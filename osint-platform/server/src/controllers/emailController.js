import { createHash } from 'crypto';

import { EMAIL_REGEX } from '../utils/validators.js';
import { recordInvestigation } from '../services/analytics.js';

async function safeFetch(url, options = {}) {
  try {
    return await fetch(url, { ...options, signal: AbortSignal.timeout(6000) });
  } catch {
    return null;
  }
}

function normalizeResult(source, status, details, url, category) {
  return { source, status, details: details || '', url: url || '', category: category || 'Info' };
}

export async function investigateEmail(req, res) {
  const { email } = req.query;
  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }

  const normalized = email.trim().toLowerCase();
  const hash = createHash('md5').update(normalized).digest('hex');
  const domain = normalized.split('@')[1];

  let hasGravatar = false;
  let profile = null;
  let avatarUrl = null;
  const checks = [];

  try {
    const avatarCheck = await safeFetch(`https://www.gravatar.com/avatar/${hash}?d=404`);
    hasGravatar = Boolean(avatarCheck && avatarCheck.status === 200);
    checks.push(normalizeResult('Gravatar', hasGravatar ? 'found' : 'not_found', hasGravatar ? 'Public avatar exists' : 'No public avatar', `https://www.gravatar.com/avatar/${hash}`, 'Profile'));

    if (hasGravatar) {
      const profileRes = await safeFetch(`https://www.gravatar.com/${hash}.json`);
      if (profileRes && profileRes.status === 200) {
        const data = await profileRes.json().catch(() => null);
        const entry = data?.entry?.[0];
        if (entry) {
          profile = {
            displayName: entry.displayName,
            aboutMe: entry.aboutMe,
            location: entry.currentLocation,
            urls: (entry.urls || []).map((u) => u.value),
            accounts: (entry.accounts || []).map((a) => ({ name: a.name, url: a.url })),
          };
          avatarUrl = `https://www.gravatar.com/avatar/${hash}?s=200`;
        }
      }
    }
  } catch {
    checks.push(normalizeResult('Gravatar', 'skipped', 'Lookup failed', null, 'Profile'));
  }

  try {
    const githubRes = await safeFetch(`https://api.github.com/search/users?q=${encodeURIComponent(normalized)}`);
    if (githubRes && githubRes.status === 200) {
      const data = await githubRes.json().catch(() => null);
      if (data?.items?.length) {
        const user = data.items[0];
        checks.push(normalizeResult('GitHub', 'found', `Possible profile: ${user.login}`, user.html_url, 'Developer'));
      } else {
        checks.push(normalizeResult('GitHub', 'not_found', 'No public GitHub user matched this email', 'https://github.com/search', 'Developer'));
      }
    } else {
      checks.push(normalizeResult('GitHub', 'skipped', 'GitHub lookup skipped or rate-limited', 'https://github.com/search', 'Developer'));
    }
  } catch {
    checks.push(normalizeResult('GitHub', 'skipped', 'GitHub lookup failed', 'https://github.com/search', 'Developer'));
  }

  try {
    const hibpKey = process.env.HIBP_API_KEY;
    if (!hibpKey) {
      checks.push(normalizeResult('Have I Been Pwned', 'skipped', 'Requires HIBP_API_KEY in server/.env', 'https://haveibeenpwned.com', 'Security'));
    } else {
      const hibpRes = await safeFetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(normalized)}`, {
        headers: { 'User-Agent': 'SentryScope-OSINT-Bot', 'hibp-api-key': hibpKey },
      });
      if (hibpRes && hibpRes.status === 200) {
        const breaches = await hibpRes.json().catch(() => []);
        const names = breaches.map((b) => b.Name).filter(Boolean);
        checks.push(normalizeResult('Have I Been Pwned', 'found', names.length ? `Pwned on ${names.length} site${names.length === 1 ? '' : 's'}` : 'Breached account data available', 'https://haveibeenpwned.com', 'Security'));
      } else if (hibpRes && hibpRes.status === 404) {
        checks.push(normalizeResult('Have I Been Pwned', 'not_found', 'No breaches found for this email', 'https://haveibeenpwned.com', 'Security'));
      } else {
        checks.push(normalizeResult('Have I Been Pwned', 'skipped', 'Lookup failed or rate-limited', 'https://haveibeenpwned.com', 'Security'));
      }
    }
  } catch {
    checks.push(normalizeResult('Have I Been Pwned', 'skipped', 'Lookup failed or rate-limited', 'https://haveibeenpwned.com', 'Security'));
  }

  try {
    const hunterKey = process.env.HUNTER_API_KEY;
    if (!hunterKey) {
      checks.push(normalizeResult('Hunter.io', 'skipped', 'Requires HUNTER_API_KEY in server/.env', 'https://hunter.io', 'Intel'));
    } else {
      const hunterRes = await safeFetch(`https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(normalized)}&api_key=${hunterKey}`);
      if (hunterRes && hunterRes.status === 200) {
        const data = await hunterRes.json().catch(() => null);
        const status = data?.data?.status || 'unknown';
        const score = typeof data?.data?.score === 'number' ? `Score: ${data.data.score}` : '';
        checks.push(normalizeResult('Hunter.io', status === 'valid' ? 'found' : 'not_found', `${status}${score ? ' · ' + score : ''}`, 'https://hunter.io', 'Intel'));
      } else {
        checks.push(normalizeResult('Hunter.io', 'skipped', 'Hunter lookup failed', 'https://hunter.io', 'Intel'));
      }
    }
  } catch {
    checks.push(normalizeResult('Hunter.io', 'skipped', 'Lookup failed', 'https://hunter.io', 'Intel'));
  }

  try {
    const emailRepRes = await safeFetch(`https://emailrep.io/query/${encodeURIComponent(normalized)}`, {
      headers: { 'User-Agent': 'SentryScope-OSINT-Bot' },
    });
    if (emailRepRes && emailRepRes.status === 200) {
      const data = await emailRepRes.json().catch(() => null);
      const reputation = data?.data?.reputation || 'unknown';
      const suspicious = Boolean(data?.data?.suspicious);
      checks.push(normalizeResult('EmailRep', suspicious ? 'found' : 'not_found', `Reputation: ${reputation}${suspicious ? ' · flagged' : ''}`, 'https://emailrep.io', 'Intel'));
    } else if (emailRepRes && emailRepRes.status === 401) {
      checks.push(normalizeResult('EmailRep', 'skipped', 'Ratelimited or blocked', 'https://emailrep.io', 'Intel'));
    } else {
      checks.push(normalizeResult('EmailRep', 'skipped', 'Lookup failed', 'https://emailrep.io', 'Intel'));
    }
  } catch {
    checks.push(normalizeResult('EmailRep', 'skipped', 'Lookup failed', 'https://emailrep.io', 'Intel'));
  }

  try {
    const gitlabRes = await safeFetch(`https://gitlab.com/api/v4/users?search=${encodeURIComponent(normalized)}`);
    if (gitlabRes && gitlabRes.status === 200) {
      const users = await gitlabRes.json().catch(() => []);
      if (users.length) {
        const user = users[0];
        checks.push(normalizeResult('GitLab', 'found', `Possible profile: ${user.username}`, `https://gitlab.com/${user.username}`, 'Developer'));
      } else {
        checks.push(normalizeResult('GitLab', 'not_found', 'No GitLab user matched this email', 'https://gitlab.com/search', 'Developer'));
      }
    } else {
      checks.push(normalizeResult('GitLab', 'skipped', 'GitLab lookup failed or rate-limited', 'https://gitlab.com/search', 'Developer'));
    }
  } catch {
    checks.push(normalizeResult('GitLab', 'skipped', 'GitLab lookup failed', 'https://gitlab.com/search', 'Developer'));
  }

  try {
    const wpRes = await safeFetch(`https://en.wordpress.com/users/search/${encodeURIComponent(normalized)}/`);
    if (wpRes && wpRes.status === 200) {
      checks.push(normalizeResult('WordPress', 'found', 'WordPress user search result available', `https://en.wordpress.com/users/search/${encodeURIComponent(normalized)}/`, 'Media'));
    } else {
      checks.push(normalizeResult('WordPress', 'not_found', 'No WordPress profile result from this public search', 'https://en.wordpress.com/users', 'Media'));
    }
  } catch {
    checks.push(normalizeResult('WordPress', 'skipped', 'Lookup failed', 'https://en.wordpress.com/users', 'Media'));
  }

  try {
    const soRes = await safeFetch(`https://api.stackexchange.com/2.3/users?order=desc&sort=reputation&site=stackoverflow&inname=${encodeURIComponent(normalized.split('@')[0])}`);
    if (soRes && soRes.status === 200) {
      const data = await soRes.json().catch(() => null);
      if (data?.items?.length) {
        const user = data.items[0];
        checks.push(normalizeResult('Stack Overflow', 'found', `Possible profile: ${user.display_name}`, `https://stackoverflow.com/users/${user.user_id}/${user.display_name}`, 'Q&A'));
      } else {
        checks.push(normalizeResult('Stack Overflow', 'not_found', 'No Stack Overflow profile matched this email identity', 'https://stackoverflow.com/users', 'Q&A'));
      }
    } else {
      checks.push(normalizeResult('Stack Overflow', 'skipped', 'Stack Overflow lookup failed', 'https://stackoverflow.com/users', 'Q&A'));
    }
  } catch {
    checks.push(normalizeResult('Stack Overflow', 'skipped', 'Lookup failed', 'https://stackoverflow.com/users', 'Q&A'));
  }

  let hasMx = null;
  try {
    const dnsRes = await safeFetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`);
    const dnsData = dnsRes ? await dnsRes.json().catch(() => null) : null;
    hasMx = Boolean(dnsData?.Answer?.length);
  } catch {
    hasMx = null;
  }

  const profilesFound = checks.filter((c) => c.status === 'found').length;
  const risk = profilesFound >= 5 ? 'high' : profilesFound >= 2 ? 'medium' : 'low';
  recordInvestigation({ type: 'Email', target: normalized, risk, profilesFound });

  res.json({
    email: normalized,
    domain,
    hasGravatar,
    avatarUrl,
    profile,
    domainAcceptsMail: hasMx,
    checks,
  });
}
