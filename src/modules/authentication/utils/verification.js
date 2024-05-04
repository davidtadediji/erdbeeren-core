// src\modules\authentication\utils\verification.js
import twilio from "twilio";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import logger from "../../../../logger.js";
import { getEnterpriseDetails } from "../../enterprise_config/configurations/detailsConfig.js";

dotenv.config();

// Generate a random verification code (numeric)
export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000)
    .toString()
    .substring(0, 6);
}

export const sendResetPasswordEmail = async (email, resetToken) => {
  const transporter = nodemailer.createTransport({
    // Configure your email provider here
    // Example for Gmail:
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
  const appUrl = process.env.APP_URL;
  logger.info("App url: " + appUrl);
  const resetLink = `${appUrl}/reset-password/${resetToken}`; // Replace with your actual reset password page URL
  const configFile = await getEnterpriseDetails();
  const enterpriseName = configFile.name;
  logger.info(enterpriseName);
  const html = `
    <html>
      <head>
        <!-- You can still include a <style> tag if you want -->
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 20px">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #888; font-size: 24px; text-align: center;">${enterpriseName}</h2>
          <p style="font-size: 18px; font-weight: bold;">Dear User,</p>
          <p style="font-size: 24px; color: #4caf50; font-weight: bold;">Click the link to reset your password: <a href="${resetLink}" style="text-decoration: underline; font-size: 20px">Reset Password Link</a></p>
          <p style="margin-top: 10px; font-size: 16px;">Thank you for working at ${enterpriseName}!</p>
          <hr style="border: 1px solid #ddd; margin-top: 20px; margin-bottom: 20px;">
          <p style="font-size: 14px; color: #888;">This email was sent by ${enterpriseName}. Please do not reply to this email.</p>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Reset Password - ${enterpriseName}`,
    html: html,
  };

  await transporter.sendMail(mailOptions);
};

// Using Nodemailer to send an email with the verification code
export async function sendVerificationCodeToEmail(email, verificationCode) {
  logger.info("Send verification code");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const configFile = await getEnterpriseDetails();
  const enterpriseName = configFile.name;
  logger.info(enterpriseName);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Verification Code - ${enterpriseName}`,
    html: `
        <html>
            <head>
                <!-- You can still include a <style> tag if you want -->
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 20px">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #888; font-size: 24px; text-align: center;">${enterpriseName}</h2>
                    <p style="font-size: 18px; font-weight: bold;">Dear User,</p>
                    <p style="font-size: 24px; color: #4caf50; font-weight: bold;">Your verification code for ${enterpriseName} is: <span style="color: #333;">${verificationCode}</span></p>
                    <p style="margin-top: 10px; font-size: 16px;">Thank you for working at ${enterpriseName}!</p>
                    <hr style="border: 1px solid #ddd; margin-top: 20px; margin-bottom: 20px;">
                    <p style="font-size: 14px; color: #888;">This email was sent by ${enterpriseName}. Please do not reply to this email.</p>
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
