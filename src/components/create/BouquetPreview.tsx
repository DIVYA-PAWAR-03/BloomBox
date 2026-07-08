'use client';

import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  FlowerItem,
  FillerType,
  WrappingColor,
  RibbonColor,
  ExtraType,
  BouquetStyle,
} from '@/types/bouquet';
import { FLOWER_CATALOGUE, WRAPPING_OPTIONS, RIBBON_OPTIONS } from '@/types/bouquet';
import FlowerAssetRenderer from './FlowerAssets';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BouquetPreviewProps {
  style: BouquetStyle;
  flowers: FlowerItem[];
  fillers: FillerType[];
  wrapping: WrappingColor;
  ribbon: RibbonColor;
  extras: ExtraType[];
  compact?: boolean;
  onFlowerDrag?: (id: string, x: number, y: number) => void;
  selectedFlowerId?: string | null;
  onFlowerSelect?: (id: string | null) => void;
}

// ─── Filler configuration ────────────────────────────────────────────────────

const FILLER_EMOJI: Record<FillerType, string[]> = {
  baby_breath:  ['✿', '✾', '❋', '✿', '✾'],
  green_leaves: ['🌿', '🍃', '🌿', '🍃'],
  fern:         ['🌿', '🌿', '🍃'],
  eucalyptus:   ['🪴', '🌿', '🪴'],
  small_fillers: ['✦', '✧', '⋆', '✦', '✧'],
};

const FILLER_SIZE: Record<FillerType, string> = {
  baby_breath:  '0.8rem',
  green_leaves: '1.1rem',
  fern:         '1.0rem',
  eucalyptus:   '1.1rem',
  small_fillers: '0.7rem',
};

const FILLER_COLOR: Record<FillerType, string> = {
  baby_breath:  '#f9fafb',
  green_leaves: '#4ade80',
  fern:         '#22c55e',
  eucalyptus:   '#86efac',
  small_fillers: '#fde68a',
};

// ─── Extras configuration ────────────────────────────────────────────────────

const EXTRAS_CONFIG: Record<ExtraType, { emoji: string; label: string; position: React.CSSProperties }> = {
  teddy:      { emoji: '🧸', label: 'Teddy Bear',   position: { bottom: '4px', left: '-8px' } },
  chocolate:  { emoji: '🍫', label: 'Chocolates',   position: { bottom: '4px', right: '-8px' } },
  gift_box:   { emoji: '🎁', label: 'Gift Box',     position: { bottom: '60px', left: '-16px' } },
  heart_card: { emoji: '💌', label: 'Heart Card',   position: { bottom: '60px', right: '-16px' } },
};

// ─── Seeded pseudo-random positions for fillers ──────────────────────────────

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getFillerPositions(fillerType: FillerType, count: number, fillerIndex: number) {
  return Array.from({ length: count }, (_, i) => {
    const seed = fillerIndex * 100 + i;
    const x = 12 + seededRandom(seed * 3 + 1) * 76;
    const y = 10 + seededRandom(seed * 7 + 2) * 44;
    const rotation = seededRandom(seed * 13 + 3) * 60 - 30;
    return { x, y, rotation };
  });
}

// ─── Color Helper Utilities for SVG gradients ────────────────────────────────

function getWrappingGradientStops(colorId: WrappingColor) {
  switch (colorId) {
    case 'white':
      return [{ offset: '0%', color: '#ffffff' }, { offset: '100%', color: '#cbd5e1' }];
    case 'pink':
      return [{ offset: '0%', color: '#fff1f2' }, { offset: '100%', color: '#fbcfe8' }];
    case 'cream':
      return [{ offset: '0%', color: '#fffdf0' }, { offset: '100%', color: '#fde396' }];
    case 'kraft':
      return [{ offset: '0%', color: '#e7ccb2' }, { offset: '100%', color: '#a07c57' }];
    case 'luxury_black':
      return [{ offset: '0%', color: '#374151' }, { offset: '100%', color: '#111827' }];
    case 'lavender':
      return [{ offset: '0%', color: '#f5f3ff' }, { offset: '100%', color: '#c7d2fe' }];
    case 'blue':
      return [{ offset: '0%', color: '#f0f9ff' }, { offset: '100%', color: '#bae6fd' }];
    case 'pastel':
      return [
        { offset: '0%', color: '#fdf4ff' },
        { offset: '50%', color: '#fbcfe8' },
        { offset: '100%', color: '#c084fc' }
      ];
    default:
      return [{ offset: '0%', color: '#ffffff' }, { offset: '100%', color: '#cbd5e1' }];
  }
}

function getRibbonColors(colorId: RibbonColor) {
  switch (colorId) {
    case 'white':
      return { light: '#ffffff', dark: '#94a3b8' };
    case 'pink':
      return { light: '#fbcfe8', dark: '#db2777' };
    case 'red':
      return { light: '#fca5a5', dark: '#991b1b' };
    case 'gold':
      return { light: '#fde047', dark: '#9a3412' };
    case 'black':
      return { light: '#4b5563', dark: '#0f172a' };
    case 'blue':
      return { light: '#93c5fd', dark: '#1e40af' };
    default:
      return { light: '#ffffff', dark: '#94a3b8' };
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BouquetPreview({
  style,
  flowers,
  fillers,
  wrapping,
  ribbon,
  extras,
  compact = false,
  onFlowerDrag,
  selectedFlowerId = null,
  onFlowerSelect,
}: BouquetPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Real-time snapping guidelines state
  const [draggedPos, setDraggedPos] = useState<{ id: string; x: number; y: number } | null>(null);

  // Resolve wrapping / ribbon definitions
  const wrappingDef = useMemo(
    () => WRAPPING_OPTIONS.find((w) => w.id === wrapping) ?? WRAPPING_OPTIONS[0],
    [wrapping]
  );
  const ribbonDef = useMemo(
    () => RIBBON_OPTIONS.find((r) => r.id === ribbon) ?? RIBBON_OPTIONS[0],
    [ribbon]
  );

  const wrappingStops = useMemo(() => getWrappingGradientStops(wrapping), [wrapping]);
  const ribbonColors = useMemo(() => getRibbonColors(ribbon), [ribbon]);

  // Determine if wrapping is dark (luxury_black) for decorative accents
  const isDark = wrapping === 'luxury_black';
  const isGold = ribbon === 'gold';

  // Sizing
  const W = compact ? 180 : 300;
  const H = compact ? 240 : 400;
  const fillerOpacity = compact ? 0.6 : 0.85;

  const getBloomSize = (type: string) => {
    const base = compact ? 1.95 : 3.25;
    const multipliers: Record<string, number> = {
      rose: 1.04,
      rose_pink: 1.04,
      rose_white: 1.04,
      rose_yellow: 1.04,
      tulip: 1.16,
      lily: 1.2,
      sunflower: 1.12,
      carnation: 1.08,
      peony: 1.12,
      hydrangea: 1.12,
      orchid: 1.1,
      cherry_blossom: 1.05,
      lavender: 1.04,
      jasmine: 1.06,
      lotus: 1.1,
      marigold: 1.08,
      daisy: 0.96,
      baby_breath_item: 0.72,
      sparkle_item: 0.78,
    };

    return base * (multipliers[type] ?? 1);
  };

  const wrapperScaleX = useMemo(() => {
    if (!flowers || flowers.length === 0) return 1.0;
    const xs = flowers.map((f) => f.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const width = maxX - minX;
    // Dynamically adjust wrapper width based on flower spread
    const calculatedScale = 0.76 + (width / 50) * 0.24;
    return Math.max(0.78, Math.min(1.22, calculatedScale));
  }, [flowers]);

  const globalScale = useMemo(() => {
    const count = flowers.length;
    if (count <= 5) return 1.08;
    // Continuous smooth sizing
    const scale = 1.08 - Math.min(1.0, (count - 5) / 35) * 0.14;
    return scale;
  }, [flowers.length]);

  // Dynamic automatic leaves generation behind flowers
  const automaticLeaves = useMemo(() => {
    if (!flowers || flowers.length === 0) return [];
    
    // Calculate centroid of the flower cluster
    const count = flowers.length;
    const cx = flowers.reduce((sum, f) => sum + f.x, 0) / count;
    const cy = flowers.reduce((sum, f) => sum + f.y, 0) / count;
    
    const leavesList: { x: number; y: number; rotation: number; scale: number; type: string }[] = [];
    
    flowers.forEach((flower, idx) => {
      // Avoid placing automatic background leaves under actual foliage items
      if (['leaf_green', 'leaf_fern', 'leaf_eucalyptus'].includes(flower.type)) return;
      if (flower.type === 'sparkle_item') return;

      const dx = flower.x - cx;
      const dy = flower.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Place leaf framing the outer boundaries
      if (dist > 6) {
        const ux = dx / dist;
        const uy = dy / dist;
        // Push the backing leaf outward from the flower center
        const leafX = flower.x + ux * 6.5;
        const leafY = flower.y + uy * 6.5;
        
        // Point outward fanning away from the center
        const angle = Math.atan2(uy, ux) * (180 / Math.PI) + 90;
        
        // Select leaf type deterministically
        const leafTypes = ['leaf_green', 'leaf_eucalyptus', 'leaf_fern'];
        const leafType = leafTypes[idx % leafTypes.length];
        
        leavesList.push({
          x: Math.max(6, Math.min(94, leafX)),
          y: Math.max(8, Math.min(62, leafY)),
          rotation: angle + (Math.sin(idx * 45) * 15),
          scale: 0.72 * flower.scale,
          type: leafType,
        });
      }
    });

    return leavesList;
  }, [flowers]);

  // Determine active alignment guides
  const activeSnapGuides = useMemo(() => {
    if (!draggedPos) return { vertical: null, horizontal: null };
    
    let vertical: number | null = null;
    let horizontal: number | null = null;
    
    // Check vertical center axis snapping
    if (Math.abs(draggedPos.x - 50) < 2) {
      vertical = 50;
    }
    
    // Check against other flowers
    for (const f of flowers) {
      if (f.id === draggedPos.id) continue;
      if (f.type === 'sparkle_item') continue;
      
      if (vertical === null && Math.abs(draggedPos.x - f.x) < 1.8) {
        vertical = f.x;
      }
      if (horizontal === null && Math.abs(draggedPos.y - f.y) < 1.8) {
        horizontal = f.y;
      }
      if (vertical !== null && horizontal !== null) break;
    }
    
    return { vertical, horizontal };
  }, [draggedPos, flowers]);

  return (
    <motion.div
      onClick={() => {
        if (onFlowerSelect) onFlowerSelect(null);
      }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative inline-block select-none"
      style={{
        width: W,
        height: H,
        filter: 'drop-shadow(0 20px 40px rgba(68,56,46,0.12)) drop-shadow(0 4px 10px rgba(68,56,46,0.06))',
      }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatType: 'loop',
        }}
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transform: `scale(${globalScale})`,
          transformOrigin: 'bottom center',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Soft realistic drop shadow under the wrapping paper */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: '6%',
            left: '50%',
            transform: 'translateX(-50%) scaleX(0.8)',
            width: '66%',
            height: '18%',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.15) 0%, transparent 80%)',
            filter: 'blur(10px)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        {/* Ambient background glow fanning upwards */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: '18%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '74%',
            height: '35%',
            borderRadius: '50%',
            background: isDark
              ? 'radial-gradient(ellipse, rgba(212,160,23,0.14) 0%, transparent 70%)'
              : 'radial-gradient(ellipse, rgba(244,114,182,0.12) 0%, transparent 70%)',
            filter: 'blur(20px)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        {/* Snapping Guidelines Overlays */}
        {activeSnapGuides.vertical !== null && (
          <div
            className="absolute top-0 bottom-[10%] w-px border-l border-dashed border-rose-500/80 pointer-events-none"
            style={{ left: `${activeSnapGuides.vertical}%`, zIndex: 100 }}
          />
        )}
        {activeSnapGuides.horizontal !== null && (
          <div
            className="absolute left-0 right-0 h-px border-t border-dashed border-rose-500/80 pointer-events-none"
            style={{ top: `${activeSnapGuides.horizontal}%`, zIndex: 100 }}
          />
        )}

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 1 — BACK WRAPPING PAPER (Premium watercolor sheets)
           ══════════════════════════════════════════════════════════════════ */}
        <img
          src={`/assets/wrappers/back-${wrapping}.svg`}
          alt={`${wrapping} back wrapper`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 5,
            transform: `scaleX(${wrapperScaleX})`,
            transformOrigin: 'bottom center',
            transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.06))',
          }}
          aria-hidden
        />

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 2 — AUTOMATIC BEHIND-FLOWER LEAVES (Watercolor Foliage)
           ══════════════════════════════════════════════════════════════════ */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
          {automaticLeaves.map((leaf, idx) => (
            <div
              key={`bg-leaf-${idx}`}
              style={{
                position: 'absolute',
                left: `${leaf.x}%`,
                top: `${leaf.y}%`,
                width: compact ? '24px' : '44px',
                height: compact ? '24px' : '44px',
                transform: `translate(-50%, -50%) rotate(${leaf.rotation}deg) scale(${leaf.scale})`,
                opacity: 0.65,
              }}
            >
              <FlowerAssetRenderer type={leaf.type} />
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 3 — DYNAMIC BEZIER FLOWER STEMS (Converging to Ribbon neck)
           ══════════════════════════════════════════════════════════════════ */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 12,
          }}
          aria-hidden
        >
          <defs>
            <linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#14532d" />
            </linearGradient>
          </defs>
          
          {flowers.map((flower) => {
            // Cap stem starting point at the flower head center (clipping base y)
            const yPct = Math.min(flower.y, 62);
            
            // Stems curve organically towards the cinch point (50, 58)
            // Left/right flowers curve inwards. Center stems are straighter.
            const cx = 50 + (flower.x - 50) * 0.45;
            const cy = yPct + (58 - yPct) * 0.55;
            
            // Lower fanned stem: extends from cinch point (50, 58) to fanned base
            const fanSpread = (flower.x - 50) * 0.22;
            const baseTargetX = 50 + fanSpread;
            const baseTargetY = 85;
            const baseCX = 50 + fanSpread * 0.5;
            const baseCY = 71;

            return (
              <g key={`stem-${flower.id}`} opacity="0.75">
                {/* Upper curved stem */}
                <path
                  d={`M ${flower.x} ${yPct} Q ${cx} ${cy} 50 58`}
                  fill="none"
                  stroke="url(#stemGrad)"
                  strokeWidth={compact ? "0.9" : "1.6"}
                  strokeLinecap="round"
                />
                
                {/* Lower gathered & fanned out stem */}
                <path
                  d={`M 50 58 Q ${baseCX} ${baseCY} ${baseTargetX} ${baseTargetY}`}
                  fill="none"
                  stroke="#14532d"
                  strokeWidth={compact ? "1.1" : "1.8"}
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </svg>

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 4 — FILLER ELEMENTS
           ══════════════════════════════════════════════════════════════════ */}
        {fillers.map((filler, fi) => {
          const emojis = FILLER_EMOJI[filler] ?? ['✿'];
          const count = compact ? Math.min(emojis.length, 3) : emojis.length + 3;
          const positions = getFillerPositions(filler, count, fi);
          return positions.map((pos, pi) => (
            <div
              key={`${filler}-${pi}`}
              aria-hidden
              style={{
                position: 'absolute',
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                fontSize: FILLER_SIZE[filler],
                transform: `rotate(${pos.rotation}deg)`,
                color: FILLER_COLOR[filler],
                opacity: fillerOpacity * (0.65 + seededRandom(fi * 37 + pi) * 0.35),
                zIndex: 14,
                pointerEvents: 'none',
                userSelect: 'none',
                lineHeight: 1,
                textShadow: filler === 'small_fillers'
                  ? `0 0 6px ${FILLER_COLOR[filler]}`
                  : 'none',
              }}
            >
              {emojis[pi % emojis.length]}
            </div>
          ));
        })}

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 5 — FLOWER HEADS
           ══════════════════════════════════════════════════════════════════ */}
        {flowers.map((flower) => {
          const isSelected = flower.id === selectedFlowerId;
          const isFoliageItem = ['leaf_green', 'leaf_fern', 'leaf_eucalyptus'].includes(flower.type);
          const bloomSize = getBloomSize(flower.type);
          
          return (
            <motion.div
              key={flower.id}
              initial={{ scale: 0, opacity: 0, rotate: 0 }}
              animate={{
                scale: isSelected ? flower.scale * 1.15 : flower.scale,
                opacity: 1,
                rotate: flower.rotation,
              }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 22,
              }}
              onClick={(e) => {
                if (onFlowerSelect) {
                  e.stopPropagation();
                  onFlowerSelect(flower.id);
                }
              }}
              style={{
                position: 'absolute',
                left: `${flower.x}%`,
                top: `${flower.y}%`,
                transform: 'translate(-50%, -50%)',
                width: isFoliageItem ? (compact ? '1.7rem' : '2.7rem') : `${bloomSize}rem`,
                height: isFoliageItem ? (compact ? '1.7rem' : '2.7rem') : `${bloomSize}rem`,
                zIndex: isSelected ? 100 : flower.zIndex,
                cursor: onFlowerDrag ? 'grab' : 'default',
                userSelect: 'none',
                filter: isSelected
                  ? 'drop-shadow(0 0 12px rgba(244,63,94,0.6)) drop-shadow(0 6px 14px rgba(0,0,0,0.3))'
                  : 'drop-shadow(0 3px 6px rgba(0,0,0,0.1))',
                outline: isSelected ? '2px dashed #f43f5e' : 'none',
                outlineOffset: '4px',
                borderRadius: '50%',
                backgroundColor: isSelected ? 'rgba(244,63,94,0.06)' : isFoliageItem ? 'transparent' : 'rgba(255,255,255,0.04)',
                padding: isSelected ? '4px' : '0px',
              }}
              whileHover={onFlowerDrag ? { scale: isSelected ? flower.scale * 1.24 : flower.scale * 1.12 } : {}}
              drag={!!onFlowerDrag}
              dragConstraints={containerRef}
              dragElastic={0.02}
              dragMomentum={false}
              onDrag={(event, info) => {
                if (!onFlowerDrag || !containerRef.current) return;
                const rect = containerRef.current.getBoundingClientRect();
                const clientX = info.point.x - rect.left;
                const clientY = info.point.y - rect.top;
                const x = Math.max(5, Math.min(95, (clientX / rect.width) * 100));
                const y = Math.max(2, Math.min(62, (clientY / rect.height) * 100));
                
                // Track real-time position for snap guidelines
                setDraggedPos({ id: flower.id, x, y });
              }}
              onDragEnd={(event, info) => {
                setDraggedPos(null);
                if (!onFlowerDrag || !containerRef.current) return;
                const rect = containerRef.current.getBoundingClientRect();
                const clientX = info.point.x - rect.left;
                const clientY = info.point.y - rect.top;
                const rawX = Math.max(5, Math.min(95, (clientX / rect.width) * 100));
                const rawY = Math.max(2, Math.min(62, (clientY / rect.height) * 100));
                
                // Snapping coordinates resolution
                let snapX = rawX;
                let snapY = rawY;
                
                // Snap to vertical center axis
                if (Math.abs(rawX - 50) < 2) {
                  snapX = 50;
                }
                
                // Snap to other flowers
                for (const f of flowers) {
                  if (f.id === flower.id) continue;
                  if (f.type === 'sparkle_item') continue;
                  
                  if (Math.abs(rawX - f.x) < 2) {
                    snapX = f.x;
                  }
                  if (Math.abs(rawY - f.y) < 2) {
                    snapY = f.y;
                  }
                }
                
                // Apply rounded coordinate step increments (0.5% grid for micro-tuning)
                const finalX = Math.round(snapX / 0.5) * 0.5;
                const finalY = Math.round(snapY / 0.5) * 0.5;
                
                onFlowerDrag(flower.id, finalX, finalY);
              }}
            >
              <FlowerAssetRenderer type={flower.type} />
            </motion.div>
          );
        })}

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 6 — FRONT WRAPPING PAPER COLLAR (Premium overlapping folds)
           ══════════════════════════════════════════════════════════════════ */}
        <img
          src={`/assets/wrappers/front-${wrapping}.svg`}
          alt={`${wrapping} front wrapper`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 13,
            transform: `scaleX(${wrapperScaleX})`,
            transformOrigin: 'bottom center',
            transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          aria-hidden
        />

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 7 — WATERCOLOR RIBBON BOW (Placed precisely at cinch point)
           ══════════════════════════════════════════════════════════════════ */}
        <div
          aria-label="Ribbon bow"
          style={{
            position: 'absolute',
            top: '58%', // exact cinch point Y
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 35,
            width: compact ? 70 : 120,
            height: compact ? 30 : 50,
            pointerEvents: 'none',
          }}
        >
          <img
            src={`/assets/ribbons/ribbon-${ribbon}.png`}
            alt={`${ribbon} ribbon`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
              filter: 'drop-shadow(0 2.5px 2.5px rgba(0, 0, 0, 0.25))',
            }}
          />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 8 — SPARKLE ACCENTS (non-compact only)
           ══════════════════════════════════════════════════════════════════ */}
        {!compact && (
          <>
            {[
              { x: 14, y: 7,  delay: 0.0, size: 10 },
              { x: 84, y: 10, delay: 0.6, size: 8  },
              { x: 74, y: 28, delay: 1.1, size: 6  },
              { x: 10, y: 36, delay: 0.4, size: 7  },
              { x: 55, y: 4,  delay: 0.9, size: 9  },
            ].map((spark, i) => (
              <motion.div
                key={`spark-${i}`}
                aria-hidden
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{
                  duration: 2.2 + i * 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: spark.delay,
                }}
                style={{
                  position: 'absolute',
                  left: `${spark.x}%`,
                  top: `${spark.y}%`,
                  fontSize: spark.size,
                  color: isDark ? '#fde68a' : '#f9a8d4',
                  zIndex: 40,
                  pointerEvents: 'none',
                  lineHeight: 1,
                  userSelect: 'none',
                }}
              >
                ✦
              </motion.div>
            ))}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 9 — EXTRAS
           ══════════════════════════════════════════════════════════════════ */}
        {extras.map((extra, i) => {
          const cfg = EXTRAS_CONFIG[extra];
          if (!cfg) return null;
          return (
            <motion.div
              key={extra}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.3 + i * 0.12,
                type: 'spring',
                stiffness: 180,
                damping: 16,
              }}
              style={{
                position: 'absolute',
                ...cfg.position,
                fontSize: compact ? '1.4rem' : '2.1rem',
                zIndex: 45,
                pointerEvents: 'none',
                userSelect: 'none',
                filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.18))',
                lineHeight: 1,
              }}
              title={cfg.label}
            >
              <motion.span
                animate={
                  extra === 'heart_card'
                    ? { y: [0, -5, 0] }
                    : extra === 'teddy'
                    ? { rotate: [-4, 4, -4] }
                    : extra === 'chocolate'
                    ? { rotate: [0, -3, 3, 0] }
                    : { scale: [1, 1.06, 1] }
                }
                transition={{
                  duration: extra === 'heart_card' ? 2.0 : 2.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.2,
                }}
                style={{ display: 'inline-block' }}
              >
                {cfg.emoji}
              </motion.span>
            </motion.div>
          );
        })}

        {/* Luxury style badge */}
        {!compact && style === 'luxury' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              position: 'absolute',
              top: '2%',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '0.65rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#d4a017',
              fontFamily: 'var(--font-cormorant, serif)',
              fontWeight: 600,
              zIndex: 45,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              userSelect: 'none',
              textShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}
          >
            ✦ Luxury Bouquet ✦
          </motion.div>
        )}

        {/* Empty state hint */}
        {flowers.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '25%',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              zIndex: 25,
              userSelect: 'none',
            }}
          >
            <div style={{ fontSize: compact ? '2rem' : '3.5rem', marginBottom: '8px', opacity: 0.35 }}>
              🌸
            </div>
            {!compact && (
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  fontFamily: 'var(--font-cormorant, serif)',
                  fontStyle: 'italic',
                  letterSpacing: '0.05em',
                }}
              >
                Add flowers to begin
              </p>
            )}
          </div>
        )}

      </motion.div>
    </motion.div>
  );
}
