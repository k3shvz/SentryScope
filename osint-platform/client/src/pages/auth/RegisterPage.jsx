import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH_LABELS = ['Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['#FF5D73', '#F59E0B', '#00E5FF', '#4ADE80'];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', agree: false });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const strength = passwordStrength(form.password);

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email';
    if (form.password.length < 8) next.password = 'Use at least 8 characters';
    if (!form.agree) next.agree = 'You must accept the responsible-use policy';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      push('Account created. Check your email to verify.', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not create account.';
      setServerError(msg);
      push(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start mapping your public footprint in minutes.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Full name"
          icon={FiUser}
          placeholder="Jordan Rivera"
          value={form.name}
          error={errors.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          autoComplete="name"
        />
        <Input
          label="Email address"
          type="email"
          icon={FiMail}
           placeholder="SentryScope@hi2.in"
          value={form.email}
          error={errors.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          autoComplete="email"
        />
        <div>
          <Input
            label="Password"
            type="password"
            icon={FiLock}
            placeholder="At least 8 characters"
            value={form.password}
            error={errors.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="new-password"
          />
          {form.password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-colors"
                    style={{ background: i < strength ? STRENGTH_COLORS[strength - 1] : '#1E293B' }}
                  />
                ))}
              </div>
              <p className="text-[11px] text-text-faint">
                {strength > 0 ? STRENGTH_LABELS[strength - 1] : 'Too short'}
              </p>
            </div>
          )}
        </div>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.agree}
            onChange={(e) => setForm({ ...form, agree: e.target.checked })}
            className="mt-0.5 w-4 h-4 rounded border-border bg-white/5 accent-[#00E5FF]"
          />
          <span className="text-xs text-text-muted leading-relaxed">
            I will only investigate identifiers, domains, and accounts I own or am explicitly
            authorized to assess, per the{' '}
            <a href="#" className="text-accent hover:underline">responsible use policy</a>.
          </span>
        </label>
        {errors.agree && <p className="text-danger text-xs -mt-2">{errors.agree}</p>}
        {serverError && <p className="text-danger text-xs">{serverError}</p>}
        <Button type="submit" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>
      <p className="text-center text-sm text-text-muted mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-accent hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
