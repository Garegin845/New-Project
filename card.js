// ===============================
// EcoFarm Connect - Card Page
// ===============================

const prices = {
    "Eco Start": 9,
    "Eco Grow": 24,
    "Eco Premium": 49
};


// Get selected plan

const params =
    new URLSearchParams(window.location.search);

const plan =
    params.get("plan") ||
    localStorage.getItem("selectedPlan") ||
    "Eco Start";

const price =
    prices[plan] || 9;


// Display plan

document.getElementById("plan-name")
    .textContent = plan;

document.getElementById("plan-price")
    .textContent = `$${price} / ամիս`;

document.getElementById("button-price")
    .textContent = `$${price}`;


// =================================
// CARD NUMBER FORMAT
// =================================

const cardNumber =
    document.getElementById("card-number");

cardNumber.addEventListener("input", function () {

    let value =
        this.value.replace(/\D/g, "");

    value =
        value.substring(0, 16);

    let formatted =
        value.match(/.{1,4}/g);

    this.value =
        formatted
            ? formatted.join(" ")
            : "";

});


// =================================
// EXPIRY FORMAT
// =================================

const expiry =
    document.getElementById("expiry");

expiry.addEventListener("input", function () {

    let value =
        this.value.replace(/\D/g, "");

    value =
        value.substring(0, 4);

    if (value.length >= 3) {

        value =
            value.substring(0, 2) +
            "/" +
            value.substring(2);

    }

    this.value = value;
});


// =================================
// CARD HOLDER
// =================================

const holder =
    document.getElementById("card-holder");

holder.addEventListener("input", function () {

    this.value =
        this.value.toUpperCase();

});


// =================================
// SUBMIT
// =================================

const form =
    document.getElementById("payment-form");

form.addEventListener("submit", function (event) {

    event.preventDefault();

    const button =
        document.getElementById("pay-button");


    /*
       DEMO ONLY

       Իրական վճարման ժամանակ այստեղ
       քարտի տվյալները չենք պահելու կամ
       Node.js-ին ուղարկելու։

       Այստեղ պետք է կանչվի ArCa/payment
       provider-ի secure checkout-ը։
    */


    button.disabled = true;

    button.textContent =
        "Վճարումը մշակվում է...";


    setTimeout(() => {

        alert(
            "Demo վճարում։\n\n" +
            "Իրական SMS/OTP հաստատումը " +
            "կկատարվի բանկի secure payment էջում։"
        );

        button.disabled = false;

        button.innerHTML =
            `Վճարել <span>$${price}</span>`;

    }, 1200);

});