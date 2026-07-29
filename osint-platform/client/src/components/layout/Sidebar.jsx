import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid,
  FiUser,
  FiMail,
  FiGlobe,
  FiFileText,
  FiImage,
  FiLock,
  FiShare2,
  FiClock,
  FiCpu,
  FiSettings,
  FiShield,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: FiGrid, end: true },
    ],
  },
  {
    label: 'Investigate',
    items: [
      { to: '/dashboard/username', label: 'Username Search', icon: FiUser },
      { to: '/dashboard/email', label: 'Email Investigation', icon: FiMail },
      { to: '/dashboard/domain', label: 'Domain & WHOIS', icon: FiGlobe },
      { to: '/dashboard/tech', label: 'Tech Detection', icon: FiCpu },
      { to: '/dashboard/metadata', label: 'Metadata Analyzer', icon: FiFileText },
      { to: '/dashboard/image', label: 'Image Analyzer', icon: FiImage },
      { to: '/dashboard/password', label: 'Password Exposure', icon: FiLock },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { to: '/dashboard/graph', label: 'Relationship Graph', icon: FiShare2 },
      { to: '/dashboard/timeline', label: 'Timeline', icon: FiClock },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    const initial = {};
    NAV_SECTIONS.forEach((section) => {
      initial[section.label] = !section.items.some((item) =>
        item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
      );
    });
    return initial;
  });

  const toggleSection = (label) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <>
      {open && (
        <button
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}
      <aside
        className={clsx(
          'fixed lg:sticky top-0 left-0 h-screen w-64 bg-base border-r border-border z-40',
          'flex flex-col transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <FiShield size={16} className="text-accent" />
          </div>
          <span className="font-semibold text-text tracking-tight">SentryScope</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-5">
          {NAV_SECTIONS.map((section) => {
            const isOpen = !collapsed[section.label];

            return (
              <div key={section.label}>
                <button
                  onClick={() => toggleSection(section.label)}
                  className="flex items-center justify-between w-full px-3 mb-2 group"
                >
                  <span className="text-[10px] font-semibold text-text-faint uppercase tracking-wider">
                    {section.label}
                  </span>
                  {isOpen ? (
                    <FiChevronUp size={12} className="text-text-faint group-hover:text-text-muted" />
                  ) : (
                    <FiChevronDown size={12} className="text-text-faint group-hover:text-text-muted" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0.5">
                        {section.items.map((item) => (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={onClose}
                            className={({ isActive }) =>
                              clsx(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 relative',
                                isActive
                                  ? 'bg-accent/10 text-accent font-medium'
                                  : 'text-text-muted hover:text-text hover:bg-white/5'
                              )
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <item.icon size={16} />
                                <span className="flex-1">{item.label}</span>
                                {isActive && (
                                  <motion.div
                                    layoutId="sidebar-active-indicator"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                  />
                                )}
                              </>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 relative',
                isActive ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-text hover:bg-white/5'
              )
            }
          >
            {({ isActive }) => (
              <>
                <FiSettings size={16} />
                <span className="flex-1">Settings</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        </div>
      </aside>
    </>
  );
}
