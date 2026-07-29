import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { fetchSiteSignature } from '../controllers/techController.js';
import { techValidators, validateResult } from '../utils/routeValidators.js';

const router = Router();

router.get('/', requireAuth, ...techValidators, validateResult, fetchSiteSignature);

export default router;
