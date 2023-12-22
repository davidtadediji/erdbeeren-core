import express from 'express';
import userController from '../controllers/userController';
import { isAuthenticated } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/profile', isAuthenticated, userController.getUserProfile);

export default router;
