import { DOMAIN_REGEX } from '../utils/validators.js';
import { recordInvestigation } from '../services/analytics.js';
import { isPublicHostname } from '../utils/ssrf.js';
import { guardedFetch, SsrfBlockedError } from '../utils/guardedFetch.js';
import tls from 'tls';

async function safeFetch(url, options = {}) {
  try {
    const controller = new AbortController();
    const timeout = options.timeout || 8000;
    const id = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch {
    return null;
  }
}

async function fetchJSON(url) {
  const res = await safeFetch(url);
  if (!res || !res.ok) throw new Error(`Upstream request failed (${res?.status || 'network'})`);
  return res.json();
}

async function fetchDNS(domain, type) {
  try {
    const data = await fetchJSON(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`);
    return data.Answer || [];
  } catch {
    return [];
  }
}

async function getSSLInfo(domain) {
  // getSSLInfo makes a raw TCP+TLS connection to the user-supplied domain —
  // unlike the HTTP fetches elsewhere in this file, it doesn't go through
  // fetch()/guardedFetch(), so it needs its own explicit SSRF check before
  // ever calling tls.connect.
  const publicHost = await isPublicHostname(domain);
  if (!publicHost) {
    return { valid: false, error: 'Requests to private, internal, or local hostnames are not allowed.' };
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    // NOTE: the callback passed here is Node's "secureConnect" listener — it
    // fires with NO arguments once the TLS handshake succeeds. It is not an
    // (err, socket) style Node callback. `socket` (the return value of
    // tls.connect) is the TLSSocket itself, and is what getPeerCertificate()
    // must be called on. Errors are handled separately via the 'error' event
    // below — never inside this callback.
    const socket = tls.connect(443, domain, { servername: domain, timeout: 8000 }, () => {
      try {
        const cert = socket.getPeerCertificate();
        socket.end();
        if (!cert || !Object.keys(cert).length) {
          return finish({ valid: false, error: 'No certificate returned' });
        }
        const validFrom = cert.valid_from ? new Date(cert.valid_from) : null;
        const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
        const now = new Date();
        const daysLeft = validTo ? Math.ceil((validTo - now) / (1000 * 60 * 60 * 24)) : null;
        finish({
          valid: true,
          issuer: cert.issuer?.O || cert.issuer?.CN || null,
          subject: cert.subject?.CN || null,
          validFrom,
          validTo,
          daysLeft,
          signature: cert.signatureAlgorithm || null,
        });
      } catch {
        finish({ valid: false, error: 'Could not read certificate' });
      }
    });
    socket.on('error', () => {
      socket.destroy();
      finish({ valid: false, error: 'Connection failed or TLS handshake error' });
    });
    socket.setTimeout(8000, () => {
      socket.destroy();
      finish({ valid: false, error: 'TLS connection timeout' });
    });
  });
}

async function getSubdomains(domain) {
  try {
    const res = await safeFetch(`https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`, { timeout: 15000 });
    if (!res || res.status !== 200) return [];
    const data = await res.json().catch(() => []);
    if (!Array.isArray(data)) return [];
    const entries = data.map((entry) => entry.name_value).filter(Boolean);
    const unique = [...new Set(entries.flatMap((v) => v.split('\n').map((s) => s.trim()).filter(Boolean)))];
    return unique.filter((s) => s.endsWith(`.${domain}`) && s !== domain).sort();
  } catch {
    return [];
  }
}

function classifyCDN(headers) {
  const server = (headers['server'] || '').toLowerCase();
  if (headers['cf-ray'] || server.includes('cloudflare')) return 'Cloudflare';
  if ((headers['x-cdn'] || '').toLowerCase().includes('akamai')) return 'Akamai';
  if (headers['fastly-ssl'] || (headers['x-served-by'] || '').includes('fastly')) return 'Fastly';
  if ((headers['cf-cache-status'])) return 'Cloudflare';
  if ((headers['via'] || '').toLowerCase().includes('cloudfront')) return 'AWS CloudFront';
  if (server.includes('netlify')) return 'Netlify';
  if (server.includes('vercel')) return 'Vercel';
  if (headers['x-ms']) return 'Azure';
  if (server.includes('gws') || server.includes('gse')) return 'Google';
  if (server.includes('awselb')) return 'AWS';
  if (server.includes('nginx')) return 'Nginx';
  if (server.includes('apache')) return 'Apache';
  return null;
}

function classifySecurityHeaders(headers) {
  const checks = [];
  const secHeaders = {
    'strict-transport-security': 'HSTS',
    'content-security-policy': 'CSP',
    'x-frame-options': 'X-Frame-Options',
    'x-content-type-options': 'X-Content-Type-Options',
    'referrer-policy': 'Referrer-Policy',
    'permissions-policy': 'Permissions-Policy',
    'x-xss-protection': 'X-XSS-Protection',
  };
  for (const [header, label] of Object.entries(secHeaders)) {
    const key = Object.keys(headers).find((k) => k.toLowerCase() === header);
    const present = Boolean(key);
    checks.push({ header: label, present, value: present ? headers[key] : null });
  }
  return checks;
}

function detectTechnologies(html, headers) {
  const tech = [];
  const lowerHtml = (html || '').toLowerCase();
  const headerStr = Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join('\n').toLowerCase();
  const combined = lowerHtml + headerStr;
  const server = (headers['server'] || '').toLowerCase();

  if (combined.includes('react') || lowerHtml.includes('_next/') || lowerHtml.includes('__next')) tech.push('Next.js/React');
  else if (lowerHtml.includes('vue') || lowerHtml.includes('nuxt')) tech.push('Vue/Nuxt');
  else if (lowerHtml.includes('angular')) tech.push('Angular');
  else if (lowerHtml.includes('svelte')) tech.push('Svelte');

  if (lowerHtml.includes('wordpress') || lowerHtml.includes('wp-content') || lowerHtml.includes('xmlrpc.php')) tech.push('WordPress');
  else if (lowerHtml.includes('drupal')) tech.push('Drupal');
  else if (lowerHtml.includes('joomla')) tech.push('Joomla');
  else if (lowerHtml.includes('ghost')) tech.push('Ghost');

  if (lowerHtml.includes('shopify')) tech.push('Shopify');
  else if (lowerHtml.includes('woocommerce')) tech.push('WooCommerce');
  else if (lowerHtml.includes('magento')) tech.push('Magento');

  if (lowerHtml.includes('google-analytics') || lowerHtml.includes('gtag(')) tech.push('Google Analytics');
  if (lowerHtml.includes('googletagmanager') || lowerHtml.includes('gtm.js')) tech.push('Google Tag Manager');

  if (lowerHtml.includes('bootstrap')) tech.push('Bootstrap');
  if (lowerHtml.includes('tailwind')) tech.push('Tailwind CSS');
  if (lowerHtml.includes('jquery')) tech.push('jQuery');
  if (lowerHtml.includes('font awesome') || lowerHtml.includes('fontawesome')) tech.push('Font Awesome');

  if (server.includes('nginx')) tech.push('Nginx');
  else if (server.includes('apache')) tech.push('Apache');
  else if (server.includes('iis')) tech.push('IIS');
  else if (server.includes('gunicorn') || server.includes('uwsgi')) tech.push('Python WSGI');

  if (lowerHtml.includes('php')) tech.push('PHP');
  else if (lowerHtml.includes('asp.net') || lowerHtml.includes('aspx')) tech.push('ASP.NET');
  else if (server.includes('python') || lowerHtml.includes('django') || lowerHtml.includes('flask')) tech.push('Python');
  else if (server.includes('node') || lowerHtml.includes('express')) tech.push('Node.js');
  else if (server.includes('ruby') || lowerHtml.includes('rails')) tech.push('Ruby on Rails');

  return [...new Set(tech)];
}

export async function investigateDomain(req, res) {
  const { domain } = req.query;

  if (!domain || !DOMAIN_REGEX.test(domain)) {
    return res.status(400).json({ message: 'Provide a valid domain, e.g. example.com' });
  }

  let rdap = null;
  let rdapError = null;
  try {
    rdap = await fetchJSON(`https://rdap.org/domain/${encodeURIComponent(domain)}`);
  } catch (err) {
    rdapError = err.message;
  }

  const [a, aaaa, cname, mx, ns, soa, txt] = await Promise.all([
    fetchDNS(domain, 'A'),
    fetchDNS(domain, 'AAAA'),
    fetchDNS(domain, 'CNAME'),
    fetchDNS(domain, 'MX'),
    fetchDNS(domain, 'NS'),
    fetchDNS(domain, 'SOA'),
    fetchDNS(domain, 'TXT'),
  ]);

  const [sslInfo, subdomains] = await Promise.all([
    getSSLInfo(domain),
    getSubdomains(domain),
  ]);

  let pageHtml = null;
  let pageHeaders = null;
  let pageError = null;
  try {
    const pageRes = await guardedFetch(`https://${domain}`, { timeout: 10000 });
    if (pageRes && pageRes.status < 500) {
      pageHeaders = Object.fromEntries(pageRes.headers.entries());
      pageHtml = await pageRes.text().catch(() => null);
    } else {
      pageError = `HTTP ${pageRes?.status || 'failed'}`;
    }
  } catch (err) {
    pageError = err instanceof SsrfBlockedError
      ? 'Requests to private, internal, or local hostnames are not allowed.'
      : 'Could not fetch homepage';
  }

  const hostingProvider = classifyCDN(pageHeaders || {});
  const technologies = detectTechnologies(pageHtml || '', pageHeaders || {});
  const securityHeaders = classifySecurityHeaders(pageHeaders || {});
  const serverHeaders = pageHeaders
    ? Object.fromEntries(
        Object.entries(pageHeaders).filter(([k]) =>
          ['server', 'x-powered-by', 'x-generator', 'x-aspnet-version', 'x-aspnetmvc-version'].includes(k.toLowerCase())
        )
      )
    : {};

  const risk = (a?.length || 0) >= 3 ? 'low' : (a?.length || 0) >= 1 ? 'medium' : 'high';
  recordInvestigation({ type: 'Domain', target: domain, risk, profilesFound: 1 });

  res.json({
    domain,
    rdap,
    rdapError,
    dns: { a, aaaa, cname, mx, ns, soa, txt },
    ssl: sslInfo,
    subdomains,
    hostingProvider,
    pageHeaders,
    serverHeaders,
    securityHeaders,
    technologies,
    pageError,
  });
}
