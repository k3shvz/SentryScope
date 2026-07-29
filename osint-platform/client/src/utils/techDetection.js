// Runs client-side against our own backend proxy (browsers block cross-origin
// fetches of arbitrary sites without CORS, so the actual page fetch happens
// server-side in domainController-style fashion). This file just defines the
// signature patterns and result shaping.

export const TECH_SIGNATURES = [
  { name: 'React', type: 'Frontend', test: (html) => /data-reactroot|react-dom|_next\/static/i.test(html) },
  { name: 'Next.js', type: 'Frontend', test: (html, headers) => /_next\/static/i.test(html) || /x-powered-by:\s*next\.js/i.test(headers) },
  { name: 'Vue.js', type: 'Frontend', test: (html) => /data-v-app|__vue__|vue\.js/i.test(html) },
  { name: 'Angular', type: 'Frontend', test: (html) => /ng-version|ng-app/i.test(html) },
  { name: 'jQuery', type: 'Frontend', test: (html) => /jquery(\.min)?\.js/i.test(html) },
  { name: 'Bootstrap', type: 'CSS Framework', test: (html) => /bootstrap(\.min)?\.css/i.test(html) },
  { name: 'Tailwind CSS', type: 'CSS Framework', test: (html) => /tailwind/i.test(html) },
  { name: 'WordPress', type: 'CMS', test: (html) => /wp-content|wp-includes|generator"\s+content="WordPress/i.test(html) },
  { name: 'Shopify', type: 'CMS', test: (html) => /cdn\.shopify\.com|Shopify\.theme/i.test(html) },
  { name: 'Wix', type: 'CMS', test: (html) => /static\.wixstatic\.com|wix\.com/i.test(html) },
  { name: 'Squarespace', type: 'CMS', test: (html) => /squarespace\.com|static1\.squarespace/i.test(html) },
  { name: 'Laravel', type: 'Backend', test: (html, headers) => /laravel_session/i.test(headers) },
  { name: 'Django', type: 'Backend', test: (html, headers) => /csrftoken|django/i.test(headers + html) },
  { name: 'Cloudflare', type: 'CDN/Hosting', test: (html, headers) => /cloudflare/i.test(headers) },
  { name: 'Nginx', type: 'Web Server', test: (html, headers) => /server:\s*nginx/i.test(headers) },
  { name: 'Apache', type: 'Web Server', test: (html, headers) => /server:\s*apache/i.test(headers) },
  { name: 'Vercel', type: 'CDN/Hosting', test: (html, headers) => /x-vercel-id|vercel\.app/i.test(headers + html) },
  { name: 'Netlify', type: 'CDN/Hosting', test: (html, headers) => /x-nf-request-id|netlify/i.test(headers + html) },
  { name: 'Firebase', type: 'Backend', test: (html) => /firebaseapp\.com|firebase-app/i.test(html) },
  { name: 'Google Analytics', type: 'Analytics', test: (html) => /google-analytics\.com|gtag\(/i.test(html) },
];

export function detectTechnologies(html, headers) {
  const headerStr = Object.entries(headers || {})
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  return TECH_SIGNATURES.filter((sig) => {
    try {
      return sig.test(html || '', headerStr || '');
    } catch {
      return false;
    }
  }).map((sig) => ({ name: sig.name, type: sig.type }));
}
