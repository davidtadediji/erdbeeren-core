// src\modules\authentication\controllers\authController.js
import { PrismaClient } from "@prisma/client"; // for user persistence
import bcrypt from "bcryptjs"; // for crypto password hashing
import crypto from "crypto"; // for generating reset password token
import jwt from "jsonwebtoken"; // for identifying users and their sessions/authentication
import logger from "../../../../logger.js"; // for logging
import { ROLES } from "../config/roles.js"; // to get the available roles on the system.
// import utilities
import {
  generateVerificationCode,
  sendResetPasswordEmail,
  sendVerificationCodeToEmail,
} from "../utils/verification.js";
// initialize prisma client
const prisma = new PrismaClient();

// Function to create employee/user account
export const signup = async (req, res, next) => {
  // "next" allows the function to pass control to the next middleware in the stack e.g. error middleware

  try {
    // get the details from the request body
    const { username, password, email, role } = req.body;

    logger.info("Username is: " + username);

    // check if user exists
    const user = await prisma.user.findFirst({
      where: { email: email },
    });

    if (user) {
      logger.info("User already exists");
      return res.status(400).json({ message: "User already exists" });
    }

    // convert the password to hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // check if the role provided is valid
    const existingRoles = Object.values(ROLES);
    let userRole = "";
    if (existingRoles.includes(role)) {
      userRole = role;
    } else {
      userRole = ROLES.AGENT;
    }

    const verificationCode = generateVerificationCode();

    // create the new user in the database
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        role: userRole,
        username,
        verificationCode: verificationCode,
      },
    });

    // generate jwt for the newly created user
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        isVerified: newUser.isVerified,
        role: newUser.role,
      },
      process.env.JWT_SECRET
    );

    // send the verification code to the user's email
    sendVerificationCodeToEmail(email, verificationCode);

    // include the token in the response
    return res.json({
      message: "User created successfully",
      user: newUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Function to verify a user after they have created an account.
export const verify = async (req, res, next) => {
  try {
    // get the verification code the user has entered after signing up and retrieving it from their email
    const { verificationCode } = req.body;

    // Extract email from the token
    const email = req.user.email;

    // Validate input
    if (!email || !verificationCode) {
      return res
        .status(400)
        .json({ message: "Email and verification code are required" });
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({ where: { email } });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the verification code matches the one in the database
    if (user.verificationCode !== verificationCode) {
      return res.status(401).json({ message: "Invalid verification code" });
    }

    // Update user's verification status
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    // Generate a new token with the updated information
    const tokenPayload = {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
    };

    const newToken = jwt.sign(tokenPayload, process.env.JWT_SECRET);

    // Add the new token in the response
    return res.json({
      message: "Email verification successful",
      user: updatedUser,
      token: newToken,
    });
  } catch (error) {
    next(error);
  }
};

// Function to log users into the system
export const login = async (req, res, next) => {
  logger.info("Login triggered");

  try {
    // get the details from the request body
    const { email, password } = req.body;

    // find the user based on the email inputted
    const user = await prisma.user.findUnique({ where: { email } });

    // and check the inputted password with the hashed password on the database.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // If verified, generate a token for authentication
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };

    // generate a fresh token
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);

    // send the token back to the frontend
    return res.json({ message: "Authentication successful", token, user });
  } catch (error) {
    next(error);
  }
};

// Function to resent verification code if user aborts the verification process.
export const resendVerificationCode = async (req, res, next) => {
  logger.info("Resend triggered with token: " + req.headers.authorization);

  try {
    // Extract email from the token
    const email = req.user.email;

    // Validate email
    if (!email) {
      return res.status(400).json({ message: "Email not found in the token" });
    }

    logger.info("Email exists: " + email);

    // Find the user in the database
    const user = await prisma.user.findUnique({ where: { email } });

    // Check if the user exists
    if (!user) {
      logger.info("User doesn't exist");
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new verification code and update the user
    await generateAndSendVerificationCode(user);

    return res.json({ message: "Verification code resent successfully" });
  } catch (error) {
    next(error);
  }
};

// Function to recover password if forgotten
export const forgotPassword = async (req, res, next) => {
  try {
    // Extract the email from the token
    const { email } = req.body;

    // Find the user in the database
    const user = await prisma.user.findUnique({ where: { email } });

    // Check if the user exists and if they don't a password cannot be recovered for them.
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a reset password token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Calculate the timestamp for one hour from now
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

    // Save the token to the user in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires: oneHourFromNow,
      },
    });

    // Send an email with the reset password link, the reset token is added to the link
    sendResetPasswordEmail(user.email, resetToken);

    return res.json({ message: "Password reset email sent successfully" });
  } catch (error) {
    next(error);
  }
};

// Function to reset password after selecting forgot password
export const resetPassword = async (req, res, next) => {
  try {
    // when a user inputs a new password and sends,
    // the reset token from the page link and new password is sent to the server
    const { resetToken, newPassword } = req.body;

    // Convert the timestamp to a Date object
    const currentTimestamp = new Date();

    // Find the user by the reset token
    const user = await prisma.user.findUnique({
      where: {
        resetToken,
        resetTokenExpires: { gte: currentTimestamp },
      },
    });

    // Check if the user exists
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid or expired reset token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and remove the reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};

// This function is used to generate and then send the verification code,
// it uses the utility functions and is then used by the resendVerificationCode function.
const generateAndSendVerificationCode = async (user) => {
  const newVerificationCode = generateVerificationCode();
  await prisma.user.update({
    where: { id: user.id },
    data: { verificationCode: newVerificationCode },
  });

  logger.info("Verification code: " + newVerificationCode);

  sendVerificationCodeToEmail(user.email, newVerificationCode);

  return newVerificationCode;
};
