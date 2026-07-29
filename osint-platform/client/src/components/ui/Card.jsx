import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function Card({ className, hoverable, glass, children, as = 'div', ...props }) {
  const Component = motion[as] || motion.div;
  return (
    <Component
      className={clsx(
        'rounded-2xl border border-border p-5 shadow-card',
        glass ? 'glass-card' : 'bg-card',
        hoverable && 'transition-all duration-200 hover:border-accent/30 hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Icon size={17} className="text-accent" />
          </div>
        )}
        <div>
          <h3 className="text-text font-semibold text-[15px] leading-tight">{title}</h3>
          {subtitle && <p className="text-text-muted text-xs mt-1">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
