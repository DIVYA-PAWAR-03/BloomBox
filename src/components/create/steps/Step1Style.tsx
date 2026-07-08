'use client';

import { motion } from 'framer-motion';
import { useBouquetStore } from '@/store/useBouquetStore';
import { BOUQUET_STYLES, FLOWER_CATALOGUE } from '@/types/bouquet';
import type { BouquetStyleDef } from '@/types/bouquet';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

function getFlowerEmojis(types: BouquetStyleDef['defaultFlowers']): string {
  return types
    .map((t) => FLOWER_CATALOGUE.find((f) => f.type === t)?.emoji ?? '🌸')
    .join(' ');
}

export default function Step1Style() {
  const bouquetStyle = useBouquetStore((s) => s.bouquetStyle);
  const setBouquetStyle = useBouquetStore((s) => s.setBouquetStyle);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className="font-heading text-4xl md:text-5xl text-rose-900 mb-3">
          Choose your bouquet style
        </h2>
        <p className="font-serif text-lg text-rose-400 italic">
          Every style begins already beautiful
        </p>
      </motion.div>

      {/* Grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {BOUQUET_STYLES.map((style) => {
          const isSelected = bouquetStyle === style.style;
          return (
            <motion.button
              key={style.style}
              variants={cardVariants}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setBouquetStyle(style.style)}
              className={[
                'relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center cursor-pointer transition-all duration-300',
                isSelected
                  ? 'border-rose-500 bg-rose-50 shadow-lg shadow-rose-200/60'
                  : 'border-rose-100 bg-white hover:border-rose-300 hover:bg-rose-50/40 hover:shadow-md hover:shadow-rose-100/50',
              ].join(' ')}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="absolute top-2 right-2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center shadow-sm"
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}

              {/* Main emoji */}
              <span style={{ fontSize: '3rem', lineHeight: 1 }}>{style.emoji}</span>

              {/* Name */}
              <span className={`font-heading text-sm font-semibold ${isSelected ? 'text-rose-700' : 'text-rose-900'}`}>
                {style.label}
              </span>

              {/* Description */}
              <span className="font-serif text-xs text-stone-500 leading-snug">
                {style.description}
              </span>

              {/* Default flower preview */}
              <div className="mt-1 text-base leading-none tracking-widest">
                {getFlowerEmojis(style.defaultFlowers)}
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Selected style details */}
      {bouquetStyle && (
        <motion.div
          key={bouquetStyle}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="font-caveat text-xl text-rose-500">
            ✨ {BOUQUET_STYLES.find((s) => s.style === bouquetStyle)?.label} style selected
          </p>
        </motion.div>
      )}
    </div>
  );
}
