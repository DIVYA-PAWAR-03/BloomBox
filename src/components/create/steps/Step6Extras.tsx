'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useBouquetStore } from '@/store/useBouquetStore';
import { EXTRA_OPTIONS } from '@/types/bouquet';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function Step6Extras() {
  const extras = useBouquetStore((s) => s.extras);
  const toggleExtra = useBouquetStore((s) => s.toggleExtra);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="text-center mb-3"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-heading text-4xl md:text-5xl text-rose-900 mb-3">
          Add something extra
        </h2>
        <p className="font-serif text-lg text-rose-400 italic">
          Optional. Make it even more special
        </p>
      </motion.div>

      {/* Optional badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8"
      >
        <span className="inline-block px-3 py-1 bg-rose-100 text-rose-500 font-serif text-xs rounded-full">
          Skip if you&apos;d like — your bouquet is already beautiful
        </span>
      </motion.div>

      {/* Extras Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {EXTRA_OPTIONS.map((extra) => {
          const isAdded = extras.includes(extra.id);
          return (
            <motion.div
              key={extra.id}
              variants={cardVariants}
              className={[
                'relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300',
                isAdded
                  ? 'border-emerald-400 bg-emerald-50 shadow-md shadow-emerald-100/60'
                  : 'border-stone-200 bg-white hover:border-rose-200 hover:shadow-md hover:shadow-rose-50/60',
              ].join(' ')}
            >
              {/* Added checkmark badge */}
              <AnimatePresence>
                {isAdded && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Emoji */}
              <motion.div
                animate={{ scale: isAdded ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.3 }}
                className="text-5xl flex-shrink-0 select-none"
                style={{ fontSize: '4rem', lineHeight: 1 }}
              >
                {extra.emoji}
              </motion.div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-heading text-lg font-semibold mb-0.5 ${isAdded ? 'text-emerald-800' : 'text-stone-800'}`}>
                  {extra.label}
                </h3>
                <p className="font-serif text-sm text-stone-500 leading-snug">
                  {extra.description}
                </p>
              </div>

              {/* Toggle button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleExtra(extra.id)}
                className={[
                  'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-200 cursor-pointer',
                  isAdded
                    ? 'border-emerald-400 bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:border-rose-400',
                ].join(' ')}
              >
                <AnimatePresence mode="wait">
                  {isAdded ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.18 }}
                    >
                      Added!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.18 }}
                    >
                      + Add
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 text-center"
      >
        <p className="font-caveat text-lg text-stone-400">
          🎁 These appear alongside your bouquet
        </p>
        {extras.length > 0 && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-sm text-emerald-600 mt-1"
          >
            {extras.length} extra{extras.length !== 1 ? 's' : ''} added ✓
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
