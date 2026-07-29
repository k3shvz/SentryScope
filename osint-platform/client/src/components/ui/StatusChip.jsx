import clsx from 'clsx';

const TONES = {
  success: 'bg-secondary/10 text-secondary border-secondary/25',
  danger: 'bg-danger/10 text-danger border-danger/25',
  warning: 'bg-warning/10 text-warning border-warning/25',
  info: 'bg-accent/10 text-accent border-accent/25',
  neutral: 'bg-white/5 text-text-muted border-border',
};

export default function StatusChip({ tone = 'neutral', dot = true, children, className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide',
        TONES[tone],
        className
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
