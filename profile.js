// =========================================================
// ECOFARM CONNECT — PREMIUM PROFILE
// =========================================================

import {
    auth, db, onAuthStateChanged,
    updateProfile, sendPasswordResetEmail,
    doc, getDoc, setDoc, collection, query, where, getDocs
} from "./firebase.js";

const $ = (id) => document.getElementById(id);

const toast = (m, type = "success") => {
    const t = $("toast");
    if (!t) return alert(m);
    t.textContent = m;
    t.dataset.type = type;
    t.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => t.classList.remove("show"), 4000);
};

// =========================================================
// THEME
// =========================================================

function applyTheme() {
    const theme = localStorage.getItem("ecofarm-theme") || "light";
    document.documentElement.dataset.theme = theme;

    const themeSwitch = $("themeSwitch");
    if (themeSwitch) themeSwitch.checked = theme === "dark";
}

applyTheme();

$("themeSwitch")?.addEventListener("change", (e) => {
    const theme = e.target.checked ? "dark" : "light";
    localStorage.setItem("ecofarm-theme", theme);
    applyTheme();
});

// =========================================================
// SIDEBAR NAVIGATION — Smooth Scroll + Active
// =========================================================

document.querySelectorAll(".side-link").forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = link.dataset.target;
        const section = $(`section-${target}`);

        if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });

            // Update active state
            document.querySelectorAll(".side-link").forEach((l) => l.classList.remove("active"));
            link.classList.add("active");
        }
    });
});

// Active link on scroll
const sections = document.querySelectorAll(".content-section");
const sideLinks = document.querySelectorAll(".side-link");

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const id = entry.target.id.replace("section-", "");
            sideLinks.forEach((link) => {
                link.classList.toggle("active", link.dataset.target === id);
            });
        }
    });
}, { rootMargin: "-30% 0px -60% 0px" });

sections.forEach((s) => observer.observe(s));

// =========================================================
// AVATAR
// =========================================================

$("avatarBtn")?.addEventListener("click", () => $("avatarInput").click());

$("avatarInput")?.addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;

    // Size check (max 2MB)
    if (f.size > 2 * 1024 * 1024) {
        toast("Նկարը չպետք է գերազանցի 2MB-ը։", "error");
        return;
    }

    const r = new FileReader();
    r.onload = () => {
        localStorage.setItem("ecofarm-avatar", r.result);
        renderAvatar(r.result);
        toast("✅ Նկարը թարմացվեց։", "success");
    };
    r.readAsDataURL(f);
});

function renderAvatar(src) {
    const avatar = $("avatar");
    if (!avatar) return;

    if (src) {
        avatar.innerHTML = `<img src="${src}" alt="Avatar">`;
    } else {
        const name = $("pName")?.value.trim() || "U";
        const initial = name.charAt(0).toUpperCase();
        avatar.innerHTML = `<span class="avatar-initial">${initial}</span>`;
    }
}

// Load saved avatar
const savedAvatar = localStorage.getItem("ecofarm-avatar");
if (savedAvatar) renderAvatar(savedAvatar);

// =========================================================
// NOTIFICATIONS PREFERENCES
// =========================================================

const notifPrefs = JSON.parse(localStorage.getItem("ecofarm-notifications") || "{}");
$("notificationsSwitch").checked = notifPrefs.email !== false;
$("newsletterSwitch").checked = notifPrefs.newsletter === true;

$("notificationsSwitch")?.addEventListener("change", (e) => {
    const prefs = JSON.parse(localStorage.getItem("ecofarm-notifications") || "{}");
    prefs.email = e.target.checked;
    localStorage.setItem("ecofarm-notifications", JSON.stringify(prefs));
    toast(e.target.checked ? "Ծանուցումները միացված են։" : "Ծանուցումները անջատված են։", "success");
});

$("newsletterSwitch")?.addEventListener("change", (e) => {
    const prefs = JSON.parse(localStorage.getItem("ecofarm-notifications") || "{}");
    prefs.newsletter = e.target.checked;
    localStorage.setItem("ecofarm-notifications", JSON.stringify(prefs));
    toast(e.target.checked ? "Բաժանորդագրված եք։" : "Բաժանորդագրությունը չեղարկված է։", "success");
});

// =========================================================
// AUTH STATE
// =========================================================

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.replace("login.html");
        return;
    }

    console.log("✅ User:", user.email);

    // Auth data
    const displayName = user.displayName || "";
    const email = user.email || "";

    $("profileName").textContent = displayName || "Օգտատեր";
    $("profileEmail").textContent = email;
    $("pName").value = displayName;
    $("pEmail").value = email;
    $("securityEmail").textContent = email;

    // Avatar initial
    if (!savedAvatar) {
        const initial = (displayName || email || "U").charAt(0).toUpperCase();
        $("avatarInitial").textContent = initial;
    }

    // Email verified badge
    if (user.emailVerified) {
        $("verifiedBadge")?.classList.remove("hidden");
    }

    // Load Firestore data
    try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (snap.exists()) {
            const d = snap.data();
            console.log("📦 Profile:", d);

            const name = d.name || displayName || "Օգտատեր";
            const plan = d.plan || "Free";
            const active = d.subscriptionActive || false;

            // Update display
            $("profileName").textContent = name;
            $("pName").value = name;
            $("pCountry").value = d.country || "";
            $("pPhone").value = d.phone || "";
            $("securityPhone").textContent = d.phone || "Չկա հեռախոս";

            // Plan
            $("currentPlan").textContent = plan;
            $("planBadge").innerHTML = `<span class="plan-dot"></span>${plan}`;
            $("sidePlanName").textContent = plan;
            $("planShowcaseBadge").textContent = plan.toUpperCase();

            // Side desc + plan status
            if (active) {
                $("planStatus").textContent = `✅ ${plan} պլանն ակտիվ է։ Շնորհակալություն բաժանորդագրման համար։`;
                $("sidePlanDesc").textContent = `Ակտիվ է մինչև հաջորդ ամիս`;
                $("planUpgradeText").textContent = "Կառավարել սակագինը";
            } else {
                $("planStatus").textContent = "Հայտարարություն տեղադրելու համար ակտիվացրեք պլան։";
                $("sidePlanDesc").textContent = "Հայտարարություն տեղադրելու համար ակտիվացրեք պլան։";
                $("planUpgradeText").textContent = "Բարելավել սակագինը";
            }

            // Plan showcase theme
            applyPlanTheme(plan);

            // Stats
            loadStats(user.uid);

            // Member since
            if (d.updatedAt?.toDate) {
                const date = d.updatedAt.toDate();
                $("statMember").textContent = date.getFullYear();
            } else if (user.metadata?.creationTime) {
                const date = new Date(user.metadata.creationTime);
                $("statMember").textContent = date.getFullYear();
            }

            // Avatar initial update
            if (!savedAvatar) {
                $("avatarInitial").textContent = name.charAt(0).toUpperCase();
            }
        }
    } catch (err) {
        console.error("Firestore load error:", err);
    }
});

// =========================================================
// PLAN THEME
// =========================================================

function applyPlanTheme(plan) {
    const showcase = $("planShowcase");
    if (!showcase) return;

    showcase.classList.remove("plan-free", "plan-start", "plan-grow", "plan-premium");

    const map = {
        "Free": "plan-free",
        "Eco Start": "plan-start",
        "Eco Grow": "plan-grow",
        "Eco Premium": "plan-premium"
    };

    showcase.classList.add(map[plan] || "plan-free");
}

// =========================================================
// STATS
// =========================================================

async function loadStats(uid) {
    try {
        // Announcements count
        const localItems = JSON.parse(localStorage.getItem("ecofarm-local-announcements") || "[]");
        $("statAnnouncements").textContent = localItems.length;

        // Mock views (in real app → Firestore)
        const viewsKey = `ecofarm-views-${uid}`;
        const views = localStorage.getItem(viewsKey) || "0";
        $("statViews").textContent = views;

        // Rating (mock)
        $("statRating").textContent = "—";

    } catch (err) {
        console.warn("Stats error:", err);
    }
}

// =========================================================
// PROFILE FORM
// =========================================================

$("profileForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return;

    const name = $("pName").value.trim();
    const country = $("pCountry").value.trim();
    const phone = $("pPhone").value.trim();

    if (!name) {
        toast("Մուտքագրեք անունը։", "error");
        $("pName").focus();
        return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    const oldText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner"></span>Պահպանվում է...';

    try {
        // Update Firebase Auth
        await updateProfile(user, { displayName: name });

        // Update Firestore
        await setDoc(doc(db, "users", user.uid), {
            name,
            country,
            phone,
            updatedAt: new Date()
        }, { merge: true });

        // Update UI
        $("profileName").textContent = name;
        if (!savedAvatar) {
            $("avatarInitial").textContent = name.charAt(0).toUpperCase();
        }

        toast("✅ Պրոֆիլը հաջողությամբ պահպանվեց։", "success");

    } catch (err) {
        console.error("Save error:", err);
        toast("Չհաջողվեց պահպանել։ Փորձեք կրկին։", "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = oldText;
    }
});

// =========================================================
// PASSWORD RESET
// =========================================================

$("passwordReset")?.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user?.email) {
        toast("Email չի գտնվել։", "error");
        return;
    }

    const btn = $("passwordReset");
    const oldText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = "Ուղարկվում է...";

    try {
        await sendPasswordResetEmail(auth, user.email);
        toast("📧 Գաղտնաբառի վերականգնման հղումն ուղարկվեց։", "success");
    } catch (err) {
        console.error(err);
        toast("Չհաջողվեց ուղարկել։", "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = oldText;
    }
});

// =========================================================
// PHONE VERIFY
// =========================================================

async function verifyPhone() {
    const phone = $("pPhone")?.value.trim();
    if (!phone) {
        toast("Մուտքագրեք հեռախոսահամարը։", "error");
        return;
    }

    try {
        const r = await fetch("/api/otp/phone/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone })
        });
        const d = await r.json();
        toast(d.message || "SMS-ը ուղարկվեց։", "success");
    } catch {
        toast("SMS ծառայությունը հասանելի չէ։", "error");
    }
}

$("phoneVerifyBtn")?.addEventListener("click", verifyPhone);
$("phoneVerifyBtn2")?.addEventListener("click", verifyPhone);

// =========================================================
// DELETE ACCOUNT
// =========================================================

$("deleteAccountBtn")?.addEventListener("click", () => {
    const confirmed = confirm(
        "⚠️ Դուք իսկապե՞ս ուզում եք ջնջել ձեր հաշիվը։\n\n" +
        "Այս գործողությունը անշրջելի է և կջնջի ձեր բոլոր տվյալները։"
    );

    if (!confirmed) return;

    const doubleConfirm = confirm(
        "Վերջին հնարավորություն։ Մուտքագրեք OK՝ հաստատելու համար։"
    );

    if (!doubleConfirm) return;

    toast("Ջնջելու հարցումն ուղարկվեց աջակցությանը։", "success");
    // In production: call API to delete account
});

// =========================================================
// INIT
// =========================================================

console.log("🌱 Premium profile initialized");