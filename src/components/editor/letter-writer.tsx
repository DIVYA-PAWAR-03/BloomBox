"use client";

import React, { useState } from 'react';
import { useGiftStore, LetterTemplate, TypingSpeed, PhotoLayout, EffectType, AppLocale } from '@/store/useGiftStore';
import { useTranslations } from '@/lib/i18n';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { VoiceRecorder } from './voice-recorder';
import { 
  Bold, Italic, Underline, Trash2, Plus, Sparkles, Heart, Gift, Image, Mic, Languages 
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const FONTS = [
  { id: 'Caveat', label: 'Playful Cursive (Caveat)' },
  { id: 'Playfair Display', label: 'Elegant Classic (Playfair)' },
  { id: 'Cinzel', label: 'Royal Serif (Cinzel)' },
  { id: 'Great Vibes', label: 'Formal Calligraphy (Vibes)' },
  { id: 'Inter', label: 'Clean Modern (Inter)' }
];

const TEXT_COLORS = [
  '#4c0519', // Deep Rose
  '#1e1b4b', // Deep Indigo
  '#14532d', // Deep Forest
  '#090500', // Dark Charcoal
  '#b45309', // Vintage Amber
];

const EFFECTS: { id: EffectType; label: string }[] = [
  { id: 'sparkles', label: '✨ Golden Sparkles' },
  { id: 'petals', label: '🌸 Floating Rose Petals' },
  { id: 'butterflies', label: '🦋 Magical Butterflies' },
  { id: 'fireflies', label: '💡 Soft Fireflies' },
  { id: 'snow', label: '❄️ Falling Winter Snow' },
  { id: 'confetti', label: '🎉 Birthday Confetti' },
  { id: 'glow', label: '🌟 Ambient Magic Glow' },
  { id: 'none', label: 'No Effects' }
];

const GIFT_CATALOG = [
  { id: 'teddy', label: 'Wave Teddy Bear 🧸', price: 15.00 },
  { id: 'chocolate', label: 'Openable Chocolate 🍫', price: 8.50 },
  { id: 'cake', label: 'Birthday Sparkler Cake 🎂', price: 25.00 },
  { id: 'ring', label: 'Diamond Engagement Ring 💍', price: 150.00 },
  { id: 'necklace', label: 'Gilded Pearl Necklace 📿', price: 65.00 },
  { id: 'perfume', label: 'Luxurious Flower Perfume 🧪', price: 45.00 },
  { id: 'gift_card', label: 'Studio Gift Card 🎫', price: 20.00 },
  { id: 'balloons', label: 'Floating Heart Balloons 🎈', price: 10.00 },
];

export function LetterWriter() {
  const { t } = useTranslations('letter');

  // Multi-Language i18n
  const locale = useGiftStore((s) => s.locale);
  const setLocale = useGiftStore((s) => s.setLocale);

  // Template states
  const letterTemplate = useGiftStore((s) => s.letterTemplate);
  const setLetterTemplate = useGiftStore((s) => s.setLetterTemplate);

  // Styling states
  const fontFamily = useGiftStore((s) => s.fontFamily);
  const setFontFamily = useGiftStore((s) => s.setFontFamily);
  const fontSize = useGiftStore((s) => s.fontSize);
  const setFontSize = useGiftStore((s) => s.setFontSize);
  const textColor = useGiftStore((s) => s.textColor);
  const setTextColor = useGiftStore((s) => s.setTextColor);

  // Writing contents
  const textContent = useGiftStore((s) => s.textContent);
  const setTextContent = useGiftStore((s) => s.setTextContent);
  const signatureText = useGiftStore((s) => s.signatureText);
  const setSignatureText = useGiftStore((s) => s.setSignatureText);
  const typingSpeed = useGiftStore((s) => s.typingSpeed);
  const setTypingSpeed = useGiftStore((s) => s.setTypingSpeed);

  // Photo memories
  const photos = useGiftStore((s) => s.photos);
  const addPhoto = useGiftStore((s) => s.addPhoto);
  const removePhoto = useGiftStore((s) => s.removePhoto);
  const photoLayout = useGiftStore((s) => s.photoLayout);
  const setPhotoLayout = useGiftStore((s) => s.setPhotoLayout);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photoCaptionInput, setPhotoCaptionInput] = useState('');

  // Attached gifts
  const attachedGifts = useGiftStore((s) => s.attachedGifts);
  const toggleAttachedGift = useGiftStore((s) => s.toggleAttachedGift);

  // Ambient effects
  const effectType = useGiftStore((s) => s.effectType);
  const setEffectType = useGiftStore((s) => s.setEffectType);

  const templates: { id: LetterTemplate; label: string }[] = [
    { id: 'love', label: 'Romantic Love Letter' },
    { id: 'birthday', label: 'Happy Birthday Card' },
    { id: 'friendship', label: 'Friendship Memo' },
    { id: 'anniversary', label: 'Anniversary Scroll' },
    { id: 'wedding', label: 'Wedding Invitation' },
    { id: 'minimal', label: 'Minimalist Note' },
    { id: 'vintage', label: 'Vintage Parchment' },
    { id: 'royal', label: 'Royal Gold Scroll' },
    { id: 'handwritten', label: 'Handwritten Script' },
    { id: 'fairy', label: 'Fairy Tale Parchment' }
  ];

  // Helper to append formatting tags into raw text content
  const applyRichText = (tag: 'bold' | 'italic' | 'underline') => {
    let wrapStart = '';
    let wrapEnd = '';
    
    if (tag === 'bold') { wrapStart = '<b>'; wrapEnd = '</b>'; }
    if (tag === 'italic') { wrapStart = '<i>'; wrapEnd = '</i>'; }
    if (tag === 'underline') { wrapStart = '<u>'; wrapEnd = '</u>'; }

    setTextContent(textContent + wrapStart + 'text' + wrapEnd);
    toast(`Rich Text format applied`);
  };

  const handleAddPhotoMemory = () => {
    if (!photoUrlInput.trim()) {
      toast.error('Please enter a photo image URL');
      return;
    }
    addPhoto(photoUrlInput, photoCaptionInput);
    setPhotoUrlInput('');
    setPhotoCaptionInput('');
    toast.success('Photo memory attached!');
  };

  return (
    <div className="space-y-4.5 text-zinc-300 pb-10">
      
      {/* 1. Multi-Language i18n Selector */}
      <div className="space-y-1.5 border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider pl-0.5">
          <Languages className="h-3.5 w-3.5 text-rose-500" />
          <span>{t('selectLanguage')}</span>
        </div>
        <select 
          value={locale} 
          onChange={(e) => setLocale(e.target.value as AppLocale)}
          className="w-full h-8 px-2 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
        >
          <option value="en" className="bg-zinc-950 text-zinc-200">English (US)</option>
          <option value="hi" className="bg-zinc-950 text-zinc-200">Hindi (हिन्दी)</option>
          <option value="mr" className="bg-zinc-950 text-zinc-200">Marathi (मराठी)</option>
          <option value="ja" className="bg-zinc-950 text-zinc-200">Japanese (日本語)</option>
          <option value="fr" className="bg-zinc-950 text-zinc-200">French (Français)</option>
          <option value="de" className="bg-zinc-950 text-zinc-200">German (Deutsch)</option>
          <option value="es" className="bg-zinc-950 text-zinc-200">Spanish (Español)</option>
        </select>
      </div>

      {/* 2. Letter Layout Template select */}
      <div className="space-y-1.5">
        <Label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Letter Design</Label>
        <select 
          value={letterTemplate} 
          onChange={(e) => setLetterTemplate(e.target.value as LetterTemplate)}
          className="w-full h-8 px-2 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
        >
          {templates.map((tpl) => (
            <option key={tpl.id} value={tpl.id} className="bg-zinc-950 text-zinc-200">
              {tpl.label}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Typography options */}
      <div className="space-y-3.5 border-t border-zinc-900/80 pt-3.5">
        <Label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{t('font')}</Label>
        
        <div className="space-y-2">
          <select 
            value={fontFamily} 
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full h-8 px-2 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
          >
            {FONTS.map(f => (
              <option key={f.id} value={f.id} className="bg-zinc-950 text-zinc-200">
                {f.label}
              </option>
            ))}
          </select>

          {/* Font Size slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>{t('size')}</span>
              <span>{fontSize}px</span>
            </div>
            <Slider
              min={12}
              max={28}
              step={1}
              value={[fontSize]}
              onValueChange={(val: any) => setFontSize(val[0])}
              className="py-1 cursor-pointer"
            />
          </div>

          {/* Color swatch selection picker */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-zinc-400">{t('color')}</span>
            <div className="flex gap-2">
              {TEXT_COLORS.map(color => (
                <button
                  key={`text-${color}`}
                  onClick={() => setTextColor(color)}
                  style={{ backgroundColor: color }}
                  className={`h-5.5 w-5.5 rounded-full border cursor-pointer transition-all ${
                    textColor === color 
                      ? 'border-white scale-110' 
                      : 'border-zinc-950 hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Text Editor content with rich formatting tools */}
      <div className="space-y-2 border-t border-zinc-900/80 pt-3.5">
        <Label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{t('title')}</Label>
        
        {/* Rich formatting ribbon */}
        <div className="flex items-center gap-1 bg-zinc-900/60 p-1.5 border border-zinc-850 rounded-t-lg shrink-0">
          <Button onClick={() => applyRichText('bold')} size="icon" variant="ghost" className="h-6 w-6 text-zinc-400 hover:text-white rounded cursor-pointer" title="Bold text">
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button onClick={() => applyRichText('italic')} size="icon" variant="ghost" className="h-6 w-6 text-zinc-400 hover:text-white rounded cursor-pointer" title="Italic text">
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button onClick={() => applyRichText('underline')} size="icon" variant="ghost" className="h-6 w-6 text-zinc-400 hover:text-white rounded cursor-pointer" title="Underline text">
            <Underline className="h-3.5 w-3.5" />
          </Button>
          <div className="h-3.5 w-[1px] bg-zinc-800 mx-1" />
          {/* Emojis shortcuts */}
          {['❤️', '✨', '🌸', '🎁'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => setTextContent(textContent + emoji)}
              className="text-xs hover:scale-110 active:scale-95 px-1 py-0.5 rounded transition-transform cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>

        <textarea
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder={t('placeholder')}
          className="w-full h-28 p-2 text-xs border border-zinc-800 bg-zinc-900/40 rounded-b-lg rounded-t-none focus:outline-none focus:ring-1 focus:ring-rose-500 text-zinc-100 font-medium leading-relaxed resize-none"
        />

        <div className="space-y-1.5 pt-1.5">
          <Label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{t('sigLabel')}</Label>
          <Input
            value={signatureText}
            onChange={(e) => setSignatureText(e.target.value)}
            className="h-8 text-xs border-zinc-800 bg-zinc-900/60 focus-visible:ring-rose-500 text-zinc-200"
          />
        </div>

        {/* Speed settings */}
        <div className="space-y-1.5 pt-1">
          <Label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{t('speed')}</Label>
          <select 
            value={typingSpeed} 
            onChange={(e) => setTypingSpeed(e.target.value as TypingSpeed)}
            className="w-full h-8 px-2 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
          >
            <option value="slow" className="bg-zinc-950 text-zinc-200">{t('slow')}</option>
            <option value="medium" className="bg-zinc-950 text-zinc-200">{t('medium')}</option>
            <option value="fast" className="bg-zinc-950 text-zinc-200">{t('fast')}</option>
            <option value="skip" className="bg-zinc-950 text-zinc-200">{t('skip')}</option>
          </select>
        </div>
      </div>

      {/* 5. Embedded voice note recorder */}
      <div className="border-t border-zinc-900/80 pt-3.5">
        <VoiceRecorder />
      </div>

      {/* 6. Photo Memories slider */}
      <div className="space-y-2 border-t border-zinc-900/80 pt-3.5">
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider pl-0.5">
          <Image className="h-3.5 w-3.5 text-zinc-500" />
          <span>{t('photos')}</span>
        </div>

        <select 
          value={photoLayout} 
          onChange={(e) => setPhotoLayout(e.target.value as PhotoLayout)}
          className="w-full h-8 px-2 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
        >
          <option value="polaroid" className="bg-zinc-950 text-zinc-200">Polaroid Card</option>
          <option value="single" className="bg-zinc-950 text-zinc-200">Single Photo Frame</option>
          <option value="grid" className="bg-zinc-950 text-zinc-200">Photo Grid (2x2)</option>
          <option value="heart" className="bg-zinc-950 text-zinc-200">Heart Shaped Frame</option>
          <option value="filmstrip" className="bg-zinc-950 text-zinc-200">Retro Film Strip</option>
          <option value="collage" className="bg-zinc-950 text-zinc-200">Drifting Collage</option>
        </select>

        {/* Add photo card layout */}
        <div className="space-y-2 p-2.5 border border-zinc-900 bg-zinc-900/10 rounded-lg">
          <Input
            value={photoUrlInput}
            onChange={(e) => setPhotoUrlInput(e.target.value)}
            placeholder="Image URL (e.g. Unsplash)"
            className="h-7 text-[10px] border-zinc-850 bg-zinc-900 text-zinc-200 pl-2 focus-visible:ring-rose-500"
          />
          <div className="flex items-center gap-2">
            <Input
              value={photoCaptionInput}
              onChange={(e) => setPhotoCaptionInput(e.target.value)}
              placeholder="Caption text"
              className="h-7 text-[10px] border-zinc-850 bg-zinc-900 text-zinc-200 pl-2 focus-visible:ring-rose-500 flex-1"
            />
            <Button
              onClick={handleAddPhotoMemory}
              className="h-7 px-2.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] gap-1 rounded-md cursor-pointer font-bold shrink-0"
            >
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>
        </div>

        {/* Existing photos preview list */}
        {photos.length > 0 && (
          <div className="space-y-1.5 pl-0.5">
            {photos.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-850">
                <span className="text-[10px] truncate max-w-[180px] font-medium text-zinc-300">
                  📷 {p.caption || 'Image memory'}
                </span>
                <button
                  onClick={() => removePhoto(p.id)}
                  className="text-zinc-500 hover:text-rose-400 cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Gift items add-on attachments */}
      <div className="space-y-2.5 border-t border-zinc-900/80 pt-3.5">
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider pl-0.5">
          <Gift className="h-3.5 w-3.5 text-zinc-500" />
          <span>{t('gifts')}</span>
        </div>

        <div className="space-y-1.5 p-2.5 bg-zinc-900/10 border border-zinc-900 rounded-lg">
          {GIFT_CATALOG.map((g) => {
            const isChecked = attachedGifts.includes(g.id);
            return (
              <div key={g.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`gift-${g.id}`}
                    checked={isChecked}
                    onChange={() => toggleAttachedGift(g.id)}
                    className="h-3.5 w-3.5 rounded border-zinc-800 text-rose-600 bg-zinc-900 focus:ring-rose-500 cursor-pointer accent-rose-500"
                  />
                  <Label 
                    htmlFor={`gift-${g.id}`}
                    className="text-xs text-zinc-300 cursor-pointer font-medium"
                  >
                    {g.label}
                  </Label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Special background ambient effects */}
      <div className="space-y-2 border-t border-zinc-900/80 pt-3.5">
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider pl-0.5">
          <Sparkles className="h-3.5 w-3.5 text-zinc-500" />
          <span>{t('effect')}</span>
        </div>

        <select 
          value={effectType} 
          onChange={(e) => setEffectType(e.target.value as EffectType)}
          className="w-full h-8 px-2 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
        >
          {EFFECTS.map(eff => (
            <option key={eff.id} value={eff.id} className="bg-zinc-950 text-zinc-200">
              {eff.label}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
}
export default LetterWriter;
