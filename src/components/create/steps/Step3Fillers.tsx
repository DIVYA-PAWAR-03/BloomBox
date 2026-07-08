'use client';

import { motion } from 'framer-motion';
import { useBouquetStore } from '@/store/useBouquetStore';
import type { FillerType } from '@/types/bouquet';

interface FillerOption {
  id: FillerType;
  emoji: string;
  label: string;
  description: string;
  color: string;
}

const FILLER_OPTIONS: FillerOption[] = [
  { id: 'baby_breath',  emoji: '🤍', label: "Baby's Breath",  description: 'Tiny white clusters', color: '#f3f4f6' },
  { id: 'green_leaves', emoji: '🌿', label: 'Green Leaves',   description: 'Lush green foliage', color: '#dcfce7' },
  { id: 'fern',         emoji: '🌱', label: 'Fern',           description: 'Delicate fronds',    color: '#d1fae5' },
  { id: 'eucalyptus',   emoji: '🪴', label: 'Eucalyptus',     description: 'Silvery green sprigs',color: '#e0f2fe' },
  { id: 'small_fillers',emoji: '✦',  label: 'Small Fillers',  description: 'Tiny accent blooms',  color: '#fdf2f8' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const cardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function Step3Fillers() {
  const fillers = useBouquetStore((s) => s.fillers);
  const toggleFiller = useBouquetStore((s) => s.toggleFiller);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-heading text-4xl md:text-5xl text-rose-900 mb-3">
          Leaves &amp; Fillers
        </h2>
        <p className="font-serif text-lg text-rose-400 italic">
          Automatically added to fill your bouquet beautifully
        </p>
      </motion.div>

      {/* Filler Cards */}
      <motion.div
        className="flex flex-col gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {FILLER_OPTIONS.map((filler) => {
          const isOn = fillers.includes(filler.id);
          return (
            <motion.button
              key={filler.id}
              variants={cardVariants}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleFiller(filler.id)}
              className={[
                'flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-250 cursor-pointer',
                isOn
                  ? 'border-rose-400 bg-rose-50 shadow-md shadow-rose-100/60'
                  : 'border-rose-100 bg-white hover:border-rose-200 hover:shadow-sm',
              ].join(' ')}
            >
              {/* Color swatch dot */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl border border-white shadow-sm"
                style={{ backgroundColor: filler.color }}
              >
                {filler.emoji}
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className={`font-heading text-base font-semibold ${isOn ? 'text-rose-700' : 'text-stone-800'}`}>
                  {filler.label}
                </p>
                <p className="font-serif text-sm text-stone-500">{filler.description}</p>
              </div>

              {/* Toggle indicator */}
              <motion.div
                animate={{
                  backgroundColor: isOn ? '#f43f5e' : '#e5e7eb',
                  scale: isOn ? 1 : 0.9,
                }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-10 h-6 rounded-full flex items-center px-0.5 shrink-0"
              >
                <motion.div
                  animate={{ x: isOn ? 16 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                  className="w-5 h-5 bg-white rounded-full shadow-sm"
                />
              </motion.div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="font-caveat text-lg text-stone-400">
          🌿 These gracefully fill the spaces between your flowers
        </p>
        <p className="font-serif text-sm text-stone-400 mt-1">
          {fillers.length} filler{fillers.length !== 1 ? 's' : ''} selected
        </p>
      </motion.div>
    </div>
  );
}
