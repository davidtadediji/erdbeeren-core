// src\modules\authentication\utils\verification.js
import twilio from 'twilio';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from '../../../../logger.js';

dotenv.config();

// Generate a random verification code (numeric)
export function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6);
}


// Using Nodemailer to send an email with the verification code
export function sendVerificationCodeToEmail(email, verificationCode) {
    logger.info("Send verification code")
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verification Code - Erdbeeren',
        text: `Your verification code is: ${verificationCode}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.error(`Error sending email: ${error.message}`);
        }
        console.log(`Email sent: ${info.response}`);
    });
}