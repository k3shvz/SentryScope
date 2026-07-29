import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiSearch, FiBell, FiChevronDown, FiLogOut, FiUser, FiSettings, FiMail, FiGithub, FiMonitor, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { THEMES } from '../../utils/themes';

export default function Navbar({ onMenuClick, onSearchClick }) {
  const { user, logout } = useAuth();
  const { themeId, setThemeId } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const themeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (themeRef.current && !themeRef.current.contains(e.target)) setThemeOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const notifications = [
    { id: 1, text: 'Domain scan for acme-corp.com completed', time: '12m ago', unread: true },
    { id: 2, text: 'New password breach match found', time: '1h ago', unread: true },
    { id: 3, text: 'Weekly footprint report is ready', time: '1d ago', unread: false },
  ];

  return (
    <header className="h-16 border-b border-border bg-base/80 backdrop-blur-md sticky top-0 z-20 flex items-center gap-4 px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-text-muted hover:text-text p-1"
        aria-label="Open menu"
      >
        <FiMenu size={20} />
      </button>

      <div className="relative flex-1 max-w-md">
        <FiSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" />
        <input
          type="text"
          placeholder="Search investigations, reports, bookmarks..."
          onClick={onSearchClick}
          readOnly
          className="w-full bg-white/[0.03] border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text placeholder:text-text-faint outline-none focus:border-accent/40 transition-colors cursor-pointer"
        />
        <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-faint bg-white/5 border border-border rounded px-1.5 py-0.5">
          ⌘K
        </kbd>
      </div>

      <div className="flex-1" />

      <div className="relative" ref={themeRef}>
        <button
          onClick={() => setThemeOpen((o) => !o)}
          className="relative text-text-muted hover:text-text p-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"
          aria-label="Theme Settings"
        >
          <FiMonitor size={18} />
          <span className="hidden lg:inline text-sm font-medium">{THEMES[themeId]?.label || 'Theme'}</span>
        </button>
        <AnimatePresence>
          {themeOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-card overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-semibold text-text uppercase tracking-wider">Appearance</p>
              </div>
              <div className="p-1">
                {Object.values(THEMES).map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setThemeId(theme.id);
                      setThemeOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 text-text-muted group-hover:text-text">
                      <div className="w-3 h-3 rounded-full border border-border" style={{ background: theme.colors.accent.DEFAULT }} />
                      {theme.label}
                    </div>
                    {themeId === theme.id && <FiCheck size={14} className="text-accent" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen((o) => !o)}
          className="relative text-text-muted hover:text-text p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Notifications"
        >
          <FiBell size={18} />
          {notifications.some((n) => n.unread) && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
          )}
        </button>
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-card overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <p className="text-sm font-semibold text-text">Notifications</p>
                <span className="text-[11px] text-text-faint">
                  {notifications.filter((n) => n.unread).length} unread
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 border-b border-border last:border-0 hover:bg-white/[0.02]">
                    <div className="flex items-start gap-2">
                      {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />}
                      <div className={n.unread ? '' : 'ml-3.5'}>
                        <p className="text-xs text-text leading-snug">{n.text}</p>
                        <p className="text-[11px] text-text-faint mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setProfileOpen((o) => !o)}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
           <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-base font-semibold text-sm shadow-[0_0_12px_var(--theme-accent-glow)] ring-2 ring-white/10">
             {user?.email?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'U'}
           </div>
           <div className="hidden md:block text-left">
             <p className="text-sm text-text font-medium leading-tight">{user?.name || 'User'}</p>
             <p className="text-[11px] text-text-faint leading-tight">{user?.email || '—'}</p>
           </div>
           <FiChevronDown size={14} className="hidden sm:block text-text-faint" />
        </button>
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-card overflow-hidden"
            >
               <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-base font-semibold text-sm shadow-[0_0_14px_var(--theme-accent-glow)] ring-2 ring-white/10 flex-shrink-0">
                   {user?.email?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'U'}
                 </div>
                 <div className="min-w-0">
                   <p className="text-sm text-text font-medium leading-tight truncate">{user?.name || 'User'}</p>
                   <p className="text-[11px] text-text-faint flex items-center gap-1 truncate">
                     <FiMail size={10} className="flex-shrink-0" /> <span className="truncate">{user?.email || '—'}</span>
                   </p>
                 </div>
               </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/dashboard/profile');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-white/5"
                >
                  <FiUser size={15} /> Profile
                </button>
                <button
                  onClick={() => {
                    navigate('/dashboard/settings');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-white/5"
                >
                  <FiSettings size={15} /> Settings
                </button>
                <a
                  href="https://github.com/k3shvz"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-white/5"
                >
                  <FiGithub size={15} /> GitHub
                </a>
                <a
                  href="https://x.com/k3shvz"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-white/5"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true" className="flex-shrink-0">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X
                </a>
              </div>
              <div className="h-px bg-border my-1" />
              <div className="py-1">
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger/10"
                >
                  <FiLogOut size={15} /> Sign out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
