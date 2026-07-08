"use client";

import React from 'react';
import { Asset } from '@/types/editor';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Sparkles, Heart } from 'lucide-react';

interface HoverPreviewCardProps {
  asset: Asset | null;
  position: { x: number; y: number } | null;
  isFavorite: boolean;
}

export function HoverPreviewCard({ asset, position, isFavorite }: HoverPreviewCardProps) {
  if (!asset || !position) return null;

  // Render tooltip relative to the sidebar
  const cardStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${position.y - 80}px`, // Offset vertically
    left: `${position.x + 25}px`, // Offset to the right of the pointer
    zIndex: 100,
    pointerEvents: 'none', // Prevents mouse blocking
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, x: -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95, x: -10 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={cardStyle}
      >
        <Card className="w-64 border border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl shadow-black/80 backdrop-blur-md rounded-xl space-y-3">
          {/* Top Banner (Category, trending, and fav indicators) */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
              {asset.type} • {asset.subcategory || 'General'}
            </span>
            <div className="flex items-center gap-1.5">
              {asset.isTrending && (
                <span className="flex items-center gap-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[8px] font-bold text-amber-500">
                  <Sparkles className="h-2 w-2" />
                  Trending
                </span>
              )}
              {isFavorite && (
                <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
              )}
            </div>
          </div>

          {/* Large Visual Graphic */}
          <div className="flex h-28 w-full items-center justify-center rounded-lg bg-zinc-900/40 border border-zinc-900 text-6xl select-none">
            {asset.assetUrl}
          </div>

          {/* Text details */}
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-xs font-bold text-white tracking-wide leading-tight">
                {asset.name}
              </h4>
            </div>
            {asset.description && (
              <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                {asset.description}
              </p>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
export default HoverPreviewCard;
