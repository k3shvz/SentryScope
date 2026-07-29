import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiMenu, FiX } from 'react-icons/fi';
import Button from '../ui/Button';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#platforms', label: 'Platforms' },
  { href: '#security', label: 'Security' },
  { href: '#faq', label: 'FAQ' },
];

const PAGE_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/changelog', label: 'Changelog' },
  { to: '/documentation', label: 'Documentation' },
  { to: '/api-reference', label: 'API' },
  { to: '/status', label: 'Status' },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-base/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <FiShield size={16} className="text-accent" />
          </div>
          <span className="font-semibold text-text tracking-tight">SentryScope</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 flex-1">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-sm text-text-muted hover:text-text transition-colors"
            >
              {l.label}
            </a>
          ))}
          {PAGE_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="px-3 py-2 text-sm text-text-muted hover:text-text transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1 lg:hidden" />

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/login" className="text-sm text-text-muted hover:text-text px-3 py-2">
            Sign in
          </Link>
          <Link to="/register">
            <Button size="sm">Start free</Button>
          </Link>
        </div>

        <button
          className="lg:hidden text-text p-1"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border px-5 py-4 space-y-1 bg-base">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-2 py-2.5 text-sm text-text-muted hover:text-text"
            >
              {l.label}
            </a>
          ))}
          {PAGE_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block px-2 py-2.5 text-sm text-text-muted hover:text-text"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link to="/login" onClick={() => setOpen(false)}>
              <Button variant="secondary" className="w-full">Sign in</Button>
            </Link>
            <Link to="/register" onClick={() => setOpen(false)}>
              <Button className="w-full">Start free</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
