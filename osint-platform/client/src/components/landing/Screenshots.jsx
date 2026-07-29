import { motion } from 'framer-motion';
import { FiActivity, FiPieChart, FiList } from 'react-icons/fi';

function MockDashboardPreview() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-text-muted text-xs">Risk overview</p>
          <p className="text-2xl font-bold text-text font-mono-num mt-1">32<span className="text-text-faint text-base">/100</span></p>
        </div>
        <span className="rounded-full bg-secondary/10 text-secondary text-[11px] font-medium px-2.5 py-1">Low exposure</span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Profiles found', value: '7' },
          { label: 'Exposed emails', value: '1' },
          { label: 'Open ports', value: '0' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-white/[0.02] border border-border p-3">
            <p className="text-lg font-bold text-text font-mono-num">{s.value}</p>
            <p className="text-[10px] text-text-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {[70, 45, 90, 30].map((w, i) => (
          <div key={i} className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-accent to-secondary" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MockGraphPreview() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 h-full flex items-center justify-center relative overflow-hidden">
      <svg viewBox="0 0 240 160" className="w-full h-full">
        <line x1="120" y1="30" x2="60" y2="90" stroke="#1E293B" strokeWidth="1.5" />
        <line x1="120" y1="30" x2="180" y2="90" stroke="#1E293B" strokeWidth="1.5" />
        <line x1="60" y1="90" x2="30" y2="140" stroke="#1E293B" strokeWidth="1.5" />
        <line x1="180" y1="90" x2="210" y2="140" stroke="#1E293B" strokeWidth="1.5" />
        <line x1="60" y1="90" x2="180" y2="90" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="120" cy="30" r="12" fill="#00E5FF" opacity="0.9" />
        <circle cx="60" cy="90" r="9" fill="#4ADE80" opacity="0.85" />
        <circle cx="180" cy="90" r="9" fill="#4ADE80" opacity="0.85" />
        <circle cx="30" cy="140" r="7" fill="#94A3B8" opacity="0.7" />
        <circle cx="210" cy="140" r="7" fill="#94A3B8" opacity="0.7" />
      </svg>
    </div>
  );
}

export default function Screenshots() {
  return (
    <section id="screenshots" className="max-w-7xl mx-auto px-5 lg:px-8 py-24 border-t border-border">
      <div className="max-w-2xl mb-14">
        <p className="text-secondary text-sm font-semibold mb-3 tracking-wide">Inside the platform</p>
        <h2 className="text-3xl lg:text-4xl font-bold text-text tracking-tight">
          A dashboard built for signal, not spectacle
        </h2>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="lg:col-span-2 h-72"
        >
          <MockDashboardPreview />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="h-72"
        >
          <MockGraphPreview />
        </motion.div>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 mt-4">
        {[
          { icon: FiActivity, label: 'Live activity timeline' },
          { icon: FiPieChart, label: 'Exposure breakdown charts' },
          { icon: FiList, label: 'Exportable evidence tables' },
        ].map((f) => (
          <div key={f.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <f.icon size={16} className="text-accent flex-shrink-0" />
            <span className="text-sm text-text-muted">{f.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
