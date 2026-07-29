import { FiBookOpen, FiPlay, FiSearch, FiCode, FiArrowRight } from 'react-icons/fi';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Link } from 'react-router-dom';

const TOPICS = [
  {
    icon: FiPlay,
    title: 'Getting started',
    description: 'Set up your workspace, configure sources, and run your first search in under five minutes.',
  },
  {
    icon: FiSearch,
    title: 'Search guides',
    description: 'Username, email, domain, and metadata investigation workflows with screenshots and decision trees.',
  },
  {
    icon: FiCode,
    title: 'Integrations',
    description: 'Connect SentryScope with Slack, Jira, TheHive, and your SIEM through REST and webhooks.',
  },
  {
    icon: FiBookOpen,
    title: 'Security and compliance',
    description: 'Understanding data retention, source attribution, and how to stay within legal and ethical boundaries.',
  },
];

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-base">
      <PublicNavbar />
      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
            <div className="max-w-3xl">
              <h1 className="text-3xl lg:text-4xl font-bold text-text mb-4">Documentation</h1>
              <p className="text-text-muted text-base leading-relaxed">
                Step-by-step guides, search methodology, and integration references for defensive OSINT
                workflows. Everything here assumes public sources and authorized use.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link to="/register">
                  <Button icon={FiArrowRight} iconPosition="right">Start free</Button>
                </Link>
                <Link to="/api-reference">
                  <Button variant="secondary">API reference</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
            <h2 className="text-xl font-bold text-text mb-8">Browse by topic</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {TOPICS.map((topic) => (
                <Card key={topic.title} hoverable>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <topic.icon size={18} className="text-accent" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text mb-1">{topic.title}</h3>
                      <p className="text-text-muted text-sm leading-relaxed">{topic.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
            <h2 className="text-xl font-bold text-text mb-3">Need help with a specific module?</h2>
            <p className="text-text-muted text-sm leading-relaxed max-w-2xl mb-6">
              Each module has its own quickstart and reference page. If something is missing or unclear,
              open an issue on GitHub or reach out through the contact page.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Username search', href: '#' },
                { label: 'Domain intelligence', href: '#' },
                { label: 'Email footprinting', href: '#' },
                { label: 'Metadata extraction', href: '#' },
                { label: 'REST API', href: '/api-reference' },
                { label: 'Webhooks', href: '/api-reference' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-xl border border-border bg-white/[0.02] px-4 py-3 text-sm text-text-muted hover:text-text hover:border-accent/30 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
