import Card from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import StatusChip from '../ui/StatusChip';

export default function ModulePlaceholder({ icon: Icon, title, description }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-text">{title}</h1>
          <p className="text-text-muted text-sm mt-1">{description}</p>
        </div>
        <StatusChip tone="warning">In development</StatusChip>
      </div>
      <Card>
        <EmptyState
          icon={Icon}
          title="This module is being wired up"
          description="The UI is in place — live data will connect once the corresponding API integration ships."
        />
      </Card>
    </div>
  );
}
