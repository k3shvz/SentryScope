import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FiLock, FiAlertTriangle } from 'react-icons/fi';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { push } = useToast();
  const navigate = useNavigate();

  function passwordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
  }

  const strength = passwordStrength(password);
  const matchError = confirm && password !== confirm ? 'Passwords do not match' : '';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      push('Password updated. Sign in with your new password.', 'success');
      navigate('/login');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Reset link is invalid or expired.';
      setError(msg);
      push(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Invalid reset link">
        <p className="text-text-muted text-sm">
          This password reset link is missing or malformed.{' '}
          <Link to="/forgot-password" className="text-accent hover:underline">
            Request a new one
          </Link>
          .
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong, unique password.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <Input
            label="New password"
            type="password"
            icon={FiLock}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            autoComplete="new-password"
            error={password.length > 0 && password.length < 8 ? 'Use at least 8 characters' : ''}
          />
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-colors"
                    style={{
                      background:
                        i < strength
                          ? ['#FF5D73', '#F59E0B', '#00E5FF', '#4ADE80'][strength - 1]
                          : '#1E293B',
                    }}
                  />
                ))}
              </div>
              <p className="text-[11px] text-text-faint">
                {strength === 1 && 'Weak'}
                {strength === 2 && 'Fair'}
                {strength === 3 && 'Good'}
                {strength === 4 && 'Strong'}
              </p>
            </div>
          )}
        </div>
        <Input
          label="Confirm new password"
          type="password"
          icon={FiLock}
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            setError('');
          }}
          error={matchError}
          autoComplete="new-password"
        />
        {(matchError || error) && (
          <div className="rounded-lg border border-danger/25 bg-danger/5 p-3 flex gap-2">
            <FiAlertTriangle size={15} className="text-danger flex-shrink-0 mt-0.5" />
            <p className="text-xs text-danger">{matchError || error}</p>
          </div>
        )}
        <Button type="submit" className="w-full" loading={loading}>
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}
