// src\modules\authentication\controllers\userController.js
import { PrismaClient } from '@prisma/client';

// Create an instance of the Prisma client
const prisma = new PrismaClient();

export const getUserProfile = async (req, res, next) => {
  try {
    // Assuming user information is already attached to the request by the authenticateJWT middleware
    const userId = req.user.id;
    
    const userProfile = await prisma.user.findUnique({ where: { id: userId } });

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    return res.json({ userProfile });
  } catch (error) {
    next(error);
  }
};
