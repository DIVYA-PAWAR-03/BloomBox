'use client';

import { motion } from 'framer-motion';
import { useBouquetStore } from '@/store/useBouquetStore';
import { WRAPPING_OPTIONS } from '@/types/bouquet';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};

export default function Step4Wrapping() {
  const wrapping = useBouquetStore((s) => s.wrapping);
  const setWrapping = useBouquetStore((s) => s.setWrapping);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-heading text-4xl md:text-5xl text-rose-900 mb-3">
          Choose your wrapping
        </h2>
        <p className="font-serif text-lg text-rose-400 italic">
          The paper that holds your love together
        </p>
      </motion.div>

      {/* Wrapping Grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {WRAPPING_OPTIONS.map((wrap) => {
          const isSelected = wrapping === wrap.id;
          const isDark = wrap.id === 'luxury_black';

          return (
            <motion.button
              key={wrap.id}
              variants={cardVariants}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setWrapping(wrap.id)}
              className={[
                'relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300',
                isSelected
                  ? 'border-rose-500 bg-rose-50/60 shadow-lg shadow-rose-200/50'
                  : 'border-stone-200 bg-white hover:border-rose-200 hover:shadow-md hover:shadow-rose-100/40',
              ].join(' ')}
            >
              {/* Paper swatch with folded look */}
              <div className="relative w-16 h-20 rounded-t-lg overflow-visible shrink-0" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))' }}>
                {/* Main body */}
                <div
                  className="absolute inset-0 rounded-t-lg"
                  style={{ background: wrap.gradient }}
                />
                {/* Paper fold crease - top right corner */}
                <div
                  className="absolute top-0 right-0 w-0 h-0"
                  style={{
                    borderStyle: 'solid',
                    borderWidth: '0 14px 14px 0',
                    borderColor: `transparent rgba(255,255,255,0.6) transparent transparent`,
                  }}
                />
                {/* Fold shadow */}
                <div
                  className="absolute top-0 right-0 w-0 h-0"
                  style={{
                    borderStyle: 'solid',
                    borderWidth: '14px 14px 0 0',
                    borderColor: `rgba(0,0,0,0.1) transparent transparent transparent`,
                  }}
                />
                {/* Texture lines for paper feel */}
                <div className="absolute inset-x-3 bottom-3 flex flex-col gap-1.5 opacity-20">
                  <div className="h-px bg-current rounded" style={{ backgroundColor: isDark ? '#fff' : '#6b7280' }} />
                  <div className="h-px bg-current rounded w-3/4" style={{ backgroundColor: isDark ? '#fff' : '#6b7280' }} />
                </div>

                {/* Selected checkmark overlay */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="absolute inset-0 flex items-center justify-center bg-rose-500/20 rounded-t-lg"
                  >
                    <div className="w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center shadow">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Label */}
              <span className={`font-heading text-sm font-semibold ${isSelected ? 'text-rose-700' : 'text-stone-700'}`}>
                {wrap.label}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Selected preview note */}
      {wrapping && (
        <motion.div
          key={wrapping}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-8 text-center"
        >
          <p className="font-caveat text-xl text-rose-500">
            ✨ {WRAPPING_OPTIONS.find((w) => w.id === wrapping)?.label} wrapping selected
          </p>
        </motion.div>
      )}
    </div>
  );
}
