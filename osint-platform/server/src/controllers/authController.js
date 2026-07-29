import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import UserModel from '../models/User.js';

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes — matches the copy in the client's ForgotPasswordPage

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  const existing = await UserModel.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const passwordHash = await UserModel.hashPassword(password);
  const user = await UserModel.create({ name, email: email.toLowerCase(), passwordHash });
  const token = signToken(user._id.toString());
  res.status(201).json({ token, user: user.toPublicJSON() });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = signToken(user._id.toString());
  res.json({ token, user: user.toPublicJSON() });
}

export async function me(req, res) {
  const user = await UserModel.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ user: user.toPublicJSON() });
}

async function sendResetEmail(user, resetUrl) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    // No SMTP configured — fall back to logging, same pattern the contact
    // form uses, so local/dev setups still work end-to-end.
    console.log(`[Password Reset] ${user.email} -> ${resetUrl}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transporter.sendMail({
    from: smtpUser,
    to: user.email,
    subject: 'Reset your SentryScope password',
    text: `We received a request to reset your SentryScope password.\n\nReset it here: ${resetUrl}\n\nThis link expires in 30 minutes. If you didn't request this, you can safely ignore this email.`,
    html: `
      <div style="font-family: system-ui, sans-serif; color: #111;">
        <h2>Reset your password</h2>
        <p>We received a request to reset your SentryScope password.</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:10px 18px;background:#00E5FF;color:#00131a;border-radius:8px;text-decoration:none;font-weight:600;">Reset password</a></p>
        <p style="color:#555;font-size:13px;">This link expires in 30 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  const genericResponse = { message: 'If an account exists for this email, a reset link has been sent.' };

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Always return the same response whether or not the account exists,
    // so this endpoint can't be used to enumerate registered emails.
    return res.json(genericResponse);
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.resetTokenHash = hashResetToken(token);
  user.resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();

  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  const resetUrl = `${clientOrigin}/reset-password?token=${token}`;

  try {
    await sendResetEmail(user, resetUrl);
  } catch (err) {
    console.error('Password reset email failed to send:', err.message);
    // Don't leak delivery failures to the caller — still respond generically.
  }

  return res.json(genericResponse);
}

export async function resetPassword(req, res) {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  const tokenHash = hashResetToken(token);
  const user = await UserModel.findOne({
    resetTokenHash: tokenHash,
    resetTokenExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
  }

  user.passwordHash = await UserModel.hashPassword(password);
  user.resetTokenHash = null;
  user.resetTokenExpiresAt = null;
  await user.save();

  res.json({ message: 'Password updated. You can now log in with your new password.' });
}
