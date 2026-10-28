require("dotenv").config();

const { sendEmail } = require("./config/email");

async function testEmail() {
    try {

        await sendEmail({
            to: process.env.EMAIL_USER,

            subject: "Kingsway Luxury Email Test",

            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>Kingsway Luxury</h2>

                    <p>
                        This is a test email from your
                        Kingsway Luxury booking system.
                    </p>

                    <p>
                        If you received this message,
                        your email configuration is working correctly.
                    </p>

                    <p>
                        <strong>Kingsway Luxury</strong><br>
                        Treating you like the Royalty that you are.
                    </p>
                </div>
            `
        });

        console.log("Test email sent successfully.");

    } catch (error) {

        console.error(
            "Test email failed:",
            error.message
        );
    }
}

testEmail();