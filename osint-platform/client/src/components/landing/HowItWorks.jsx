import { motion } from 'framer-motion';

const STEPS = [
  {
    step: '01',
    title: 'Enter a public identifier',
    desc: 'A username, domain, or email you own or are authorized to assess.',
  },
  {
    step: '02',
    title: 'SentryScope queries public sources',
    desc: 'We check indexed platforms, DNS, WHOIS registries, and breach corpora — nothing behind a login wall.',
  },
  {
    step: '03',
    title: 'Review the compiled footprint',
    desc: 'See exposure in a risk-scored dashboard: profiles, technologies, metadata, and timeline in one place.',
  },
  {
    step: '04',
    title: 'Export or act on findings',
    desc: 'Download a PDF/CSV report, or hand findings straight to your remediation workflow.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-7xl mx-auto px-5 lg:px-8 py-24 border-t border-border">
      <div className="max-w-2xl mb-14">
        <p className="text-secondary text-sm font-semibold mb-3 tracking-wide">Process</p>
        <h2 className="text-3xl lg:text-4xl font-bold text-text tracking-tight">
          From identifier to actionable report in four steps
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="relative"
          >
            <span className="text-4xl font-bold text-white/[0.06] font-mono-num absolute -top-2 -left-1">
              {s.step}
            </span>
            <div className="relative pt-8">
              <h3 className="text-text font-semibold mb-2">{s.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{s.desc}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className="hidden lg:block absolute top-4 -right-3 w-6 h-px bg-border" />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
