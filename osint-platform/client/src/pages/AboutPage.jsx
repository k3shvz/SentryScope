import { Link } from 'react-router-dom';
import { FiLock, FiGlobe, FiUsers, FiZap, FiArrowRight } from 'react-icons/fi';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';

const VALUES = [
  {
    icon: FiLock,
    title: 'Defensive-first',
    description: 'Built for security teams, not surveillance. Every module is designed for authorized, ethical investigation.',
  },
  {
    icon: FiGlobe,
    title: 'Public sources only',
    description: 'We only aggregate data that is already public. No credential dumps, no private scraping, no gray-market feeds.',
  },
  {
    icon: FiZap,
    title: 'Fast, reproducible results',
    description: 'Correlated findings across platforms in seconds, with exportable reports you can attach to tickets and audits.',
  },
  {
    icon: FiUsers,
    title: 'Built by practitioners',
    description: 'Designed with input from SOC analysts and red-teamers who actually use OSINT in incident-response workflows.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-base">
      <PublicNavbar />
      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
            <div className="max-w-3xl">
              <h1 className="text-3xl lg:text-4xl font-bold text-text mb-4">
                About SentryScope
              </h1>
              <p className="text-text-muted text-base leading-relaxed">
                SentryScope is an open-source intelligence platform built for defensive security, risk assessment,
                and authorized investigations. We help security teams, researchers, and organizations understand
                their public footprint across usernames, domains, emails, metadata, and more.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link to="/contact">
                  <Button icon={FiArrowRight} iconPosition="right">Contact us</Button>
                </Link>
                <Link to="/register">
                  <Button variant="secondary">Start free</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
            <h2 className="text-xl font-bold text-text mb-8">Our principles</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {VALUES.map((item) => (
                <div key={item.title} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text mb-1">{item.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-text mb-3">What we do</h2>
                <p className="text-text-muted text-sm leading-relaxed mb-4">
                  SentryScope aggregates public data from registrar records, platform APIs, certificate transparency logs,
                  and other legitimately accessible sources. It is built for authorized use: penetration tests, bug bounties,
                  domain monitoring, and organizational exposure management.
                </p>
                <p className="text-text-muted text-sm leading-relaxed">
                  Every check is opt-in, source-attributed, and explicitly non-destructive. We do not sell data,
                  and we do not bypass access controls. Our goal is to make public-source intelligence repeatable,
                  auditable, and safe.
                </p>
              </div>
              <div>
                <h2 className="text-xl font-bold text-text mb-3">Who it&apos;s for</h2>
                <div className="grid grid-cols-2 gap-3">
                  {['Security Operations Centers', 'Penetration testers', 'Bug bounty researchers', 'CISOs', 'Incident responders', 'Security educators'].map(
                    (audience) => (
                      <div key={audience} className="rounded-xl border border-border bg-white/[0.02] px-4 py-3">
                        <p className="text-sm text-text font-medium">{audience}</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
