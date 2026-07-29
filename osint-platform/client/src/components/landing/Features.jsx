import { motion } from 'framer-motion';
import {
  FiUser,
  FiGlobe,
  FiLock,
  FiFileText,
  FiCpu,
  FiShare2,
} from 'react-icons/fi';

const FEATURES = [
  {
    icon: FiUser,
    title: 'Username & profile search',
    desc: 'Trace a handle across dozens of public platforms and surface bios, followers, and linked accounts in one view.',
  },
  {
    icon: FiGlobe,
    title: 'Domain & WHOIS intelligence',
    desc: 'Pull registrar data, DNS records, SSL details, and hosting provider info for any domain you\'re authorized to assess.',
  },
  {
    icon: FiLock,
    title: 'Password exposure checks',
    desc: 'Check exposure against breach corpora using k-anonymity — your actual password never leaves your device.',
  },
  {
    icon: FiFileText,
    title: 'Document metadata analysis',
    desc: 'Extract author, software, GPS, and revision history hidden inside PDFs, Office files, and images.',
  },
  {
    icon: FiCpu,
    title: 'Technology fingerprinting',
    desc: 'Detect frameworks, CMS platforms, and CDNs powering a website from its public-facing signals.',
  },
  {
    icon: FiShare2,
    title: 'Relationship graphing',
    desc: 'Visualize how a username, email, and domain connect across public sources in an interactive, draggable graph.',
  },
];

export default function Features() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-5 lg:px-8 py-24">
      <div className="max-w-2xl mb-14">
        <p className="text-accent text-sm font-semibold mb-3 tracking-wide">Capabilities</p>
        <h2 className="text-3xl lg:text-4xl font-bold text-text tracking-tight mb-4">
          Every module works from public sources only
        </h2>
        <p className="text-text-muted leading-relaxed">
          No credential bypasses, no private data access, no scraping that violates a
          platform&apos;s terms. Just a structured view of what&apos;s already visible to anyone
          looking.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            className="rounded-2xl border border-border bg-card p-6 hover:border-accent/25 transition-colors duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <f.icon size={18} className="text-accent" />
            </div>
            <h3 className="text-text font-semibold mb-2">{f.title}</h3>
            <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
