import { FiAlertTriangle, FiShield, FiUsers, FiGlobe, FiMail } from 'react-icons/fi';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';

const RULES = [
  {
    icon: FiShield,
    title: 'Authorized use only',
    body: 'Use SentryScope only for activities you are legally permitted to perform. This includes penetration tests, bug bounties, incident response, and approved risk assessments.',
  },
  {
    icon: FiUsers,
    title: 'Respect privacy',
    body: 'Do not use the platform to investigate private individuals without consent or legal authority. Public-source intelligence does not override privacy rights.',
  },
  {
    icon: FiGlobe,
    title: 'Do not harass or stalk',
    body: 'Aggregating public data to threaten, intimidate, or monitor a person is prohibited. Report suspected misuse through the security disclosure channel.',
  },
  {
    icon: FiAlertTriangle,
    title: 'No credential misuse',
    body: 'Do not submit leaked credentials, private dumps, or gray-market feeds. If you encounter exposed credentials, report them to the affected platform instead.',
  },
  {
    icon: FiMail,
    title: 'Responsible disclosure',
    body: 'If you discover vulnerabilities or misuse, report them privately. Publicly disclosing unpatched issues before a fix is available puts users at risk.',
  },
];

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen bg-base">
      <PublicNavbar />
      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
            <div className="max-w-3xl">
              <h1 className="text-3xl lg:text-4xl font-bold text-text mb-4">Acceptable use</h1>
              <p className="text-text-muted text-base leading-relaxed">
                SentryScope is built for defensive security. These guidelines help keep the community
                safe, lawful, and respectful. Violations may result in access revocation and, where
                applicable, referral to appropriate authorities.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
            <div className="max-w-3xl space-y-4">
              {RULES.map((rule) => (
                <Card key={rule.title}>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <rule.icon size={18} className="text-accent" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-text mb-1">{rule.title}</h2>
                      <p className="text-text-muted text-sm leading-relaxed">{rule.body}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
            <h2 className="text-xl font-bold text-text mb-3">Report a violation</h2>
            <p className="text-text-muted text-sm leading-relaxed max-w-2xl mb-6">
              If you witness misuse of SentryScope or believe a user is violating these guidelines,
              report it confidentially. Include as much context as possible without exposing private data.
            </p>
            <a href="mailto:SentryScope@hi2.in" className="inline-flex items-center gap-2 text-sm text-accent hover:underline">
              <FiMail size={14} />
              SentryScope@hi2.in
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
