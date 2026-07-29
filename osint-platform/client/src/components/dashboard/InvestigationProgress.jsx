import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import Card from '../ui/Card';

const STEPS = ['Initiated', 'Recon', 'Analysis', 'Enrichment', 'Report'];

/**
 * Lightweight visual tied to real dashboard state: idle until the first
 * investigation of the session, "Analysis" while a scan is in flight,
 * "Report" once at least one investigation has completed.
 */
export default function InvestigationProgress({ scanning = false, hasInvestigations = false }) {
  const currentStep = !hasInvestigations && !scanning ? 0 : scanning ? 2 : 4;

  return (
    <Card>
      <h3 className="mb-5 text-[11px] font-mono font-semibold text-text uppercase tracking-wider">
        Investigation Progress
      </h3>

      <div className="flex items-center justify-between" role="list" aria-label="Investigation steps">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isLast = index === STEPS.length - 1;

          return (
            <div key={step} className="flex flex-1 flex-col items-center" role="listitem">
              <div className="relative flex w-full items-center justify-center">
                <motion.div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                    isCompleted || isActive
                      ? 'border-accent/60 bg-accent/10 text-accent'
                      : 'border-border bg-card text-text-faint'
                  }`}
                  animate={
                    isActive
                      ? { boxShadow: ['0 0 0 0 rgba(0,229,255,0.35)', '0 0 0 8px rgba(0,229,255,0)'] }
                      : {}
                  }
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeOut' }}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted && !isActive ? <FiCheck size={14} /> : index + 1}
                </motion.div>

                {!isLast && (
                  <motion.div
                    className={`absolute left-1/2 top-1/2 h-0.5 w-full -translate-y-1/2 ${
                      isCompleted ? 'bg-accent/60' : 'bg-border'
                    }`}
                    initial={false}
                    animate={{ scaleX: isCompleted ? 1 : 0 }}
                    style={{ transformOrigin: 'left' }}
                    transition={{ duration: 0.4 }}
                  />
                )}
              </div>

              <span
                className={`mt-2 text-[10px] font-mono ${
                  isActive || isCompleted ? 'text-accent' : 'text-text-faint'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
