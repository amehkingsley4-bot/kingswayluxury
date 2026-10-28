const mongoose = require("mongoose");

const laundryItemSchema = new mongoose.Schema(
    {
        item: {
            type: String,
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        service: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        total: {
            type: Number,
            required: true
        }
    }
);


const laundryBookingSchema = new mongoose.Schema(
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
        // LAUNDRY PICKUP INFORMATION
        // ================================

        pickupDate: {
            type: Date,
            required: true
        },

        pickupAddress: {
            type: String,
            required: true
        },

        deliveryAddress: {
            type: String,
            required: true
        },


        // Keep the existing location field
        // for compatibility with existing bookings.
        location: {
            type: String,
            required: false
        },


        // ================================
        // LAUNDRY ITEMS
        // ================================

        items: {
            type: [laundryItemSchema],
            required: true
        },

        overallTotal: {
            type: Number,
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
        // ADMIN CONFIRMED SCHEDULE
        // ================================

        confirmedPickupDate: {
            type: Date,
            default: null
        },

        confirmedPickupTime: {
            type: String,
            default: ""
        },

        confirmedDeliveryDate: {
            type: Date,
            default: null
        },

        confirmedDeliveryTime: {
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
    "LaundryBooking",
    laundryBookingSchema
);