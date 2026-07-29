import { FiShield, FiTrash2, FiLock, FiEye, FiArrowRight } from 'react-icons/fi';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

const TOPICS = [
  {
    icon: FiEye,
    title: 'What we collect',
    body: 'Account data, search queries, and optional workspace metadata are stored to operate the service. We do not collect passwords, private messages, or non-public personal data.',
  },
  {
    icon: FiLock,
    title: 'How we protect it',
    body: 'Data is encrypted at rest and in transit. Access is restricted to operational staff on a need-to-know basis and logged for audit.',
  },
  {
    icon: FiTrash2,
    title: 'Retention and deletion',
    body: 'Search results are retained for the life of your workspace unless deleted. You can export and delete data at any time from the dashboard. Backups are purged on a rolling schedule.',
  },
  {
    icon: FiShield,
    title: 'Third parties',
    body: 'We do not sell data. Infrastructure providers receive only the minimum necessary data to run the service and are bound by equivalent security clauses.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-base">
      <PublicNavbar />
      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
            <div className="max-w-3xl">
              <h1 className="text-3xl lg:text-4xl font-bold text-text mb-4">Privacy policy</h1>
              <p className="text-text-muted text-base leading-relaxed">
                This policy explains what data SentryScope processes, why, and for how long. We aim for
                transparency over legal complexity. If something is unclear, ask.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
            <div className="max-w-3xl space-y-4">
              {TOPICS.map((topic) => (
                <Card key={topic.title}>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <topic.icon size={18} className="text-accent" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-text mb-1">{topic.title}</h2>
                      <p className="text-text-muted text-sm leading-relaxed">{topic.body}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
            <h2 className="text-xl font-bold text-text mb-3">Your choices</h2>
            <p className="text-text-muted text-sm leading-relaxed max-w-2xl mb-6">
              You can request a full data export or account deletion at any time. For privacy-related
              requests, email privacy@example.com or use the contact form.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact">
                <Button icon={FiArrowRight} iconPosition="right">Contact us</Button>
              </Link>
              <Button variant="secondary">Export my data</Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
