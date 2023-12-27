// src\modules\authentication\controller\userController.js
import { prisma } from '../prisma/client';

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
