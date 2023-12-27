// src\modules\authentication\routes\userRoutes.js
import express from 'express';
import {getUserProfile} from '../controllers/userController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect the '/profile' route with the authenticateJWT middleware
router.get('/profile', authenticateJWT, getUserProfile);

export default router;
