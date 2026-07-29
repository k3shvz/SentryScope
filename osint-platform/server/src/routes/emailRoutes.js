import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { investigateEmail } from '../controllers/emailController.js';
import { emailValidators, validateResult } from '../utils/routeValidators.js';

const router = Router();

router.get('/', requireAuth, ...emailValidators, validateResult, investigateEmail);

export default router;
