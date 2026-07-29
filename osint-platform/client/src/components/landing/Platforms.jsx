import { motion } from 'framer-motion';

const PLATFORMS = [
  'GitHub', 'GitLab', 'Twitter / X', 'LinkedIn', 'Reddit', 'Instagram',
  'Mastodon', 'Dev.to', 'Stack Overflow', 'Medium', 'YouTube', 'TikTok',
  'Pastebin', 'HackerNews', 'Product Hunt', 'npm', 'PyPI', 'Docker Hub',
];

export default function Platforms() {
  return (
    <section id="platforms" className="max-w-7xl mx-auto px-5 lg:px-8 py-24 border-t border-border">
      <div className="max-w-2xl mb-12">
        <p className="text-accent text-sm font-semibold mb-3 tracking-wide">Coverage</p>
        <h2 className="text-3xl lg:text-4xl font-bold text-text tracking-tight mb-4">
          Checked across the platforms people actually use
        </h2>
        <p className="text-text-muted leading-relaxed">
          Coverage expands regularly. Every check respects each platform&apos;s public API
          terms and rate limits.
        </p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {PLATFORMS.map((p, i) => (
          <motion.span
            key={p}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.02 }}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm text-text-muted hover:text-accent hover:border-accent/30 transition-colors cursor-default"
          >
            {p}
          </motion.span>
        ))}
      </div>
    </section>
  );
}
