const express = require("express");

const LaundryBooking =
    require("../models/LaundryBooking");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const {
            name,
            phone,
            email,
            pickupDate,
            pickupAddress,
            deliveryAddress,
            location,
            items,
            overallTotal
        } = req.body;


        // ================================
        // VALIDATION
        // ================================

        if (
            !name ||
            !phone ||
            !email ||
            !pickupDate ||
            !pickupAddress ||
            !deliveryAddress ||
            !items ||
            !items.length ||
            overallTotal === undefined
        ) {
            return res.status(400).json({
                message:
                    "Please provide all required laundry booking information."
            });
        }


        // ================================
        // CREATE BOOKING
        // ================================

        const booking =
            new LaundryBooking({
                name,
                phone,
                email,
                pickupDate,
                pickupAddress,
                deliveryAddress,

                // Keep location for compatibility
                // with the existing system.
                location:
                    location || pickupAddress,

                items,
                overallTotal,

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
                "Laundry booking submitted successfully. Please make payment and submit your payment proof.",
            booking
        });

    } catch (error) {

        console.error(
            "Laundry booking error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to save laundry booking."
        });
    }
});


module.exports = router;