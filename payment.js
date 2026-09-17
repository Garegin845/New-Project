// =========================================================
// ECOFARM CONNECT — PREMIUM PAYMENT
// =========================================================

import { auth } from "./firebase.js";

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
// PLAN
// =========================================================

const params = new URLSearchParams(location.search);
const plan = params.get("plan")
    || sessionStorage.getItem("selectedPlan")
    || localStorage.getItem("selectedPlan")
    || "Eco Start";

const prices = {
    "Free": "$0",
    "Eco Start": "$9",
    "Eco Grow": "$24",
    "Eco Premium": "$49"
};

$("planName").textContent = plan;
$("planPrice").textContent = prices[plan] || "$9";
$("totalPrice").textContent = prices[plan] || "$9";
$("payAmount").textContent = prices[plan] || "$9";

sessionStorage.setItem("selectedPlan", plan);
localStorage.setItem("selectedPlan", plan);

// =========================================================
// CARD REFS
// =========================================================

const card3d = $("card3d");
const visualNumber = $("visualNumber");
const visualName = $("visualName");
const visualExpiry = $("visualExpiry");
const visualCvv = $("visualCvv");
const cardBrand = $("cardBrand");
const brandBadge = $("brandBadge");

// =========================================================
// CARD TYPE DETECTION
// =========================================================

function detectCardBrand(number) {
    const n = number.replace(/\D/g, "");
    if (/^4/.test(n))              return { name: "VISA",       logo: "VISA",       color: "#1a1f71" };
    if (/^5[1-5]/.test(n))         return { name: "Mastercard", logo: "MC",         color: "#eb001b" };
    if (/^3[47]/.test(n))          return { name: "Amex",       logo: "AMEX",       color: "#006fcf" };
    if (/^6/.test(n))              return { name: "Discover",   logo: "DISC",       color: "#ff6000" };
    if (/^(5[06-9]|6[37])/.test(n)) return { name: "Maestro",   logo: "MAESTRO",    color: "#eb001b" };
    if (/^9/.test(n))              return { name: "ArCa",       logo: "ArCa",       color: "#005baa" };
    return { name: "ECOFARM", logo: "ECOFARM", color: "#a7efbd" };
}

// =========================================================
// CARD NUMBER
// =========================================================

$("cardNumber").addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 16);

    // Format: 4-4-4-4
    v = v.replace(/(.{4})/g, "$1 ").trim();
    e.target.value = v;

    // Visual on card
    if (v) {
        const digits = v.replace(/\s/g, "");
        const padded = digits.padEnd(16, "•");
        const formatted = padded.match(/.{1,4}/g).join(" ");
        visualNumber.textContent = formatted;
    } else {
        visualNumber.textContent = "•••• •••• •••• ••••";
    }

    // Brand detection
    const brand = detectCardBrand(v);
    cardBrand.textContent = brand.logo;
    cardBrand.style.color = brand.color === "#1a1f71" ? "#a7efbd" : brand.color;

    if (brand.name !== "ECOFARM" && v.length >= 2) {
        brandBadge.textContent = brand.name;
        brandBadge.style.opacity = "1";
    } else {
        brandBadge.textContent = "";
        brandBadge.style.opacity = "0";
    }

    // Validation
    const digits = v.replace(/\D/g, "");
    if (digits.length === 16) {
        if (luhnCheck(digits)) {
            markValid("cardNumber", "errCardNumber");
        } else {
            markError("cardNumber", "errCardNumber", "Քարտի համարը վավեր չէ");
        }
    } else if (digits.length > 0) {
        clearMark("cardNumber", "errCardNumber");
    } else {
        clearMark("cardNumber", "errCardNumber");
    }

    pulseCard();
});

// =========================================================
// EXPIRY
// =========================================================

$("expiry").addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 4);

    if (v.length >= 3) {
        v = v.slice(0, 2) + " / " + v.slice(2);
    } else if (v.length === 2 && e.inputType !== "deleteContentBackward") {
        v = v + " / ";
    }
    e.target.value = v;

    const display = v.replace(/\s/g, "").replace(" / ", "/");
    visualExpiry.textContent = display || "MM/YY";

    // Validation
    if (v.length >= 5) {
        const parts = v.split(" / ");
        const mm = parseInt(parts[0]);
        const yy = parseInt(parts[1]);
        const now = new Date();
        const curYY = now.getFullYear() % 100;
        const curMM = now.getMonth() + 1;

        if (mm < 1 || mm > 12) {
            markError("expiry", "errExpiry", "Ամիսը սխալ է");
        } else if (yy < curYY || (yy === curYY && mm < curMM)) {
            markError("expiry", "errExpiry", "Քարտը ժամկետանց է");
        } else {
            markValid("expiry", "errExpiry");
        }
    } else {
        clearMark("expiry", "errExpiry");
    }

    pulseCard();
});

// =========================================================
// CVV — FLIP
// =========================================================

$("cvv").addEventListener("focus", () => {
    card3d.classList.add("flipped");
    $("cvv").type = "text";
});

$("cvv").addEventListener("blur", () => {
    card3d.classList.remove("flipped");
    $("cvv").type = "password";
});

$("cvv").addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
    const val = e.target.value;
    visualCvv.textContent = val ? val.padEnd(3, "•") : "•••";

    if (val.length >= 3) {
        markValid("cvv", "errCvv");
    } else if (val.length > 0) {
        clearMark("cvv", "errCvv");
    }
});

// =========================================================
// CARD HOLDER
// =========================================================

$("cardHolder").addEventListener("input", (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z\s\u0531-\u0587]/g, "");
    e.target.value = val;
    visualName.textContent = val || "YOUR NAME";

    if (val.trim().length >= 3) {
        markValid("cardHolder", "errCardHolder");
    } else {
        clearMark("cardHolder", "errCardHolder");
    }
    pulseCard();
});

// =========================================================
// VALIDATION HELPERS
// =========================================================

function markError(inputId, errId, msg) {
    $(inputId).classList.add("invalid");
    $(inputId).classList.remove("valid");
    const err = $(errId);
    if (err) { err.textContent = msg; err.classList.add("show"); }
}

function markValid(inputId, errId) {
    $(inputId).classList.add("valid");
    $(inputId).classList.remove("invalid");
    const err = $(errId);
    if (err) { err.textContent = ""; err.classList.remove("show"); }
}

function clearMark(inputId, errId) {
    $(inputId).classList.remove("valid", "invalid");
    const err = $(errId);
    if (err) { err.textContent = ""; err.classList.remove("show"); }
}

// =========================================================
// PULSE
// =========================================================

let pulseTimer;
function pulseCard() {
    card3d.classList.add("pulse");
    clearTimeout(pulseTimer);
    pulseTimer = setTimeout(() => card3d.classList.remove("pulse"), 500);
}

// =========================================================
// MANUAL FLIP
// =========================================================

card3d?.addEventListener("click", () => {
    card3d.classList.toggle("flipped");
    if (card3d.classList.contains("flipped")) {
        $("cvv").focus();
        $("cvv").type = "text";
    } else {
        $("cvv").blur();
        $("cvv").type = "password";
    }
});

// =========================================================
// LUHN
// =========================================================

function luhnCheck(num) {
    let sum = 0, alt = false;
    for (let i = num.length - 1; i >= 0; i--) {
        let n = parseInt(num[i], 10);
        if (alt) { n *= 2; if (n > 9) n -= 9; }
        sum += n;
        alt = !alt;
    }
    return sum % 10 === 0;
}

function shakeCard() {
    card3d.classList.add("error");
    setTimeout(() => card3d.classList.remove("error"), 500);
}

// =========================================================
// SUBMIT
// =========================================================

$("cardForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        toast("Խնդրում ենք մուտք գործել։", "error");
        sessionStorage.setItem("selectedPlan", plan);
        setTimeout(() => location.href = "login.html", 900);
        return;
    }

    const digits = $("cardNumber").value.replace(/\D/g, "");
    if (digits.length < 16) { toast("16-նիշ քարտի համար։", "error"); shakeCard(); return; }
    if (!luhnCheck(digits)) { toast("Քարտի համարը սխալ է։", "error"); shakeCard(); return; }
    if ($("expiry").value.length < 5) { toast("Ստուգեք ժամկետը։", "error"); shakeCard(); return; }
    if ($("cvv").value.length < 3) { toast("Ստուգեք CVV-ն։", "error"); shakeCard(); return; }
    if ($("cardHolder").value.trim().length < 3) { toast("Մուտքագրեք քարտապանի անունը։", "error"); shakeCard(); return; }

    const btn = $("payBtn");
    btn.classList.add("loading");
    btn.disabled = true;

    localStorage.setItem("paymentStatus", "success");
    localStorage.setItem("selectedPlan", plan);

    try {
        await fetch("/api/user/plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                uid: user.uid,
                plan,
                paymentId: `demo_${Date.now()}`
            })
        });
    } catch (err) {
        console.warn("Server failed:", err);
    }

    // Success animation
    setTimeout(() => {
        btn.classList.remove("loading");
        btn.classList.add("success");
        toast(`✅ ${plan} պլանը ակտիվացվեց։`, "success");
        setTimeout(() => location.href = "home.html", 1500);
    }, 1400);
});

console.log("💎 Premium payment initialized");