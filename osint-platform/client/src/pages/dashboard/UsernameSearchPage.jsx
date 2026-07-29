import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiExternalLink, FiCheckCircle, FiXCircle, FiUsers, FiCalendar } from 'react-icons/fi';
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

const CATEGORY_ICONS = {
  Developer: '💻',
  Competitive: '🧠',
  Social: '👤',
  Media: '🎬',
  Messaging: '📨',
  Gaming: '🎮',
  Security: '🔐',
};

const CATEGORY_ORDER = [
  'Developer',
  'Security',
  'Social',
  'Media',
  'Messaging',
  'Gaming',
  'Competitive',
];

function Section({ title, icon, children }) {
  return (
    <div className="rounded-xl border border-border/60 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-3">
        <span aria-hidden="true" className="text-base leading-none">
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-text">{title}</h3>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </div>
  );
}

function PlatformCard({ result }) {
  return (
    <Card hoverable className={!result.exists ? 'opacity-60' : ''}>
      <div className="flex items-start gap-3">
        {result.avatar ? (
          <img src={result.avatar} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
            <FiUser size={16} className="text-text-faint" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-text font-semibold text-sm truncate">{result.platform}</h3>
            {result.exists ? (
              <FiCheckCircle size={15} className="text-secondary flex-shrink-0" />
            ) : (
              <FiXCircle size={15} className="text-text-faint flex-shrink-0" />
            )}
          </div>
          {result.exists ? (
            <>
              {result.name && <p className="text-xs text-text-muted mt-0.5 truncate">{result.name}</p>}
              {result.bio && <p className="text-xs text-text-faint mt-1 line-clamp-2">{result.bio}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                {typeof result.followers === 'number' && (
                  <span className="text-[11px] text-text-faint flex items-center gap-1">
                    <FiUsers size={10} /> {result.followers} followers
                  </span>
                )}
                {typeof result.publicRepos === 'number' && (
                  <span className="text-[11px] text-text-faint">{result.publicRepos} repos</span>
                )}
                {typeof result.karma === 'number' && (
                  <span className="text-[11px] text-text-faint">{result.karma} karma</span>
                )}
                {typeof result.reputation === 'number' && (
                  <span className="text-[11px] text-text-faint">{result.reputation.toLocaleString()} rep</span>
                )}
                {typeof result.packageCount === 'number' && (
                  <span className="text-[11px] text-text-faint">{result.packageCount} packages</span>
                )}
                {result.joined && (
                  <span className="text-[11px] text-text-faint flex items-center gap-1">
                    <FiCalendar size={10} /> {new Date(result.joined).toLocaleDateString()}
                  </span>
                )}
              </div>
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline mt-2"
              >
                View profile <FiExternalLink size={10} />
              </a>
            </>
          ) : (
            <p className="text-xs text-text-faint mt-1">No public profile found</p>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function UsernameSearchPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const { push } = useToast();
  const { logInvestigation } = useHistory();

  async function runSearch(rawValue) {
    const clean = rawValue.trim().replace(/^@/, '');
    if (!clean) return;
    setError('');
    setLoading(true);
    setResults(null);
    try {
      const { data } = await api.get('/username', { params: { username: clean } });
      setResults(data.results);
      const foundCount = data.results.filter((r) => r.exists).length;
      push(`Found ${foundCount} public profile${foundCount === 1 ? '' : 's'}.`, 'success');
      logInvestigation({
        type: 'Username',
        target: `@${clean}`,
        risk: foundCount >= 3 ? 'medium' : 'low',
        summary: `${foundCount} public profiles found across ${data.results.length} platforms checked`,
      });
    } catch (err) {
      const status = err?.response?.status;
      const message = status === 401
        ? 'Session expired or unauthorized. Please log in again.'
        : err?.response?.data?.message || 'Search failed. Try again.';
      setError(message);
      push(message, status === 401 ? 'warning' : 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    await runSearch(username);
  }

  useIncomingQuery((incoming) => {
    setUsername(incoming);
    runSearch(incoming);
  });

  const trimmed = results || [];
  const categories = CATEGORY_ORDER.filter((c) => trimmed.some((r) => r.category === c));
  const otherCategory = trimmed.some((r) => !r.category || r.category === 'Other');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text">Username Search</h1>
        <p className="text-text-muted text-sm mt-1">
          Checks a handle across public platforms and groups results by category, including Social Media and Security platforms.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              icon={FiUser}
              placeholder="e.g. torvalds"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              error={error}
            />
          </div>
          <Button type="submit" loading={loading} className="sm:w-auto">
            Search
          </Button>
        </form>
      </Card>

      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(18)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && !results && (
        <Card>
          <EmptyState
            icon={FiUser}
            title="No username searched yet"
            description="Enter a handle above to check its presence across public platforms."
          />
        </Card>
      )}

      {!loading && results && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {results.length === 0 && (
            <Card>
              <EmptyState
                icon={FiUser}
                title="No results returned"
                description="We couldn’t retrieve results for this username. Check the handle and try again."
              />
            </Card>
          )}

          {results.length > 0 && (() => {
            const found = trimmed.filter((r) => r.exists);
            if (!found.length) return null;
            return (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-text">Public profiles found</h3>
                  <StatusChip tone="success">{found.length}</StatusChip>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {found.map((r) => (
                    <PlatformCard key={r.platform} result={r} />
                  ))}
                </div>
              </div>
            );
          })()}

          {results.length > 0 && otherCategory && (
            <Section title="Other" icon="🔎">
              {trimmed
                .filter((r) => !r.category || r.category === 'Other')
                .map((r) => (
                  <PlatformCard key={r.platform} result={r} />
                ))}
            </Section>
          )}

          {results.length > 0 &&
            categories.map((category) => {
              const items = trimmed.filter((r) => r.category === category);
              return (
                <Section key={category} title={category} icon={CATEGORY_ICONS[category] || '📁'}>
                  {items.map((r) => (
                    <PlatformCard key={r.platform} result={r} />
                  ))}
                </Section>
              );
            })}
        </motion.div>
      )}
    </div>
  );
}
