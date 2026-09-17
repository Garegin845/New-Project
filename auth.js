// =========================================================
// ECOFARM CONNECT — AUTH (ՈՒՂՂՎԱԾ)
// =========================================================

import {
    auth, db, googleProvider,
    signInWithPopup, signInWithRedirect, getRedirectResult,
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    sendPasswordResetEmail, updateProfile,
    doc, setDoc, getDoc, serverTimestamp
} from "./firebase.js";

const $ = (id) => document.getElementById(id);

window.EcoFarmAuthLoaded = true;
console.log("🌱 EcoFarm Auth loaded");

// =========================================================
// TOAST
// =========================================================

function toast(message, type = "error") {
    const el = $("toast");
    if (!el) { alert(message); return; }
    el.textContent = message;
    el.dataset.type = type;
    el.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => el.classList.remove("show"), 4500);
}

// =========================================================
// BUSY
// =========================================================

function setBusy(button, busy, text = "Խնդրում ենք սպասել...") {
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

// =========================================================
// ERROR TRANSLATION
// =========================================================

function firebaseMessage(error) {
    const code = error?.code || "";
    const messages = {
        "auth/invalid-credential": "Email-ը կամ գաղտնաբառը սխալ է։",
        "auth/invalid-login-credentials": "Email-ը կամ գաղտնաբառը սխալ է։",
        "auth/user-not-found": "Այս email-ով հաշիվ չկա։",
        "auth/wrong-password": "Գաղտնաբառը սխալ է։",
        "auth/email-already-in-use": "Այս email-ով հաշիվ արդեն կա։",
        "auth/weak-password": "Գաղտնաբառը ≥ 8 նիշ։",
        "auth/invalid-email": "Email հասցեն սխալ է։",
        "auth/popup-closed-by-user": "Google-ի պատուհանը փակվեց։",
        "auth/popup-blocked": "Popup-ները արգելափակված են։ Թույլատրեք։",
        "auth/cancelled-popup-request": "Google մուտքը չեղարկվեց։",
        "auth/operation-not-allowed": "Firebase-ում այս մեթոդը միացված չէ։",
        "auth/unauthorized-domain": "Այս domain-ը թույլատրված չէ Firebase-ում։",
        "auth/network-request-failed": "Կապ չկա Firebase-ի հետ։",
        "auth/too-many-requests": "Շատ փորձեր։ Սպասեք։",
        "auth/configuration-not-found": "Firebase Auth-ը կարգավորված չէ։"
    };
    return messages[code] || error?.message || "Գործողությունը չհաջողվեց։";
}

// =========================================================
// SAVE USER
// =========================================================

async function saveUser(user, extra = {}) {
    try {
        const ref = doc(db, "users", user.uid);
        const existing = await getDoc(ref);
        const prev = existing.exists() ? existing.data() : {};

        await setDoc(ref, {
            uid: user.uid,
            name: extra.name ?? user.displayName ?? prev.name ?? "",
            email: user.email ?? "",
            country: extra.country ?? prev.country ?? "",
            phone: extra.phone ?? prev.phone ?? "",
            plan: extra.plan ?? prev.plan ?? "Free",
            subscriptionActive: extra.subscriptionActive ?? prev.subscriptionActive ?? false,
            emailVerified: user.emailVerified ?? false,
            updatedAt: serverTimestamp()
        }, { merge: true });

        console.log("✅ User saved to Firestore");
    } catch (err) {
        console.warn("⚠️ Save user failed:", err);
    }
}

// =========================================================
// 🔥 GOOGLE LOGIN — Popup առաջ, Redirect fallback
// =========================================================

async function googleLogin() {
    console.log("🟢 GOOGLE LOGIN STARTED");
    const button = $("googleLoginBtn");
    setBusy(button, true, "Միացում Google-ին...");

    try {
        // 1️⃣ Փորձում ենք popup
        console.log("🔵 Trying popup...");
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        console.log("✅ Google popup success:", user.email);

        await saveUser(user);
        location.replace("home.html");
        return;

    } catch (popupError) {
        console.warn("⚠️ Popup failed:", popupError.code);

        // 2️⃣ Popup-ը արգելափակված է → redirect
        if ([
            "auth/popup-blocked",
            "auth/popup-closed-by-user",
            "auth/cancelled-popup-request",
            "auth/operation-not-supported-in-this-environment"
        ].includes(popupError.code)) {
            try {
                console.log("🔵 Falling back to redirect...");
                await signInWithRedirect(auth, googleProvider);
                return;
            } catch (redirectError) {
                console.error("❌ Redirect failed:", redirectError);
                setBusy(button, false);
                toast(firebaseMessage(redirectError));
                return;
            }
        }

        // 3️⃣ Այլ սխալ
        setBusy(button, false);
        toast(firebaseMessage(popupError));
    }
}

// =========================================================
// 🔥 REDIRECT RESULT — կարևոր!
// =========================================================

getRedirectResult(auth)
    .then(async (result) => {
        if (result?.user) {
            console.log("✅ Google redirect success:", result.user.email);
            await saveUser(result.user);
            location.replace("home.html");
        } else {
            console.log("ℹ️ No redirect result (normal on first load)");
        }
    })
    .catch((error) => {
        console.error("❌ Redirect result error:", error);
        toast(firebaseMessage(error));
    });

// =========================================================
// GOOGLE BUTTON — Event delegation
// =========================================================

document.addEventListener("click", (e) => {
    if (e.target.closest("#googleLoginBtn")) {
        e.preventDefault();
        googleLogin();
    }
});

// =========================================================
// REGISTER
// =========================================================

const registerForm = $("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const button = registerForm.querySelector('button[type="submit"]');

        const name = $("regName")?.value.trim();
        const email = $("regEmail")?.value.trim();
        const phone = $("regPhone")?.value.trim();
        const country = $("regCountry")?.value;
        const password = $("regPassword")?.value || "";
        const password2 = $("regPassword2")?.value || "";
        const planRaw = $("regPlan")?.value || "";
        const plan = planRaw.split(" — ")[0].trim();

        // Validation
        if (!name) return toast("Մուտքագրեք անունը։");
        if (!email) return toast("Մուտքագրեք email-ը։");
        if (!phone) return toast("Մուտքագրեք հեռախոսահամարը։");
        if (!country) return toast("Ընտրեք երկիրը։");
        if (!plan) return toast("Ընտրեք սակագինը։");
        if (password.length < 8) return toast("Գաղտնաբառը ≥ 8 նիշ։");
        if (password !== password2) return toast("Գաղտնաբառերը չեն համընկնում։");

        setBusy(button, true, "Հաշիվը ստեղծվում է...");

        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            const user = cred.user;

            await updateProfile(user, { displayName: name });
            await saveUser(user, { name, phone, country, plan });

            sessionStorage.setItem("pendingVerificationEmail", email);
            sessionStorage.setItem("pendingVerificationUid", user.uid);
            sessionStorage.setItem("pendingVerificationPlan", plan);

            // Փորձում ենք OTP
            try {
                const res = await fetch("/api/otp/email/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });
                if (res.ok) {
                    location.replace("verify.html");
                    return;
                }
            } catch (otpErr) {
                console.warn("OTP unavailable:", otpErr);
            }

            location.replace("home.html");
        } catch (error) {
            console.error("Register error:", error);
            toast(firebaseMessage(error));
            setBusy(button, false);
        }
    });
}

// =========================================================
// LOGIN
// =========================================================

const loginForm = $("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const button = loginForm.querySelector('button[type="submit"]');
        const email = $("loginEmail")?.value.trim();
        const password = $("loginPassword")?.value || "";

        if (!email) return toast("Մուտքագրեք email-ը։");
        if (!password) return toast("Մուտքագրեք գաղտնաբառը։");

        setBusy(button, true, "Մուտք...");

        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            console.log("✅ Login success:", cred.user.email);
            saveUser(cred.user).catch(console.warn);
            location.replace("home.html");
        } catch (error) {
            console.error("Login error:", error);
            toast(firebaseMessage(error));
            setBusy(button, false);
        }
    });
}

// =========================================================
// FORGOT PASSWORD
// =========================================================

const forgotBtn = $("forgotPassword");
if (forgotBtn) {
    forgotBtn.addEventListener("click", async () => {
        const email = $("loginEmail")?.value.trim();
        if (!email) return toast("Մուտքագրեք email-ը։");

        try {
            await sendPasswordResetEmail(auth, email);
            toast("Վերականգնման նամակը ուղարկվեց։", "success");
        } catch (err) {
            toast(firebaseMessage(err));
        }
    });
}

// =========================================================
// PASSWORD TOGGLE
// =========================================================

document.querySelectorAll("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
        const input = $(btn.dataset.toggle);
        if (!input) return;
        input.type = input.type === "password" ? "text" : "password";
    });
});

console.log("🌱 EcoFarm Auth initialized");