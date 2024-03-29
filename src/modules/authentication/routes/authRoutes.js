// src\modules\authentication\routes\authRoutes.js
import express from 'express';
import { signup, login, verify, resendVerificationCode, forgotPassword, resetPassword } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { signupSchema, loginSchema } from '../authValidation.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';


const router = express.Router();

router.post('/signup', validateRequest(signupSchema), signup);
router.post('/login', validateRequest(loginSchema), login);
router.post('/verify', authenticateJWT,  verify);
router.post('/resend-verification', authenticateJWT, resendVerificationCode);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword)

export default router;
