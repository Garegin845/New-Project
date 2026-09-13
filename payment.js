const prices = {
    "Eco Start": 9,
    "Eco Grow": 24,
    "Eco Premium": 49
};

const params =
    new URLSearchParams(window.location.search);

const plan =
    params.get("plan") ||
    localStorage.getItem("selectedPlan") ||
    "Eco Start";

const price =
    prices[plan] || 9;

document.getElementById("selected-plan")
    .textContent = plan;

document.getElementById("selected-price")
    .textContent = `$${price} / ամիս`;

localStorage.setItem("selectedPlan", plan);


function payWith(method) {

    // Ընտրված վճարման մեթոդը պահում ենք
    localStorage.setItem("paymentMethod", method);

    // Գնում ենք քարտի էջ
    window.location.href =
        "card.html?plan=" +
        encodeURIComponent(plan) +
        "&method=" +
        encodeURIComponent(method);
}