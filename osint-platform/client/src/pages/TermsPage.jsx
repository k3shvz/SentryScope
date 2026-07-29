import { FiMail } from 'react-icons/fi';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    title: 'Accounts and access',
    body: 'You are responsible for maintaining the confidentiality of your account credentials. Team administrators may audit who has access to shared workspaces and revoke invitations at any time.',
  },
  {
    title: 'Acceptable use',
    body: 'SentryScope is intended for authorized security testing, incident response, and organizational risk assessment. Any use for unauthorized surveillance, harassment, or illegal activity is prohibited.',
  },
  {
    title: 'Data and output',
    body: 'All results are derived from public sources. You are responsible for how you store, share, and act on those results. We do not validate findings for legal admissibility.',
  },
  {
    title: 'Service changes',
    body: 'We may update features, pricing, and availability with reasonable notice. Continued use after changes constitutes acceptance. Downtime is not guaranteed and is not liability-bearing.',
  },
  {
    title: 'Limitation of liability',
    body: 'SentryScope is provided as-is. We are not liable for indirect, incidental, or consequential damages arising from use or inability to use the platform.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-base">
      <PublicNavbar />
      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
            <div className="max-w-3xl">
              <h1 className="text-3xl lg:text-4xl font-bold text-text mb-4">Terms of service</h1>
              <p className="text-text-muted text-base leading-relaxed">
                These terms govern your use of SentryScope. By creating an account or using the service,
                you agree to the following conditions. If you do not agree, please discontinue use.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
            <div className="max-w-3xl space-y-6">
              {SECTIONS.map((section) => (
                <Card key={section.title}>
                  <h2 className="text-sm font-semibold text-text mb-2">{section.title}</h2>
                  <p className="text-text-muted text-sm leading-relaxed">{section.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
            <h2 className="text-xl font-bold text-text mb-3">Questions?</h2>
            <p className="text-text-muted text-sm leading-relaxed max-w-2xl mb-6">
              If you have questions about these terms, reach out before using the platform. We will
              clarify scope and any restrictions that may apply.
            </p>
            <Link to="/contact">
              <Button icon={FiMail}>Contact us</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
