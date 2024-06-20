// src\modules\authentication\controllers\authController.js

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import logger from "../../../../logger.js";
import { ROLES } from "../config/roles.js";
import {
  generateVerificationCode,
  sendResetPasswordEmail,
  sendVerificationCodeToEmail,
} from "../utils/verification.js";
const prisma = new PrismaClient();

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

export const signup = async (req, res, next) => {
  logger.info("signup triggered: " + JSON.stringify(req.body, null, 2));

  try {
    const { username, password, email, role } = req.body;

    logger.info("Username is: " + username);

    const user = await prisma.user.findFirst({
      where: { email: email },
    });

    // check if user exists
    if (user) {
      logger.info("User already exists");
      return res.status(400).json({ message: "User already exists" });
    }

    logger.info("User doesn't exist yet");

    // convert the password to hash
    const hashedPassword = await bcrypt.hash(password, 10);

    logger.info("Hashed password: " + hashedPassword);

    // check if the role provided is valid
    const existingRoles = Object.values(ROLES);
    let userRole = "";
    if (existingRoles.includes(role)) {
      userRole = role;
    } else {
      userRole = ROLES.AGENT;
    }

    const verificationCode = generateVerificationCode();

    // create the new user
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        role: userRole,
        username,
        verificationCode: verificationCode,
      },
    });

    logger.info("User was created successfully" + newUser);

    // generate jwt for the newly created user
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        isVerified: newUser.isVerified,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
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

export const login = async (req, res, next) => {
  logger.info("Login triggered");

  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

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

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET,);

    return res.json({ message: "Authentication successful", token, user });
  } catch (error) {
    next(error);
  }
};

export const verify = async (req, res, next) => {
  logger.info(
    "verify triggered: " +
      JSON.stringify(req.body, null, 2) +
      " " +
      req.headers.authorization
  );

  try {
    const { verificationCode } = req.body;

    // Extract email from the token
    const email = req.user.email;

    logger.info("Email gotten: " + email);
    logger.info("VerificationCode gotten: " + verificationCode);

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

    // Check if the verification code matches
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

    return res.json({
      message: "Email verification successful",
      user: updatedUser,
      token: newToken, // Include the new token in the response
    });
  } catch (error) {
    next(error);
  }
};

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

export const forgotPassword = async (req, res, next) => {
  try {
    // Extract email from the token
    const { email } = req.body;

    // Find the user in the database
    const user = await prisma.user.findUnique({ where: { email } });

    // Check if the user exists
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

    // Send an email with the reset password link
    // Implement a function similar to sendVerificationCodeToEmail
    sendResetPasswordEmail(user.email, resetToken);

    return res.json({ message: "Password reset email sent successfully" });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
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
