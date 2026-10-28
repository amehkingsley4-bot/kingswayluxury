const express = require("express");

const HaircutBooking =
    require("../models/HaircutBooking");

const router = express.Router();


router.post("/", async (req, res) => {
    try {

        const {
            name,
            phone,
            email,
            location,
            serviceAddress,
            service,
            haircutService,
            price,
            requestedAppointmentDate,
            requestedAppointmentTime
        } = req.body;


        // ================================
        // VALIDATION
        // ================================

        if (
            !name ||
            !phone ||
            !email ||
            !serviceAddress ||
            !haircutService ||
            price === undefined ||
            !requestedAppointmentDate ||
            !requestedAppointmentTime
        ) {
            return res.status(400).json({
                message:
                    "Please provide all required haircut booking information."
            });
        }


        // ================================
        // CREATE BOOKING
        // ================================

        const booking =
            new HaircutBooking({

                name,
                phone,
                email,

                // Keep location for compatibility
                location:
                    location || serviceAddress,

                service:
                    service || "Home Haircut",

                haircutService,

                price,

                requestedAppointmentDate,

                requestedAppointmentTime,

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
                "Home haircut booking submitted successfully. Please make payment and submit your payment proof.",
            booking
        });


    } catch (error) {

        console.error(
            "Haircut booking error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to save haircut booking."
        });
    }
});


module.exports = router;