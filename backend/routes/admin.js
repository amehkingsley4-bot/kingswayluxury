const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const path = require("path");

const { sendEmail } = require("../config/email");

const router = express.Router();

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD || "KingswayAdmin2026!";

const activeAdminTokens = new Set();

/* =========================================================
   COLLECTIONS
========================================================= */

const collections = {
    laundry: "laundrybookings",
    haircut: "haircutbookings",
    cleaning: "housecleaningbookings"
};

/* =========================================================
   NORMALIZE BOOKING TYPE
========================================================= */

function normalizeBookingType(type) {
    const value = String(type || "")
        .trim()
        .toLowerCase();

    if (
        [
            "laundry",
            "laundrybooking",
            "laundrybookings"
        ].includes(value)
    ) {
        return "laundry";
    }

    if (
        [
            "haircut",
            "haircutbooking",
            "haircutbookings",
            "homehaircut",
            "home-haircut"
        ].includes(value)
    ) {
        return "haircut";
    }

    if (
        [
            "cleaning",
            "cleaningbooking",
            "cleaningbookings",
            "housecleaning",
            "house-cleaning",
            "housecleaningbooking",
            "housecleaningbookings"
        ].includes(value)
    ) {
        return "cleaning";
    }

    return null;
}

/* =========================================================
   GET COLLECTION
========================================================= */

function getCollection(type) {
    const normalizedType = normalizeBookingType(type);

    if (!normalizedType) {
        return null;
    }

    return mongoose.connection.collection(
        collections[normalizedType]
    );
}

/* =========================================================
   ADMIN LOGIN
========================================================= */

router.post("/login", (req, res) => {
    try {
        const { password } = req.body;

        if (!password || password !== ADMIN_PASSWORD) {
            return res.status(401).json({
                message: "Invalid admin password."
            });
        }

        const token = crypto.randomBytes(32).toString("hex");

        activeAdminTokens.add(token);

        res.json({
            message: "Login successful.",
            token
        });
    } catch (error) {
        console.error("Admin login error:", error);

        res.status(500).json({
            message: "Login failed."
        });
    }
});

/* =========================================================
   ADMIN AUTHENTICATION
========================================================= */

function authenticateAdmin(req, res, next) {
    const authHeader = req.headers.authorization;

    if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
    ) {
        return res.status(401).json({
            message: "Unauthorized."
        });
    }

    const token = authHeader.split(" ")[1];

    if (!activeAdminTokens.has(token)) {
        return res.status(401).json({
            message: "Invalid or expired admin session."
        });
    }

    next();
}

/* =========================================================
   ADMIN LOGOUT
========================================================= */

router.post(
    "/logout",
    authenticateAdmin,
    (req, res) => {
        const token =
            req.headers.authorization.split(" ")[1];

        activeAdminTokens.delete(token);

        res.json({
            message: "Logged out successfully."
        });
    }
);

/* =========================================================
   GET ALL BOOKINGS
========================================================= */

router.get(
    "/bookings",
    authenticateAdmin,
    async (req, res) => {
        try {
            const laundryBookings =
                await getCollection("laundry")
                    .find({})
                    .sort({ createdAt: -1 })
                    .toArray();

            const haircutBookings =
                await getCollection("haircut")
                    .find({})
                    .sort({ createdAt: -1 })
                    .toArray();

            const cleaningBookings =
                await getCollection("cleaning")
                    .find({})
                    .sort({ createdAt: -1 })
                    .toArray();

            const bookings = [
                ...laundryBookings.map(
                    booking => ({
                        ...booking,
                        bookingType: "laundry"
                    })
                ),

                ...haircutBookings.map(
                    booking => ({
                        ...booking,
                        bookingType: "haircut"
                    })
                ),

                ...cleaningBookings.map(
                    booking => ({
                        ...booking,
                        bookingType: "cleaning"
                    })
                )
            ];

            bookings.sort((a, b) => {
                const dateA =
                    new Date(a.createdAt || 0);

                const dateB =
                    new Date(b.createdAt || 0);

                return dateB - dateA;
            });

            res.json(bookings);
        } catch (error) {
            console.error(
                "Get bookings error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to load bookings."
            });
        }
    }
);

/* =========================================================
   VIEW PAYMENT PROOF / RECEIPT
========================================================= */

router.get(
    "/payment-proof/:type/:id",
    authenticateAdmin,
    async (req, res) => {
        try {
            const { type, id } = req.params;

            const normalizedType =
                normalizeBookingType(type);

            if (!normalizedType) {
                return res.status(400).json({
                    message:
                        "Unknown booking type."
                });
            }

            if (
                !mongoose.Types.ObjectId.isValid(id)
            ) {
                return res.status(400).json({
                    message:
                        "Invalid booking ID."
                });
            }

            const booking =
                await getCollection(normalizedType)
                    .findOne({
                        _id:
                            new mongoose.Types.ObjectId(id)
                    });

            if (!booking) {
                return res.status(404).json({
                    message:
                        "Booking not found."
                });
            }

            if (!booking.paymentProof) {
                return res.status(404).json({
                    message:
                        "No payment proof has been uploaded."
                });
            }

            const uploadPath = path.join(
                __dirname,
                "..",
                "uploads",
                booking.paymentProof
            );

            res.sendFile(uploadPath);
        } catch (error) {
            console.error(
                "Payment proof error:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to open payment proof."
            });
        }
    }
);

/* =========================================================
   UPDATE PAYMENT STATUS
========================================================= */

router.patch(
    "/bookings/:type/:id/payment-status",
    authenticateAdmin,
    async (req, res) => {
        try {
            const { type, id } = req.params;
            const { paymentStatus } = req.body;

            const normalizedType =
                normalizeBookingType(type);

            const allowedStatuses = [
                "Pending",
                "Proof Submitted",
                "Verified",
                "Rejected"
            ];

            if (!normalizedType) {
                return res.status(400).json({
                    message:
                        "Unknown booking type."
                });
            }

            if (
                !mongoose.Types.ObjectId.isValid(id)
            ) {
                return res.status(400).json({
                    message:
                        "Invalid booking ID."
                });
            }

            if (
                !allowedStatuses.includes(
                    paymentStatus
                )
            ) {
                return res.status(400).json({
                    message:
                        "Invalid payment status."
                });
            }

            const updateData = {
                paymentStatus,

                paymentVerifiedAt:
                    paymentStatus === "Verified"
                        ? new Date()
                        : null
            };

            const result =
                await getCollection(normalizedType)
                    .findOneAndUpdate(
                        {
                            _id:
                                new mongoose.Types.ObjectId(
                                    id
                                )
                        },
                        {
                            $set: updateData
                        },
                        {
                            returnDocument: "after"
                        }
                    );

            if (!result) {
                return res.status(404).json({
                    message:
                        "Booking not found."
                });
            }

            res.json({
                message:
                    `Payment status updated to ${paymentStatus}.`,
                booking: result
            });
        } catch (error) {
            console.error(
                "Payment status error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to update payment status."
            });
        }
    }
);

/* =========================================================
   CONFIRM BOOKING + SEND EMAIL
========================================================= */

router.patch(
    "/bookings/:type/:id/confirm",
    authenticateAdmin,
    async (req, res) => {
        try {
            const { type, id } = req.params;

            const normalizedType =
                normalizeBookingType(type);

            const {
                confirmedDate,
                confirmedTime,

                confirmedPickupDate,
                confirmedPickupTime,

                confirmedDeliveryDate,
                confirmedDeliveryTime
            } = req.body;

            if (!normalizedType) {
                return res.status(400).json({
                    message:
                        "Unknown booking type."
                });
            }

            if (
                !mongoose.Types.ObjectId.isValid(id)
            ) {
                return res.status(400).json({
                    message:
                        "Invalid booking ID."
                });
            }

            const bookingCollection =
                getCollection(normalizedType);

            const booking =
                await bookingCollection.findOne({
                    _id:
                        new mongoose.Types.ObjectId(id)
                });

            if (!booking) {
                return res.status(404).json({
                    message:
                        "Booking not found."
                });
            }

            /* -------------------------------------------------
               PAYMENT MUST BE VERIFIED FIRST
            ------------------------------------------------- */

            if (
                booking.paymentStatus !==
                "Verified"
            ) {
                return res.status(400).json({
                    message:
                        "This booking cannot be confirmed until payment has been verified."
                });
            }

            /* -------------------------------------------------
               BUILD CONFIRMATION DATA
            ------------------------------------------------- */

            const updateData = {
                status: "Confirmed"
            };

            /* -------------------------------------------------
               LAUNDRY
            ------------------------------------------------- */

            if (
                normalizedType ===
                "laundry"
            ) {
                const pickupDate =
                    confirmedPickupDate ||
                    confirmedDate;

                const pickupTime =
                    confirmedPickupTime ||
                    confirmedTime;

                const deliveryDate =
                    confirmedDeliveryDate ||
                    confirmedDate;

                const deliveryTime =
                    confirmedDeliveryTime ||
                    confirmedTime;

                if (
                    !pickupDate ||
                    !pickupTime ||
                    !deliveryDate ||
                    !deliveryTime
                ) {
                    return res.status(400).json({
                        message:
                            "Please provide confirmed pickup and delivery date/time."
                    });
                }

                updateData.confirmedPickupDate =
                    pickupDate;

                updateData.confirmedPickupTime =
                    pickupTime;

                updateData.confirmedDeliveryDate =
                    deliveryDate;

                updateData.confirmedDeliveryTime =
                    deliveryTime;
            }

            /* -------------------------------------------------
               HOUSE CLEANING
            ------------------------------------------------- */

            if (
                normalizedType ===
                "cleaning"
            ) {
                if (
                    !confirmedDate ||
                    !confirmedTime
                ) {
                    return res.status(400).json({
                        message:
                            "Please provide the confirmed service date and time."
                    });
                }

                updateData.confirmedServiceDate =
                    confirmedDate;

                updateData.confirmedServiceTime =
                    confirmedTime;
            }

            /* -------------------------------------------------
               HOME HAIRCUT
            ------------------------------------------------- */

            if (
                normalizedType ===
                "haircut"
            ) {
                if (
                    !confirmedDate ||
                    !confirmedTime
                ) {
                    return res.status(400).json({
                        message:
                            "Please provide the confirmed appointment date and time."
                    });
                }

                updateData.confirmedAppointmentDate =
                    confirmedDate;

                updateData.confirmedAppointmentTime =
                    confirmedTime;
            }

            /* -------------------------------------------------
               SAVE CONFIRMATION
            ------------------------------------------------- */

            const updatedBooking =
                await bookingCollection.findOneAndUpdate(
                    {
                        _id:
                            new mongoose.Types.ObjectId(
                                id
                            )
                    },
                    {
                        $set: updateData
                    },
                    {
                        returnDocument: "after"
                    }
                );

            if (!updatedBooking) {
                return res.status(404).json({
                    message:
                        "Booking could not be updated."
                });
            }

            /* -------------------------------------------------
               BUILD SCHEDULE EMAIL
            ------------------------------------------------- */

            let scheduleHTML = "";

            if (
                normalizedType ===
                "laundry"
            ) {
                scheduleHTML = `
                    <tr>
                        <td style="padding:8px 0;">
                            <strong>Pickup Date:</strong>
                        </td>

                        <td style="padding:8px 0;">
                            ${updatedBooking.confirmedPickupDate}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:8px 0;">
                            <strong>Pickup Time:</strong>
                        </td>

                        <td style="padding:8px 0;">
                            ${updatedBooking.confirmedPickupTime}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:8px 0;">
                            <strong>Delivery Date:</strong>
                        </td>

                        <td style="padding:8px 0;">
                            ${updatedBooking.confirmedDeliveryDate}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:8px 0;">
                            <strong>Delivery Time:</strong>
                        </td>

                        <td style="padding:8px 0;">
                            ${updatedBooking.confirmedDeliveryTime}
                        </td>
                    </tr>
                `;
            }

            if (
                normalizedType ===
                "cleaning"
            ) {
                scheduleHTML = `
                    <tr>
                        <td style="padding:8px 0;">
                            <strong>Service Date:</strong>
                        </td>

                        <td style="padding:8px 0;">
                            ${updatedBooking.confirmedServiceDate}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:8px 0;">
                            <strong>Service Time:</strong>
                        </td>

                        <td style="padding:8px 0;">
                            ${updatedBooking.confirmedServiceTime}
                        </td>
                    </tr>
                `;
            }

            if (
                normalizedType ===
                "haircut"
            ) {
                scheduleHTML = `
                    <tr>
                        <td style="padding:8px 0;">
                            <strong>Appointment Date:</strong>
                        </td>

                        <td style="padding:8px 0;">
                            ${updatedBooking.confirmedAppointmentDate}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:8px 0;">
                            <strong>Appointment Time:</strong>
                        </td>

                        <td style="padding:8px 0;">
                            ${updatedBooking.confirmedAppointmentTime}
                        </td>
                    </tr>
                `;
            }

            /* -------------------------------------------------
               BOOKING DETAILS
            ------------------------------------------------- */

            let serviceDetails = "";

            if (
                normalizedType ===
                "laundry"
            ) {
                serviceDetails = `
                    <tr>
                        <td style="padding:8px 0;">
                            <strong>Pickup Address:</strong>
                        </td>

                        <td style="padding:8px 0;">
                            ${updatedBooking.pickupAddress || "N/A"}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:8px 0;">
                            <strong>Delivery Address:</strong>
                        </td>

                        <td style="padding:8px 0;">
                            ${updatedBooking.deliveryAddress || "N/A"}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:8px 0;">
                            <strong>Total:</strong>
                        </td>

                        <td style="padding:8px 0;">
                            ₦${Number(
                                updatedBooking.overallTotal || 0
                            ).toLocaleString()}
                        </td>
                    </tr>
                `;
            }

            if (
                normalizedType ===
                "cleaning"
            ) {
                serviceDetails = `
                    <tr>
                        <td style="padding:8px 0;">
                            <strong>Service Address:</strong>
                        </td>

                        <td style="padding:8px 0;">
                            ${updatedBooking.serviceAddress || "N/A"}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:8px 0;">
                            <strong>Package:</strong>
                        </td>

                        <td style="padding:8px 0;">
                            ${updatedBooking.package || "N/A"}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:8px 0;">
                            <strong>Bedrooms:</strong>
                        </td>

                        <td style="padding:8px 0;">
                            ${updatedBooking.bedrooms || "N/A"}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:8px 0;">
                            <strong>Amount:</strong>
                        </td>

                        <td style="padding:8px 0;">
                            ₦${Number(
                                updatedBooking.price || 0
                            ).toLocaleString()}
                        </td>
                    </tr>
                `;
            }

            if (
                normalizedType ===
                "haircut"
            ) {
                serviceDetails = `
                    <tr>
                        <td style="padding:8px 0;">
                            <strong>Service Address:</strong>
                        </td>

                        <td style="padding:8px 0;">
                            ${updatedBooking.serviceAddress || "N/A"}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:8px 0;">
                            <strong>Haircut Service:</strong>
                        </td>

                        <td style="padding:8px 0;">
                            ${updatedBooking.haircutService || "N/A"}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:8px 0;">
                            <strong>Amount:</strong>
                        </td>

                        <td style="padding:8px 0;">
                            ₦${Number(
                                updatedBooking.price || 0
                            ).toLocaleString()}
                        </td>
                    </tr>
                `;
            }

            /* -------------------------------------------------
               SERVICE NAME
            ------------------------------------------------- */

            let serviceName =
                "Kingsway Luxury";

            if (
                normalizedType ===
                "laundry"
            ) {
                serviceName =
                    "Laundry Service";
            }

            if (
                normalizedType ===
                "cleaning"
            ) {
                serviceName =
                    "House Cleaning Service";
            }

            if (
                normalizedType ===
                "haircut"
            ) {
                serviceName =
                    "Home Haircut Service";
            }

            /* -------------------------------------------------
               CUSTOMER EMAIL CHECK
            ------------------------------------------------- */

            if (!updatedBooking.email) {
                return res.status(400).json({
                    message:
                        "Booking confirmed, but the customer has no email address. Confirmation email was not sent.",
                    booking: updatedBooking
                });
            }

            /* -------------------------------------------------
               EMAIL HTML
            ------------------------------------------------- */

            const emailHTML = `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 650px;
                    margin: 0 auto;
                    color: #333;
                    line-height: 1.6;
                ">

                    <div style="
                        background: #4b145f;
                        padding: 25px;
                        text-align: center;
                    ">
                        <h1 style="
                            color: #ffffff;
                            margin: 0;
                        ">
                            Kingsway Luxury
                        </h1>

                        <p style="
                            color: #f4d27a;
                            margin: 8px 0 0;
                        ">
                            Treating you like the Royalty that you are
                        </p>
                    </div>

                    <div style="padding: 30px 20px;">

                        <h2 style="
                            color: #4b145f;
                            margin-top: 0;
                        ">
                            Your Booking Has Been Confirmed
                        </h2>

                        <p>
                            Dear ${updatedBooking.name || "Customer"},
                        </p>

                        <p>
                            Thank you for choosing Kingsway Luxury.
                            We are pleased to confirm that your
                            ${serviceName} booking has been scheduled.
                        </p>

                        <p>
                            Your payment has been verified and your
                            booking is now confirmed.
                        </p>

                        <h3 style="color:#4b145f;">
                            Booking Details
                        </h3>

                        <table style="
                            width:100%;
                            border-collapse:collapse;
                            margin-bottom:25px;
                        ">

                            <tr>
                                <td style="padding:8px 0;">
                                    <strong>Service:</strong>
                                </td>

                                <td style="padding:8px 0;">
                                    ${serviceName}
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:8px 0;">
                                    <strong>Customer:</strong>
                                </td>

                                <td style="padding:8px 0;">
                                    ${updatedBooking.name || "N/A"}
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:8px 0;">
                                    <strong>Phone:</strong>
                                </td>

                                <td style="padding:8px 0;">
                                    ${updatedBooking.phone || "N/A"}
                                </td>
                            </tr>

                            ${serviceDetails}

                        </table>

                        <h3 style="color:#4b145f;">
                            Confirmed Schedule
                        </h3>

                        <table style="
                            width:100%;
                            border-collapse:collapse;
                            background:#faf7fc;
                            padding:10px;
                        ">

                            ${scheduleHTML}

                        </table>

                        <p style="margin-top:25px;">
                            Please make yourself available at the confirmed
                            time and location.
                        </p>

                        <p>
                            If you need to make any enquiry regarding your
                            booking, please contact us on:
                        </p>

                        <p>
                            <strong>Phone:</strong> 08136905393<br>
                            <strong>Email:</strong> amehkingsley4@gmail.com
                        </p>

                        <p>
                            It has always been a pleasure serving you.
                        </p>

                        <p>
                            Warm regards,<br>
                            <strong>Kingsway Luxury</strong>
                        </p>

                    </div>

                    <div style="
                        background:#f3f3f3;
                        padding:18px;
                        text-align:center;
                        font-size:13px;
                        color:#666;
                    ">
                        Kingsway Luxury<br>
                        Treating you like the Royalty that you are
                    </div>

                </div>
            `;

            /* -------------------------------------------------
               SEND CONFIRMATION EMAIL
            ------------------------------------------------- */

            try {
                await sendEmail({
                    to: updatedBooking.email,

                    subject:
                        `Booking Confirmed - ${serviceName} | Kingsway Luxury`,

                    html: emailHTML
                });

                await bookingCollection.updateOne(
                    {
                        _id:
                            new mongoose.Types.ObjectId(
                                id
                            )
                    },
                    {
                        $set: {
                            confirmationEmailSent:
                                true,

                            confirmationEmailSentAt:
                                new Date()
                        }
                    }
                );

                const finalBooking =
                    await bookingCollection.findOne({
                        _id:
                            new mongoose.Types.ObjectId(
                                id
                            )
                    });

                return res.json({
                    message:
                        "Booking confirmed and confirmation email sent successfully.",

                    booking: finalBooking
                });
            } catch (emailError) {
                console.error(
                    "Confirmation email failed:",
                    emailError
                );

                return res.status(207).json({
                    message:
                        "Booking was confirmed, but the confirmation email could not be sent.",

                    emailError:
                        emailError.message,

                    booking: updatedBooking
                });
            }
        } catch (error) {
            console.error(
                "Confirm booking error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to confirm booking.",

                error: error.message
            });
        }
    }
);

/* =========================================================
   UPDATE BOOKING STATUS
========================================================= */

router.patch(
    "/bookings/:type/:id/status",
    authenticateAdmin,
    async (req, res) => {
        try {
            const { type, id } = req.params;
            const { status } = req.body;

            const normalizedType =
                normalizeBookingType(type);

            const allowedStatuses = [
                "Pending",
                "Confirmed",
                "Completed",
                "Cancelled"
            ];

            if (!normalizedType) {
                return res.status(400).json({
                    message:
                        "Unknown booking type."
                });
            }

            if (
                !mongoose.Types.ObjectId.isValid(id)
            ) {
                return res.status(400).json({
                    message:
                        "Invalid booking ID."
                });
            }

            if (
                !allowedStatuses.includes(status)
            ) {
                return res.status(400).json({
                    message:
                        "Invalid booking status."
                });
            }

            const result =
                await getCollection(normalizedType)
                    .findOneAndUpdate(
                        {
                            _id:
                                new mongoose.Types.ObjectId(
                                    id
                                )
                        },
                        {
                            $set: {
                                status
                            }
                        },
                        {
                            returnDocument: "after"
                        }
                    );

            if (!result) {
                return res.status(404).json({
                    message:
                        "Booking not found."
                });
            }

            res.json({
                message:
                    `Booking status updated to ${status}.`,

                booking: result
            });
        } catch (error) {
            console.error(
                "Status update error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to update booking status."
            });
        }
    }
);

/* =========================================================
   DELETE BOOKING
========================================================= */

router.delete(
    "/bookings/:type/:id",
    authenticateAdmin,
    async (req, res) => {
        try {
            const { type, id } = req.params;

            const normalizedType =
                normalizeBookingType(type);

            if (!normalizedType) {
                return res.status(400).json({
                    message:
                        "Unknown booking type."
                });
            }

            if (
                !mongoose.Types.ObjectId.isValid(id)
            ) {
                return res.status(400).json({
                    message:
                        "Invalid booking ID."
                });
            }

            const result =
                await getCollection(normalizedType)
                    .findOneAndDelete({
                        _id:
                            new mongoose.Types.ObjectId(
                                id
                            )
                    });

            if (!result) {
                return res.status(404).json({
                    message:
                        "Booking not found."
                });
            }

            res.json({
                message:
                    "Booking deleted successfully."
            });
        } catch (error) {
            console.error(
                "Delete booking error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to delete booking."
            });
        }
    }
);

/* =========================================================
   EXPORT
========================================================= */

module.exports = router;