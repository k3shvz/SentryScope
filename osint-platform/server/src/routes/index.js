import { Router } from 'express';
import authRoutes from './authRoutes.js';
import domainRoutes from './domainRoutes.js';
import passwordRoutes from './passwordRoutes.js';
import techRoutes from './techRoutes.js';
import usernameRoutes from './usernameRoutes.js';
import emailRoutes from './emailRoutes.js';
import metadataRoutes from './metadataRoutes.js';
import imageRoutes from './imageRoutes.js';
import contactRoutes from './contactRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import historyRoutes from './historyRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/domain', domainRoutes);
router.use('/password', passwordRoutes);
router.use('/tech', techRoutes);
router.use('/username', usernameRoutes);
router.use('/email', emailRoutes);
router.use('/metadata', metadataRoutes);
router.use('/image', imageRoutes);
router.use('/contact', contactRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/history', historyRoutes);

router.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

export default router;
