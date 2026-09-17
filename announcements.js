// =========================================================
// ECOFARM CONNECT — PREMIUM ANNOUNCEMENTS
// =========================================================

import { auth, db, onAuthStateChanged, doc, getDoc } from "./firebase.js";

const $ = (id) => document.getElementById(id);
const grid = $("announcementGrid");

const toast = (m, type = "success") => {
    const t = $("toast");
    if (!t) return alert(m);
    t.textContent = m;
    t.dataset.type = type;
    t.classList.add("show");
    clearTimeout(window.__toast);
    window.__toast = setTimeout(() => t.classList.remove("show"), 4000);
};

// HTML escape
const esc = (str) => String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Format price to number for sorting
const parsePrice = (p) => {
    if (!p) return 0;
    const num = String(p).replace(/[^\d.]/g, "");
    return parseFloat(num) || 0;
};

// =========================================================
// STATE
// =========================================================

let currentUser = null;
let profile = null;
let localItems = JSON.parse(localStorage.getItem("ecofarm-local-announcements") || "[]");

const seed = [
    { title: "Բերրի հողատարածք վարձակալության", category: "land", location: "Արարատի մարզ", price: "$1,200 / տարի", description: "5 հեկտար բերրի գյուղատնտեսական հողատարածք՝ ջրային հասանելիությամբ։ Հարմար է բանջարեղենի և հացահատիկի մշակության համար։", icon: "🌾", date: "13 Սեպտեմբեր 2026" },
    { title: "John Deere տրակտոր 6120M", category: "equipment", location: "Արմավիր", price: "$18,500", description: "Լավ վիճակում գտնվող տրակտոր՝ մեծ և փոքր գյուղատնտեսական աշխատանքների համար։ Աշխատանքային ժամերը՝ 2400։", icon: "🚜", date: "12 Սեպտեմբեր 2026" },
    { title: "Թարմ օրգանական բանջարեղեն", category: "products", location: "Կոտայք", price: "750 ֏ / կգ", description: "Օրգանական լոլիկ, վարունգ, պղպեղ և կանաչեղեն։ Մեծածախ պատվերների դեպքում՝ հատուկ գին։", icon: "🥬", date: "11 Սեպտեմբեր 2026" },
    { title: "Կաթնատու կովեր (10 հատ)", category: "animals", location: "Շիրակ", price: "$1,400 / հատ", description: "Առողջ և պատվաստված կաթնատու կովեր՝ ֆերմայի ընդլայնման համար։ Օրական՝ 25լ կաթ։", icon: "🐄", date: "9 Սեպտեմբեր 2026" },
    { title: "Ֆերմայի աշխատակից", category: "jobs", location: "Արմավիր", price: "250,000 ֏ / ամիս", description: "Փնտրում ենք պատասխանատու աշխատակից գյուղատնտեսական ֆերմայում աշխատելու համար։", icon: "👨‍🌾", date: "8 Սեպտեմբեր 2026" },
    { title: "Ոռոգման համակարգի տեղադրում", category: "services", location: "Ամբողջ Հայաստան", price: "Սկսած $500", description: "Ժամանակակից կաթիլային ոռոգման համակարգերի տեղադրում՝ ցանկացած ծավալի համար։", icon: "💧", date: "7 Սեպտեմբեր 2026" }
];

const labels = {
    land: "🌾 Հողատարածք",
    equipment: "🚜 Գյուղտեխնիկա",
    products: "🥬 Արտադրանք",
    animals: "🐄 Կենդանիներ",
    jobs: "👨‍🌾 Աշխատանք",
    services: "🛠️ Ծառայություններ"
};

// =========================================================
// RENDER
// =========================================================

function render() {
    const q = $("search").value.toLowerCase().trim();
    const cat = $("category").value;
    const sort = $("sortBy").value;

    // Combine
    const all = [...localItems, ...seed];

    // Filter
    let filtered = all.filter((x) => {
        const matchesCat = cat === "all" || x.category === cat;
        const haystack = `${x.title} ${x.description} ${x.location} ${x.price || ""}`.toLowerCase();
        return matchesCat && (!q || haystack.includes(q));
    });

    // Sort
    switch (sort) {
        case "price-low":
            filtered.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
            break;
        case "price-high":
            filtered.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
            break;
        case "title":
            filtered.sort((a, b) => a.title.localeCompare(b.title, "hy"));
            break;
        default: // newest — already by date in array
    }

    // Results count
    $("resultsCount").textContent = filtered.length;
    $("resultsText").textContent = filtered.length === 1 ? "հայտարարություն" : "հայտարարություն";

    // Empty state
    if (!filtered.length) {
        grid.innerHTML = "";
        $("annEmpty").classList.remove("hidden");
        return;
    }

    $("annEmpty").classList.add("hidden");

    // Render cards
    grid.innerHTML = filtered.map((x, i) => `
        <article class="ann-card" data-index="${i}">
            <div class="ann-card-image">
                ${x.image
                    ? `<img src="${esc(x.image)}" alt="${esc(x.title)}" loading="lazy">`
                    : `<span class="ann-card-emoji">${esc(x.icon || "🌱")}</span>`}
                <span class="ann-card-tag">${esc(labels[x.category] || x.category)}</span>
            </div>
            <div class="ann-card-body">
                <h3 class="ann-card-title">${esc(x.title)}</h3>
                <p class="ann-card-desc">${esc(x.description)}</p>
                <div class="ann-card-meta">
                    <span class="ann-card-loc">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        ${esc(x.location)}
                    </span>
                    <span class="ann-card-date">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <rect x="3" y="4" width="18" height="18" rx="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        ${esc(x.date || "Այսօր")}
                    </span>
                </div>
                <div class="ann-card-footer">
                    <strong class="ann-card-price">${esc(x.price || "Գինը ըստ պայմանավորվածության")}</strong>
                    <button type="button" class="ann-card-btn" data-index="${i}">
                        Դիտել
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </button>
                </div>
            </div>
        </article>
    `).join("");

    // Event delegation for "View" buttons
    grid.querySelectorAll(".ann-card-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const item = filtered[Number(btn.dataset.index)];
            toast(`${item.title} · ${item.location} · ${item.price || ""}`, "success");
        });
    });

    // Click on card
    grid.querySelectorAll(".ann-card").forEach((card) => {
        card.addEventListener("click", () => {
            const item = filtered[Number(card.dataset.index)];
            toast(`${item.title} · ${item.location}`, "success");
        });
    });
}

// =========================================================
// SEARCH + FILTER EVENTS
// =========================================================

$("search").addEventListener("input", (e) => {
    const v = e.target.value;
    $("searchClear").classList.toggle("hidden", !v);
    render();
});

$("searchClear").addEventListener("click", () => {
    $("search").value = "";
    $("searchClear").classList.add("hidden");
    $("search").focus();
    render();
});

$("category").addEventListener("change", render);
$("sortBy").addEventListener("change", render);

$("resetFilters").addEventListener("click", () => {
    $("search").value = "";
    $("category").value = "all";
    $("sortBy").value = "newest";
    $("searchClear").classList.add("hidden");
    render();
    toast("Ֆիլտրերը վերականգնվեցին", "success");
});

// =========================================================
// 🔥 MODAL — Open/Close
// =========================================================

function openModal() {
    if (!currentUser) {
        toast("Մուտք գործեք հայտարարություն տեղադրելու համար։", "error");
        sessionStorage.setItem("redirectAfterLogin", "announcements.html");
        setTimeout(() => location.href = "login.html", 900);
        return;
    }

    if (!profile?.subscriptionActive) {
        // Show notice banner + scroll to it
        $("subscriptionNotice").classList.remove("hidden");
        $("subscriptionNotice").scrollIntoView({ behavior: "smooth", block: "center" });
        toast("Ակտիվացրեք սակագին հայտարարություն տեղադրելու համար", "error");
        return;
    }

    $("modal").classList.remove("hidden");
    document.body.style.overflow = "hidden";
    setTimeout(() => $("aTitle").focus(), 100);
}

function closeModal() {
    $("modal").classList.add("hidden");
    document.body.style.overflow = "";
}

$("addAnnouncement").addEventListener("click", openModal);
$("closeModal").addEventListener("click", closeModal);
$("cancelModal").addEventListener("click", closeModal);
$("modalBackdrop").addEventListener("click", closeModal);

// ESC to close
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("modal").classList.contains("hidden")) {
        closeModal();
    }
});

// =========================================================
// IMAGE UPLOAD
// =========================================================

$("uploadZone").addEventListener("click", () => $("aImage").click());

$("aImage").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;

    if (f.size > 5 * 1024 * 1024) {
        toast("Նկարը չպետք է գերազանցի 5MB-ը։", "error");
        return;
    }

    const r = new FileReader();
    r.onload = () => {
        $("previewImg").src = r.result;
        $("imagePreview").classList.remove("hidden");
        $("uploadZone").style.display = "none";
    };
    r.readAsDataURL(f);
});

$("removeImage").addEventListener("click", (e) => {
    e.stopPropagation();
    $("aImage").value = "";
    $("previewImg").src = "";
    $("imagePreview").classList.add("hidden");
    $("uploadZone").style.display = "";
});

// =========================================================
// CHAR COUNTERS
// =========================================================

$("aTitle").addEventListener("input", (e) => {
    $("titleCount").textContent = e.target.value.length;
});

$("aDescription").addEventListener("input", (e) => {
    $("descCount").textContent = e.target.value.length;
});

// =========================================================
// SUBMIT ANNOUNCEMENT
// =========================================================

$("announcementForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentUser) {
        closeModal();
        location.href = "login.html";
        return;
    }

    if (!profile?.subscriptionActive) {
        closeModal();
        location.href = "pricing.html";
        return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    const oldText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Տեղադրվում է...';

    // Get image
    const file = $("aImage").files[0];
    let image = "";
    if (file) {
        image = await new Promise((resolve) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result);
            r.readAsDataURL(file);
        });
    }

    const item = {
        title: $("aTitle").value.trim(),
        category: $("aCategory").value,
        price: $("aPrice").value.trim(),
        location: $("aLocation").value.trim(),
        description: $("aDescription").value.trim(),
        image,
        icon: getCategoryIcon($("aCategory").value),
        date: new Date().toLocaleDateString("hy-AM"),
        uid: currentUser.uid
    };

    // Save to localStorage (instant feedback)
    localItems.unshift(item);
    localStorage.setItem("ecofarm-local-announcements", JSON.stringify(localItems));

    // Try server
    try {
        await fetch("/api/announcements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid: currentUser.uid, announcement: item })
        });
    } catch (err) {
        console.warn("Server save failed (demo mode):", err);
    }

    // Reset form
    e.target.reset();
    $("imagePreview").classList.add("hidden");
    $("uploadZone").style.display = "";
    $("titleCount").textContent = "0";
    $("descCount").textContent = "0";

    closeModal();
    render();

    toast("✅ Հայտարարությունը հաջողությամբ տեղադրվեց։", "success");

    // Scroll to top of grid
    grid.scrollIntoView({ behavior: "smooth", block: "start" });

    btn.disabled = false;
    btn.innerHTML = oldText;
});

// Category icon map
function getCategoryIcon(cat) {
    const map = {
        land: "🌾",
        equipment: "🚜",
        products: "🥬",
        animals: "🐄",
        jobs: "👨‍🌾",
        services: "🛠️"
    };
    return map[cat] || "🌱";
}

// =========================================================
// AUTH STATE
// =========================================================

onAuthStateChanged(auth, async (u) => {
    currentUser = u;

    if (u) {
        try {
            const s = await getDoc(doc(db, "users", u.uid));
            profile = s.exists() ? s.data() : null;
        } catch {
            profile = null;
        }

        const notice = $("subscriptionNotice");
        if (!profile?.subscriptionActive) {
            notice.classList.remove("hidden");
        } else {
            notice.classList.add("hidden");
        }
    } else {
        $("subscriptionNotice").classList.add("hidden");
    }

    render();
});

// =========================================================
// INIT
// =========================================================

console.log("📢 Premium announcements initialized");
render();