import { Router } from 'express';
import { body } from 'express-validator';
import { validateResult } from '../utils/routeValidators.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { sendContactEmail, getContactMessages } from '../controllers/contactController.js';

const router = Router();

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Enter a valid email.'),
    body('message').trim().notEmpty().withMessage('Message is required.'),
  ],
  validateResult,
  sendContactEmail
);

router.get('/', requireAuth, requireAdmin, getContactMessages);

export default router;
