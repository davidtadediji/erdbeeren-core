// src\modules\authentication\routes\userRoutes.js
import express from 'express';
import userController from '../controllers/userController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = express.Router();

// Protect the '/profile' route with the authenticateJWT middleware
router.get('/profile', authenticateJWT, userController.getUserProfile);

export default router;
