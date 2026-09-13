
/* =========================
   LANGUAGE SYSTEM
========================= */

const translations = {

    hy: {
        navPricing: "Սակագներ",
        navRegister: "Գրանցվել",

        pricingTitle: "Մեր Սակագնային Պլանները",

        start: "Eco Start",
        grow: "Eco Grow",
        premium: "Eco Premium",

        month: "/ամիս",

        popular: "Հանրաճանաչ",

        f1: "✓ Մինչև 5 ապրանքի տեղադրում",
        f2: "✓ Հիմնական պրոֆիլ",
        f3: "✓ Ստանդարտ տեսանելիություն",

        f4: "✓ Անսահմանափակ ապրանքներ",
        f5: "✓ Վստահելի ֆերմերի նշան",
        f6: "✓ Առաջնահերթություն որոնման մեջ",

        f7: "✓ Ներառված են Grow-ի բոլոր ֆունկցիաները",
        f8: "✓ Անհատական մարքեթինգային աջակցություն",
        f9: "✓ Գովազդ գլխավոր էջում",

        select: "Ընտրել",

        registerTitle: "Ֆերմերի Գրանցում և Ցուցադրություն",

        name: "Անուն / Ազգանուն կամ Բրենդ",
        country: "Երկիր",
        email: "Էլ. Փոստ",
        plan: "Ընտրված Սակագնային Պլան",
        product: "Էկո Արտադրանքի Նկարագրություն",
        file: "Ապրանքի Լուսանկար",

        payment: "Անցնել Վճարման",

        showcaseTitle: "Մեր Ֆերմերների Արտադրանքը",

        oliveImage: "Eco Olive Oil",
        oliveTitle: "Premium Olive Oil",
        oliveFarmer: "Ֆերմեր՝ Ալեխանդրո (Իսպանիա)",

        honeyImage: "Organic Honey",
        honeyTitle: "Wildflower Honey",
        honeyFarmer: "Ֆերմեր՝ Արամ (Հայաստան)",

        avocadoImage: "Fresh Avocado",
        avocadoTitle: "Bio Avocado",
        avocadoFarmer: "Ֆերմեր՝ Ջոն (ԱՄՆ)"
    },

    en: {
        navPricing: "Pricing",
        navRegister: "Register",

        pricingTitle: "Our Pricing Plans",

        start: "Eco Start",
        grow: "Eco Grow",
        premium: "Eco Premium",

        month: "/month",

        popular: "Popular",

        f1: "✓ Up to 5 product listings",
        f2: "✓ Basic profile",
        f3: "✓ Standard visibility",

        f4: "✓ Unlimited products",
        f5: "✓ Trusted Farmer badge",
        f6: "✓ Priority in search results",

        f7: "✓ All Grow features included",
        f8: "✓ Personalized marketing support",
        f9: "✓ Homepage advertising",

        select: "Select",

        registerTitle: "Farmer Registration & Showcase",

        name: "Full Name / Brand",
        country: "Country",
        email: "Email",
        plan: "Selected Pricing Plan",
        product: "Eco Product Description",
        file: "Product Photo",

        payment: "Proceed to Payment",

        showcaseTitle: "Our Farmers' Products",

        oliveImage: "Eco Olive Oil",
        oliveTitle: "Premium Olive Oil",
        oliveFarmer: "Farmer: Alejandro (Spain)",

        honeyImage: "Organic Honey",
        honeyTitle: "Wildflower Honey",
        honeyFarmer: "Farmer: Aram (Armenia)",

        avocadoImage: "Fresh Avocado",
        avocadoTitle: "Bio Avocado",
        avocadoFarmer: "Farmer: John (USA)"
    },

    ru: {
        navPricing: "Тарифы",
        navRegister: "Регистрация",

        pricingTitle: "Наши тарифные планы",

        start: "Eco Start",
        grow: "Eco Grow",
        premium: "Eco Premium",

        month: "/месяц",

        popular: "Популярный",

        f1: "✓ До 5 размещений товаров",
        f2: "✓ Базовый профиль",
        f3: "✓ Стандартная видимость",

        f4: "✓ Неограниченное количество товаров",
        f5: "✓ Знак проверенного фермера",
        f6: "✓ Приоритет в результатах поиска",

        f7: "✓ Все функции Grow включены",
        f8: "✓ Персональная маркетинговая поддержка",
        f9: "✓ Реклама на главной странице",

        select: "Выбрать",

        registerTitle: "Регистрация и витрина фермера",

        name: "Имя / Фамилия или Бренд",
        country: "Страна",
        email: "Электронная почта",
        plan: "Выбранный тарифный план",
        product: "Описание экологического продукта",
        file: "Фотография продукта",

        payment: "Перейти к оплате",

        showcaseTitle: "Продукция наших фермеров",

        oliveImage: "Eco Olive Oil",
        oliveTitle: "Premium Olive Oil",
        oliveFarmer: "Фермер: Алехандро (Испания)",

        honeyImage: "Organic Honey",
        honeyTitle: "Wildflower Honey",
        honeyFarmer: "Фермер: Арам (Армения)",

        avocadoImage: "Fresh Avocado",
        avocadoTitle: "Bio Avocado",
        avocadoFarmer: "Фермер: Джон (США)"
    }

};


/* =========================
   CHANGE LANGUAGE
========================= */

function changeLanguage(lang) {

    const t = translations[lang];

    if (!t) return;

    document.getElementById("nav-pricing").textContent = t.navPricing;
    document.getElementById("nav-register").textContent = t.navRegister;

    document.getElementById("title-pricing").textContent = t.pricingTitle;
    document.getElementById("title-register").textContent = t.registerTitle;
    document.getElementById("title-showcase").textContent = t.showcaseTitle;

    document.getElementById("badge-popular").textContent = t.popular;

    document.getElementById("f1").textContent = t.f1;
    document.getElementById("f2").textContent = t.f2;
    document.getElementById("f3").textContent = t.f3;

    document.getElementById("f4").textContent = t.f4;
    document.getElementById("f5").textContent = t.f5;
    document.getElementById("f6").textContent = t.f6;

    document.getElementById("f7").textContent = t.f7;
    document.getElementById("f8").textContent = t.f8;
    document.getElementById("f9").textContent = t.f9;

    document.querySelectorAll(".select-btn").forEach(button => {
        button.textContent = t.select;
    });

    document.getElementById("lbl-name").textContent = t.name;
    document.getElementById("lbl-country").textContent = t.country;
    document.getElementById("lbl-email").textContent = t.email;
    document.getElementById("lbl-plan").textContent = t.plan;
    document.getElementById("lbl-product").textContent = t.product;
    document.getElementById("lbl-file").textContent = t.file;

    document.getElementById("btn-submit").textContent = t.payment;

    document.getElementById("farm1").textContent = t.oliveFarmer;
    document.getElementById("farm2").textContent = t.honeyFarmer;
    document.getElementById("farm3").textContent = t.avocadoFarmer;

    const productImages = document.querySelectorAll(".product-img");

    if (productImages.length >= 3) {
        productImages[0].textContent = t.oliveImage;
        productImages[1].textContent = t.honeyImage;
        productImages[2].textContent = t.avocadoImage;
    }

    const productTitles = document.querySelectorAll(".product-info h4");

    if (productTitles.length >= 3) {
        productTitles[0].textContent = t.oliveTitle;
        productTitles[1].textContent = t.honeyTitle;
        productTitles[2].textContent = t.avocadoTitle;
    }

    const cards = document.querySelectorAll(".price-card");

    if (cards.length >= 3) {

        cards[0].querySelector("h3").textContent = t.start;
        cards[1].querySelector("h3").textContent = t.grow;
        cards[2].querySelector("h3").textContent = t.premium;

        cards.forEach(card => {

            const yearText = card.querySelector(".per-year");

            if (yearText) {
                yearText.textContent = t.month;
            }

        });
    }

    localStorage.setItem("ecofarm-language", lang);

    document.documentElement.lang = lang;
}


/* =========================
   SELECT PLAN
========================= */

function selectPlan(plan) {

    const select = document.getElementById("plan-select");

    if (!select) return;

    select.value = plan;

    const register = document.getElementById("register");

    if (register) {
        register.scrollIntoView({
            behavior: "smooth"
        });
    }
}


/* =========================
   PAYMENT
========================= */

async function handlePayment() {

    const nameInput = document.querySelectorAll(
        '.form-group input[type="text"]'
    );

    const emailInput = document.querySelector(
        '.form-group input[type="email"]'
    );

    const textarea = document.querySelector("textarea");

    const planSelect = document.getElementById("plan-select");

    const button = document.getElementById("btn-submit");


    if (!nameInput[0] || !nameInput[1] || !emailInput || !textarea || !planSelect) {

        alert("Form-ի դաշտերը չեն գտնվել։");

        return;
    }


    const name = nameInput[0].value.trim();

    const country = nameInput[1].value.trim();

    const email = emailInput.value.trim();

    const plan = planSelect.value;

    const product = textarea.value.trim();


    if (!name || !country || !email || !plan || !product) {

        alert("Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը։");

        return;
    }


    button.disabled = true;

    button.textContent = "Խնդրում ենք սպասել...";


    try {

        console.log("Sending payment request...");

        const response = await fetch("/api/create-payment", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name,
                country: country,
                email: email,
                plan: plan,
                product: product
            })

        });


        console.log("HTTP status:", response.status);


        const data = await response.json();

        console.log("Server response:", data);


        if (!response.ok) {

            throw new Error(
                data.error || "Server error"
            );

        }


        if (!data.paymentUrl) {

            throw new Error(
                "paymentUrl չի ստացվել server-ից"
            );

        }


        localStorage.setItem(
            "selectedPlan",
            plan
        );


        console.log(
            "Redirecting to:",
            data.paymentUrl
        );


        window.location.href = data.paymentUrl;


    } catch (error) {

        console.error(
            "PAYMENT ERROR:",
            error
        );


        alert(
            "Վճարման էջը բացել չհաջողվեց։\n\n" +
            error.message
        );


        button.disabled = false;

        button.textContent =
            translations[
                localStorage.getItem("ecofarm-language") || "hy"
            ].payment;
    }

}


/* =========================
   LOAD LANGUAGE
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const savedLanguage =
            localStorage.getItem("ecofarm-language") || "hy";

        const selector =
            document.querySelector(".lang-select");

        if (selector) {
            selector.value = savedLanguage;
        }

        changeLanguage(savedLanguage);

    }
);

