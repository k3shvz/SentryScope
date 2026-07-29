import Investigation from '../models/Investigation.js';

const ALLOWED_RISK = new Set(['low', 'medium', 'high']);

export async function listHistory(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Investigation.find({ user: req.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Investigation.countDocuments({ user: req.userId }),
    ]);

    res.json({
      entries: items.map((item) => item.toPublicJSON()),
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not load investigation history.' });
  }
}

export async function createHistoryEntry(req, res) {
  const { type, target, risk = 'low', summary = '', profilesFound = 0 } = req.body;

  if (!type || !target) {
    return res.status(400).json({ message: 'type and target are required.' });
  }
  if (!ALLOWED_RISK.has(risk)) {
    return res.status(400).json({ message: 'risk must be one of low, medium, high.' });
  }

  try {
    const entry = await Investigation.create({
      user: req.userId,
      type,
      target,
      risk,
      summary,
      profilesFound: Number(profilesFound) || 0,
    });
    res.status(201).json({ entry: entry.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ message: 'Could not save investigation.' });
  }
}

export async function clearHistory(req, res) {
  try {
    await Investigation.deleteMany({ user: req.userId });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Could not clear investigation history.' });
  }
}
