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
        html: `
        <html>
            <head>
                <!-- You can still include a <style> tag if you want -->
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 20px">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #888; font-size: 24px; text-align: center;">Erdbeeren</h2>
                    <p style="font-size: 18px; font-weight: bold;">Dear User,</p>
                    <p style="font-size: 24px; color: #4caf50; font-weight: bold;">Your verification code for Erdbeeren is: <span style="color: #333;">${verificationCode}</span></p>
                    <p style="margin-top: 10px; font-size: 16px;">Thank you for choosing Erdbeeren!</p>
                    <hr style="border: 1px solid #ddd; margin-top: 20px; margin-bottom: 20px;">
                    <p style="font-size: 14px; color: #888;">This email was sent by Erdbeeren. Please do not reply to this email.</p>
                </div>
            </body>
        </html>
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.error(`Error sending email: ${error.message}`);
        }
        console.log(`Email sent: ${info.response}`);
    });
}