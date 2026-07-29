const records = [];
const counters = {
  investigations: 0,
  profiles: 0,
  risk: { high: 0, medium: 0, low: 0 },
  moduleCounts: {},
};

export function recordInvestigation({ type, target, risk = 'low', profilesFound = 0 }) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    target,
    risk,
    profilesFound,
    timestamp: new Date().toISOString(),
  };
  records.push(entry);
  counters.investigations += 1;
  counters.profiles += profilesFound;
  counters.risk[risk] = (counters.risk[risk] || 0) + 1;
  counters.moduleCounts[type] = (counters.moduleCounts[type] || 0) + 1;
  return entry;
}

export function getDashboardMetrics() {
  const total = counters.investigations;
  const recent = records.slice(-20).reverse();
  return {
    investigations: total,
    profilesIndexed: counters.profiles,
    openRisk: counters.risk.high,
    totalRisk: counters.risk.high + counters.risk.medium,
    moduleCounts: counters.moduleCounts,
    recentInvestigations: recent,
    updatedAt: new Date().toISOString(),
  };
}

export function clearAnalytics() {
  records.length = 0;
  counters.investigations = 0;
  counters.profiles = 0;
  counters.risk = { high: 0, medium: 0, low: 0 };
  counters.moduleCounts = {};
}
