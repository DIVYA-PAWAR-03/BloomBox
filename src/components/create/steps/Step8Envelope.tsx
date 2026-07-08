'use client';

import { motion } from 'framer-motion';
import { useBouquetStore } from '@/store/useBouquetStore';
import { ENVELOPE_OPTIONS } from '@/types/bouquet';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function Step8Envelope() {
  const envelope = useBouquetStore((s) => s.envelope);
  const setEnvelope = useBouquetStore((s) => s.setEnvelope);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-heading text-4xl md:text-5xl text-rose-900 mb-3">
          Seal it with love
        </h2>
        <p className="font-serif text-lg text-rose-400 italic">
          Choose your envelope style
        </p>
      </motion.div>

      {/* Envelope Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {ENVELOPE_OPTIONS.map((env) => {
          const isSelected = envelope === env.id;
          return (
            <motion.button
              key={env.id}
              variants={cardVariants}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setEnvelope(env.id)}
              className={[
                'relative flex flex-col items-center p-5 rounded-2xl border-2 transition-all cursor-pointer',
                isSelected
                  ? 'border-rose-500 bg-rose-50/50 shadow-lg shadow-rose-200/50'
                  : 'border-rose-100 bg-white hover:border-rose-300 hover:shadow-md',
              ].join(' ')}
            >
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center shadow-sm z-10"
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}

              {/* Envelope Animation Display */}
              <div className="w-full aspect-[4/3] flex items-center justify-center relative mb-4 overflow-hidden rounded-lg bg-rose-50/20 p-2">
                <div className="relative w-36 h-24 rounded shadow-sm border border-stone-200" style={{ backgroundColor: env.color }}>
                  {/* Flap inside */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-0 border-t-[48px] border-x-[72px] border-x-transparent z-20 origin-top"
                    style={{
                      borderTopColor: env.flapColor,
                    }}
                    animate={{
                      rotateX: isSelected ? 180 : 0,
                      y: isSelected ? -2 : 0,
                    }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  />
                  {/* Pocket background */}
                  <div className="absolute inset-0 bg-black/5 z-0" />
                  {/* Sealed stamp for wax/heart seal */}
                  {env.id === 'wax_seal' && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 shadow-sm border border-red-800 flex items-center justify-center text-[10px] z-30">
                      🔴
                    </div>
                  )}
                  {env.id === 'heart_seal' && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-rose-500 shadow-sm border border-rose-600 flex items-center justify-center text-[10px] z-30">
                      ❤️
                    </div>
                  )}
                </div>
              </div>

              {/* Label */}
              <span className={`font-heading text-base font-semibold mb-1 ${isSelected ? 'text-rose-700' : 'text-rose-900'}`}>
                {env.label}
              </span>

              {/* Description */}
              <span className="font-serif text-xs text-stone-500 text-center leading-snug">
                {env.description}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Note */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="font-serif text-rose-400 italic text-sm">
          Your handwritten letter will be sealed inside this envelope
        </p>
      </motion.div>
    </div>
  );
}
