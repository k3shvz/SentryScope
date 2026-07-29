import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';

const FAQS = [
  {
    q: 'Does SentryScope access private accounts or bypass logins?',
    a: 'No. Every module only reads information that is already publicly visible — public API endpoints, public profile pages, DNS/WHOIS registries, and public breach corpora checked via k-anonymity. There is no credential bypass or private-data access anywhere in the platform.',
  },
  {
    q: 'Can I scan someone else\'s domain or account?',
    a: 'You should only run investigations against identifiers, domains, or infrastructure you own or have explicit written authorization to assess — for example, as part of your own organization\'s security program or an authorized penetration test.',
  },
  {
    q: 'How does the password exposure checker work without seeing my password?',
    a: 'Your password is hashed on your device using SHA-1. Only the first 5 characters of that hash are sent to the breach-database API, which returns all matching hash suffixes. The comparison happens locally, so your full password and full hash never leave your browser.',
  },
  {
    q: 'What happens to the data I collect during an investigation?',
    a: 'Reports and investigation history are stored against your account so you can revisit them later. You can delete any investigation, export it, or clear your history at any time from Settings.',
  },
  {
    q: 'Is there an API for integrating SentryScope into our own tooling?',
    a: 'Yes — Pro and Enterprise plans include API access with scoped keys, so you can trigger scans and pull reports from your existing security workflows.',
  },
];

function FAQItem({ item, isOpen, onClick }) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        aria-expanded={isOpen}
      >
        <span className="text-text font-medium text-[15px]">{item.q}</span>
        <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <FiPlus size={18} className="text-text-muted flex-shrink-0" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-text-muted text-sm leading-relaxed pb-5 pr-8">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section id="faq" className="max-w-4xl mx-auto px-5 lg:px-8 py-24 border-t border-border">
      <div className="max-w-2xl mb-10">
        <p className="text-accent text-sm font-semibold mb-3 tracking-wide">FAQ</p>
        <h2 className="text-3xl lg:text-4xl font-bold text-text tracking-tight">
          Common questions
        </h2>
      </div>
      <div>
        {FAQS.map((item, i) => (
          <FAQItem
            key={item.q}
            item={item}
            isOpen={openIdx === i}
            onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
          />
        ))}
      </div>
    </section>
  );
}
