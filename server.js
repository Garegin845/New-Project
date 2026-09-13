
const express = require("express");
require("dotenv").config();

const app = express();

const PORT = 3000;

// =========================
// MIDDLEWARE
// =========================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend files
app.use(express.static(__dirname));


// =========================
// PLANS
// =========================

const plans = {
    "Eco Start": 9,
    "Eco Grow": 24,
    "Eco Premium": 49
};


// =========================
// CREATE PAYMENT
// =========================

app.post("/api/create-payment", async (req, res) => {

    try {

        const {
            name,
            country,
            email,
            plan,
            product
        } = req.body;


        // =========================
        // VALIDATION
        // =========================

        if (!name || !country || !email || !plan) {

            return res.status(400).json({
                error: "Missing required information"
            });

        }


        // =========================
        // CHECK PLAN
        // =========================

        if (!plans[plan]) {

            return res.status(400).json({
                error: "Invalid plan"
            });

        }


        // =========================
        // PRICE
        // =========================

        const amount = plans[plan];


        // =========================
        // SERVER LOG
        // =========================

        console.log("New payment request:");

        console.log({
            name,
            country,
            email,
            plan,
            amount,
            product
        });


        // =========================
        // TEMPORARY PAYMENT PAGE
        // =========================

        const paymentUrl =
            `/payment.html?plan=${encodeURIComponent(plan)}`;


        return res.json({

            success: true,

            paymentUrl: paymentUrl

        });

    } catch (error) {

        console.error(
            "Payment creation error:",
            error
        );

        return res.status(500).json({

            error: "Payment creation failed"

        });

    }

});


// =========================
// START SERVER
// =========================

app.listen(PORT, () => {

    console.log(
        `EcoFarm server running at http://localhost:${PORT}`
    );

});

