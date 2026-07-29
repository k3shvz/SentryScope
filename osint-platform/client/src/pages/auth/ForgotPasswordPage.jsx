import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiCheckCircle } from 'react-icons/fi';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../utils/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Check your inbox">
        <div className="rounded-xl border border-secondary/25 bg-secondary/5 p-5 flex gap-3">
          <FiCheckCircle size={18} className="text-secondary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-text-muted leading-relaxed">
            If an account exists for <strong className="text-text">{email}</strong>, we&apos;ve
            sent a link to reset your password. It expires in 30 minutes.
          </p>
        </div>
        <Link to="/login" className="block text-center text-sm text-accent hover:underline mt-6">
          Back to sign in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter the email tied to your account and we'll send a reset link."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          icon={FiMail}
          placeholder="SentryScope@hi2.in"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          error={error}
          autoComplete="email"
        />
        {error && (
          <p className="text-danger text-xs">{error}</p>
        )}
        <Button type="submit" className="w-full" loading={loading}>
          Send reset link
        </Button>
      </form>
      <p className="text-center text-sm text-text-muted mt-6">
        Remembered it?{' '}
        <Link to="/login" className="text-accent hover:underline font-medium">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
