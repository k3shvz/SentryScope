import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiAlertTriangle,
  FiFileText,
  FiUser,
  FiGlobe,
  FiCpu,
  FiLock,
  FiMail,
  FiActivity,
  FiClock,
  FiServer,
  FiList,
  FiRefreshCw,
  FiSearch,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Card from '../../components/ui/Card';
import StatusChip from '../../components/ui/StatusChip';
import Button from '../../components/ui/Button';
import { useHistory } from '../../context/HistoryContext';
import ExportMenu from '../../components/dashboard/ExportMenu';
import InvestigationProgress from '../../components/dashboard/InvestigationProgress';
import AISummaryWidget from '../../components/dashboard/AISummaryWidget';
import api from '../../utils/api';

const MODULES = [
  { key: 'username', label: 'Username', icon: FiUser, route: '/dashboard/username', shortcut: '⌘U', color: 'var(--theme-accent)' },
  { key: 'domain', label: 'Domain', icon: FiGlobe, route: '/dashboard/domain', shortcut: '⌘D', color: 'var(--theme-secondary)' },
  { key: 'email', label: 'Email', icon: FiMail, route: '/dashboard/email', shortcut: '⌘E', color: 'var(--theme-warning)' },
  { key: 'password', label: 'Password', icon: FiLock, route: '/dashboard/password', shortcut: '⌘P', color: 'var(--theme-danger)' },
  { key: 'tech', label: 'Tech', icon: FiCpu, route: '/dashboard/tech', shortcut: '⌘T', color: 'var(--theme-accent)' },
  { key: 'metadata', label: 'Metadata', icon: FiFileText, route: '/dashboard/metadata', shortcut: '⌘M', color: 'var(--theme-secondary)' },
];

const RISK_TONE = { low: 'success', medium: 'warning', high: 'danger' };
const RISK_COLORS = { low: '#4ADE80', medium: '#F59E0B', high: '#FF5D73' };

const initialDaily = [
  { day: 'Mon', scans: 4, threats: 1 },
  { day: 'Tue', scans: 7, threats: 2 },
  { day: 'Wed', scans: 5, threats: 1 },
  { day: 'Thu', scans: 9, threats: 3 },
  { day: 'Fri', scans: 6, threats: 2 },
  { day: 'Sat', scans: 2, threats: 0 },
  { day: 'Sun', scans: 4, threats: 1 },
];

export default function DashboardHome() {
  const { entries } = useHistory();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [cliLog, setCliLog] = useState('$ ready\n');
  const [scanning, setScanning] = useState(false);
  const [now, setNow] = useState(new Date());
  const [serverStatus, setServerStatus] = useState('checking');
  const [metrics, setMetrics] = useState(null);
  const [daily, setDaily] = useState(initialDaily);
  const logRef = useRef(null);
  const pollRef = useRef(null);

  const appendLog = useCallback((line) => {
    setCliLog((prev) => {
      const next = prev + line + '\n';
      return next.slice(-1800);
    });
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [cliLog]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('dashboard-cli-input')?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchMetrics() {
    try {
      const { data } = await api.get('/analytics/dashboard');
      setMetrics(data);
      setServerStatus('ok');
    } catch {
      setServerStatus('degraded');
    }
  }

  useEffect(() => {
    fetchMetrics();
    pollRef.current = setInterval(fetchMetrics, 5000);
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => {
    if (!metrics) return;
    setDaily((prev) => {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
      const todayEntry = prev.find((d) => d.day === today);
      if (todayEntry && metrics.investigations) {
        return prev.map((d) => (d.day === today ? { ...d, scans: metrics.investigations, threats: metrics.openRisk || 0 } : d));
      }
      return prev;
    });
  }, [metrics]);

  useEffect(() => {
    if (!entries.length) return;
    const last = entries[0];
    appendLog(`[session] last investigation: ${last.target || last.summary || 'unknown'} [${last.risk || 'low'}]`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length, appendLog]);

  const investigationsList = useMemo(() => {
    if (entries.length) {
      return entries.map((entry, idx) => ({
        id: `INV-${2100 + idx}`,
        target: entry.target || entry.summary || 'unknown',
        type: entry.type || '—',
        risk: entry.risk || 'low',
        time: 'just now',
        scannedAt: new Date().toISOString(),
      }));
    }
    if (metrics?.recentInvestigations?.length) {
      return metrics.recentInvestigations.map((inv) => ({
        id: inv.id || `INV-${Math.floor(Math.random() * 9000) + 1000}`,
        target: inv.target,
        type: inv.type,
        risk: inv.risk,
        time: inv.timestamp ? new Date(inv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
        scannedAt: inv.timestamp,
      }));
    }
    return [];
  }, [entries, metrics]);

  const moduleCounts = useMemo(() => {
    const counts = {};
    investigationsList.forEach((item) => {
      counts[item.type] = (counts[item.type] || 0) + 1;
    });
    if (metrics?.moduleCounts) {
      Object.entries(metrics.moduleCounts).forEach(([key, value]) => {
        counts[key] = (counts[key] || 0) + value;
      });
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [investigationsList, metrics]);

  const stats = useMemo(() => {
    const totalInvestigations = metrics?.investigations ?? investigationsList.length;
    const profilesIndexed = metrics?.profilesIndexed ?? investigationsList.reduce((sum, i) => sum + (i.profilesFound || 0), 0);
    const highRiskCount = investigationsList.filter((i) => i.risk === 'high').length;
    const openRisk = metrics?.openRisk ?? highRiskCount;
    const reportsGenerated = investigationsList.length;
    return [
      { label: 'Investigations', value: totalInvestigations, icon: FiActivity, sub: `${investigationsList.length} this session` },
      { label: 'Profiles indexed', value: profilesIndexed, icon: FiUsers, sub: 'Username, domain, email' },
      { label: 'Open risk', value: openRisk, icon: FiAlertTriangle, sub: `${highRiskCount} high` },
      { label: 'Reports generated', value: reportsGenerated, icon: FiFileText, sub: 'Exportable' },
    ];
  }, [investigationsList, metrics]);

  const pieData = useMemo(() => {
    const palette = ['var(--theme-accent)', 'var(--theme-secondary)', 'var(--theme-warning)', 'var(--theme-danger)', 'var(--theme-text-faint)'];
    return moduleCounts.map((m, idx) => ({ name: m.name, value: m.value, color: palette[idx] || palette[0] }));
  }, [moduleCounts]);

  function handleSearch(e) {
    e.preventDefault();
    const raw = query.trim();
    if (!raw) return;
    appendLog(`$ scan ${raw}`);
    setScanning(true);
    setTimeout(() => {
      const module = raw.includes('@') ? 'email' : /^[a-z0-9.-]+\.[a-z]{2,}/i.test(raw) ? 'domain' : 'username';
      appendLog(`[resolver] matched module: ${module}`);
      appendLog(`[${module}] queued ${raw} for inspection`);
      setScanning(false);
      const mod = MODULES.find((m) => m.key === module);
      if (mod) {
        navigate(mod.route, { state: { quickQuery: raw } });
      }
    }, 500);
  }

  function refresh() {
    appendLog('$ refresh');
    fetchMetrics();
  }

  return (
    <div className="space-y-5">
      <div className="relative rounded-2xl border border-border/80 bg-gradient-to-br from-card to-card-hover overflow-hidden p-6 sm:p-8 shadow-sm">
        {/* Background decorative glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-text tracking-tight">Intelligence Overview</h1>
              <p className="text-sm text-text-muted mt-1">Live analytics and active investigations across your network.</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusChip tone={serverStatus === 'ok' ? 'success' : 'warning'} dot>
                {serverStatus === 'ok' ? 'Systems operational' : 'Degraded performance'}
              </StatusChip>
              <button onClick={refresh} className="text-xs font-medium text-text-muted hover:text-text flex items-center gap-1.5 px-2 py-1 transition-colors">
                <FiRefreshCw size={12} className={scanning ? 'animate-spin' : ''} /> {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </button>
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative max-w-3xl group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="text-text-faint group-focus-within:text-accent transition-colors" size={18} />
            </div>
            <input
              id="dashboard-cli-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter domain, email, username, or IP to analyze..."
              className="w-full bg-base/80 backdrop-blur-md border border-border/80 rounded-xl py-3.5 pl-12 pr-32 text-sm text-text placeholder:text-text-faint outline-none focus:border-accent/60 focus:ring-4 focus:ring-accent/10 transition-all shadow-inner"
            />
            <div className="absolute inset-y-0 right-2 flex items-center gap-2">
              <kbd className="hidden sm:inline-flex text-[10px] font-medium text-text-faint bg-white/5 border border-border rounded px-1.5 py-0.5">
                ⌘K
              </kbd>
              <Button type="submit" size="sm" className="shadow-glow" loading={scanning}>
                Analyze
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((item) => (
          <Card key={item.label} className="relative">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-mono text-text-faint uppercase tracking-wider">{item.label}</p>
                <p className="text-2xl font-bold text-text tabular-nums font-mono mt-1 leading-tight">{item.value.toLocaleString()}</p>
                <p className="text-[11px] text-text-faint mt-1 font-mono">{item.sub}</p>
              </div>
              <item.icon size={16} className="text-text-faint mt-0.5" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiClock size={14} className="text-text-faint" />
              <span className="text-[11px] font-mono font-semibold text-text uppercase tracking-wider">Activity (7d)</span>
            </div>
            <span className="text-[10px] font-mono text-text-faint">{daily.reduce((s, d) => s + d.scans, 0)} scans total</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily} margin={{ left: -16, right: 8 }}>
                <defs>
                  <linearGradient id="socScan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--theme-accent)" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="var(--theme-accent)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="socThreat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--theme-danger)" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="var(--theme-danger)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--theme-text-faint)" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="var(--theme-text-faint)" fontSize={11} tickLine={false} axisLine={false} dx={-8} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(11,17,24,0.95)',
                    border: '1px solid var(--theme-border)',
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                />
                <Area type="monotone" dataKey="scans" stroke="var(--theme-accent)" strokeWidth={2} fill="url(#socScan)" name="Scans" />
                <Area type="monotone" dataKey="threats" stroke="var(--theme-danger)" strokeWidth={2} fill="url(#socThreat)" name="Threats" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-semibold text-text uppercase tracking-wider">Modules</span>
            <span className="text-[10px] font-mono text-text-faint">{investigationsList.length} processed</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={46} outerRadius={68} paddingAngle={2} strokeWidth={0}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(11,17,24,0.95)',
                    border: '1px solid var(--theme-border)',
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap gap-2">
              {moduleCounts.map((m) => (
                <span key={m.name} className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-text-faint" /> {m.name}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FiList size={14} className="text-text-faint" />
              <span className="text-[11px] font-mono font-semibold text-text uppercase tracking-wider">Investigations</span>
            </div>
            <span className="text-[10px] font-mono text-text-faint">
              {investigationsList.length} record{investigationsList.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="divide-y divide-border">
            {investigationsList.length === 0 && (
              <div className="py-6 text-center text-text-faint text-xs font-mono">no records yet — run a scan</div>
            )}
            {investigationsList.map((inv) => (
              <div key={inv.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded bg-white/5 border border-border flex items-center justify-center flex-shrink-0">
                    {inv.type === 'Domain' ? (
                      <FiGlobe size={13} className="text-accent" />
                    ) : inv.type === 'Email' ? (
                      <FiMail size={13} className="text-warning" />
                    ) : inv.type === 'Username' ? (
                      <FiUser size={13} className="text-secondary" />
                    ) : (
                      <FiServer size={13} className="text-text-muted" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-text font-medium truncate">{inv.target}</p>
                    <p className="text-[11px] text-text-faint font-mono">{inv.id} · {inv.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[11px] font-mono text-text-faint hidden sm:block">{inv.time}</span>
                  <StatusChip tone={RISK_TONE[inv.risk]}>{inv.risk}</StatusChip>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-semibold text-text uppercase tracking-wider">Quick scan</span>
              <ExportMenu data={investigationsList} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MODULES.map((mod) => (
                <button
                  key={mod.key}
                  onClick={() => navigate(mod.route)}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-border p-2.5 hover:border-accent/30 hover:bg-white/[0.02] transition-colors"
                >
                  <mod.icon size={16} className="text-text-muted" />
                  <span className="text-[11px] text-text-muted font-medium">{mod.label}</span>
                  <span className="text-[10px] font-mono text-text-faint">{mod.shortcut}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-semibold text-text uppercase tracking-wider">Recent activity</span>
              <span className="text-[10px] font-mono text-text-faint">this session</span>
            </div>
            <div className="space-y-2.5">
              {investigationsList.length === 0 && (
                <p className="py-4 text-center text-text-faint text-xs font-mono">no activity yet — run a scan</p>
              )}
              {investigationsList.slice(0, 5).map((inv) => (
                <div key={inv.id} className="flex items-start gap-2.5 rounded-lg border border-border/60 p-2.5 hover:bg-white/[0.01]">
                  <span
                    className="mt-1 h-2 w-2 rounded-full flex-shrink-0"
                    style={{ background: RISK_COLORS[inv.risk] || '#5B6B85' }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-text font-medium truncate">{inv.target}</p>
                    <p className="text-[11px] text-text-faint font-mono mt-0.5">{inv.type} · {inv.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <InvestigationProgress scanning={scanning} hasInvestigations={investigationsList.length > 0} />

          <AISummaryWidget investigations={investigationsList} />
        </div>
      </div>
    </div>
  );
}
