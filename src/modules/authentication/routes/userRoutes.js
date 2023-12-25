// src\modules\authentication\routes\userRoutes.js
import express from 'express';
import userController from '../controllers/userController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

// Protect the '/profile' route with both isAuthenticated and hasPermission middlewares
router.get('/profile', authMiddleware.isAuthenticated, authMiddleware.hasPermission(['VIEW_PROFILE']), userController.getUserProfile);

export default router;
