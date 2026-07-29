import { motion } from 'framer-motion';
import { FiShield, FiLock, FiEyeOff, FiCheckSquare } from 'react-icons/fi';

const POINTS = [
  {
    icon: FiEyeOff,
    title: 'Public sources only',
    desc: 'No credential bypasses, no scraping behind login walls, no access to private accounts — ever.',
  },
  {
    icon: FiLock,
    title: 'k-anonymity password checks',
    desc: 'Your password is hashed locally; only a truncated hash prefix is ever sent, matching the same model used by Have I Been Pwned.',
  },
  {
    icon: FiCheckSquare,
    title: 'Built for authorized use',
    desc: 'Designed for teams assessing their own organization\'s exposure, or engagements with explicit written authorization.',
  },
  {
    icon: FiShield,
    title: 'Hardened by default',
    desc: 'Rate limiting, input sanitization, hashed credentials, and strict CORS policies protect the platform itself.',
  },
];

export default function Security() {
  return (
    <section id="security" className="max-w-7xl mx-auto px-5 lg:px-8 py-24 border-t border-border">
      <div className="grid lg:grid-cols-2 gap-14 items-start">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-danger text-sm font-semibold mb-3 tracking-wide">Ethics &amp; security</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-text tracking-tight mb-5">
            Built with a hard line around what it won&apos;t do
          </h2>
          <p className="text-text-muted leading-relaxed mb-6">
            SentryScope is an educational and defensive-security tool. It&apos;s designed to help
            you understand what&apos;s publicly visible about your organization — not to enable
            unauthorized access, harassment, or surveillance of individuals.
          </p>
          <div className="rounded-xl border border-danger/25 bg-danger/5 p-4">
            <p className="text-sm text-text leading-relaxed">
              <strong className="text-danger">Usage disclaimer:</strong> Only investigate
              identifiers, domains, or accounts you own or have explicit written authorization
              to assess. Misuse to stalk, harass, or access non-public information violates
              this platform&apos;s terms.
            </p>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {POINTS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
                <p.icon size={16} className="text-secondary" />
              </div>
              <h3 className="text-text font-semibold text-sm mb-1.5">{p.title}</h3>
              <p className="text-text-muted text-xs leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
