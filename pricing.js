// =========================================================
// ECOFARM CONNECT — PRICING + PLAN ACTIVATION
// =========================================================

import { auth, db, onAuthStateChanged, doc, getDoc } from "./firebase.js";

const $ = (id) => document.getElementById(id);

const toast = (m, type = "success") => {
    const t = $("toast");
    if (!t) return alert(m);
    t.textContent = m;
    t.dataset.type = type;
    t.classList.add("show");
    clearTimeout(window.__toast);
    window.__toast = setTimeout(() => t.classList.remove("show"), 4000);
};

// =========================================================
// BILLING TOGGLE (Monthly / Yearly)
// =========================================================

document.querySelectorAll("[data-billing]").forEach((btn) => {
    btn.addEventListener("click", () => {
        const mode = btn.dataset.billing;

        // Buttons
        document.querySelectorAll("[data-billing]").forEach((b) => {
            b.classList.toggle("active", b === btn);
        });

        // Update prices
        document.querySelectorAll(".amount").forEach((el) => {
            const val = el.dataset[mode];
            if (val !== undefined) el.textContent = val;
        });

        // Update notes
        document.querySelectorAll(".plan-price-note").forEach((el) => {
            const note = el.dataset[`note${mode.charAt(0).toUpperCase() + mode.slice(1)}`];
            if (note) el.textContent = note;
        });

        // Update periods
        document.querySelectorAll(".period").forEach((el) => {
            el.textContent = mode === "yearly" ? "/ ամիս (տարեկան)" : "/ ամիս";
        });
    });
});

// =========================================================
// PLAN SELECT
// =========================================================

let currentUser = null;
let userProfile = null;

document.querySelectorAll("[data-plan]").forEach((btn) => {
    btn.addEventListener("click", async () => {
        const plan = btn.dataset.plan;

        // Free plan — just go home
        if (plan === "Free") {
            if (!currentUser) {
                location.href = "index.html";
                return;
            }
            toast("Դուք արդեն Free պլանում եք։", "success");
            setTimeout(() => location.href = "home.html", 800);
            return;
        }

        // Save selected plan
        sessionStorage.setItem("selectedPlan", plan);
        localStorage.setItem("selectedPlan", plan);

        // If user is logged in
        if (currentUser) {
            // Check if this is already their plan
            if (userProfile?.plan === plan && userProfile?.subscriptionActive) {
                toast(`Դուք արդեն ${plan} պլանում եք։`, "success");
                return;
            }
            location.href = `payment.html?plan=${encodeURIComponent(plan)}`;
            return;
        }

        // Not logged in → register
        toast("Գրանցվեք՝ սակագինն ակտիվացնելու համար։", "success");
        setTimeout(() => {
            location.href = `index.html?plan=${encodeURIComponent(plan)}`;
        }, 900);
    });
});

// =========================================================
// AUTH STATE — Show current plan
// =========================================================

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (!user) {
        // Hide banner for logged-out users
        $("currentPlanBanner")?.classList.add("hidden");
        return;
    }

    try {
        const snap = await getDoc(doc(db, "users", user.uid));
        userProfile = snap.exists() ? snap.data() : null;

        const plan = userProfile?.plan || "Free";
        const active = userProfile?.subscriptionActive || false;

        // Show banner
        const banner = $("currentPlanBanner");
        if (banner) {
            banner.classList.remove("hidden");
            $("currentPlanName").textContent = plan;
            $("currentPlanDesc").textContent = active
                ? `✅ Պլանը ակտիվ է`
                : `Ընթացիկ պլան՝ ${plan}`;
        }

        // Highlight current plan card
        document.querySelectorAll(".plan-card").forEach((card) => {
            const cardPlan = card.dataset.plan;
            const existingBadge = card.querySelector(".current-badge");
            if (existingBadge) existingBadge.remove();

            card.classList.remove("plan-current");

            if (cardPlan === plan && active) {
                card.classList.add("plan-current");

                // Add "Current" badge
                const badge = document.createElement("div");
                badge.className = "current-badge";
                badge.innerHTML = `<span>✓</span> ՁԵՐ ՊԼԱՆԸ`;
                card.querySelector(".plan-header").prepend(badge);

                // Change CTA text
                const cta = card.querySelector(".plan-cta");
                if (cta) {
                    cta.textContent = "Ընթացիկ պլան";
                    cta.disabled = true;
                    cta.classList.add("plan-cta-disabled");
                }
            }
        });

        // Also handle banner auto-hide if Free
        if (plan === "Free") {
            $("currentPlanBanner")?.classList.add("hidden");
        }

    } catch (err) {
        console.warn("Profile load failed:", err);
    }
});

console.log("💎 Premium pricing initialized");