import { FiActivity, FiAlertTriangle, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const SERVICES = [
  { name: 'Web application', status: 'operational', latency: '38 ms', region: 'EU, US' },
  { name: 'Search API', status: 'operational', latency: '52 ms', region: 'EU, US, APAC' },
  { name: 'Auth and teams', status: 'operational', latency: '41 ms', region: 'EU, US' },
  { name: 'Image metadata', status: 'degraded', latency: '210 ms', region: 'US' },
  { name: 'Webhooks', status: 'operational', latency: '65 ms', region: 'EU, US' },
];

const INCIDENTS = [
  {
    date: 'July 22, 2026',
    title: 'Image metadata latency',
    body: 'Some image URLs are returning slower than usual. We are re-routing image processing and expect full recovery within the hour.',
    status: 'monitoring',
  },
  {
    date: 'July 10, 2026',
    title: 'Minor dashboard outage',
    body: 'A deploy caused brief read errors on saved searches. Rolled back in under four minutes. No data was lost.',
    status: 'resolved',
  },
  {
    date: 'June 28, 2026',
    title: 'API rate-limit tuning',
    body: 'Increased default limits for standard tier after sustained traffic growth. No user-facing impact.',
    status: 'resolved',
  },
];

function StatusBadge({ status }) {
  const map = {
    operational: { label: 'Operational', icon: FiCheckCircle, className: 'text-secondary bg-secondary/10' },
    degraded: { label: 'Degraded', icon: FiAlertTriangle, className: 'text-accent bg-accent/10' },
    monitoring: { label: 'Monitoring', icon: FiActivity, className: 'text-text-muted bg-white/5' },
    resolved: { label: 'Resolved', icon: FiCheckCircle, className: 'text-secondary bg-secondary/10' },
  };
  const item = map[status] || map.operational;
  return (
    <span className={clsx('inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-md', item.className)}>
      <item.icon size={12} />
      {item.label}
    </span>
  );
}

function clsx(...args) {
  return args.filter(Boolean).join(' ');
}

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-base">
      <PublicNavbar />
      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
            <div className="max-w-3xl">
              <h1 className="text-3xl lg:text-4xl font-bold text-text mb-4">System status</h1>
              <p className="text-text-muted text-base leading-relaxed">
                Real-time health for SentryScope services. Subscribe to updates if you rely on the API
                for production pipelines.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
            <h2 className="text-xl font-bold text-text mb-6">Services</h2>
            <div className="space-y-3">
              {SERVICES.map((service) => (
                <Card key={service.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FiActivity size={16} className="text-text-muted" />
                    <div>
                      <p className="text-sm font-semibold text-text">{service.name}</p>
                      <p className="text-xs text-text-muted">{service.region}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-text-muted">p{service.latency}</span>
                    <StatusBadge status={service.status} />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
            <h2 className="text-xl font-bold text-text mb-6">Incident history</h2>
            <div className="space-y-4">
              {INCIDENTS.map((incident) => (
                <Card key={incident.title}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-text">{incident.title}</h3>
                    <StatusBadge status={incident.status} />
                  </div>
                  <p className="text-xs text-text-muted mb-2">{incident.date}</p>
                  <p className="text-text-muted text-sm leading-relaxed">{incident.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
            <h2 className="text-xl font-bold text-text mb-3">Subscribe to updates</h2>
            <p className="text-text-muted text-sm leading-relaxed max-w-2xl mb-6">
              Get notified by email or Slack when services change state. We only send actionable
              messages, never marketing.
            </p>
            <div className="flex flex-wrap gap-3">
              <input
                type="email"
                 placeholder="SentryScope@hi2.in"
                className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent/50"
              />
              <Button icon={FiRefreshCw}>Subscribe</Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
