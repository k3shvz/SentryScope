import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiShield, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import Card, { CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import StatusChip from '../../components/ui/StatusChip';
import PasswordMeter from '../../components/ui/PasswordMeter';
import { useToast } from '../../context/ToastContext';
import { useHistory } from '../../context/HistoryContext';
import {
  scorePassword,
  calculateEntropy,
  estimateCrackTime,
  passwordRecommendations,
  checkPasswordExposure,
} from '../../utils/passwordAnalysis';

export default function PasswordCheckerPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const { push } = useToast();
  const { logInvestigation } = useHistory();

  const score = scorePassword(password);
  const entropy = calculateEntropy(password);

  async function handleCheck(e) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const exposure = await checkPasswordExposure(password);
      setResult(exposure);
      if (exposure.breached) {
        push(`Found in ${exposure.count.toLocaleString()} known breaches.`, 'warning');
      } else {
        push('No exposure found in known breach data.', 'success');
      }
      logInvestigation({
        type: 'Password',
        target: '•'.repeat(Math.min(password.length, 12)),
        risk: exposure.breached ? 'high' : 'low',
        summary: exposure.breached
          ? `Found in ${exposure.count.toLocaleString()} known breaches`
          : 'No exposure found in known breach data',
      });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-text">Password Exposure Checker</h1>
        <p className="text-text-muted text-sm mt-1">
          Checks against known breach data using k-anonymity — only a truncated hash prefix
          is ever sent over the network.
        </p>
      </div>

      <Card className="flex items-start gap-3 bg-accent/5 border-accent/20">
        <FiInfo size={16} className="text-accent flex-shrink-0 mt-0.5" />
        <p className="text-xs text-text-muted leading-relaxed">
          Your full password is hashed locally in your browser using SHA-1. Only the first 5
          characters of that hash are sent to the breach-database API — the same k-anonymity
          model used by Have I Been Pwned. Your actual password never leaves this device.
        </p>
      </Card>

      <Card>
        <CardHeader icon={FiLock} title="Check a password" subtitle="Analyze strength and breach exposure" />
        <form onSubmit={handleCheck} className="space-y-4">
          <Input
            label="Password"
            type="password"
            icon={FiLock}
            placeholder="Enter a password to analyze"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setResult(null);
              setError('');
            }}
            autoComplete="off"
          />
          {password && <PasswordMeter score={score} />}
          <Button type="submit" loading={loading} disabled={!password}>
            Check exposure
          </Button>
          {error && (
            <p className="text-danger text-xs flex items-center gap-1.5">
              <FiAlertTriangle size={12} /> {error}
            </p>
          )}
        </form>
      </Card>

      {password && (
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <p className="text-text-muted text-xs mb-1">Entropy</p>
            <p className="text-xl font-bold text-text font-mono-num">{entropy} bits</p>
          </Card>
          <Card>
            <p className="text-text-muted text-xs mb-1">Est. crack time</p>
            <p className="text-xl font-bold text-text font-mono-num">{estimateCrackTime(entropy)}</p>
          </Card>
          <Card>
            <p className="text-text-muted text-xs mb-1">Exposure status</p>
            {result ? (
              <StatusChip tone={result.breached ? 'danger' : 'success'}>
                {result.breached ? 'Exposed' : 'Not found'}
              </StatusChip>
            ) : (
              <StatusChip tone="neutral">Not checked</StatusChip>
            )}
          </Card>
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={result.breached ? 'border-danger/30' : 'border-secondary/30'}>
            <div className="flex items-start gap-3 mb-4">
              {result.breached ? (
                <FiAlertTriangle size={20} className="text-danger flex-shrink-0" />
              ) : (
                <FiCheckCircle size={20} className="text-secondary flex-shrink-0" />
              )}
              <div>
                <h3 className="text-text font-semibold text-sm">
                  {result.breached
                    ? `Found in ${result.count.toLocaleString()} breaches`
                    : 'No exposure found'}
                </h3>
                <p className="text-text-muted text-xs mt-1 leading-relaxed">
                  {result.breached
                    ? 'This exact password has appeared in known public breach data. Anyone with access to those datasets could try it against your accounts.'
                    : "This password wasn't found in the checked breach corpora. That doesn't guarantee it's strong — just that it hasn't leaked yet."}
                </p>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-text-muted mb-2 flex items-center gap-1.5">
                <FiShield size={12} /> Recommendations
              </p>
              <ul className="space-y-1.5">
                {passwordRecommendations(password).map((rec) => (
                  <li key={rec} className="text-xs text-text-muted flex items-start gap-2">
                    <span className="text-accent mt-1">•</span> {rec}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
