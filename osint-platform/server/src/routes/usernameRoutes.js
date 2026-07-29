import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { searchUsername } from '../controllers/usernameController.js';
import { usernameValidators, validateResult } from '../utils/routeValidators.js';

const router = Router();

router.get('/', requireAuth, ...usernameValidators, validateResult, searchUsername);

export default router;
