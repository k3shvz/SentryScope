import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

const FORMATS = [
  { key: 'pdf', label: 'Export PDF', description: 'Print-to-PDF report' },
  { key: 'csv', label: 'Export CSV', description: 'Download as spreadsheet' },
  { key: 'json', label: 'Export JSON', description: 'Raw data export' },
];

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function toCsv(records) {
  const headers = ['id', 'type', 'target', 'risk', 'time'];
  const escape = (value) => {
    const str = value === undefined || value === null ? '' : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const rows = records.map((r) => headers.map((h) => escape(r[h])).join(','));
  return [headers.join(','), ...rows].join('\n');
}

function openPrintableReport(records) {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return false;

  const rows = records
    .map(
      (r) => `
        <tr>
          <td>${r.id ?? ''}</td>
          <td>${r.type ?? ''}</td>
          <td>${r.target ?? ''}</td>
          <td>${r.risk ?? ''}</td>
          <td>${r.time ?? ''}</td>
        </tr>`
    )
    .join('');

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SentryScope Investigation Report</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; padding: 32px; color: #111; }
          h1 { font-size: 18px; margin-bottom: 4px; }
          p.meta { color: #666; font-size: 12px; margin-top: 0; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #ddd; }
          th { text-transform: uppercase; letter-spacing: 0.04em; color: #555; font-size: 10px; }
          tr:nth-child(even) { background: #f7f7f8; }
        </style>
      </head>
      <body>
        <h1>SentryScope Investigation Report</h1>
        <p class="meta">Generated ${new Date().toLocaleString()} \u00b7 ${records.length} record${records.length === 1 ? '' : 's'}</p>
        <table>
          <thead>
            <tr><th>ID</th><th>Type</th><th>Target</th><th>Risk</th><th>Time</th></tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="5">No records yet — run a scan.</td></tr>'}
          </tbody>
        </table>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
  return true;
}

export default function ExportMenu({ data = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const { push } = useToast();

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleExport = (format) => {
    setIsOpen(false);

    if (!data.length) {
      push('No investigations to export yet — run a scan first.', 'info');
      return;
    }

    const stamp = new Date().toISOString().slice(0, 10);
    if (format === 'csv') {
      downloadBlob(toCsv(data), `sentryscope-investigations-${stamp}.csv`, 'text/csv');
      push('CSV export downloaded.', 'success');
    } else if (format === 'json') {
      downloadBlob(JSON.stringify(data, null, 2), `sentryscope-investigations-${stamp}.json`, 'application/json');
      push('JSON export downloaded.', 'success');
    } else if (format === 'pdf') {
      const opened = openPrintableReport(data);
      push(opened ? 'Opened print dialog for PDF export.' : 'Could not open print window — check your popup blocker.', opened ? 'success' : 'error');
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={toggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-text transition hover:bg-white/[0.03] focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        <FiDownload size={16} />
        Export
        <svg
          className={`ml-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            aria-label="Export options"
            className="absolute right-0 top-full z-40 mt-2 w-44 rounded-xl border border-border bg-card py-1.5 shadow-lg"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {FORMATS.map((format) => (
              <button
                key={format.key}
                role="menuitem"
                onClick={() => handleExport(format.key)}
                className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left text-sm text-text transition hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent/40"
              >
                <span className="font-medium">{format.label}</span>
                <span className="text-xs text-text-faint">{format.description}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
