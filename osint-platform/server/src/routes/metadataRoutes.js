import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { upload, validateFileSignature } from '../middleware/upload.js';
import { analyzeMetadata } from '../controllers/metadataController.js';

const router = Router();

router.post('/', requireAuth, upload.single('file'), validateFileSignature, analyzeMetadata);

export default router;
