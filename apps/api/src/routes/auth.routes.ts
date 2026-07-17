import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  login,
  refreshTokens,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  activateAccount,
} from '../controllers/auth.controller';

const router = Router();

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  portalType: z.enum(['super-admin', 'doctor', 'hospital-admin']).optional(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const activateSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Public routes
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshTokens);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/activate', validate(activateSchema), activateAccount);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
