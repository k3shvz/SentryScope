import clsx from 'clsx';

export function Skeleton({ className }) {
  return (
    <div
      className={clsx(
        'rounded-md bg-gradient-to-r from-card via-card-hover to-card bg-[length:200%_100%] animate-[shimmer_1.6s_ease-in-out_infinite]',
        className
      )}
      style={{
        backgroundImage: 'linear-gradient(90deg, #101827 25%, #1a2740 37%, #101827 63%)',
        backgroundSize: '400% 100%',
        animation: 'shimmer 1.6s ease-in-out infinite',
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-2.5 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-2.5 w-full mb-2" />
      <Skeleton className="h-2.5 w-4/5 mb-2" />
      <Skeleton className="h-2.5 w-3/5" />
    </div>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('shimmer-keyframes')) {
  const style = document.createElement('style');
  style.id = 'shimmer-keyframes';
  style.innerHTML = `@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
  document.head.appendChild(style);
}
