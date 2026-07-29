import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiGlobe, FiServer, FiLayers } from 'react-icons/fi';
import Card, { CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import StatusChip from '../../components/ui/StatusChip';
import { SkeletonCard } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useHistory } from '../../context/HistoryContext';
import { useIncomingQuery } from '../../hooks/useIncomingQuery';
import { detectTechnologies } from '../../utils/techDetection';
import api from '../../utils/api';

const TYPE_TONES = {
  Frontend: 'info',
  'CSS Framework': 'info',
  CMS: 'success',
  Backend: 'warning',
  'CDN/Hosting': 'neutral',
  'Web Server': 'neutral',
  Analytics: 'neutral',
};

export default function TechDetectionPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const { push } = useToast();
  const { logInvestigation } = useHistory();

  async function runScan(rawValue) {
    const clean = rawValue.trim();
    if (!clean) return;
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.get('/tech', { params: { url: clean } });
      const technologies = detectTechnologies(data.html, data.headers);
      setResult({ ...data, technologies });
      push(`Found ${technologies.length} technologies.`, 'success');
      logInvestigation({
        type: 'Tech',
        target: clean,
        risk: 'low',
        summary: `${technologies.length} technologies detected: ${technologies.slice(0, 3).map((t) => t.name).join(', ')}${technologies.length > 3 ? '…' : ''}`,
      });
    } catch (err) {
      const message = err?.response?.data?.message || 'Could not reach that site.';
      setError(message);
      push(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleScan(e) {
    e.preventDefault();
    await runScan(url);
  }

  useIncomingQuery((incoming) => {
    setUrl(incoming);
    runScan(incoming);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text">Website Technology Detection</h1>
        <p className="text-text-muted text-sm mt-1">
          Fetches a site&apos;s public HTML and response headers, then matches known framework,
          CMS, and hosting signatures.
        </p>
      </div>

      <Card>
        <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              icon={FiGlobe}
              placeholder="example.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              error={error}
            />
          </div>
          <Button type="submit" loading={loading} className="sm:w-auto">
            Detect
          </Button>
        </form>
      </Card>

      {loading && (
        <div className="grid sm:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!loading && !result && (
        <Card>
          <EmptyState
            icon={FiCpu}
            title="No site scanned yet"
            description="Enter a URL above to detect the frameworks and infrastructure behind it."
          />
        </Card>
      )}

      {!loading && result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card>
            <CardHeader
              icon={FiLayers}
              title="Detected technologies"
              subtitle={`${result.technologies.length} signatures matched · HTTP ${result.status}`}
            />
            {result.technologies.length === 0 ? (
              <p className="text-xs text-text-faint">
                No known signatures matched. The site may use custom tooling, or serve minimal
                markup before JavaScript renders.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {result.technologies.map((t) => (
                  <StatusChip key={t.name} tone={TYPE_TONES[t.type] || 'neutral'}>
                    {t.name} · {t.type}
                  </StatusChip>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader icon={FiServer} title="Response headers" subtitle="Public HTTP headers returned by the server" />
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {Object.entries(result.headers).map(([key, value]) => (
                <div key={key} className="flex text-xs font-mono-num gap-2 py-1 border-b border-border last:border-0">
                  <span className="text-text-muted flex-shrink-0">{key}:</span>
                  <span className="text-text truncate">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
