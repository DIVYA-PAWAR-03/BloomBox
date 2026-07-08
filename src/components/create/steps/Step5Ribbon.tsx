'use client';

import { motion } from 'framer-motion';
import { useBouquetStore } from '@/store/useBouquetStore';
import { RIBBON_OPTIONS } from '@/types/bouquet';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

interface BowProps {
  color: string;
  darkColor: string;
  size?: number;
}

function BowShape({ color, darkColor, size = 56 }: BowProps) {
  const half = size / 2;
  const loopW = size * 0.38;
  const loopH = size * 0.28;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left loop */}
      <ellipse
        cx={half - loopW * 0.55}
        cy={half - 2}
        rx={loopW}
        ry={loopH}
        fill={color}
        stroke={darkColor}
        strokeWidth="1.5"
        transform={`rotate(-20 ${half - loopW * 0.55} ${half - 2})`}
      />
      {/* Right loop */}
      <ellipse
        cx={half + loopW * 0.55}
        cy={half - 2}
        rx={loopW}
        ry={loopH}
        fill={color}
        stroke={darkColor}
        strokeWidth="1.5"
        transform={`rotate(20 ${half + loopW * 0.55} ${half - 2})`}
      />
      {/* Left tail */}
      <path
        d={`M ${half - 2} ${half + 2} Q ${half - size * 0.3} ${half + size * 0.35} ${half - size * 0.4} ${half + size * 0.44}`}
        stroke={darkColor}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right tail */}
      <path
        d={`M ${half + 2} ${half + 2} Q ${half + size * 0.3} ${half + size * 0.35} ${half + size * 0.4} ${half + size * 0.44}`}
        stroke={darkColor}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Center knot */}
      <circle cx={half} cy={half - 1} r={size * 0.09} fill={darkColor} />
    </svg>
  );
}

export default function Step5Ribbon() {
  const ribbon = useBouquetStore((s) => s.ribbon);
  const setRibbon = useBouquetStore((s) => s.setRibbon);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-heading text-4xl md:text-5xl text-rose-900 mb-3">
          Tie it with a ribbon
        </h2>
        <p className="font-serif text-lg text-rose-400 italic">
          The perfect bow to complete your bouquet
        </p>
      </motion.div>

      {/* Ribbon Options Row */}
      <motion.div
        className="flex flex-wrap justify-center gap-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {RIBBON_OPTIONS.map((rib) => {
          const isSelected = ribbon === rib.id;
          return (
            <motion.button
              key={rib.id}
              variants={cardVariants}
              whileHover={{ scale: 1.08, y: -4 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => setRibbon(rib.id)}
              className={[
                'relative flex flex-col items-center gap-3 px-6 py-5 rounded-2xl border-2 cursor-pointer transition-all duration-250 min-w-[100px]',
                isSelected
                  ? 'border-rose-500 bg-rose-50 shadow-lg shadow-rose-200/60'
                  : 'border-stone-200 bg-white hover:border-rose-200 hover:shadow-md',
              ].join(' ')}
            >
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center shadow-sm"
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}

              {/* Bow SVG */}
              <motion.div
                animate={{ rotate: isSelected ? [0, -5, 5, 0] : 0 }}
                transition={{ duration: 0.4 }}
              >
                <BowShape color={rib.color} darkColor={rib.darkColor} size={60} />
              </motion.div>

              {/* Label */}
              <span className={`font-heading text-sm font-semibold ${isSelected ? 'text-rose-700' : 'text-stone-600'}`}>
                {rib.label}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Selected ribbon note */}
      {ribbon && (
        <motion.div
          key={ribbon}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-10 text-center"
        >
          <p className="font-caveat text-xl text-rose-500">
            🎀 {RIBBON_OPTIONS.find((r) => r.id === ribbon)?.label} ribbon tied
          </p>
        </motion.div>
      )}
    </div>
  );
}
