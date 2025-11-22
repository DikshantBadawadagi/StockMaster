const nodemailer = require('nodemailer');
require('dotenv').config();

// Check if email is enabled
const isEmailEnabled = process.env.ENABLE_EMAIL !== 'false';

// Create reusable transporter
const transporter = isEmailEnabled ? nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
}) : null;

// Send email function
const sendEmail = async (options) => {
    // If email is disabled, just log and skip sending
    if (!isEmailEnabled) {
        console.log('📧 Email sending is disabled. Would have sent:');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        if (options.html) {
            const otpMatch = options.html.match(/<h1[^>]*>(\d{6})<\/h1>/);
            if (otpMatch) {
                console.log(`OTP: ${otpMatch[1]}`);
            }
        }
        return { success: true, messageId: 'disabled', disabled: true };
    }

    const mailOptions = {
        from: {
            name: process.env.SENDER_NAME || 'StockMaster',
            address: process.env.EMAIL_USER
        },
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    console.log('Attempting to send email to:', options.to);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
};

module.exports = sendEmail;
