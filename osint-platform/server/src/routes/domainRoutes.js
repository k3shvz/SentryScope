import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { investigateDomain } from '../controllers/domainController.js';
import { domainValidators, validateResult } from '../utils/routeValidators.js';

const router = Router();

router.get('/', requireAuth, ...domainValidators, validateResult, investigateDomain);

export default router;
