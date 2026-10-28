const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const router = express.Router();


// ========================================
// UPLOAD DIRECTORY
// ========================================

const uploadDirectory = path.join(
    __dirname,
    "..",
    "uploads"
);

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true
    });
}


// ========================================
// FILE STORAGE
// ========================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {

        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;

        cb(null, uniqueName);
    }
});


// ========================================
// FILE VALIDATION
// ========================================

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf"
];


const upload = multer({

    storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        if (
            allowedMimeTypes.includes(
                file.mimetype
            )
        ) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only JPG, JPEG, PNG and PDF files are allowed."
                )
            );
        }
    }
});


// ========================================
// COLLECTION MAP
// ========================================

const collectionNames = {

    laundry:
        "laundrybookings",

    haircut:
        "haircutbookings",

    cleaning:
        "housecleaningbookings"
};


// ========================================
// PAYMENT PROOF UPLOAD
// ========================================

router.post(
    "/:type/:id",
    upload.single("paymentProof"),

    async (req, res) => {

        try {

            const {
                type,
                id
            } = req.params;


            // -------------------------------
            // CHECK BOOKING TYPE
            // -------------------------------

            const collectionName =
                collectionNames[type];

            if (!collectionName) {

                return res.status(400).json({
                    message:
                        "Invalid booking type."
                });
            }


            // -------------------------------
            // CHECK FILE
            // -------------------------------

            if (!req.file) {

                return res.status(400).json({
                    message:
                        "Please upload your payment receipt."
                });
            }


            // -------------------------------
            // CHECK BOOKING ID
            // -------------------------------

            if (
                !mongoose.Types.ObjectId.isValid(
                    id
                )
            ) {

                return res.status(400).json({
                    message:
                        "Invalid booking ID."
                });
            }


            const objectId =
                new mongoose.Types.ObjectId(id);


            // -------------------------------
            // FIND BOOKING
            // -------------------------------

            const booking =
                await mongoose.connection.db
                    .collection(collectionName)
                    .findOne({
                        _id: objectId
                    });


            if (!booking) {

                // Remove uploaded file because
                // the booking doesn't exist.
                fs.unlinkSync(
                    req.file.path
                );

                return res.status(404).json({
                    message:
                        "Booking not found."
                });
            }


            // -------------------------------
            // DELETE OLD PAYMENT PROOF
            // -------------------------------

            if (
                booking.paymentProof
            ) {

                const oldFilePath =
                    path.join(
                        uploadDirectory,
                        booking.paymentProof
                    );

                if (
                    fs.existsSync(
                        oldFilePath
                    )
                ) {
                    fs.unlinkSync(
                        oldFilePath
                    );
                }
            }


            // -------------------------------
            // SAVE PAYMENT PROOF
            // -------------------------------

            await mongoose.connection.db
                .collection(collectionName)
                .updateOne(

                    {
                        _id: objectId
                    },

                    {
                        $set: {

                            paymentProof:
                                req.file.filename,

                            paymentStatus:
                                "Proof Submitted",

                            paymentVerifiedAt:
                                null
                        }
                    }
                );


            // -------------------------------
            // RESPONSE
            // -------------------------------

            res.json({

                message:
                    "Payment proof submitted successfully. Your payment will be verified by Kingsway Luxury.",

                paymentProof:
                    req.file.filename

            });

        } catch (error) {

            console.error(
                "Payment proof upload error:",
                error
            );


            // Remove uploaded file if
            // something went wrong.
            if (
                req.file &&
                fs.existsSync(
                    req.file.path
                )
            ) {
                fs.unlinkSync(
                    req.file.path
                );
            }


            res.status(500).json({

                message:
                    "Failed to submit payment proof."

            });
        }
    }
);


module.exports = router;