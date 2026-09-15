import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const $ = id => document.getElementById(id);

function toast(message, type = "error") {
  const t = $("toast");
  if (!t) return alert(message);
  t.textContent = message;
  t.dataset.type = type;
  t.classList.add("show");
  clearTimeout(window.__ecoToast);
  window.__ecoToast = setTimeout(() => t.classList.remove("show"), 5000);
}

function setBusy(button, busy, text) {
  if (!button) return;
  if (busy) {
    button.dataset.oldText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="auth-spinner"></span>${text}`;
  } else {
    button.disabled = false;
    if (button.dataset.oldText) button.innerHTML = button.dataset.oldText;
  }
}

function firebaseMessage(error) {
  const code = error?.code || "";
  const messages = {
    "auth/invalid-credential": "Email-ը կամ գաղտնաբառը սխալ է։",
    "auth/invalid-login-credentials": "Email-ը կամ գաղտնաբառը սխալ է։",
    "auth/user-not-found": "Այս email-ով հաշիվ չկա։",
    "auth/wrong-password": "Գաղտնաբառը սխալ է։",
    "auth/email-already-in-use": "Այս email-ով հաշիվ արդեն գոյություն ունի։ Փորձեք մուտք գործել։",
    "auth/weak-password": "Գաղտնաբառը պետք է լինի առնվազն 6 նիշ։",
    "auth/invalid-email": "Email հասցեն սխալ է։",
    "auth/popup-closed-by-user": "Google մուտքի պատուհանը փակվել է։",
    "auth/popup-blocked": "Chrome-ը արգելափակել է Google-ի popup-ը։ Թույլատրեք popup-ները։",
    "auth/cancelled-popup-request": "Google մուտքը չեղարկվեց։",
    "auth/operation-not-allowed": "Firebase Console-ում այս մուտքի մեթոդը միացված չէ։",
    "auth/unauthorized-domain": "Այս կայքի domain-ը Firebase-ում թույլատրված չէ։ Ավելացրեք localhost-ը Authorized domains-ում։",
    "auth/network-request-failed": "Firebase-ին միանալ չհաջողվեց։ Ստուգեք ինտերնետը և բացեք կայքը localhost:3000-ով։",
    "auth/too-many-requests": "Շատ փորձեր են կատարվել։ Մի փոքր սպասեք և նորից փորձեք։"
  };
  return messages[code] || error?.message || "Գործողությունը չհաջողվեց։";
}

async function saveUser(user, extra = {}) {
  // Firestore is only for the profile. It must NEVER block authentication or navigation.
  try {
    const { getFirestore, doc, setDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js");
    const db = getFirestore(app);
    const write = setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: user.displayName || extra.name || "",
      email: user.email || "",
      country: extra.country || "",
      phone: extra.phone || "",
      plan: extra.plan || "Free",
      subscriptionActive: extra.subscriptionActive || false,
      emailVerified: user.emailVerified || false,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Do not let an offline Firestore client freeze the login/register flow.
    await Promise.race([
      write,
      new Promise(resolve => setTimeout(resolve, 1500))
    ]);
  } catch (e) {
    console.warn("EcoFarm: Firestore profile skipped:", e);
  }
}

async function googleLogin(button) {
  setBusy(button, true, "Միացում Google-ին...");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Firestore profile saving is non-blocking. Auth success must navigate immediately.
    saveUser(result.user).catch(() => {});
    console.log("Google Auth → SUCCESS:", result.user.email);
    location.replace("home.html");
  } catch (e) {
    console.error("Google auth error:", e);
    toast(firebaseMessage(e));
    setBusy(button, false);
  }
}

$("googleRegister")?.addEventListener("click", e => googleLogin(e.currentTarget));
$("googleLogin")?.addEventListener("click", e => googleLogin(e.currentTarget));

$("registerForm")?.addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const name = $("regName")?.value.trim();
  const email = $("regEmail")?.value.trim();
  const phone = $("regPhone")?.value.trim();
  const country = $("regCountry")?.value;
  const pass = $("regPassword")?.value || "";
  const pass2 = $("regPassword2")?.value || "";
  const planRaw = $("regPlan")?.value || "";
  const plan = planRaw.split(" — ")[0];

  if (pass !== pass2) return toast("Գաղտնաբառերը չեն համընկնում։");
  if (pass.length < 6) return toast("Գաղտնաբառը պետք է լինի առնվազն 6 նիշ։");

  setBusy(button, true, "Հաշիվը ստեղծվում է...");
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    // Save profile in background; do not block registration on Firestore.
    saveUser(cred.user, { name, phone, country, plan }).catch(() => {});

    sessionStorage.setItem("pendingVerificationEmail", email);
    sessionStorage.setItem("pendingVerificationUid", cred.user.uid);
    sessionStorage.setItem("pendingVerificationPlan", plan || "Free");

    // OTP is optional for now: if backend email service is not configured,
    // don't pretend Firebase registration itself failed.
    try {
      const r = await fetch("/api/otp/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.message || "Email կոդը ուղարկել չհաջողվեց։");
      location.href = "verify.html";
    } catch (otpError) {
      console.warn("OTP backend unavailable:", otpError);
      toast("Հաշիվը ստեղծվեց, բայց հաստատման կոդը ուղարկելու server-ը հասանելի չէ։ Ստուգեք npm run dev-ը։");
      setBusy(button, false);
    }
  } catch (e) {
    console.error("Registration error:", e);
    toast(firebaseMessage(e));
    setBusy(button, false);
  }
});

$("loginForm")?.addEventListener("submit", async e => {
  e.preventDefault();
  const button = e.currentTarget.querySelector('button[type="submit"]');
  const email = $("loginEmail")?.value.trim();
  const password = $("loginPassword")?.value || "";
  if (!email || !password) return toast("Լրացրեք email-ը և գաղտնաբառը։");

  setBusy(button, true, "Մուտք...");
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // Save profile in background; do not block login on Firestore.
    saveUser(cred.user).catch(() => {});
    console.log("Email Auth → SUCCESS:", cred.user.email);
    location.replace("home.html");
  } catch (e) {
    console.error("Login error:", e);
    toast(firebaseMessage(e));
    setBusy(button, false);
  }
});

$("forgotPassword")?.addEventListener("click", async () => {
  const email = $("loginEmail")?.value.trim();
  if (!email) return toast("Սկզբում մուտքագրեք ձեր email-ը։");
  try {
    await sendPasswordResetEmail(auth, email);
    toast("Գաղտնաբառը վերականգնելու նամակը ուղարկվեց։", "success");
  } catch (e) {
    toast(firebaseMessage(e));
  }
});

$("verifyEmail")?.addEventListener("click", async () => {
  const code = [...document.querySelectorAll(".code-boxes input")].map(x => x.value).join("");
  const email = sessionStorage.getItem("pendingVerificationEmail");
  const uid = sessionStorage.getItem("pendingVerificationUid");
  if (code.length !== 6) return toast("Մուտքագրեք 6-նիշ կոդը։");
  try {
    const r = await fetch("/api/otp/email/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, uid, code })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.message || "Սխալ կոդ։");
    toast("Email-ը հաստատված է։", "success");
    setTimeout(() => location.href = "login.html", 700);
  } catch (e) {
    toast(e.message || "Սխալ կոդ։");
  }
});

$("resendEmail")?.addEventListener("click", async () => {
  const email = sessionStorage.getItem("pendingVerificationEmail");
  if (!email) return toast("Հաստատման session-ը չի գտնվել։");
  try {
    const r = await fetch("/api/otp/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.message || "Չհաջողվեց ուղարկել կոդը։");
    toast(d.message || "Նոր կոդը ուղարկվեց։", "success");
  } catch (e) {
    toast(e.message);
  }
});

// Support older HTML files that use inline onclick handlers.
window.registerWithGoogle = () => googleLogin(document.getElementById("googleRegister"));
window.loginWithGoogle = () => googleLogin(document.getElementById("googleLogin"));
window.logoutUser = async () => { try { await signOut(auth); location.href = "login.html"; } catch(e) { toast(firebaseMessage(e)); } };

// Make module-load success visible in the browser.
window.EcoFarmAuthLoaded = true;
console.log("EcoFarm Auth loaded successfully");
