// ========================================
// EcoFarm Connect — Payment UI
// ========================================


// Plans

const prices = {

    "Eco Start": 9,

    "Eco Grow": 24,

    "Eco Premium": 49

};


// URL parameters

const params =
    new URLSearchParams(
        window.location.search
    );


const plan =
    params.get("plan") ||
    localStorage.getItem("selectedPlan") ||
    "Eco Start";


const price =
    prices[plan] || 9;


// ========================================
// PLAN INFORMATION
// ========================================

document.getElementById("plan-name")
    .textContent = plan;


document.getElementById("plan-price")
    .textContent =
        `$${price} / ամիս`;


document.getElementById("button-price")
    .textContent =
        `$${price}`;


// ========================================
// ELEMENTS
// ========================================

const cardNumber =
    document.getElementById("card-number");

const expiry =
    document.getElementById("expiry");

const cvv =
    document.getElementById("cvv");

const cardHolder =
    document.getElementById("card-holder");

const visualNumber =
    document.getElementById("visual-number");

const visualName =
    document.getElementById("visual-name");

const visualExpiry =
    document.getElementById("visual-expiry");

const cardType =
    document.getElementById("card-type");

const detectedCard =
    document.getElementById("detected-card");


// ========================================
// CARD TYPE DETECTION
// ========================================

function detectCardType(number) {

    number =
        number.replace(/\D/g, "");


    if (/^4/.test(number)) {

        return "VISA";

    }


    if (
        /^(5[1-5]|2[2-7])/.test(number)
    ) {

        return "MASTERCARD";

    }


    return "CARD";
}


// ========================================
// CARD NUMBER
// ========================================

cardNumber.addEventListener(
    "input",
    function () {

        let value =
            this.value
                .replace(/\D/g, "")
                .substring(0, 16);


        let formatted =
            value.match(/.{1,4}/g);


        this.value =
            formatted
                ? formatted.join(" ")
                : "";


        const type =
            detectCardType(value);


        cardType.textContent =
            type;


        detectedCard.textContent =
            type === "CARD"
                ? ""
                : type;


        if (!value) {

            visualNumber.textContent =
                "•••• •••• •••• ••••";

            return;
        }


        let groups = [];

        for (
            let i = 0;
            i < value.length;
            i += 4
        ) {

            groups.push(
                value.substring(i, i + 4)
            );
        }


        while (groups.length < 4) {

            groups.push("••••");
        }


        visualNumber.textContent =
            groups.join(" ");
    }
);


// ========================================
// EXPIRY
// ========================================

expiry.addEventListener(
    "input",
    function () {

        let value =
            this.value
                .replace(/\D/g, "")
                .substring(0, 4);


        if (value.length >= 3) {

            value =
                value.substring(0, 2)
                + "/"
                + value.substring(2);

        }


        this.value = value;


        visualExpiry.textContent =
            value || "MM/YY";
    }
);


// ========================================
// CARD HOLDER
// ========================================

cardHolder.addEventListener(
    "input",
    function () {

        this.value =
            this.value
                .toUpperCase()
                .substring(0, 30);


        visualName.textContent =
            this.value ||
            "YOUR NAME";
    }
);


// ========================================
// CVV SHOW / HIDE
// ========================================

const toggleCVV =
    document.getElementById("toggle-cvv");


toggleCVV.addEventListener(
    "click",
    function () {

        if (
            cvv.type === "password"
        ) {

            cvv.type = "text";

            this.textContent = "🙈";

        } else {

            cvv.type = "password";

            this.textContent = "👁";
        }
    }
);


// ========================================
// ONLY NUMBERS — CVV
// ========================================

cvv.addEventListener(
    "input",
    function () {

        this.value =
            this.value
                .replace(/\D/g, "")
                .substring(0, 4);
    }
);


// ========================================
// FORM
// ========================================

const form =
    document.getElementById(
        "payment-form"
    );


const payButton =
    document.getElementById(
        "pay-button"
    );


const processing =
    document.getElementById(
        "processing"
    );


form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // --------------------------------
        // DEMO VALIDATION ONLY
        // --------------------------------

        const number =
            cardNumber.value
                .replace(/\s/g, "");

        const expiration =
            expiry.value;

        const securityCode =
            cvv.value;

        const holder =
            cardHolder.value.trim();


        let valid = true;


        // Card number

        if (
            number.length < 13
        ) {

            document.getElementById(
                "card-error"
            ).textContent =
                "Մուտքագրեք քարտի համարը։";

            valid = false;

        } else {

            document.getElementById(
                "card-error"
            ).textContent = "";
        }


        // Expiry

        if (
            !/^\d{2}\/\d{2}$/.test(
                expiration
            )
        ) {

            document.getElementById(
                "expiry-error"
            ).textContent =
                "Օրինակ՝ 12/29";

            valid = false;

        } else {

            document.getElementById(
                "expiry-error"
            ).textContent = "";
        }


        // CVV

        if (
            securityCode.length < 3
        ) {

            valid = false;
        }


        // Holder

        if (!holder) {

            valid = false;

            cardHolder.focus();
        }


        if (!valid) {

            return;
        }


        // --------------------------------
        // DEMO PROCESSING
        // --------------------------------

        payButton.disabled = true;

        processing.classList.add(
            "active"
        );


        /*
         * IMPORTANT:
         *
         * Այստեղ իրական քարտի տվյալները
         * չենք ուղարկում քո server.js-ին։
         *
         * Production տարբերակում այստեղ
         * պետք է բացվի payment provider-ի
         * secure checkout-ը։
         *
         * Provider-ը կանի՝
         *
         * Visa
         * ↓
         * 3-D Secure
         * ↓
         * SMS / OTP
         * ↓
         * Bank authorization
         * ↓
         * Charge
         *
         */


        setTimeout(() => {

            processing.classList.remove(
                "active"
            );

            payButton.disabled = false;


            alert(
                "Սա դեռ DEMO վճարում է։\n\n" +
                "Իրական վճարման ժամանակ այստեղ " +
                "կբացվի բանկի / payment provider-ի " +
                "secure էջը, որտեղ կկատարվի " +
                "3-D Secure և SMS հաստատումը։"
            );

        }, 1500);

    }
);