const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true
    },

    customerPhone: {
      type: String,
      required: true,
      trim: true
    },

    customerLocation: {
      type: String,
      required: true,
      trim: true
    },

    service: {
      type: String,
      required: true
    },

    items: [
      {
        item: {
          type: String,
          required: true
        },

        quantity: {
          type: Number,
          required: true
        },

        serviceType: {
          type: String
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
    ],

    overallTotal: {
      type: Number,
      required: true
    },

    notes: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      default: "Pending"
    }
  },

  {
    timestamps: true
  }
);

module.exports = mongoose.model("Booking", bookingSchema);