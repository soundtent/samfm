const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
    try {
        const options = {
            host: process.env.EMAIL_HOST,
            // service: process.env.SERVICE,
            port: 465, //587,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        };
        const transporter = nodemailer.createTransport(options);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            text: text,
        });

        console.log("Email sent sucessfully");
    } catch (error) {
        console.log(error, "Email not sent");
    }
};

module.exports = sendEmail;
