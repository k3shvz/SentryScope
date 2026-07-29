import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShield, FiCheckCircle, FiLock, FiActivity } from 'react-icons/fi';

const SYSTEMS = [
  { label: 'Auth & Teams', status: 'operational', latency: '41 ms' },
  { label: 'Search API', status: 'operational', latency: '52 ms' },
  { label: 'Image Metadata', status: 'operational', latency: '38 ms' },
  { label: 'Export Pipeline', status: 'operational', latency: '64 ms' },
];

const PILLARS = [
  {
    icon: FiActivity,
    title: 'Live intelligence',
    description: 'Username, domain, email, and metadata checks powered by public APIs, cert transparency, and breach corpora.',
  },
  {
    icon: FiLock,
    title: 'Privacy by design',
    description: 'Password checks use k-anonymity. Your inputs never leave the browser for sensitive modules.',
  },
  {
    icon: FiCheckCircle,
    title: 'Audit-ready output',
    description: 'Export PDF, CSV, and JSON reports with source attribution for incident response and compliance reviews.',
  },
];

const DELAY = 0.08;
const SPRING = { type: 'spring', stiffness: 260, damping: 24 };

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-base flex">
      <div className="hidden lg:flex lg:w-[52%] xl:w-[54%] relative overflow-hidden">
        <div className="absolute inset-0 bg-cyber-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-base via-base/80 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative w-full max-w-2xl mx-auto px-12 xl:px-16 py-14 flex flex-col justify-between">
          <div>
            <Link to="/" className="relative inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center backdrop-blur-sm">
                <FiShield size={20} className="text-accent" />
              </div>
              <span className="font-semibold text-text text-xl tracking-tight">SentryScope</span>
            </Link>
          </div>

          <div className="relative mt-10">
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="text-3xl xl:text-4xl font-bold text-text leading-[1.12] tracking-tight"
            >
              Map your public exposure with confidence.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="text-text-muted text-sm leading-relaxed mt-5 max-w-md"
            >
              Professional OSINT for security teams — built on public sources, hardened by default, and designed
              for authorized use only.
            </motion.p>

            <motion.div className="mt-10 space-y-4" initial="hidden" animate="visible" transition={{ staggerChildren: DELAY }}>
              {PILLARS.map((pillar) => (
                <motion.div
                  key={pillar.title}
                  transition={SPRING}
                  variants={{
                    hidden: { opacity: 0, x: -18 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  className="flex items-start gap-4 rounded-2xl border border-border/80 bg-white/[0.02] p-4 backdrop-blur-sm"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/10 flex items-center justify-center flex-shrink-0">
                    <pillar.icon size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">{pillar.title}</p>
                    <p className="text-xs text-text-muted leading-relaxed mt-0.5">{pillar.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="relative mt-10">
            <div className="rounded-2xl border border-border/80 bg-white/[0.02] p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-text uppercase tracking-wider">System status</p>
                <StatusPill label="All systems operational" />
              </div>
              <div className="space-y-2.5">
                {SYSTEMS.map((system) => (
                  <div key={system.label} className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">{system.label}</span>
                    <span className="text-[11px] text-text-faint font-mono-num">{system.latency}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-text-faint mt-3">
              Educational &amp; authorized-use only. Public sources, always.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-12 bg-base">
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="w-full max-w-[420px]"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <FiShield size={18} className="text-accent" />
            </div>
            <span className="font-semibold text-text text-lg tracking-tight">SentryScope</span>
          </div>
          <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-7 shadow-card">
            <h1 className="text-[28px] font-bold text-text tracking-tight">{title}</h1>
            {subtitle && <p className="text-text-muted text-sm leading-relaxed mt-1.5 mb-7">{subtitle}</p>}
            <div className="space-y-5">{children}</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatusPill({ label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 px-2.5 py-1 text-[11px] font-medium">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-secondary" />
      </span>
      {label}
    </span>
  );
}
