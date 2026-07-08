'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useBouquetStore } from '@/store/useBouquetStore';
import { Heart, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  { num: 1, label: 'Style',    emoji: '💐' },
  { num: 2, label: 'Flowers',  emoji: '🌹' },
  { num: 3, label: 'Fillers',  emoji: '🌿' },
  { num: 4, label: 'Wrapping', emoji: '🎀' },
  { num: 5, label: 'Ribbon',   emoji: '🎗️' },
  { num: 6, label: 'Extras',   emoji: '🎁' },
  { num: 7, label: 'Letter',   emoji: '✉️' },
  { num: 8, label: 'Envelope', emoji: '📬' },
  { num: 9, label: 'Share',    emoji: '💌' },
];

interface StepWizardProps {
  children: React.ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  nextLabel?: string;
  hideNext?: boolean;
  hidePrev?: boolean;
}

export default function StepWizard({ children, onNext, onPrev, nextLabel = 'Continue', hideNext = false, hidePrev = false }: StepWizardProps) {
  const { currentStep, nextStep, prevStep } = useBouquetStore();

  const handleNext = () => {
    if (onNext) onNext();
    else nextStep();
  };

  const handlePrev = () => {
    if (onPrev) onPrev();
    else prevStep();
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--color-background, #faf6f0)' }}>
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-rose-100/30 relative z-50"
        style={{ background: 'rgba(250,246,240,0.9)', backdropFilter: 'blur(12px)', zIndex: 50 }}>
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-full bg-linear-to-tr from-rose-400 to-amber-300 flex items-center justify-center">
            <Heart className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="font-serif text-lg font-semibold text-stone-700 group-hover:text-rose-500 transition-colors" style={{ fontFamily: 'var(--font-cormorant, serif)' }}>
            BloomBox
          </span>
        </Link>

        {/* Step Counter */}
        <div className="flex items-center gap-1 text-xs text-stone-500 font-medium">
          <span className="text-rose-400 font-semibold">Step {currentStep}</span>
          <span>of 9</span>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="w-full px-4 py-4 border-b border-rose-100/20 overflow-x-auto">
        <div className="flex items-center justify-center gap-0 min-w-max mx-auto">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            const isUpcoming = currentStep < step.num;

            return (
              <div key={step.num} className="flex items-center">
                {/* Step dot */}
                <motion.div
                  className="flex flex-col items-center gap-1 cursor-default"
                  whileHover={isCompleted ? { scale: 1.05 } : {}}
                >
                  <motion.div
                    className="relative flex items-center justify-center rounded-full transition-all duration-300"
                    style={{
                      width: isCurrent ? 36 : 28,
                      height: isCurrent ? 36 : 28,
                      background: isCompleted
                        ? '#e11d48'
                        : isCurrent
                        ? '#fff1f2'
                        : '#f3f4f6',
                      border: isCurrent
                        ? '2px solid #e11d48'
                        : isCompleted
                        ? 'none'
                        : '2px solid #e5e7eb',
                    }}
                    animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <span style={{ fontSize: isCurrent ? '14px' : '12px' }}>
                        {step.emoji}
                      </span>
                    )}
                  </motion.div>
                  <span
                    className="text-[9px] font-medium tracking-wide hidden sm:block"
                    style={{
                      color: isCurrent ? '#e11d48' : isCompleted ? '#9f1239' : '#9ca3af',
                    }}
                  >
                    {step.label}
                  </span>
                </motion.div>

                {/* Connector line */}
                {index < STEPS.length - 1 && (
                  <div
                    className="h-px mx-1 transition-all duration-500"
                    style={{
                      width: '24px',
                      background: isCompleted ? '#e11d48' : '#e5e7eb',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="sticky bottom-0 w-full px-6 py-4 flex items-center justify-between border-t border-rose-100/20 z-50"
        style={{ background: 'rgba(250,246,240,0.95)', backdropFilter: 'blur(12px)', zIndex: 50 }}>
        
        {!hidePrev && currentStep > 1 ? (
          <motion.button
            onClick={handlePrev}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium text-stone-600 border border-stone-200 hover:border-rose-200 hover:text-rose-500 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </motion.button>
        ) : (
          <div />
        )}

        {!hideNext && currentStep < 9 && (
          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-medium text-white shadow-md transition-all"
            style={{ background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)', boxShadow: '0 4px 20px rgba(225,29,72,0.25)' }}
          >
            {nextLabel}
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
