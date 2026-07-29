import { URL_REGEX } from '../utils/validators.js';
import { extractHostname } from '../utils/ssrf.js';
import { guardedFetch, SsrfBlockedError } from '../utils/guardedFetch.js';
import { recordInvestigation } from '../services/analytics.js';

export async function fetchSiteSignature(req, res) {
  let { url } = req.query;
  if (!url || !URL_REGEX.test(url.replace(/^https?:\/\//, ''))) {
    return res.status(400).json({ message: 'Provide a valid URL or domain, e.g. example.com' });
  }
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  const hostname = extractHostname(url);
  if (!hostname) {
    return res.status(400).json({ message: 'Provide a valid URL with a hostname.' });
  }

  try {
    // guardedFetch validates the hostname up front AND re-validates every
    // address it actually connects to (including redirect targets) at the
    // moment of connecting, which is what actually closes the SSRF hole —
    // checking response.url after fetch() has already completed is too late.
    const response = await guardedFetch(url, {
      timeout: 8000,
      headers: { 'User-Agent': 'SentryScope-OSINT-Bot/1.0 (+educational-security-tool)' },
    });

    const html = await response.text();
    const headers = Object.fromEntries(response.headers.entries());
    recordInvestigation({ type: 'Tech', target: hostname, risk: 'low', profilesFound: 1 });
    res.json({
      finalUrl: response.url,
      status: response.status,
      headers,
      html: html.slice(0, 200000),
    });
  } catch (err) {
    if (err instanceof SsrfBlockedError) {
      return res.status(400).json({ message: err.message });
    }
    res.status(502).json({ message: 'Could not reach that site. Check the URL and try again.' });
  }
}
