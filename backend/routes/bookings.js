const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");


// CREATE BOOKING
router.post("/", async (req, res) => {

  try {

    const booking = new Booking(req.body);

    const savedBooking = await booking.save();

    res.status(201).json({
      message: "Booking saved successfully",
      booking: savedBooking
    });

  } catch (error) {

    console.error("Booking error:", error);

    res.status(500).json({
      message: "Failed to save booking",
      error: error.message
    });

  }

});


module.exports = router;