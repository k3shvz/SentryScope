export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <Icon size={24} className="text-text-faint" />
        </div>
      )}
      <h4 className="text-text font-semibold text-sm mb-1.5">{title}</h4>
      {description && (
        <p className="text-text-muted text-sm max-w-xs leading-relaxed mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
