/* =========================================================
   ECOFARM CONNECT PAYMENT
========================================================= */

const planPrices = {
    "Eco Start": 9,
    "Eco Grow": 24,
    "Eco Premium": 49
};


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const plan =
            params.get("plan") ||
            localStorage.getItem(
                "selectedPlan"
            ) ||
            "Eco Start";


        const price =
            planPrices[plan] || 9;


        document.getElementById(
            "selected-plan"
        ).textContent = plan;


        document.getElementById(
            "selected-price"
        ).textContent =
            `$${price} / ամիս`;

    }
);


/* =========================================================
   PAY
========================================================= */

function payWith(method) {

    const buttons =
        document.querySelectorAll(
            ".payment-method"
        );


    buttons.forEach(
        button => {

            button.disabled = true;

            button.style.opacity =
                "0.55";

            button.style.pointerEvents =
                "none";

        }
    );


    const plan =
        document.getElementById(
            "selected-plan"
        ).textContent;


    const price =
        document.getElementById(
            "selected-price"
        ).textContent;


    const status =
        document.getElementById(
            "payment-status"
        );


    if (status) {

        status.innerHTML = `
            <div class="payment-loading">
                <span class="loader"></span>
                Վճարումը մշակվում է...
            </div>
        `;

    }


    /*
       DEMO PAYMENT

       Այստեղ իրական բանկային վճարում չկա։
       Քո ներկայիս նախագիծը աշխատում է demo payment-ով։
    */

    setTimeout(() => {

        localStorage.setItem(
            "paymentStatus",
            "success"
        );

        localStorage.setItem(
            "paymentMethod",
            method
        );

        localStorage.setItem(
            "paidPlan",
            plan
        );

        localStorage.setItem(
            "paidPrice",
            price
        );


        /*
           Վճարումից հետո → INDEX
        */

        window.location.href =
            "index.html";

    }, 1500);

}


window.payWith =
    payWith;