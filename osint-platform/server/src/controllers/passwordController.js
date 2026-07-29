// This proxies the k-anonymity range query so the client can optionally route
// through our backend (e.g. to apply consistent rate limiting/logging) without
// ever seeing the user's password or full hash — only a 5-char hash prefix
// arrives here, exactly as the client itself would send directly to the API.

import { HEX_PREFIX_REGEX } from '../utils/validators.js';
import { recordInvestigation } from '../services/analytics.js';

export async function checkHashPrefix(req, res) {
  const { prefix } = req.params;

  if (!HEX_PREFIX_REGEX.test(prefix)) {
    return res.status(400).json({ message: 'Invalid hash prefix.' });
  }

  try {
    const upstream = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
    });
    if (!upstream.ok) {
      return res.status(502).json({ message: 'Breach-check service unavailable.' });
    }
    const text = await upstream.text();
    const count = text.split('\n').filter(Boolean).length;
    const risk = count > 1000 ? 'high' : count > 100 ? 'medium' : 'low';
    recordInvestigation({ type: 'Password', target: req.params.prefix, risk, profilesFound: count });
    res.type('text/plain').send(text);
  } catch {
    res.status(502).json({ message: 'Breach-check service unavailable.' });
  }
}
