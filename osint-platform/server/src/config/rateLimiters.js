import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

// A single IP-only limit means a whole NAT'd office/campus shares one
// budget. Where a valid session token is present, key by user instead so
// logged-in traffic is rate-limited per-account; anonymous/invalid-token
// requests still fall back to per-IP limiting.
function resolveKey(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload?.sub) return `user:${payload.sub}`;
    } catch {
      // invalid/expired token — fall through to IP-based limiting
    }
  }
  return `ip:${req.ip}`;
}

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: resolveKey,
  message: { message: 'Too many requests. Please slow down and try again shortly.' },
});

// Auth endpoints are pre-login by definition (register/login/forgot-password),
// so there's no token to key on yet — stays IP-based intentionally.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait before trying again.' },
});
