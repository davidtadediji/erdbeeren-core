// src\modules\authentication\controllers\userController.js
import { PrismaClient } from "@prisma/client";
import logger from "../../../../logger.js";
import auditLogger from "../../../../audit_logger.js";

// Create an instance of the Prisma client
const prisma = new PrismaClient();

export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    auditLogger.info(`Agent ${userId} viewed their user profile`);

    const userProfile = await prisma.user.findUnique({ where: { id: userId } });

    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    return res.json({ userProfile });
  } catch (error) {
    next(error);
  }
};
