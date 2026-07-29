import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { upload, validateFileSignature } from '../middleware/upload.js';
import { analyzeImage } from '../controllers/imageController.js';

const router = Router();

router.post('/', requireAuth, upload.single('image'), validateFileSignature, analyzeImage);

export default router;
