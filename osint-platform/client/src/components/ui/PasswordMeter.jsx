const LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
const COLORS = ['#FF5D73', '#FF5D73', '#F59E0B', '#00E5FF', '#4ADE80'];

export default function PasswordMeter({ score }) {
  return (
    <div>
      <div className="flex gap-1 mb-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors duration-300"
            style={{ background: i <= score ? COLORS[score] : 'var(--theme-border)' }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: COLORS[score] }}>
        {LABELS[score]}
      </p>
    </div>
  );
}
