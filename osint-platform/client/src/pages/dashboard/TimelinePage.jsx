import { motion } from 'framer-motion';
import {
  FiClock,
  FiUser,
  FiMail,
  FiGlobe,
  FiCpu,
  FiFileText,
  FiImage,
  FiLock,
  FiShare2,
  FiTrash2,
} from 'react-icons/fi';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusChip from '../../components/ui/StatusChip';
import EmptyState from '../../components/ui/EmptyState';
import { useHistory } from '../../context/HistoryContext';

const TYPE_ICONS = {
  Username: FiUser,
  Email: FiMail,
  Domain: FiGlobe,
  Tech: FiCpu,
  Metadata: FiFileText,
  Image: FiImage,
  Password: FiLock,
  'Relationship Graph': FiShare2,
};

const RISK_TONE = { low: 'success', medium: 'warning', high: 'danger' };

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function TimelinePage() {
  const { entries, clearHistory } = useHistory();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-text">Timeline</h1>
          <p className="text-text-muted text-sm mt-1">
            A chronological log of every investigation run this session.
          </p>
        </div>
        {entries.length > 0 && (
          <Button variant="ghost" size="sm" icon={FiTrash2} onClick={clearHistory}>
            Clear history
          </Button>
        )}
      </div>

      <Card>
        <CardHeader icon={FiClock} title="Activity" subtitle={`${entries.length} events logged`} />
        {entries.length === 0 ? (
          <EmptyState
            icon={FiClock}
            title="No activity yet"
            description="Run an investigation from any module — Username Search, Domain lookup, Password check, and more — and it'll show up here."
          />
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
            <div className="space-y-5">
              {entries.map((entry, i) => {
                const Icon = TYPE_ICONS[entry.type] || FiClock;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="relative"
                  >
                    <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-accent border-2 border-base" />
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <Icon size={14} className="text-text-muted mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-text font-medium">
                            {entry.type} · <span className="text-text-muted font-normal">{entry.target}</span>
                          </p>
                          {entry.summary && (
                            <p className="text-xs text-text-faint mt-0.5">{entry.summary}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusChip tone={RISK_TONE[entry.risk] || 'neutral'}>{entry.risk}</StatusChip>
                        <span className="text-[11px] text-text-faint">{timeAgo(entry.timestamp)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
