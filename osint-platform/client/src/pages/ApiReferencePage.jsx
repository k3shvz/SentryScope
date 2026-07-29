import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/v1/search/username',
    description: 'Search for a username across configured platforms. Supports pagination and platform filtering.',
  },
  {
    method: 'GET',
    path: '/v1/search/domain',
    description: 'Retrieve registrar records, subdomains, and MX entries for a domain using public sources.',
  },
  {
    method: 'GET',
    path: '/v1/search/email',
    description: 'Discover publicly exposed email addresses tied to a domain or username without sending mail.',
  },
  {
    method: 'GET',
    path: '/v1/metadata/image',
    description: 'Return EXIF, creation tool, and geolocation hints for a public image URL.',
  },
  {
    method: 'POST',
    path: '/v1/scan',
    description: 'Start an async investigation scan. Returns a job ID for polling results.',
  },
];

export default function ApiReferencePage() {
  return (
    <div className="min-h-screen bg-base">
      <PublicNavbar />
      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
            <div className="max-w-3xl">
              <h1 className="text-3xl lg:text-4xl font-bold text-text mb-4">API reference</h1>
              <p className="text-text-muted text-base leading-relaxed">
                Integrate SentryScope into your existing toolchain with a versioned, rate-limited REST API.
                Every endpoint returns public-source attribution and supports standard auth via bearer tokens.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <h2 className="text-sm font-semibold text-text mb-2">Authentication</h2>
                  <p className="text-text-muted text-sm leading-relaxed">
                    Include your API key in the Authorization header. Keys are scoped to a team and can be
                    rotated from the dashboard without downtime.
                  </p>
                  <div className="mt-4 rounded-lg bg-base border border-border p-3">
                    <code className="text-xs text-accent font-mono">Authorization: Bearer ss_...</code>
                  </div>
                </Card>
                <Card>
                  <h2 className="text-sm font-semibold text-text mb-2">Rate limits</h2>
                  <p className="text-text-muted text-sm leading-relaxed">
                    Standard tier allows 60 requests per minute. Enterprise tiers support higher throughput
                    and dedicated gateway routing.
                  </p>
                </Card>
                <Card>
                  <h2 className="text-sm font-semibold text-text mb-2">Errors</h2>
                  <p className="text-text-muted text-sm leading-relaxed">
                    Errors use standard HTTP codes. The response body includes a machine-readable code,
                    a human-readable message, and a request ID for support.
                  </p>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-text mb-6">Endpoints</h2>
                <div className="space-y-3">
                  {ENDPOINTS.map((endpoint) => (
                    <Card key={endpoint.path} hoverable>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${endpoint.method === 'GET' ? 'bg-accent/10 text-accent' : 'bg-secondary/10 text-secondary'}`}>{endpoint.method}</span>
                          <code className="text-xs text-text font-mono">{endpoint.path}</code>
                        </div>
                        <p className="text-text-muted text-sm leading-relaxed">{endpoint.description}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
            <h2 className="text-xl font-bold text-text mb-3">SDKs and examples</h2>
            <p className="text-text-muted text-sm leading-relaxed max-w-2xl mb-6">
              Official examples are available for Python, Go, and curl. Community libraries for TypeScript
              and Rust are maintained under permissive licenses.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary">Python</Button>
              <Button variant="secondary">Go</Button>
              <Button variant="secondary">cURL</Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
