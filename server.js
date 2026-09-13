const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Frontend files
app.use(express.static(__dirname));


// Plans
const plans = {
    "Eco Start": 9,
    "Eco Grow": 24,
    "Eco Premium": 49
};


// Create payment
app.post("/api/create-payment", async (req, res) => {

    try {

        const {
            name,
            country,
            email,
            plan,
            product
        } = req.body;


        // Validation

        if (!name || !country || !email || !plan) {

            return res.status(400).json({
                error: "Missing required information"
            });

        }


        if (!plans[plan]) {

            return res.status(400).json({
                error: "Invalid plan"
            });

        }


        const amount = plans[plan];


        console.log("New payment request:");

        console.log({
            name,
            country,
            email,
            plan,
            amount,
            product
        });


        /*
        ==========================================
        ARCA PAYMENT WILL GO HERE
        ==========================================

        1. Generate unique order number
        2. Send request to ArCa
        3. Receive orderId + formUrl
        4. Return formUrl to frontend
        */


        res.json({
            success: true,

            // TEMPORARY
            // Later this will be ArCa formUrl

            paymentUrl:
                `/payment.html?plan=${encodeURIComponent(plan)}`
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Payment creation failed"
        });

    }

});


app.listen(PORT, () => {

    console.log(
        `EcoFarm server running at http://localhost:${PORT}`
    );

// Քո server.js

app.post("/api/create-payment", async (req, res) => {

    // 1. Ստանում ենք ընտրված պլանը
    const { name, email, plan } = req.body;

    // 2. Payment provider-ում ստեղծում ենք order
    // 3. Ստանում ենք secure payment URL

    res.json({
        paymentUrl: "SECURE_PAYMENT_URL"
    });
});});