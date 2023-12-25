// src\modules\authentication\controller\userController.js
import { prisma } from '../prisma/client';

export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming user ID is available in the authenticated user object
    const userProfile = await prisma.user.findUnique({ where: { id: userId } });

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    return res.json({ userProfile });
  } catch (error) {
    next(error);
  }
};
