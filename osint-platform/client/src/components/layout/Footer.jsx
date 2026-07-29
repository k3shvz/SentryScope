import { Link } from 'react-router-dom';
import { FiShield } from 'react-icons/fi';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Platforms', href: '/#platforms' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Pricing', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/documentation' },
      { label: 'API reference', href: '/api-reference' },
      { label: 'Status', href: '/status' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '#' },
      { label: 'Responsible use', href: '/acceptable-use' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of service', href: '/terms' },
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Acceptable use', href: '/acceptable-use' },
      { label: 'Cookie policy', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
        <div className="grid lg:grid-cols-6 gap-10 mb-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <FiShield size={16} className="text-accent" />
              </div>
              <span className="font-semibold text-text">SentryScope</span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs mb-5">
              Open-source intelligence footprinting for defensive security teams. Public
              sources only, always.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/k3shvz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-text-muted hover:text-accent transition-colors"
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02a9.68 9.68 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.94-4.57 4.92.36.31.68.92.68 1.85v2.74c0 .27.16.58.67.5A10 10 0 0 0 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
              <a
                href="https://x.com/k3shvz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-text-muted hover:text-accent transition-colors"
                aria-label="X"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-text text-sm font-semibold mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-text-muted text-sm hover:text-text transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-faint text-xs">
            © {new Date().getFullYear()} SentryScope. For educational and authorized security use only.
          </p>
          <p className="text-text-faint text-xs">Made By K3shv</p>
        </div>
      </div>
    </footer>
  );
}
