// src\modules\authentication\routes\authRoutes.js
import express from 'express';
import {signup, login, verify, resendVerificationCode } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify', verify);
router.post('/resend', resendVerificationCode)

export default router;
