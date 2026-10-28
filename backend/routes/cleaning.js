const express = require("express");

const HouseCleaningBooking =
    require("../models/HouseCleaningBooking");

const router = express.Router();


router.post("/", async (req, res) => {
    try {

        const {
            name,
            phone,
            email,
            location,
            serviceAddress,
            bedrooms,
            package: cleaningPackage,
            price,
            requestedServiceDate
        } = req.body;


        // ================================
        // VALIDATION
        // ================================

        if (
            !name ||
            !phone ||
            !email ||
            !serviceAddress ||
            bedrooms === undefined ||
            !cleaningPackage ||
            price === undefined ||
            !requestedServiceDate
        ) {
            return res.status(400).json({
                message:
                    "Please provide all required house cleaning booking information."
            });
        }


        // ================================
        // CREATE BOOKING
        // ================================

        const booking =
            new HouseCleaningBooking({

                name,
                phone,
                email,

                // Keep location for compatibility
                location:
                    location || serviceAddress,

                serviceAddress,

                bedrooms,

                package: cleaningPackage,

                price,

                requestedServiceDate,

                // Payment starts as pending.
                paymentStatus: "Pending",

                // Booking starts as pending.
                status: "Pending"
            });


        // ================================
        // SAVE BOOKING
        // ================================

        await booking.save();


        // ================================
        // RESPONSE
        // ================================

        res.status(201).json({
            message:
                "House cleaning booking submitted successfully. Please make payment and submit your payment proof.",
            booking
        });


    } catch (error) {

        console.error(
            "House cleaning booking error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to save house cleaning booking."
        });
    }
});


module.exports = router;