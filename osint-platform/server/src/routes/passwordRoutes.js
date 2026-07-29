import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { checkHashPrefix } from '../controllers/passwordController.js';
import { passwordValidators, validateResult } from '../utils/routeValidators.js';

const router = Router();

router.get('/range/:prefix', requireAuth, ...passwordValidators, validateResult, checkHashPrefix);

export default router;
