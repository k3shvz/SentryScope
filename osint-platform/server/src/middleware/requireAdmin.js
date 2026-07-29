import UserModel from '../models/User.js';

// Must run after requireAuth (needs req.userId already set).
export async function requireAdmin(req, res, next) {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required.' });
    }
    next();
  } catch {
    res.status(500).json({ message: 'Could not verify permissions.' });
  }
}
