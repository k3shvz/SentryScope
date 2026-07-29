import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getDashboardMetrics, clearAnalytics } from '../services/analytics.js';

const router = Router();

router.use(requireAuth);

router.get('/dashboard', (req, res) => {
  res.json(getDashboardMetrics());
});

router.post('/clear', (req, res) => {
  clearAnalytics();
  res.json({ ok: true });
});

export default router;
