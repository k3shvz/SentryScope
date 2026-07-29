import { useState } from 'react';
import { FiMail, FiSend, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

export default function ContactPage() {
  const { push } = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/contact', { name: form.name.trim(), email: form.email.trim(), message: form.message.trim() });
      setSent(true);
      push('Message sent successfully.', 'success');
    } catch {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-base">
      <PublicNavbar />
      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
            <div className="max-w-3xl">
              <h1 className="text-3xl lg:text-4xl font-bold text-text mb-4">Contact us</h1>
              <p className="text-text-muted text-base leading-relaxed">
                Have a question about features, integrations, or partnerships? Reach out and we&apos;ll get back
                to you. For security disclosures, please use the dedicated channel below.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
            <div className="grid lg:grid-cols-2 gap-10">
              <div>
                <h2 className="text-xl font-bold text-text mb-2">Send a message</h2>
                <p className="text-text-muted text-sm leading-relaxed mb-6">
                  For general inquiries, feature requests, and partnership discussions.
                  We typically respond within 1–2 business days.
                </p>
                {sent ? (
                  <div className="rounded-xl border border-secondary/25 bg-secondary/5 p-5 flex gap-3">
                    <FiCheckCircle size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-text">Message sent</p>
                      <p className="text-sm text-text-muted">Thanks for reaching out. We&apos;ll get back to you shortly.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {error && (
                      <div className="rounded-lg border border-danger/25 bg-danger/5 p-3 flex gap-2">
                        <FiAlertTriangle size={14} className="text-danger flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-danger">{error}</p>
                      </div>
                    )}
                    <Input
                      label="Your name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Your name"
                    />
                    <Input
                      label="Email address"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="SentryScope@hi2.in"
                    />
                    <Input
                      label="Message"
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Tell us what you need..."
                    />
                    <Button type="submit" loading={loading} icon={FiSend}>Send message</Button>
                  </form>
                )}
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-text mb-3">Security disclosures</h3>
                  <p className="text-text-muted text-sm leading-relaxed mb-4">
                    Found a vulnerability in SentryScope? Please report it responsibly. We do not offer a bounty
                    program right now, but we will credit researchers and fix issues promptly.
                  </p>
                  <a href="mailto:SentryScope@hi2.in" className="text-sm text-accent hover:underline flex items-center gap-2">
                    <FiMail size={14} /> SentryScope@hi2.in
                  </a>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-text mb-3">Other channels</h3>
                  <div className="space-y-3 text-sm text-text-muted">
                    <p>GitHub Issues: bug reports and feature requests.</p>
                    <p>X / Twitter: @k3shvz for quick updates.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
