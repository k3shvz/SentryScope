import { useState, useMemo, useCallback } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { motion } from 'framer-motion';
import { FiShare2, FiUser } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useHistory } from '../../context/HistoryContext';
import api from '../../utils/api';

const STYLESHEET = [
  {
    selector: 'node',
    style: {
      'background-color': '#101827',
      'border-width': 2,
      'border-color': '#00E5FF',
      label: 'data(label)',
      color: '#F8FAFC',
      'font-size': 11,
      'text-valign': 'bottom',
      'text-margin-y': 8,
      width: 44,
      height: 44,
    },
  },
  {
    selector: 'node[type="center"]',
    style: { 'border-color': '#00E5FF', 'background-color': '#00E5FF20', width: 56, height: 56, 'font-weight': 'bold' },
  },
  {
    selector: 'node[type="platform"]',
    style: { 'border-color': '#4ADE80', 'background-color': '#4ADE8020' },
  },
  {
    selector: 'node[type="domain"]',
    style: { 'border-color': '#F59E0B', 'background-color': '#F59E0B20' },
  },
  {
    selector: 'edge',
    style: {
      width: 1.5,
      'line-color': '#1E293B',
      'target-arrow-color': '#1E293B',
      'curve-style': 'bezier',
      'target-arrow-shape': 'none',
    },
  },
];

function buildElements(username, results) {
  const elements = [{ data: { id: 'center', label: `@${username}`, type: 'center' } }];
  const domainsSeen = new Set();

  results
    .filter((r) => r.exists)
    .forEach((r) => {
      const platformId = `platform-${r.platform}`;
      elements.push({ data: { id: platformId, label: r.platform, type: 'platform' } });
      elements.push({ data: { id: `e-${platformId}`, source: 'center', target: platformId } });

      if (r.website) {
        try {
          const host = new URL(r.website.startsWith('http') ? r.website : `https://${r.website}`).hostname;
          if (!domainsSeen.has(host)) {
            domainsSeen.add(host);
            const domainId = `domain-${host}`;
            elements.push({ data: { id: domainId, label: host, type: 'domain' } });
            elements.push({ data: { id: `e-${domainId}`, source: platformId, target: domainId } });
          }
        } catch {
          // ignore unparsable URLs
        }
      }
    });

  return elements;
}

export default function RelationshipGraphPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const { push } = useToast();
  const { logInvestigation } = useHistory();

  const elements = useMemo(
    () => (graphData ? buildElements(graphData.username, graphData.results) : []),
    [graphData]
  );

  const layout = useMemo(
    () => ({ name: 'breadthfirst', directed: true, spacingFactor: 1.4, animate: true, animationDuration: 400 }),
    []
  );

  const handleCyRef = useCallback((cy) => {
    cy.on('mouseover', 'node', (e) => e.target.style('cursor', 'pointer'));
  }, []);

  async function handleBuild(e) {
    e.preventDefault();
    const clean = username.trim().replace(/^@/, '');
    if (!clean) return;
    setLoading(true);
    setGraphData(null);
    try {
      const { data } = await api.get('/username', { params: { username: clean } });
      setGraphData(data);
      const foundCount = data.results.filter((r) => r.exists).length;
      push(`Graph built with ${foundCount} connected nodes.`, 'success');
      logInvestigation({
        type: 'Relationship Graph',
        target: `@${clean}`,
        risk: foundCount >= 3 ? 'medium' : 'low',
        summary: `Mapped ${foundCount} public connections`,
      });
    } catch (err) {
      push(err?.response?.data?.message || 'Could not build the graph.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text">Relationship Graph</h1>
        <p className="text-text-muted text-sm mt-1">
          Enter a username to map its public connections — platforms it&apos;s found on, and any
          linked personal domains. Draggable and zoomable.
        </p>
      </div>

      <Card>
        <form onSubmit={handleBuild} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input icon={FiUser} placeholder="e.g. torvalds" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <Button type="submit" loading={loading} className="sm:w-auto">
            Build graph
          </Button>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        {!graphData ? (
          <div className="py-8">
            <EmptyState
              icon={FiShare2}
              title="No graph built yet"
              description="Enter a username above to visualize its public footprint as a connected graph."
            />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[480px]">
            <CytoscapeComponent
              elements={elements}
              stylesheet={STYLESHEET}
              layout={layout}
              cy={handleCyRef}
              style={{ width: '100%', height: '100%' }}
              minZoom={0.5}
              maxZoom={2.5}
            />
          </motion.div>
        )}
      </Card>

      {graphData && (
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent" /> Center identity
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary" /> Public platform
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning" /> Linked domain
          </span>
        </div>
      )}
    </div>
  );
}
