// =========================================================
// ECOFARM CONNECT — APP (Navigation + Theme)
// =========================================================

import {
    auth, db, onAuthStateChanged, signOut,
    doc, getDoc
} from "./firebase.js";

const $ = (id) => document.getElementById(id);

// =========================================================
// THEME
// =========================================================

function applyTheme() {
    const theme = localStorage.getItem("ecofarm-theme") || "light";
    document.documentElement.dataset.theme = theme;

    const themeBtn = $("themeBtn");
    if (themeBtn) {
        themeBtn.textContent = theme === "dark" ? "☀" : "☾";
        themeBtn.title = theme === "dark" ? "Անցնել բաց թեմայի" : "Անցնել մուգ թեմայի";
    }
}

applyTheme();

document.addEventListener("click", (e) => {
    if (e.target.closest("#themeBtn")) {
        const current = localStorage.getItem("ecofarm-theme") || "light";
        localStorage.setItem("ecofarm-theme", current === "light" ? "dark" : "light");
        applyTheme();
    }
});

// =========================================================
// AUTH STATE
// =========================================================

onAuthStateChanged(auth, async (user) => {
    const loginLink = $("loginLink");
    const registerLink = $("registerLink");
    const logoutBtn = $("logoutBtn");

    if (user) {
        loginLink?.classList.add("hidden");
        registerLink?.classList.add("hidden");
        logoutBtn?.classList.remove("hidden");

        try {
            const snap = await getDoc(doc(db, "users", user.uid));
            if (snap.exists()) window.__ecofarmProfile = snap.data();
        } catch (err) {
            console.warn("Profile load failed:", err);
        }
    } else {
        loginLink?.classList.remove("hidden");
        registerLink?.classList.remove("hidden");
        logoutBtn?.classList.add("hidden");

        const page = location.pathname.split("/").pop().toLowerCase() || "home.html";
        const protectedPages = ["home.html", "profile.html", "announcements.html", "payment.html"];
        if (protectedPages.includes(page)) {
            location.replace("login.html");
        }
    }
});

// =========================================================
// LOGOUT
// =========================================================

document.addEventListener("click", async (e) => {
    const btn = e.target.closest("#logoutBtn");
    if (!btn) return;

    try {
        btn.disabled = true;
        btn.textContent = "Ելք...";
        await signOut(auth);
        localStorage.removeItem("selectedPlan");
        localStorage.removeItem("paymentStatus");
        location.replace("login.html");
    } catch (err) {
        console.error("Logout error:", err);
        btn.disabled = false;
        btn.textContent = "↪ Ելք";
        alert("Դուրս գալ չհաջողվեց։");
    }
});

console.log("🌱 EcoFarm App initialized");