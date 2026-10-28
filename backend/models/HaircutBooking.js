const mongoose = require("mongoose");

const haircutBookingSchema = new mongoose.Schema(
    {
        // ================================
        // CUSTOMER INFORMATION
        // ================================

        name: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true
        },


        // ================================
        // SERVICE ADDRESS
        // ================================

        location: {
            type: String,
            required: false
        },

        serviceAddress: {
            type: String,
            required: true
        },


        // ================================
        // HAIRCUT SERVICE
        // ================================

        service: {
            type: String,
            default: "Home Haircut"
        },

        haircutService: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true
        },


        // ================================
        // CUSTOMER REQUESTED APPOINTMENT
        // ================================

        requestedAppointmentDate: {
            type: Date,
            required: true
        },

        requestedAppointmentTime: {
            type: String,
            required: true
        },


        // ================================
        // PAYMENT
        // ================================

        paymentStatus: {
            type: String,
            enum: [
                "Pending",
                "Proof Submitted",
                "Verified",
                "Rejected"
            ],
            default: "Pending"
        },

        paymentProof: {
            type: String,
            default: ""
        },

        paymentVerifiedAt: {
            type: Date,
            default: null
        },


        // ================================
        // BOOKING STATUS
        // ================================

        status: {
            type: String,
            enum: [
                "Pending",
                "Confirmed",
                "Completed",
                "Cancelled"
            ],
            default: "Pending"
        },


        // ================================
        // ADMIN CONFIRMED APPOINTMENT
        // ================================

        confirmedAppointmentDate: {
            type: Date,
            default: null
        },

        confirmedAppointmentTime: {
            type: String,
            default: ""
        },


        // ================================
        // CUSTOMER EMAIL CONFIRMATION
        // ================================

        confirmationEmailSent: {
            type: Boolean,
            default: false
        },

        confirmationEmailSentAt: {
            type: Date,
            default: null
        }
    },

    {
        timestamps: true
    }
);


module.exports = mongoose.model(
    "HaircutBooking",
    haircutBookingSchema
);