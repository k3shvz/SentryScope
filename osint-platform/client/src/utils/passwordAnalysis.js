// All analysis here runs entirely client-side. For the exposure check, only the
// first 5 characters of the SHA-1 hash are ever transmitted (k-anonymity model),
// so the real password and full hash never leave the browser.

export async function sha1Hex(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function calculateEntropy(password) {
  if (!password) return 0;
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;
  if (poolSize === 0) return 0;
  return Math.round(password.length * Math.log2(poolSize));
}

export function estimateCrackTime(entropyBits) {
  // Assumes ~10 billion guesses/sec, a conservative offline-attack estimate
  const guessesPerSecond = 1e10;
  const combinations = Math.pow(2, entropyBits);
  const seconds = combinations / guessesPerSecond / 2; // average case

  if (seconds < 1) return 'Instantly';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  const years = seconds / 31536000;
  if (years < 1000) return `${Math.round(years)} years`;
  if (years < 1e6) return `${Math.round(years / 1000)} thousand years`;
  if (years < 1e9) return `${Math.round(years / 1e6)} million years`;
  return `${Math.round(years / 1e9)} billion years`;
}

export function scorePassword(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

export function passwordRecommendations(password) {
  const recs = [];
  if (password.length < 12) recs.push('Use at least 12 characters — length matters more than complexity.');
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) recs.push('Mix uppercase and lowercase letters.');
  if (!/[0-9]/.test(password)) recs.push('Include at least one number.');
  if (!/[^a-zA-Z0-9]/.test(password)) recs.push('Add a symbol like !, #, or %.');
  if (/^(password|qwerty|letmein|admin|welcome)/i.test(password)) {
    recs.push('Avoid common dictionary words and predictable patterns.');
  }
  if (recs.length === 0) recs.push('This password meets strong-password guidelines. Consider a password manager to keep it unique per site.');
  return recs;
}

/**
 * Checks a password against the Have I Been Pwned Pwned Passwords API using
 * the k-anonymity model: only the first 5 chars of the SHA-1 hash are sent.
 * Returns { breached: boolean, count: number } or throws on network failure.
 */
export async function checkPasswordExposure(password) {
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { 'Add-Padding': 'true' },
  });

  if (!response.ok) {
    throw new Error('Unable to reach the breach-check service.');
  }

  const text = await response.text();
  const lines = text.split('\n');
  for (const line of lines) {
    const [lineSuffix, count] = line.trim().split(':');
    if (lineSuffix === suffix) {
      return { breached: true, count: parseInt(count, 10) };
    }
  }
  return { breached: false, count: 0 };
}
