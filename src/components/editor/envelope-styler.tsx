"use client";

import React from 'react';
import { useGiftStore, EnvelopeCategory, EnvelopeTexture, WaxSealType } from '@/store/useGiftStore';
import { useTranslations } from '@/lib/i18n';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';

const SWATCHES = [
  '#e11d48', // Crimson Red
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#eab308', // Gold
  '#1c1917', // Stone dark
  '#78350f', // Kraft brown
];

const SEAL_SWATCHES = [
  '#fbbf24', // Gold
  '#be123c', // Burgundy
  '#0369a1', // Deep Blue
  '#15803d', // Emerald Green
];

const STICKERS = ['💖', '🌹', '✨', '🎂', '🎓', '🎄', '🎁', '🕊️', '👑', '🕯️', '🧸', '🍫'];

export function EnvelopeStyler() {
  const { t } = useTranslations('envelope');

  const envelopeCategory = useGiftStore((s) => s.envelopeCategory);
  const setEnvelopeCategory = useGiftStore((s) => s.setEnvelopeCategory);

  const envelopeColor = useGiftStore((s) => s.envelopeColor);
  const setEnvelopeColor = useGiftStore((s) => s.setEnvelopeColor);

  const envelopeTexture = useGiftStore((s) => s.envelopeTexture);
  const setEnvelopeTexture = useGiftStore((s) => s.setEnvelopeTexture);

  const waxSealType = useGiftStore((s) => s.waxSealType);
  const setWaxSealType = useGiftStore((s) => s.setWaxSealType);

  const sealColor = useGiftStore((s) => s.sealColor);
  const setSealColor = useGiftStore((s) => s.setSealColor);

  const ribbonColor = useGiftStore((s) => s.ribbonColor);
  const setRibbonColor = useGiftStore((s) => s.setRibbonColor);

  const envelopeStickers = useGiftStore((s) => s.envelopeStickers);
  const addEnvelopeSticker = useGiftStore((s) => s.addEnvelopeSticker);
  const clearEnvelopeStickers = useGiftStore((s) => s.clearEnvelopeStickers);

  const categories: { id: EnvelopeCategory; label: string }[] = [
    { id: 'love', label: 'Romantic Love' },
    { id: 'birthday', label: 'Happy Birthday' },
    { id: 'friendship', label: 'Friendship Story' },
    { id: 'wedding', label: 'Wedding Bells' },
    { id: 'minimal', label: 'Minimalist Clean' },
    { id: 'luxury', label: 'Gilded Luxury' },
    { id: 'royal', label: 'Royal Crest' },
    { id: 'vintage', label: 'Vintage Classic' },
    { id: 'christmas', label: 'Christmas Festive' },
    { id: 'valentine', label: 'Valentine Special' },
    { id: 'mother', label: "Mother's Day" },
    { id: 'father', label: "Father's Day" },
    { id: 'graduation', label: 'Graduation Day' },
    { id: 'congrats', label: 'Congratulations' }
  ];

  const textures: { id: EnvelopeTexture; label: string }[] = [
    { id: 'smooth', label: t('smooth') },
    { id: 'linen', label: t('linen') },
    { id: 'parchment', label: t('parchment') },
    { id: 'kraft', label: t('kraft') }
  ];

  const seals: { id: WaxSealType; label: string }[] = [
    { id: 'rose', label: 'Rose Crest' },
    { id: 'heart', label: 'Romantic Heart' },
    { id: 'ring', label: 'Wedding Rings' },
    { id: 'star', label: 'Glowing Star' },
    { id: 'none', label: 'No Wax Seal' }
  ];

  return (
    <div className="space-y-4 text-zinc-300">
      
      {/* Category selector */}
      <div className="space-y-1.5">
        <Label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{t('category')}</Label>
        <select 
          value={envelopeCategory} 
          onChange={(e) => setEnvelopeCategory(e.target.value as EnvelopeCategory)}
          className="w-full h-8 px-2 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id} className="bg-zinc-950 text-zinc-200">
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Color swatch picker */}
      <div className="space-y-1.5">
        <Label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{t('color')}</Label>
        <div className="flex flex-wrap gap-2 pt-0.5">
          {SWATCHES.map((color) => (
            <button
              key={color}
              onClick={() => setEnvelopeColor(color)}
              style={{ backgroundColor: color }}
              className={`h-6 w-6 rounded-full border cursor-pointer transition-all ${
                envelopeColor === color 
                  ? 'border-white scale-110 shadow-md shadow-black/40' 
                  : 'border-zinc-950 hover:scale-105'
              }`}
            />
          ))}
          {/* Custom color picker */}
          <div className="relative h-6 w-6 rounded-full border border-zinc-800 bg-zinc-900 hover:scale-105 overflow-hidden cursor-pointer">
            <input
              type="color"
              value={envelopeColor}
              onChange={(e) => setEnvelopeColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Sparkles className="h-3 w-3 text-zinc-400 absolute top-1.5 left-1.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Texture buttons */}
      <div className="space-y-1.5">
        <Label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{t('texture')}</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {textures.map((tex) => (
            <button
              key={tex.id}
              onClick={() => setEnvelopeTexture(tex.id)}
              className={`py-1 px-2 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                envelopeTexture === tex.id
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-450'
                  : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Wax seals selector */}
      <div className="space-y-1.5">
        <Label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{t('sealType')}</Label>
        <select 
          value={waxSealType} 
          onChange={(e) => setWaxSealType(e.target.value as WaxSealType)}
          className="w-full h-8 px-2 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
        >
          {seals.map((s) => (
            <option key={s.id} value={s.id} className="bg-zinc-950 text-zinc-200">
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Seal Color swatches */}
      {waxSealType !== 'none' && (
        <div className="space-y-1.5">
          <Label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{t('sealColor')}</Label>
          <div className="flex gap-2 pt-0.5">
            {SEAL_SWATCHES.map((color) => (
              <button
                key={`seal-${color}`}
                onClick={() => setSealColor(color)}
                style={{ backgroundColor: color }}
                className={`h-5.5 w-5.5 rounded-full border cursor-pointer transition-all ${
                  sealColor === color 
                    ? 'border-white scale-110 shadow-md shadow-black/40' 
                    : 'border-zinc-950 hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ribbon color swatches */}
      <div className="space-y-1.5">
        <Label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{t('ribbonColor')}</Label>
        <div className="flex flex-wrap gap-2 pt-0.5">
          <button
            onClick={() => setRibbonColor('none')}
            className={`h-5.5 px-2 rounded-full border text-[9px] font-bold cursor-pointer transition-all ${
              ribbonColor === 'none'
                ? 'border-rose-500 bg-rose-500/10 text-rose-450'
                : 'border-zinc-800 bg-zinc-900/40 text-zinc-400'
            }`}
          >
            None
          </button>
          {['#be123c', '#fbbf24', '#ffffff', '#1e1b4b'].map((color) => (
            <button
              key={`ribbon-${color}`}
              onClick={() => setRibbonColor(color)}
              style={{ backgroundColor: color }}
              className={`h-5.5 w-5.5 rounded-full border cursor-pointer transition-all ${
                ribbonColor === color 
                  ? 'border-white scale-110 shadow-md shadow-black/40' 
                  : 'border-zinc-950 hover:scale-105'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Stickers builder */}
      <div className="space-y-1.5 border-t border-zinc-900/80 pt-3.5">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{t('stickers')}</Label>
          {envelopeStickers.length > 0 && (
            <button 
              onClick={clearEnvelopeStickers}
              className="text-[9px] text-rose-400 font-semibold hover:underline cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-6 gap-2 pt-1">
          {STICKERS.map((stk) => (
            <button
              key={stk}
              onClick={() => addEnvelopeSticker(stk)}
              className="h-9 w-full flex items-center justify-center bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900 rounded-lg text-xl cursor-pointer select-none active:scale-95 transition-transform"
            >
              {stk}
            </button>
          ))}
        </div>

        {envelopeStickers.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 pl-0.5">
            {envelopeStickers.map((stk, index) => (
              <span key={index} className="text-sm select-none p-1 rounded bg-zinc-900 border border-zinc-850">
                {stk}
              </span>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
export default EnvelopeStyler;
