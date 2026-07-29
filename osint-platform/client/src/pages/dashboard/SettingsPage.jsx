import { useState } from 'react';
import { FiUser, FiShield } from 'react-icons/fi';
import Card, { CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import StatusChip from '../../components/ui/StatusChip';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { THEMES } from '../../utils/themes';

const THEME_ICONS = {
  cyber: '🌐',
  midnight: '🌙',
  obsidian: '🖤',
  forest: '🌿',
  light: '☀️',
};

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { themeId, setThemeId, currentTheme } = useTheme();
  const { push } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    push('Settings saved successfully.', 'success');
  }

  function handleThemeChange(id) {
    setThemeId(id);
    push(`Theme changed to ${THEMES[id]?.label || id}`, 'success');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text">Settings</h1>
        <p className="text-text-muted text-sm mt-1">
          Manage your account preferences and interface theme.
        </p>
      </div>

      <Card>
        <CardHeader icon={FiUser} title="Profile" subtitle="Your public profile information" />
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="SentryScope@hi2.in"
          />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text">Email notifications</p>
              <p className="text-xs text-text-faint">Receive alerts for new investigations</p>
            </div>
            <button
              type="button"
              onClick={() => setNotifications((s) => !s)}
              className={clsx(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                notifications ? 'bg-accent' : 'bg-border'
              )}
            >
              <span
                className={clsx(
                  'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                  notifications ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="submit" loading={saving}>Save changes</Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 text-base">
            {THEME_ICONS[currentTheme?.id] || '🎨'}
          </div>
          <div>
            <h3 className="text-text font-semibold text-[15px] leading-tight">Theme</h3>
            <p className="text-text-muted text-xs mt-0.5">Current theme: {currentTheme?.label || themeId}</p>
          </div>
        </div>
        <p className="text-xs text-text-faint mb-4">{currentTheme?.description || ''}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.values(THEMES).map((theme) => {
            const isActive = themeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={clsx(
                  'rounded-xl border p-3 text-left transition-all duration-200',
                  isActive
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-accent/30 hover:bg-white/[0.01]'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ background: theme.colors.accent.DEFAULT }}
                  />
                  <span className="text-sm font-medium text-text">{theme.label}</span>
                </div>
                <p className="text-[11px] text-text-faint leading-relaxed line-clamp-2">
                  {theme.description}
                </p>
                {isActive && (
                  <div className="mt-2">
                    <StatusChip tone="success" dot>Active</StatusChip>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader icon={FiShield} title="Security" subtitle="Account security options" />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text">Session</p>
              <p className="text-xs text-text-faint">Sign out of all active sessions</p>
            </div>
            <Button variant="danger" size="sm" onClick={logout}>Sign out</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
