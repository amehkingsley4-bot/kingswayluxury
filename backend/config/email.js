const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});


async function sendEmail({
    to,
    subject,
    html
}) {
    try {

        const info = await transporter.sendMail({
            from: `"Kingsway Luxury" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });

        console.log(
            "Email sent successfully:",
            info.messageId
        );

        return info;

    } catch (error) {

        console.error(
            "Email sending failed:",
            error
        );

        throw error;
    }
}


module.exports = {
    transporter,
    sendEmail
};