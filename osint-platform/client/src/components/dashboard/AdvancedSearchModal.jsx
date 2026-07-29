import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiGlobe, FiUser, FiMail } from 'react-icons/fi';

const TABS = [
  { key: 'username', label: 'Username', icon: FiUser, hint: 'Search across social platforms and forums', validation: 'Min. 2 characters, alphanumeric' },
  { key: 'email', label: 'Email', icon: FiMail, hint: 'Check breaches, domains, and associated profiles', validation: 'Must be a valid email format' },
  { key: 'domain', label: 'Domain', icon: FiGlobe, hint: 'WHOIS data, subdomains, and DNS records', validation: 'Include TLD (e.g., example.com)' },
];

const TARGET_MODULES = {
  username: 'username',
  email: 'email',
  domain: 'domain',
};

export default function AdvancedSearchModal({ isOpen, onClose, navigate }) {
  const [activeTab, setActiveTab] = useState('username');
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) && isOpen) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const targetModule = TARGET_MODULES[activeTab] || 'username';
    navigate(`/dashboard/${targetModule}`, { state: { quickQuery: query.trim() } });
    onClose();
    setQuery('');
  };

  const activeConfig = TABS.find((t) => t.key === activeTab);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Advanced Search"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className="relative w-full max-w-2xl rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-lg p-1 text-white/60 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Close search"
            >
              <FiX size={20} />
            </button>

            <h2 className="mb-4 text-xl font-semibold text-white">Advanced Search</h2>

            <div
              role="tablist"
              aria-label="Search type"
              className="mb-4 flex rounded-xl bg-white/10 p-1"
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => { setActiveTab(tab.key); setQuery(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-white/30 ${
                      isActive
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <FiSearch className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-white/40" size={18} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Enter ${activeTab} to search...`}
                  className="w-full rounded-xl border border-white/20 bg-white/5 py-3 pr-12 pl-12 text-white placeholder-white/40 outline-none transition focus:border-white/40 focus:bg-white/10 focus:ring-2 focus:ring-white/20"
                  aria-describedby="search-hint search-validation"
                />
                <kbd className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-xs text-white/50">
                  {navigator.platform?.includes('Mac') ? '⌘K' : 'Ctrl+K'}
                </kbd>
              </div>

              <div className="flex items-start gap-2 text-xs text-white/50">
                <InfoIcon />
                <div>
                  <p id="search-hint">{activeConfig?.hint}</p>
                  <p id="search-validation" className="mt-0.5 italic">{activeConfig?.validation}</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={!query.trim()}
                className="w-full rounded-xl bg-white py-3 font-semibold text-gray-900 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                Search
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoIcon() {
  return (
    <svg className="mt-0.5 h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
