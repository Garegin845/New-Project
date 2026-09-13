function payWith(method) {

    // Վճարման կոճակները ժամանակավորապես անջատում ենք
    const buttons = document.querySelectorAll(".payment-method");

    buttons.forEach(button => {
        button.disabled = true;
        button.style.opacity = "0.6";
        button.style.cursor = "not-allowed";
    });

    // Փոքր loading
    const selectedPlan = document.getElementById("selected-plan");
    const selectedPrice = document.getElementById("selected-price");

    selectedPlan.textContent = "Վճարումը մշակվում է...";
    selectedPrice.textContent = "";

    // Դեմո վճարում
    setTimeout(() => {

        // Պահպանում ենք, որ վճարումը հաջող է եղել
        localStorage.setItem("paymentStatus", "success");
        localStorage.setItem("paymentMethod", method);

        // Գլխավոր էջ տեղափոխում
        window.location.href = "home.html";

    }, 1500);
}