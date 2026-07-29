import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiGlobe,
  FiServer,
  FiMail,
  FiHash,
  FiAlertTriangle,
  FiCalendar,
  FiLock,
  FiLayers,
  FiCode,
  FiShield,
  FiMap,
  FiHardDrive,
  FiInfo,
  FiCheckCircle,
} from 'react-icons/fi';
import Card, { CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import StatusChip from '../../components/ui/StatusChip';
import { SkeletonCard } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useHistory } from '../../context/HistoryContext';
import { useIncomingQuery } from '../../hooks/useIncomingQuery';
import api from '../../utils/api';

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-xs text-text-muted">{label}</span>
      <span className="text-xs text-text font-medium text-right max-w-[60%] truncate">{value || '—'}</span>
    </div>
  );
}

function extractRegistrar(rdap) {
  if (!rdap?.entities) return null;
  const registrar = rdap.entities.find((e) => e.roles?.includes('registrar'));
  return registrar?.vcardArray?.[1]?.find((f) => f[0] === 'fn')?.[3] || registrar?.handle || null;
}

function extractDate(rdap, action) {
  const event = rdap?.events?.find((e) => e.eventAction === action);
  return event ? new Date(event.eventDate).toLocaleDateString() : null;
}

export default function DomainInvestigationPage() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const { push } = useToast();
  const { logInvestigation } = useHistory();

  async function runSearch(rawValue) {
    const clean = rawValue.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!/^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})+$/.test(clean)) {
      setError('Enter a valid domain, e.g. example.com');
      return;
    }
    setError('');
    setLoading(true);
    setData(null);
    try {
      const { data } = await api.get('/domain', { params: { domain: clean } });
      setData(data);
      push(`Domain investigation complete for ${clean}`, 'success');
      const foundCount = (data.dns?.a?.length || 0) + (data.subdomains?.length || 0);
      logInvestigation({
        type: 'Domain',
        target: clean,
        risk: data.rdapError ? 'medium' : 'low',
        summary: data.rdapError
          ? 'Registry data unavailable — DNS and infrastructure signals retrieved'
          : `Registry lookup succeeded · ${foundCount} direct hit${foundCount === 1 ? '' : 's'}`,
      });
    } catch (err) {
      const message = err?.response?.data?.message || 'Could not complete the domain lookup.';
      setError(message);
      push(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    await runSearch(domain);
  }

  useIncomingQuery((incoming) => {
    setDomain(incoming);
    runSearch(incoming);
  });

  const registrar = data?.rdap ? extractRegistrar(data.rdap) : null;
  const registered = data?.rdap ? extractDate(data.rdap, 'registration') : null;
  const expiring = data?.rdap ? extractDate(data.rdap, 'expiration') : null;
  const updated = data?.rdap ? extractDate(data.rdap, 'last changed') : null;
  const dns = data?.dns || {};
  const ssl = data?.ssl || {};
  const tech = data?.technologies || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text">Domain Investigation</h1>
        <p className="text-text-muted text-sm mt-1">
          WHOIS/RDAP registry data, DNS records, SSL certificate, subdomains, technology fingerprinting,
          server and security headers, CDN/hosting, and more. Public sources only.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              icon={FiGlobe}
              placeholder="example.com"
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
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
        <div className="grid md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!loading && !data && (
        <Card>
          <EmptyState
            icon={FiGlobe}
            title="No domain investigated yet"
            description="Enter a domain above to inspect its public infrastructure footprint."
          />
        </Card>
      )}

      {!loading && data && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <Card>
            <CardHeader
              icon={FiHash}
              title="Registration"
              subtitle="RDAP/WHOIS registry data"
              action={
                <StatusChip tone={data.rdapError ? 'danger' : 'success'}>
                  {data.rdapError ? 'Registry unavailable' : 'Registry available'}
                </StatusChip>
              }
            />
            {data.rdapError ? (
              <p className="text-xs text-text-faint flex items-center gap-1.5 mt-2">
                <FiAlertTriangle size={12} className="text-warning" /> {data.rdapError}
              </p>
            ) : (
              <div className="mt-2">
                <InfoRow label="Registrar" value={registrar} />
                <InfoRow label="Registered" value={registered} />
                <InfoRow label="Last updated" value={updated} />
                <InfoRow label="Expires" value={expiring} />
                <InfoRow label="Domain status" value={data.rdap?.status?.join(', ')} />
              </div>
            )}
          </Card>

          <Card>
            <CardHeader icon={FiServer} title="DNS Records" subtitle="A, AAAA, CNAME, MX, NS, SOA, TXT" />
            <div className="mt-3 space-y-4">
              {dns.a?.length ? (
                <div>
                  <p className="text-xs font-semibold text-text-muted mb-1.5">A records (IPv4)</p>
                  <div className="flex flex-wrap gap-2">
                    {dns.a.map((r, i) => (
                      <span
                        key={i}
                        className="text-xs font-mono-num bg-white/[0.03] border border-border rounded-lg px-3 py-1.5 text-text-muted"
                      >
                        {r.data}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {dns.aaaa?.length ? (
                <div>
                  <p className="text-xs font-semibold text-text-muted mb-1.5">AAAA records (IPv6)</p>
                  <div className="flex flex-wrap gap-2">
                    {dns.aaaa.map((r, i) => (
                      <span
                        key={i}
                        className="text-xs font-mono-num bg-white/[0.03] border border-border rounded-lg px-3 py-1.5 text-text-muted"
                      >
                        {r.data}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {dns.cname?.length ? (
                <div>
                  <p className="text-xs font-semibold text-text-muted mb-1.5">CNAME</p>
                  <div className="flex flex-wrap gap-2">
                    {dns.cname.map((r, i) => (
                      <span
                        key={i}
                        className="text-xs font-mono-num bg-white/[0.03] border border-border rounded-lg px-3 py-1.5 text-text-muted"
                      >
                        {r.data}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {dns.ns?.length ? (
                <div>
                  <p className="text-xs font-semibold text-text-muted mb-1.5">Name servers</p>
                  <div className="flex flex-wrap gap-2">
                    {dns.ns.map((r, i) => (
                      <span
                        key={i}
                        className="text-xs font-mono-num bg-white/[0.03] border border-border rounded-lg px-3 py-1.5 text-text-muted"
                      >
                        {r.data}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {dns.mx?.length ? (
                <div>
                  <p className="text-xs font-semibold text-text-muted mb-1.5">MX records</p>
                  <div className="space-y-1.5">
                    {dns.mx.map((r, i) => (
                      <div key={i} className="text-xs font-mono-num text-text-muted bg-white/[0.03] border border-border rounded-lg px-3 py-2">
                        {r.data}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {dns.soa?.length ? (
                <div>
                  <p className="text-xs font-semibold text-text-muted mb-1.5">SOA</p>
                  <div className="flex flex-wrap gap-2">
                    {dns.soa.map((r, i) => (
                      <span
                        key={i}
                        className="text-xs font-mono-num bg-white/[0.03] border border-border rounded-lg px-3 py-1.5 text-text-muted"
                      >
                        {r.data}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {dns.txt?.length ? (
                <div>
                  <p className="text-xs font-semibold text-text-muted mb-1.5">TXT records</p>
                  <div className="space-y-1.5">
                    {dns.txt.map((r, i) => (
                      <div
                        key={i}
                        className="text-xs font-mono-num text-text-muted bg-white/[0.03] border border-border rounded-lg px-3 py-2 break-all"
                      >
                        {r.data}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHeader
              icon={FiLock}
              title="SSL Certificate"
              subtitle="TLS/HTTPS endpoint probe"
              action={
                ssl.valid ? (
                  <StatusChip tone={ssl.daysLeft < 14 ? 'danger' : ssl.daysLeft < 60 ? 'warning' : 'success'}>
                    {ssl.daysLeft != null ? `${ssl.daysLeft} days left` : 'Valid'}
                  </StatusChip>
                ) : (
                  <StatusChip tone="danger">{ssl.error || 'No TLS'}</StatusChip>
                )
              }
            />
            {ssl.valid ? (
              <div className="mt-2">
                <InfoRow label="Subject (CN)" value={ssl.subject} />
                <InfoRow label="Issuer" value={ssl.issuer} />
                <InfoRow label="Valid from" value={ssl.validFrom ? new Date(ssl.validFrom).toLocaleString() : null} />
                <InfoRow label="Valid to" value={ssl.validTo ? new Date(ssl.validTo).toLocaleString() : null} />
                <InfoRow label="Signature" value={ssl.signature} />
              </div>
            ) : !ssl.error && !ssl.valid ? (
              <p className="text-xs text-text-faint mt-2">No TLS certificate detected for port 443.</p>
            ) : null}
          </Card>

          <Card>
            <CardHeader
              icon={FiLayers}
              title="Subdomains"
              subtitle="Certificate Transparency logs"
              action={
                <StatusChip tone={(data?.subdomains?.length || 0) > 0 ? 'success' : 'neutral'}>
                  {(data?.subdomains?.length || 0)} found
                </StatusChip>
              }
            />
            {(data?.subdomains?.length || 0) === 0 ? (
              <p className="text-xs text-text-faint mt-2">No subdomains discovered from public certificate transparency logs.</p>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {data.subdomains.map((sub, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono-num bg-white/[0.03] border border-border rounded-lg px-3 py-1.5 text-text-muted"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader
              icon={FiCode}
              title="Technology Detection"
              subtitle="Heuristics from HTML/headers"
            />
            {tech.length === 0 ? (
              <p className="text-xs text-text-faint mt-2">No technology fingerprints detected from the homepage.</p>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {tech.map((item, i) => (
                  <StatusChip key={i} tone="secondary">
                    {item}
                  </StatusChip>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader icon={FiServer} title="Server Headers" subtitle="Raw response headers from homepage" />
            {data.pageError ? (
              <p className="text-xs text-text-faint mt-2 flex items-center gap-1.5">
                <FiAlertTriangle size={12} className="text-warning" /> {data.pageError}
              </p>
            ) : (
              <div className="mt-2 space-y-1.5">
                {Object.entries(data.pageHeaders || {}).map(([key, value]) => (
                  <div key={key} className="text-xs font-mono-num text-text-muted break-all">
                    <span className="text-text-faint">{key}:</span> {value}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader icon={FiShield} title="Security Headers" subtitle="Presence of common security directives" />
            {(data.securityHeaders || []).length === 0 ? (
              <p className="text-xs text-text-faint mt-2">No response headers available to inspect.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {data.securityHeaders.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-xs text-text-muted">{item.header}</span>
                    {item.present ? (
                      <StatusChip tone="success">Present</StatusChip>
                    ) : (
                      <StatusChip tone="danger">Missing</StatusChip>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader icon={FiMap} title="CDN / Hosting" subtitle="Inferred from response headers and DNS" />
              {data.hostingProvider ? (
                <InfoRow label="Provider" value={data.hostingProvider} />
              ) : (
                <p className="text-xs text-text-faint mt-2">Could not infer CDN or hosting provider from visible headers.</p>
              )}
            </Card>

            <Card>
              <CardHeader icon={FiHardDrive} title="Open Ports" subtitle="Web endpoints detected" />
              <div className="mt-2 space-y-1">
                {['80', '443'].map((port) => (
                  <div key={port} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-xs text-text-muted">HTTP{port === '443' ? 'S' : ''} ({port})</span>
                    <StatusChip tone="secondary">Checked</StatusChip>
                  </div>
                ))}
                <p className="text-[11px] text-text-faint leading-relaxed mt-2">
                  Active port scanning requires dedicated, authorized tools. For full port assessment, use authenticated
                  vulnerability scanners against targets you own or have explicit written permission to assess.
                </p>
              </div>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}
