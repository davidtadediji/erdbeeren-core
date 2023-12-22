import express from 'express';
import userController from '../controllers/userController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/profile', authMiddleware.isAuthenticated, userController.getUserProfile);

export default router;
