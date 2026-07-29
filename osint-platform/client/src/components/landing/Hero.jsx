import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTerminal, FiCheckCircle, FiLoader } from 'react-icons/fi';
import Button from '../ui/Button';

const SCAN_STEPS = [
  { label: 'Resolving public DNS records', delay: 0 },
  { label: 'Cross-referencing indexed profiles', delay: 900 },
  { label: 'Checking known breach corpora (k-anonymity)', delay: 1900 },
  { label: 'Fingerprinting exposed technologies', delay: 2900 },
  { label: 'Compiling footprint report', delay: 3900 },
];

function ScanTerminal() {
  const [completed, setCompleted] = useState(0);
  const isReset = completed === 0;

  useEffect(() => {
    const timers = SCAN_STEPS.map((step, i) =>
      setTimeout(() => setCompleted((c) => Math.max(c, i + 1)), step.delay + 400)
    );
    const reset = setTimeout(() => setCompleted(0), 5800);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(reset);
    };
  }, [isReset]);

  return (
    <div className="glass-card rounded-2xl shadow-glow overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-white/[0.02]">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-danger/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-warning/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-secondary/60" />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-faint ml-2">
          <FiTerminal size={12} />
          <span className="font-mono-num">footprint-scan.sentryscope.io</span>
        </div>
      </div>
      <div className="p-5 font-mono-num text-[13px] space-y-3 min-h-[220px]">
        <p className="text-text-muted">
          <span className="text-secondary">$</span> sentryscope scan --target acme-corp.com --public-only
        </p>
        {SCAN_STEPS.map((step, i) => {
          const isDone = completed > i;
          const isActive = completed === i;
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: isActive || isDone ? 1 : 0.25, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              {isDone ? (
                <FiCheckCircle size={14} className="text-secondary flex-shrink-0" />
              ) : isActive ? (
                <FiLoader size={14} className="text-accent flex-shrink-0 animate-spin" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-border flex-shrink-0" />
              )}
              <span className={isDone ? 'text-text-muted' : isActive ? 'text-text' : 'text-text-faint'}>
                {step.label}
              </span>
            </motion.div>
          );
        })}
        {completed >= SCAN_STEPS.length && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-secondary pt-1"
          >
            ✓ 14 public data points indexed · 0 private sources accessed
          </motion.p>
        )}
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-cyber-grid">
      <div className="absolute inset-0 bg-gradient-to-b from-base via-base/95 to-base pointer-events-none" />

      {/* Floating glow particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-3xl opacity-20 animate-float pointer-events-none"
          style={{
            width: `${140 + i * 40}px`,
            height: `${140 + i * 40}px`,
            background: i % 2 === 0 ? '#00E5FF' : '#4ADE80',
            top: `${10 + i * 14}%`,
            left: `${(i * 17) % 90}%`,
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${7 + i}s`,
          }}
        />
      ))}

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32 grid lg:grid-cols-2 gap-14 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/5 px-3 py-1 text-xs text-accent font-medium mb-6">
            Built for defensive security teams
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.08] tracking-tight text-text mb-6">
            See your organization the way{' '}
            <span className="text-gradient-accent">an attacker already can</span>
          </h1>
          <p className="text-text-muted text-lg leading-relaxed max-w-lg mb-8">
            SentryScope maps the public digital footprint of your people, domains, and
            infrastructure — using only open-source intelligence — so you can close exposure
            before someone else finds it first.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/register">
              <Button size="lg" icon={FiArrowRight} iconPosition="right">
                Start a free investigation
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="secondary" size="lg">
                See how it works
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 max-w-md">
              {[
                { value: '60+', label: 'Public platforms scanned' },
                { value: '100%', label: 'Public-source only' },
                { value: '<30s', label: 'Avg. scan time' },
              ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-text font-mono-num">{stat.value}</p>
                <p className="text-xs text-text-muted mt-1 leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <ScanTerminal />
        </motion.div>
      </div>
    </section>
  );
}
