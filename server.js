import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import nodemailer from "nodemailer";
import admin from "firebase-admin";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Required for Firebase Google popup flow in Chrome.
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

let firebaseReady = false;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = await import(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT), {
      with: { type: "json" }
    });
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount.default) });
    firebaseReady = true;
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
    firebaseReady = true;
  }
} catch (error) {
  console.error("Firebase Admin initialization failed:", error.message);
}

const otpStore = new Map();

function makeCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function saveOtp(key, code, ttl = 10 * 60 * 1000) {
  otpStore.set(key, { hash: hashCode(code), expiresAt: Date.now() + ttl, attempts: 0 });
}

function verifyOtp(key, code) {
  const item = otpStore.get(key);
  if (!item) return { ok: false, message: "Կոդը չի գտնվել կամ ժամկետը լրացել է։" };
  if (Date.now() > item.expiresAt) {
    otpStore.delete(key);
    return { ok: false, message: "Կոդի ժամկետը լրացել է։" };
  }
  if (item.attempts >= 5) {
    otpStore.delete(key);
    return { ok: false, message: "Չափազանց շատ սխալ փորձեր։" };
  }
  item.attempts += 1;
  if (hashCode(code) !== item.hash) return { ok: false, message: "Սխալ հաստատման կոդ։" };
  otpStore.delete(key);
  return { ok: true };
}

function requireAdmin() {
  if (!firebaseReady) throw new Error("Firebase Admin-ը դեռ կարգավորված չէ։");
  return admin.auth();
}

const mailer = process.env.SMTP_USER && process.env.SMTP_PASS
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE) === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })
  : null;

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, firebaseAdmin: firebaseReady, smtp: Boolean(mailer) });
});

app.post("/api/otp/email/send", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Մուտքագրեք ճիշտ էլ․ փոստ։" });
    }
    if (!mailer) {
      return res.status(503).json({
        message: "Email OTP-ը միացնելու համար լրացրեք SMTP տվյալները .env ֆայլում։"
      });
    }

    const code = makeCode();
    saveOtp(`email:${email.toLowerCase()}`, code);

    await mailer.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: "EcoFarm Connect — հաստատման կոդ",
      text: `Ձեր EcoFarm Connect հաստատման կոդն է՝ ${code}. Կոդը գործում է 10 րոպե։`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px">
          <h2 style="color:#1f7a45">🌱 EcoFarm Connect</h2>
          <p>Ձեր հաստատման կոդն է՝</p>
          <div style="font-size:34px;font-weight:800;letter-spacing:8px">${code}</div>
          <p>Կոդը գործում է 10 րոպե։ Եթե դուք չեք կատարել այս գործողությունը, պարզապես անտեսեք նամակը։</p>
        </div>`
    });

    res.json({ ok: true, message: "Հաստատման կոդը ուղարկվեց ձեր էլ․ փոստին։" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Չհաջողվեց ուղարկել հաստատման կոդը։" });
  }
});

app.post("/api/otp/email/verify", async (req, res) => {
  try {
    const { email, code, uid } = req.body;
    const result = verifyOtp(`email:${String(email || "").toLowerCase()}`, String(code || ""));
    if (!result.ok) return res.status(400).json(result);

    if (firebaseReady && uid) {
      await requireAdmin().updateUser(uid, { emailVerified: true });
    }

    res.json({ ok: true, emailVerified: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Չհաջողվեց հաստատել էլ․ փոստը։" });
  }
});

app.post("/api/otp/phone/send", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Մուտքագրեք հեռախոսահամար։" });

  // SMS is intentionally optional. Configure Twilio credentials in .env to enable it.
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    return res.status(503).json({
      message: "SMS OTP-ը միացնելու համար լրացրեք Twilio տվյալները .env ֆայլում։"
    });
  }

  try {
    const code = makeCode();
    saveOtp(`phone:${phone}`, code);

    const twilio = (await import("twilio")).default(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    await twilio.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
      body: `EcoFarm Connect հաստատման կոդ՝ ${code}`
    });

    res.json({ ok: true, message: "SMS կոդը ուղարկվեց։" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Չհաջողվեց ուղարկել SMS-ը։" });
  }
});

app.post("/api/otp/phone/verify", async (req, res) => {
  const { phone, code } = req.body;
  const result = verifyOtp(`phone:${phone}`, String(code || ""));
  if (!result.ok) return res.status(400).json(result);
  res.json({ ok: true, phoneVerified: true });
});

app.post("/api/user/plan", async (req, res) => {
  try {
    const { uid, plan, paymentId } = req.body;
    if (!uid || !["Eco Start", "Eco Grow", "Eco Premium"].includes(plan)) {
      return res.status(400).json({ message: "Սխալ պլան։" });
    }
    if (firebaseReady) {
      await admin.firestore().collection("users").doc(uid).set({
        plan,
        subscriptionActive: true,
        paymentId: paymentId || `demo_${Date.now()}`,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }
    res.json({ ok: true, plan, subscriptionActive: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Չհաջողվեց ակտիվացնել պլանը։" });
  }
});

app.post("/api/announcements", async (req, res) => {
  try {
    const { uid, announcement } = req.body;
    if (!uid || !announcement?.title || !announcement?.category || !announcement?.description) {
      return res.status(400).json({ message: "Լրացրեք պարտադիր դաշտերը։" });
    }

    if (!firebaseReady) {
      return res.json({
        ok: true,
        demo: true,
        announcement: { ...announcement, id: `demo_${Date.now()}`, uid }
      });
    }

    const userDoc = await admin.firestore().collection("users").doc(uid).get();
    const user = userDoc.data() || {};
    if (!user.subscriptionActive) {
      return res.status(403).json({ message: "Հայտարարություն տեղադրելու համար անհրաժեշտ է ակտիվ սակագին։" });
    }

    const ref = await admin.firestore().collection("announcements").add({
      ...announcement,
      uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ ok: true, id: ref.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Չհաջողվեց տեղադրել հայտարարությունը։" });
  }
});

app.get("/api/announcements", async (_req, res) => {
  try {
    if (!firebaseReady) return res.json({ ok: true, items: [] });
    const snap = await admin.firestore()
      .collection("announcements")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    res.json({ ok: true, items: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Չհաջողվեց բեռնել հայտարարությունները։" });
  }
});

app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});

app.listen(PORT, () => {
  console.log(`EcoFarm Connect → http://localhost:${PORT}`);
});