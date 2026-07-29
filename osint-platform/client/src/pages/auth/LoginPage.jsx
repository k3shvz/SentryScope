import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock } from 'react-icons/fi';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  function validate() {
    const next = {};
    if (!form.email) next.email = 'Email is required';
    if (!form.password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      push('Welcome back.', 'success');
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      push(err?.response?.data?.message || 'Invalid email or password.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back. Enter your details to continue.">
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-4" 
        noValidate
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
        }}
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
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
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
          <Input
            label="Password"
            type="password"
            icon={FiLock}
            placeholder="••••••••"
            value={form.password}
            error={errors.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-accent hover:underline">
            Forgot password?
          </Link>
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1 } }}>
          <Button type="submit" className="w-full shadow-glow-strong hover:shadow-glow transition-shadow" loading={loading}>
            Sign in
          </Button>
        </motion.div>
      </motion.form>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-sm text-text-muted mt-6"
      >
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-accent hover:underline font-medium">
          Create one
        </Link>
      </motion.p>
    </AuthLayout>
  );
}
