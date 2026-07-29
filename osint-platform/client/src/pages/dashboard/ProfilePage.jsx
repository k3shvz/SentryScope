import { FiUser, FiMail, FiShield, FiClock, FiActivity, FiCalendar } from 'react-icons/fi';
import Card, { CardHeader } from '../../components/ui/Card';
import StatusChip from '../../components/ui/StatusChip';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from '../../context/HistoryContext';
import { useNavigate } from 'react-router-dom';

const RISK_TONE = { low: 'success', medium: 'warning', high: 'danger' };

export default function ProfilePage() {
  const { user } = useAuth();
  const { entries, clearHistory } = useHistory();
  const navigate = useNavigate();

  const totalInvestigations = entries.length;
  const highRisk = entries.filter((e) => e.risk === 'high').length;
  const mediumRisk = entries.filter((e) => e.risk === 'medium').length;
  const lowRisk = entries.filter((e) => e.risk === 'low').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-text">Profile</h1>
          <p className="text-text-muted text-sm mt-1">
            Your account details and session activity summary.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard/settings')}>
          Edit profile
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-3xl font-bold text-base flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-text">{user?.name || 'User'}</h2>
            <p className="text-sm text-text-muted flex items-center gap-1.5 mt-1">
              <FiMail size={13} /> {user?.email || '—'}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <StatusChip tone="accent">Active</StatusChip>
              <span className="text-[11px] text-text-faint flex items-center gap-1">
                <FiCalendar size={10} /> Joined recently
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader icon={FiActivity} title="Total" subtitle="Investigations" />
          <p className="text-3xl font-bold text-text font-mono-num">{totalInvestigations}</p>
        </Card>
        <Card>
          <CardHeader icon={FiShield} title="High risk" subtitle="Findings" />
          <p className="text-3xl font-bold text-danger font-mono-num">{highRisk}</p>
        </Card>
        <Card>
          <CardHeader icon={FiClock} title="Medium risk" subtitle="Findings" />
          <p className="text-3xl font-bold text-warning font-mono-num">{mediumRisk}</p>
        </Card>
        <Card>
          <CardHeader icon={FiUser} title="Low risk" subtitle="Findings" />
          <p className="text-3xl font-bold text-secondary font-mono-num">{lowRisk}</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardHeader
            icon={FiActivity}
            title="Recent activity"
            subtitle={`${entries.length} events this session`}
          />
          {entries.length > 0 && (
            <button onClick={clearHistory} className="text-xs text-danger hover:underline">
              Clear history
            </button>
          )}
        </div>
        {entries.length === 0 ? (
          <EmptyState
            icon={FiActivity}
            title="No activity yet"
            description="Run an investigation from any module and it will show up here."
          />
        ) : (
          <div className="space-y-3">
            {entries.slice(0, 8).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <FiUser size={13} className="text-text-muted" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-text font-medium">{entry.type}</p>
                    <p className="text-xs text-text-faint truncate">{entry.target}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusChip tone={RISK_TONE[entry.risk] || 'neutral'}>{entry.risk}</StatusChip>
                  <span className="text-[11px] text-text-faint">{entry.time || 'just now'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
