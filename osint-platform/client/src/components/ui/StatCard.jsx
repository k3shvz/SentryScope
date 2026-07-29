import { useEffect, useState } from 'react';
import Card from './Card';

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    let raf;
    function tick(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export default function StatCard({ icon: Icon, label, value, suffix = '', trend, tone = 'accent' }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0);
  const toneClasses = {
    accent: 'bg-accent/10 text-accent',
    secondary: 'bg-secondary/10 text-secondary',
    danger: 'bg-danger/10 text-danger',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <Card hoverable>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${toneClasses[tone]}`}>
          <Icon size={16} />
        </div>
        {trend && (
          <span className={trend > 0 ? 'text-secondary text-xs font-medium' : 'text-danger text-xs font-medium'}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-text font-mono-num">
        {typeof value === 'number' ? animated : value}
        {suffix}
      </p>
      <p className="text-text-muted text-xs mt-1">{label}</p>
    </Card>
  );
}
