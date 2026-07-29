import { FiArrowRight } from 'react-icons/fi';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Link } from 'react-router-dom';

const RELEASES = [
  {
    version: '0.12.0',
    date: 'July 18, 2026',
    title: 'Certificate transparency and passive DNS',
    body: 'Added certificate transparency log search across Censys and crt.sh. Passive DNS resolution now mirrors results for faster pivoting on domains and subdomains.',
  },
  {
    version: '0.11.0',
    date: 'June 29, 2026',
    title: 'Username enumeration across 24 platforms',
    body: 'Expanded username search with rate-limited queries and cache-backed results. Users can now save searches and export findings as CSV and JSON.',
  },
  {
    version: '0.10.0',
    date: 'June 2, 2026',
    title: 'Email footprinting and breach-aware checks',
    body: 'Introduced domain email discovery and verification without sending messages. Breach checks rely on public breach repositories and clearly label source confidence.',
  },
  {
    version: '0.9.0',
    date: 'May 11, 2026',
    title: 'Teams and audit logs',
    body: 'Organizations can create teams, assign roles, and review read-only audit logs. All actions are tied to the authenticated user and timestamped.',
  },
  {
    version: '0.8.0',
    date: 'April 20, 2026',
    title: 'Metadata extraction and image lookup',
    body: 'Uploaded images are stripped of EXIF metadata in-browser before upload. URL-based image lookup surfaces public metadata, geolocation hints, and platform origins.',
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-base">
      <PublicNavbar />
      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
            <div className="max-w-3xl">
              <h1 className="text-3xl lg:text-4xl font-bold text-text mb-4">Changelog</h1>
              <p className="text-text-muted text-base leading-relaxed">
                Track new features, bug fixes, and platform improvements. Every release is backwards-compatible
                whenever possible, and breaking changes are called out with migration notes.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link to="/register">
                  <Button icon={FiArrowRight} iconPosition="right">Start free</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
            <div className="space-y-4">
              {RELEASES.map((release) => (
                <Card key={release.version} className="hoverable">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded-md">v{release.version}</span>
                        <span className="text-xs text-text-muted">{release.date}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-text mb-1">{release.title}</h3>
                      <p className="text-text-muted text-sm leading-relaxed">{release.body}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
