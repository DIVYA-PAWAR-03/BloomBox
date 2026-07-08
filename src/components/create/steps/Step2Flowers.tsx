'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBouquetStore } from '@/store/useBouquetStore';
import { FLOWER_CATALOGUE } from '@/types/bouquet';
import type { FlowerType } from '@/types/bouquet';
import { Trash2, Copy, ArrowUp, ArrowDown, X } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

interface PopAnim {
  id: number;
  x: number;
  y: number;
}

export default function Step2Flowers() {
  const store = useBouquetStore();
  const flowers = store.flowers;
  const selectedFlowerId = store.selectedFlowerId;

  const [activeTab, setActiveTab] = useState<'flowers' | 'fillers'>('flowers');
  const [pops, setPops] = useState<PopAnim[]>([]);

  const getCount = (type: FlowerType) => flowers.filter((f) => f.type === type).length;

  const handleAdd = (type: FlowerType, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const id = Date.now();
    setPops((prev) => [
      ...prev,
      { id, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    ]);
    setTimeout(() => setPops((prev) => prev.filter((p) => p.id !== id)), 700);
    store.addFlower(type);
  };

  const handleRemoveLast = (type: FlowerType) => {
    const last = [...flowers].reverse().find((f) => f.type === type);
    if (last) store.removeFlower(last.id);
  };

  // Split flower catalog into categories
  const isFoliage = (type: FlowerType) =>
    ['leaf_green', 'leaf_fern', 'leaf_eucalyptus', 'baby_breath_item', 'sparkle_item'].includes(type);

  const flowersList = FLOWER_CATALOGUE.filter((f) => !isFoliage(f.type));
  const fillersList = FLOWER_CATALOGUE.filter((f) => isFoliage(f.type));

  const activeCatalogue = activeTab === 'flowers' ? flowersList : fillersList;

  const bouquetSummary = FLOWER_CATALOGUE.filter((f) => getCount(f.type) > 0);

  const selectedFlower = flowers.find((f) => f.id === selectedFlowerId);
  const selectedDef = selectedFlower
    ? FLOWER_CATALOGUE.find((f) => f.type === selectedFlower.type)
    : null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-heading text-4xl md:text-5xl text-rose-900 mb-3">
          Customize your bouquet
        </h2>
        <p className="font-serif text-lg text-rose-400 italic">
          Click to add items. Click any item in the preview window to custom-edit it!
        </p>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex justify-center border-b border-rose-100 mb-8 gap-4">
        <button
          onClick={() => setActiveTab('flowers')}
          className={`pb-3 px-6 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === 'flowers'
              ? 'text-rose-600'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          Flowers 🌸
          {activeTab === 'flowers' && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('fillers')}
          className={`pb-3 px-6 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === 'fillers'
              ? 'text-rose-600'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          Leaves & Stems 🌿
          {activeTab === 'fillers' && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500"
            />
          )}
        </button>
      </div>

      {/* Catalogue Grid */}
      <motion.div
        key={activeTab}
        className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {activeCatalogue.map((flower) => {
          const count = getCount(flower.type);
          return (
            <motion.div
              key={flower.type}
              variants={cardVariants}
              className="relative group"
            >
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => handleAdd(flower.type, e)}
                className={[
                  'w-full flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer',
                  count > 0
                    ? 'border-rose-400 bg-rose-50/50 shadow-sm shadow-rose-100/60'
                    : 'border-rose-100 bg-white hover:border-rose-300 hover:shadow-sm hover:shadow-rose-100/40',
                ].join(' ')}
              >
                {/* Count badge */}
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      key={count}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                      className="absolute -top-2 -right-2 min-w-5.5 h-5.5 px-1.5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Emoji */}
                <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{flower.emoji}</span>

                {/* Color dot + name */}
                <div className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: flower.color }}
                  />
                  <span className="font-serif text-xs text-stone-700 font-medium">
                    {flower.label}
                  </span>
                </div>
              </motion.button>

              {/* Remove button */}
              <AnimatePresence>
                {count > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleRemoveLast(flower.type)}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-rose-200 text-rose-400 hover:text-rose-600 hover:border-rose-400 rounded-full text-xs flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                  >
                    −
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Flower Customization Toolbar (Only shows when an item is selected in preview) */}
      <AnimatePresence>
        {selectedFlower && selectedDef && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="p-6 bg-stone-50 rounded-3xl border border-rose-100 shadow-md space-y-5"
          >
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-rose-100/50 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl select-none">{selectedDef.emoji}</span>
                <div>
                  <h3 className="font-heading text-lg text-rose-900 leading-tight">
                    Customizing {selectedDef.label}
                  </h3>
                  <span className="text-[10px] text-stone-400 font-mono uppercase">
                    ID: {selectedFlower.id.slice(-6)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => store.selectFlower(null)}
                className="p-1.5 rounded-full hover:bg-stone-200/50 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sliders for rotation / size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rotation Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-stone-500 font-semibold">
                  <span>Rotate Flower</span>
                  <span>{selectedFlower.rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={selectedFlower.rotation}
                  onChange={(e) => store.updateFlowerRotation(selectedFlower.id, Number(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              {/* Size Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-stone-500 font-semibold">
                  <span>Scale / Size</span>
                  <span>{Math.round(selectedFlower.scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={selectedFlower.scale}
                  onChange={(e) => store.updateFlowerScale(selectedFlower.id, Number(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>

            {/* Editing actions */}
            <div className="flex flex-wrap items-center justify-between pt-3 gap-3 border-t border-rose-100/50">
              {/* Layer depth buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => store.bringForward(selectedFlower.id)}
                  title="Bring Forward"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-200 hover:border-rose-300 text-xs font-semibold text-stone-600 hover:text-rose-500 cursor-pointer shadow-sm transition-colors"
                >
                  <ArrowUp className="h-3.5 w-3.5" /> Forward
                </button>
                <button
                  onClick={() => store.sendBackward(selectedFlower.id)}
                  title="Send Backward"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-200 hover:border-rose-300 text-xs font-semibold text-stone-600 hover:text-rose-500 cursor-pointer shadow-sm transition-colors"
                >
                  <ArrowDown className="h-3.5 w-3.5" /> Backward
                </button>
              </div>

              {/* Duplicate / Delete actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => store.duplicateFlower(selectedFlower.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold text-rose-600 cursor-pointer shadow-sm transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" /> Duplicate
                </button>
                <button
                  onClick={() => store.deleteFlower(selectedFlower.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold text-red-600 cursor-pointer shadow-sm transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating + pops */}
      <AnimatePresence>
        {pops.map((pop) => (
          <motion.span
            key={pop.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -40, scale: 1.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            style={{ position: 'fixed', left: pop.x, top: pop.y, zIndex: 9999, pointerEvents: 'none', fontSize: '1.4rem' }}
          >
            +
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Summary */}
      <AnimatePresence>
        {bouquetSummary.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="mt-8 p-5 bg-white rounded-2xl border border-rose-100 shadow-sm"
          >
            <p className="font-serif text-sm text-rose-400 mb-2 italic">Your bouquet total:</p>
            <div className="flex flex-wrap gap-3">
              {bouquetSummary.map((f) => (
                <span key={f.type} className="font-caveat text-lg text-rose-800 flex items-center gap-1">
                  {f.emoji}
                  <span className="text-rose-400">×{getCount(f.type)}</span>
                </span>
              ))}
            </div>
            <p className="font-serif text-xs text-stone-400 mt-2">
              {flowers.length} item{flowers.length !== 1 ? 's' : ''} in bouquet
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
