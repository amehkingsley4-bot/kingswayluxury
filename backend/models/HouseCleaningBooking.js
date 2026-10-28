const mongoose = require("mongoose");

const houseCleaningBookingSchema = new mongoose.Schema(
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
        // CLEANING SERVICE
        // ================================

        bedrooms: {
            type: Number,
            required: true
        },

        package: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true
        },


        // ================================
        // CUSTOMER REQUESTED SERVICE DATE
        // ================================

        requestedServiceDate: {
            type: Date,
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
        // ADMIN CONFIRMED SERVICE DATE
        // ================================

        confirmedServiceDate: {
            type: Date,
            default: null
        },

        confirmedServiceTime: {
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
    "HouseCleaningBooking",
    houseCleaningBookingSchema
);