import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { listHistory, createHistoryEntry, clearHistory } from '../controllers/historyController.js';

const router = Router();

router.use(requireAuth);

router.get('/', listHistory);
router.post('/', createHistoryEntry);
router.delete('/', clearHistory);

export default router;
