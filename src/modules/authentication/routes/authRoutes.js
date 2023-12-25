// src\modules\authentication\routes\authRoutes.js
import express from 'express';
import authController from '../controllers/authController';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login); // Add a login route
router.get('/logout', authController.logout);

export default router;
