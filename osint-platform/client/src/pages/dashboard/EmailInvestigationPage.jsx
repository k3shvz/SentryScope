import { useMemo } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiExternalLink, FiCheckCircle, FiXCircle, FiMapPin, FiInfo, FiShield, FiCode, FiServer, FiMessageSquare, FiFilm, FiUser } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import StatusChip from '../../components/ui/StatusChip';
import { SkeletonCard } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useHistory } from '../../context/HistoryContext';
import { useIncomingQuery } from '../../hooks/useIncomingQuery';
import api from '../../utils/api';

const CATEGORY_CONFIG = {
  Profile: { label: 'Profile', icon: FiUser, tone: 'success' },
  Security: { label: 'Security', icon: FiShield, tone: 'danger' },
  Developer: { label: 'Developer', icon: FiCode, tone: 'secondary' },
  Intel: { label: 'Intel', icon: FiServer, tone: 'neutral' },
  'Q&A': { label: 'Q&A', icon: FiMessageSquare, tone: 'secondary' },
  Media: { label: 'Media', icon: FiFilm, tone: 'secondary' },
  Other: { label: 'Other', icon: FiInfo, tone: 'neutral' },
};

const ORDER = ['Profile', 'Security', 'Developer', 'Intel', 'Q&A', 'Media', 'Other'];

function StatusMeta({ status }) {
  const label = status === 'found' ? 'Found' : status === 'not_found' ? 'Not found' : 'Skipped';
  const tone = status === 'found' ? 'success' : status === 'not_found' ? 'danger' : 'neutral';
  return <StatusChip tone={tone}>{label}</StatusChip>;
}

function CheckCard({ item }) {
  const Icon = CATEGORY_CONFIG[item.category]?.icon || FiInfo;
  const tone = CATEGORY_CONFIG[item.category]?.tone || 'neutral';
  return (
    <Card hoverable className="opacity-90">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg border border-border flex items-center justify-center flex-shrink-0 bg-white/[0.02]`}>
          <Icon size={15} className="text-text-muted" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-text font-semibold text-sm truncate">{item.source}</h3>
            <StatusMeta status={item.status} />
          </div>
          {item.details ? <p className="text-xs text-text-faint mt-1 leading-relaxed">{item.details}</p> : null}
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline mt-2"
            >
              Open source <FiExternalLink size={10} />
            </a>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export default function EmailInvestigationPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const { push } = useToast();
  const { logInvestigation } = useHistory();

  async function runSearch(rawValue) {
    const clean = rawValue.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.get('/email', { params: { email: clean } });
      setResult(data);
      const foundCount = (data.checks || []).filter((c) => c.status === 'found').length;
      push(foundCount ? `Found ${foundCount} match${foundCount === 1 ? '' : 'es'} across public sources.` : 'No public matches found.', foundCount ? 'success' : 'info');
      logInvestigation({ type: 'Email', target: clean, risk: foundCount >= 3 ? 'medium' : 'low', summary: 'Email investigation completed', profilesFound: foundCount });
    } catch (err) {
      const message = err?.response?.data?.message || 'Investigation failed. Try again.';
      setError(message);
      push(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    await runSearch(email);
  }

  useIncomingQuery((incoming) => {
    setEmail(incoming);
    runSearch(incoming);
  });

  const grouped = useMemo(() => {
    const checks = result?.checks || [];
    const map = new Map();
    for (const category of ORDER) map.set(category, []);
    for (const item of checks) {
      const key = item.category && map.has(item.category) ? item.category : 'Other';
      map.get(key).push(item);
    }
    return map;
  }, [result]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text">Email Investigation</h1>
        <p className="text-text-muted text-sm mt-1">
          Search an email across Gravatar, GitHub, Have I Been Pwned, Hunter.io, EmailRep, GitLab, WordPress, and Stack Overflow. Public sources only — no private account access.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              icon={FiMail}
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              error={error}
            />
          </div>
          <Button type="submit" loading={loading} className="sm:w-auto">
            Investigate
          </Button>
        </form>
      </Card>

      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && !result && (
        <Card>
          <EmptyState
            icon={FiMail}
            title="No email investigated yet"
            description="Enter an email above to check public profiles and sources."
          />
        </Card>
      )}

      {!loading && result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <Card>
            <div className="flex items-start gap-4">
              {result.avatarUrl ? (
                <img src={result.avatarUrl} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <FiMail size={22} className="text-text-faint" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-text font-semibold text-sm truncate">{result.email}</h3>
                  <StatusChip tone={result.hasGravatar ? 'success' : 'neutral'}>
                    {result.hasGravatar ? 'Gravatar profile found' : 'No Gravatar profile'}
                  </StatusChip>
                </div>
                {result.profile?.displayName && <p className="text-text-muted text-sm mt-1">{result.profile.displayName}</p>}
                {result.profile?.aboutMe && <p className="text-text-faint text-xs mt-1 leading-relaxed">{result.profile.aboutMe}</p>}
                {result.profile?.location && (
                  <p className="text-text-faint text-xs mt-1 flex items-center gap-1">
                    <FiMapPin size={11} /> {result.profile.location}
                  </p>
                )}
              </div>
            </div>

            {result.profile?.accounts?.length > 0 && (
              <div className="border-t border-border mt-4 pt-4">
                <p className="text-xs font-semibold text-text-muted mb-2">Linked public accounts</p>
                <div className="flex flex-wrap gap-2">
                  {result.profile.accounts.map((acc, i) => (
                    <a
                      key={i}
                      href={acc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-white/[0.03] border border-border rounded-lg px-3 py-1.5 text-text-muted hover:text-accent hover:border-accent/30 transition-colors flex items-center gap-1.5"
                    >
                      {acc.name} <FiExternalLink size={10} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {ORDER.map((category) => {
              const items = grouped.get(category) || [];
              if (!items.length) return null;
              const Config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Other;
              const found = items.filter((c) => c.status === 'found').length;
              return (
                <Card key={category} className="sm:col-span-1 xl:col-span-1">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Config.icon size={16} className="text-text-muted" />
                      <h3 className="text-sm font-semibold text-text">{Config.label}</h3>
                    </div>
                    <StatusChip tone={Config.tone}>{found}/{items.length}</StatusChip>
                  </div>
                  <div className="space-y-3">
                    {items.map((item, idx) => <CheckCard key={`${item.source}-${idx}`} item={item} />)}
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="flex items-start gap-3">
            {result.domainAcceptsMail ? (
              <FiCheckCircle size={16} className="text-secondary flex-shrink-0 mt-0.5" />
            ) : result.domainAcceptsMail === false ? (
              <FiXCircle size={16} className="text-warning flex-shrink-0 mt-0.5" />
            ) : (
              <FiInfo size={16} className="text-text-faint flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm text-text font-medium">
                {result.domainAcceptsMail === true && `${result.domain} has valid mail servers configured`}
                {result.domainAcceptsMail === false && `${result.domain} has no MX records — mail may not be deliverable`}
                {result.domainAcceptsMail === null && 'Could not verify mail server configuration'}
              </p>
              <p className="text-xs text-text-muted mt-1">
                Based on a public DNS lookup of MX records for the sending domain.
              </p>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
