import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import * as authController from '../controllers/authController.js';
import { authValidators, validateResult } from '../utils/routeValidators.js';

const router = Router();

router.post('/register', ...authValidators.register, validateResult, authController.register);
router.post('/login', ...authValidators.login, validateResult, authController.login);
router.get('/me', requireAuth, authController.me);
router.post('/forgot-password', ...authValidators.forgotPassword, validateResult, authController.forgotPassword);
router.post('/reset-password', ...authValidators.resetPassword, validateResult, authController.resetPassword);

export default router;
