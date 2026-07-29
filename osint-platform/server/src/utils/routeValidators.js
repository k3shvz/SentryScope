import { body, param, query, validationResult } from 'express-validator';

export function validateResult(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
}

export const authValidators = {
  register: [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Enter a valid email.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  ],
  login: [
    body('email').isEmail().withMessage('Enter a valid email.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  forgotPassword: [
    body('email').isEmail().withMessage('Enter a valid email.'),
  ],
  resetPassword: [
    body('token').notEmpty().withMessage('Token is required.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  ],
};

export const domainValidators = [
  query('domain').trim().notEmpty().withMessage('Domain is required.'),
];

export const usernameValidators = [
  query('username').trim().notEmpty().withMessage('Username is required.'),
];

export const emailValidators = [
  query('email').isEmail().withMessage('Enter a valid email.'),
];

export const techValidators = [
  query('url').trim().notEmpty().withMessage('URL is required.'),
];

export const passwordValidators = [
  param('prefix').matches(/^[0-9A-Fa-f]{5}$/).withMessage('Invalid hash prefix.'),
];