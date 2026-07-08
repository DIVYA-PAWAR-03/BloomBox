"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGiftStore } from '@/store/useGiftStore';
import { useTranslations } from '@/lib/i18n';
import { AmbientEffects } from './ambient-effects';
import { Button } from '@/components/ui/button';
import { 
  X, Play, Pause, Volume2, VolumeX, Sparkles, Gift, Heart, Music
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function GiftPreviewOverlay() {
  const isPreviewOpen = useGiftStore((s) => s.isPreviewOpen);
  const setIsPreviewOpen = useGiftStore((s) => s.setIsPreviewOpen);
  
  const { t: tEnv } = useTranslations('envelope');
  const { t } = useTranslations('common');

  // Envelope details
  const envelopeColor = useGiftStore((s) => s.envelopeColor);
  const envelopeTexture = useGiftStore((s) => s.envelopeTexture);
  const waxSealType = useGiftStore((s) => s.waxSealType);
  const sealColor = useGiftStore((s) => s.sealColor);
  const ribbonColor = useGiftStore((s) => s.ribbonColor);
  const envelopeStickers = useGiftStore((s) => s.envelopeStickers);

  // Letter details
  const letterTemplate = useGiftStore((s) => s.letterTemplate);
  const fontFamily = useGiftStore((s) => s.fontFamily);
  const fontSize = useGiftStore((s) => s.fontSize);
  const textColor = useGiftStore((s) => s.textColor);
  const textContent = useGiftStore((s) => s.textContent);
  const signatureText = useGiftStore((s) => s.signatureText);
  const typingSpeed = useGiftStore((s) => s.typingSpeed);
  const effectType = useGiftStore((s) => s.effectType);

  // Voice details
  const voiceUrl = useGiftStore((s) => s.voiceUrl);

  // Background Music
  const musicUrl = useGiftStore((s) => s.musicUrl);
  const musicTitle = useGiftStore((s) => s.musicTitle);
  const musicVolume = useGiftStore((s) => s.musicVolume);

  // Photos & Attachments
  const photos = useGiftStore((s) => s.photos);
  const photoLayout = useGiftStore((s) => s.photoLayout);
  const attachedGifts = useGiftStore((s) => s.attachedGifts);

  // Opening animation stages: 
  // 'sealed' -> 'lifted' -> 'seal_cracked' -> 'flap_opened' -> 'sliding_up' -> 'letter_opened'
  const [openingStage, setOpeningStage] = useState<'sealed' | 'lifted' | 'seal_cracked' | 'flap_opened' | 'sliding_up' | 'letter_opened'>('sealed');

  // Typing animation states
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio players refs
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const voicePlayerRef = useRef<HTMLAudioElement | null>(null);
  const [bgMusicMuted, setBgMusicMuted] = useState(false);
  const [bgMusicPlaying, setBgMusicPlaying] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);

  // Interactive wiggles
  const [teddyWiggle, setTeddyWiggle] = useState(false);
  const [chocolateOpen, setChocolateOpen] = useState(false);
  const [balloonHover, setBalloonHover] = useState(false);
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);
  const [heartsList, setHeartsList] = useState<{ id: number; x: number; y: number }[]>([]);

  // 1. Synthesize sound effects using Web Audio API
  const playCrackSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.12);
      
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  };

  const playRustleSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const bufferSize = ctx.sampleRate * 0.25; // 250ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start();
    } catch {}
  };

  // 2. Play Background Music & Voice notes
  const startBackgroundMusic = () => {
    if (!musicUrl) return;
    bgMusicRef.current = new Audio(musicUrl);
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0; // Start muted for fade-in!
    bgMusicRef.current.play()
      .then(() => {
        setBgMusicPlaying(true);
        // Fade-in volume over 2 seconds
        let currentVol = 0;
        const interval = setInterval(() => {
          if (!bgMusicRef.current) {
            clearInterval(interval);
            return;
          }
          currentVol += 0.05;
          if (currentVol >= musicVolume) {
            bgMusicRef.current.volume = musicVolume;
            clearInterval(interval);
          } else {
            bgMusicRef.current.volume = currentVol;
          }
        }, 100);
      })
      .catch((err) => console.log('Autoplay blocked:', err));
  };

  const toggleBgMusic = () => {
    if (bgMusicRef.current) {
      if (bgMusicMuted) {
        bgMusicRef.current.muted = false;
        setBgMusicMuted(false);
      } else {
        bgMusicRef.current.muted = true;
        setBgMusicMuted(true);
      }
    }
  };

  const toggleVoiceNote = () => {
    if (!voiceUrl) return;

    if (!voicePlayerRef.current) {
      voicePlayerRef.current = new Audio(voiceUrl);
      voicePlayerRef.current.onended = () => setVoicePlaying(false);
    }

    if (voicePlaying) {
      voicePlayerRef.current.pause();
      setVoicePlaying(false);
    } else {
      voicePlayerRef.current.play();
      setVoicePlaying(true);
      
      // Duck background music volume during voice note playback
      if (bgMusicRef.current && !bgMusicMuted) {
        bgMusicRef.current.volume = musicVolume * 0.2;
      }
    }
  };

  // Restore music volume on voice note end
  useEffect(() => {
    if (!voicePlaying && bgMusicRef.current && !bgMusicMuted) {
      bgMusicRef.current.volume = musicVolume;
    }
  }, [voicePlaying, musicVolume, bgMusicMuted]);

  // 3. Envelope opening orchestration flow
  const handleEnvelopeClick = () => {
    if (openingStage !== 'sealed') return;

    // A: Lift up
    setOpeningStage('lifted');
    playRustleSound();

    // B: Break seal stamp
    setTimeout(() => {
      setOpeningStage('seal_cracked');
      playCrackSound();
      
      // Micro-confetti burst
      confetti({
        particleCount: 20,
        spread: 30,
        origin: { y: 0.55 }
      });
    }, 800);

    // C: Open flap
    setTimeout(() => {
      setOpeningStage('flap_opened');
      playRustleSound();
    }, 1500);

    // D: Slide paper out
    setTimeout(() => {
      setOpeningStage('sliding_up');
      playRustleSound();
    }, 2200);

    // E: Complete unboxing, slide full letter into view
    setTimeout(() => {
      setOpeningStage('letter_opened');
      startBackgroundMusic();
      
      // Start ambient particles
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.3 }
      });

      // Start typing letter content
      triggerTyping();
    }, 3100);
  };

  // 4. Character-by-character typing animation
  const triggerTyping = () => {
    if (typingSpeed === 'skip') {
      setDisplayedText(textContent);
      setIsTypingComplete(true);
      return;
    }

    let delay = 40; // medium
    if (typingSpeed === 'slow') delay = 85;
    if (typingSpeed === 'fast') delay = 15;

    let index = 0;
    setDisplayedText('');
    setIsTypingComplete(false);

    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    typingIntervalRef.current = setInterval(() => {
      // Check for HTML tags block to print them instantly
      if (textContent.charAt(index) === '<') {
        const closeIndex = textContent.indexOf('>', index);
        if (closeIndex !== -1) {
          index = closeIndex + 1;
        }
      } else {
        index++;
      }

      setDisplayedText(textContent.slice(0, index));

      if (index >= textContent.length) {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        setIsTypingComplete(true);
      }
    }, delay);
  };

  const skipTyping = () => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    setDisplayedText(textContent);
    setIsTypingComplete(true);
  };

  // Floating heart clicking effect
  const handleHeartClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newHeart = { id: Date.now(), x, y };
    setHeartsList((prev) => [...prev, newHeart]);
    
    // Remove heart after animation completes
    setTimeout(() => {
      setHeartsList((prev) => prev.filter(h => h.id !== newHeart.id));
    }, 1200);
  };

  // Clean up timers & music players on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
      if (voicePlayerRef.current) {
        voicePlayerRef.current.pause();
        voicePlayerRef.current = null;
      }
    };
  }, []);

  if (!isPreviewOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden select-none">
      
      {/* Particle overlay */}
      {openingStage === 'letter_opened' && (
        <AmbientEffects type={effectType} />
      )}

      {/* Top navbar controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          {openingStage === 'letter_opened' && musicUrl && (
            <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800 px-3 py-1 rounded-full text-[11px] font-semibold text-zinc-300">
              <Music className={`h-3 w-3 text-rose-500 ${bgMusicPlaying && !bgMusicMuted ? 'animate-spin' : ''}`} />
              <span className="truncate max-w-[120px]">{musicTitle}</span>
              <button 
                onClick={toggleBgMusic}
                className="text-zinc-500 hover:text-white cursor-pointer ml-1"
              >
                {bgMusicMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          )}
        </div>

        <Button
          onClick={() => setIsPreviewOpen(false)}
          variant="outline"
          size="icon"
          className="h-8 w-8 border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white rounded-full cursor-pointer"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative w-full max-w-lg flex flex-col items-center justify-center px-4">
        
        {/* ==================================================== */}
        {/* STAGE A: ENVELOPE OPENING ANIMATIONS */}
        {/* ==================================================== */}
        {openingStage !== 'letter_opened' && (
          <div className="flex flex-col items-center gap-6">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest animate-pulse">
              {openingStage === 'sealed' ? tEnv('clickOpen') : tEnv(openingStage === 'lifted' ? 'opening' : 'unfolding')}
            </span>

            <motion.div
              onClick={handleEnvelopeClick}
              initial={{ scale: 0.8, y: 100, rotate: -8, opacity: 0 }}
              animate={{
                scale: openingStage === 'sealed' ? [0.95, 1, 0.95] : 1.05,
                y: openingStage === 'sealed' ? 0 : openingStage === 'lifted' ? -40 : 0,
                rotate: 0,
                opacity: 1
              }}
              transition={{
                scale: openingStage === 'sealed' ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : { type: 'spring', stiffness: 80 },
                y: { type: 'spring', stiffness: 90, damping: 12 }
              }}
              className={`w-[360px] h-[220px] relative rounded-xl shadow-2xl cursor-pointer overflow-hidden border border-white/5 flex items-center justify-center`}
              style={{
                backgroundColor: envelopeColor,
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.65)'
              }}
            >
              {/* Paper texture overlay */}
              {envelopeTexture !== 'smooth' && (
                <div className={`absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none`} />
              )}

              {/* Envelope flap folds details */}
              {/* Left triangle */}
              <div className="absolute left-0 bottom-0 top-0 w-0 h-0 border-t-[110px] border-t-transparent border-b-[110px] border-b-transparent border-l-[180px] opacity-15 pointer-events-none" style={{ borderLeftColor: 'black' }} />
              
              {/* Right triangle */}
              <div className="absolute right-0 bottom-0 top-0 w-0 h-0 border-t-[110px] border-t-transparent border-b-[110px] border-b-transparent border-r-[180px] opacity-15 pointer-events-none" style={{ borderRightColor: 'black' }} />
              
              {/* Bottom triangle */}
              <div className="absolute left-0 right-0 bottom-0 h-0 w-0 border-l-[180px] border-l-transparent border-r-[180px] border-r-transparent border-b-[110px] opacity-25 pointer-events-none" style={{ borderBottomColor: 'black' }} />

              {/* Top Flap pivoting open (uses rotateX) */}
              <motion.div
                initial={{ rotateX: 0 }}
                animate={{ rotateX: openingStage === 'flap_opened' || openingStage === 'sliding_up' ? 180 : 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="absolute top-0 left-0 right-0 h-[110px] origin-top z-25 pointer-events-none w-0 h-0 border-l-[180px] border-l-transparent border-r-[180px] border-r-transparent border-t-[110px]"
                style={{
                  borderTopColor: envelopeColor,
                  filter: 'brightness(0.85)'
                }}
              />

              {/* Ribbon decoration */}
              {ribbonColor !== 'none' && (
                <div 
                  className="absolute left-0 right-0 h-8 opacity-90 z-20 pointer-events-none shadow"
                  style={{ backgroundColor: ribbonColor, top: '40%' }}
                />
              )}

              {/* Emojis/Stickers scattered */}
              {envelopeStickers.map((stk, idx) => (
                <div
                  key={idx}
                  className="absolute text-xl pointer-events-none z-22 select-none filter drop-shadow-md"
                  style={{
                    left: `${20 + (idx * 28) % 65}%`,
                    top: `${15 + (idx * 35) % 60}%`,
                    transform: `rotate(${(idx * 15) % 45}deg)`
                  }}
                >
                  {stk}
                </div>
              ))}

              {/* Wax Seal Stamp (popping away on crack) */}
              {waxSealType !== 'none' && (
                <motion.div
                  animate={{
                    scale: openingStage === 'sealed' || openingStage === 'lifted' ? 1 : 0,
                    opacity: openingStage === 'sealed' || openingStage === 'lifted' ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="absolute h-12 w-12 rounded-full border border-black/10 flex items-center justify-center text-2xl font-bold z-26 shadow-lg shadow-black/40 cursor-pointer select-none active:scale-95"
                  style={{
                    backgroundColor: sealColor,
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)'
                  }}
                >
                  {waxSealType === 'rose' && '🌹'}
                  {waxSealType === 'heart' && '❤️'}
                  {waxSealType === 'ring' && '💍'}
                  {waxSealType === 'star' && '⭐'}
                </motion.div>
              )}

              {/* Sliding Letter (revealing upwards) */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{
                  y: openingStage === 'sliding_up' ? -180 : 20,
                  opacity: openingStage === 'sliding_up' ? 1 : 0,
                  scale: openingStage === 'sliding_up' ? 0.9 : 0.8
                }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="absolute w-[320px] h-[180px] bg-amber-50 rounded-lg p-4 border border-zinc-200 z-10 flex flex-col justify-between"
              >
                <div className="h-1.5 w-16 bg-zinc-200 rounded" />
                <div className="space-y-1.5 flex-1 pt-3">
                  <div className="h-1 w-full bg-zinc-200 rounded" />
                  <div className="h-1 w-5/6 bg-zinc-200 rounded" />
                </div>
                <div className="h-2 w-10 bg-zinc-300 rounded self-end" />
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STAGE B: UNFOLDED LETTER & INTERACTIVE MOMENTS */}
        {/* ==================================================== */}
        {openingStage === 'letter_opened' && (
          <motion.div
            initial={{ scale: 0.6, y: 150, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 70, damping: 14 }}
            className="w-full relative"
          >
            
            {/* Ambient photos sliding in from sides */}
            {photos.length > 0 && (
              <div className="hidden lg:block absolute -left-64 top-4 space-y-6 max-w-[220px]">
                {photos.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ x: -80, opacity: 0, rotate: -15 }}
                    animate={{ x: 0, opacity: 1, rotate: idx % 2 === 0 ? -6 : 8 }}
                    transition={{ delay: 0.6 + idx * 0.4 }}
                    onClick={() => setZoomedPhoto(p.url)}
                    className="p-3 bg-white border border-zinc-200 shadow-xl rounded-sm cursor-zoom-in hover:scale-105 transition-transform"
                  >
                    <img 
                      src={p.url} 
                      alt="memory" 
                      className="w-full h-28 object-cover rounded-sm pointer-events-none" 
                    />
                    <div className="text-[10px] font-bold text-zinc-700 font-mono tracking-tight text-center mt-2.5">
                      {p.caption || 'Memory card'}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Mobile photo memories inline header */}
            {photos.length > 0 && (
              <div className="lg:hidden w-full flex gap-3 overflow-x-auto pb-4 scrollbar-none scroll-smooth">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setZoomedPhoto(p.url)}
                    className="p-2.5 bg-white border border-zinc-200 shadow-md rounded-sm min-w-[140px] shrink-0 cursor-zoom-in"
                  >
                    <img src={p.url} className="w-full h-20 object-cover rounded-sm" />
                    <p className="text-[9px] font-bold text-zinc-600 text-center mt-2">{p.caption}</p>
                  </div>
                ))}
              </div>
            )}

            {/* The Main Letter Sheet */}
            <div 
              className={`w-full bg-amber-50/95 border-2 border-zinc-200 rounded-xl p-8 shadow-2xl relative select-text`}
              style={{
                fontFamily: fontFamily,
                color: textColor,
                boxShadow: '0 30px 60px -15px rgba(0,0,0,0.8)'
              }}
            >
              {/* Gold border frame wrapper style */}
              {letterTemplate === 'royal' && (
                <div className="absolute inset-2 border border-amber-600/30 rounded-lg pointer-events-none" />
              )}
              {letterTemplate === 'vintage' && (
                <div className="absolute inset-0 bg-[radial-gradient(#a3a3a3_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-10 rounded-xl pointer-events-none" />
              )}

              {/* Floating hearts wiggler */}
              <div 
                onClick={handleHeartClick}
                className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-full bg-rose-50 border border-rose-100 hover:bg-rose-100/50 cursor-pointer shadow-sm select-none transition-colors"
                title="Click to float hearts"
              >
                <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                
                {/* Floating click hearts */}
                {heartsList.map((h) => (
                  <motion.span
                    key={h.id}
                    initial={{ opacity: 1, scale: 0.5, y: 0 }}
                    animate={{ opacity: 0, scale: 1.5, y: -80, x: -10 + Math.random() * 20 }}
                    transition={{ duration: 1.2 }}
                    className="absolute text-rose-500 text-base"
                    style={{ left: h.x, top: h.y }}
                  >
                    ❤️
                  </motion.span>
                ))}
              </div>

              {/* Letter content text block */}
              <div 
                className="space-y-4 leading-relaxed tracking-wide min-h-[160px]"
                style={{ fontSize: `${fontSize}px` }}
              >
                {/* Typing text string */}
                <p 
                  className="whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: displayedText }}
                />
                
                {/* Typing cursor blink */}
                {!isTypingComplete && (
                  <span className="inline-block w-1.5 h-4 ml-0.5 bg-rose-500 animate-pulse" />
                )}
              </div>

              {/* Signature section */}
              {isTypingComplete && signatureText && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-right mt-8 pt-4 border-t border-zinc-900/5"
                  style={{ fontSize: `${fontSize + 2}px` }}
                >
                  <p className="italic">{signatureText}</p>
                </motion.div>
              )}

              {/* Embedding Voice message player inside letter */}
              {voiceUrl && isTypingComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-3 bg-zinc-950/5 border border-zinc-900/10 rounded-lg flex items-center justify-between gap-3 text-zinc-700"
                >
                  <Button
                    onClick={toggleVoiceNote}
                    size="icon"
                    className="h-8 w-8 bg-rose-600 hover:bg-rose-500 text-white rounded-full cursor-pointer"
                  >
                    {voicePlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current pl-0.5" />}
                  </Button>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Sender Voice Message</p>
                    <p className="text-xs font-semibold mt-0.5">Click to play voice note</p>
                  </div>
                </motion.div>
              )}

              {/* Skip Animation button trigger */}
              {!isTypingComplete && (
                <button
                  onClick={skipTyping}
                  className="absolute bottom-3 left-4 text-[9px] font-bold text-zinc-400 hover:text-rose-500 uppercase tracking-widest cursor-pointer"
                >
                  {t('letter.skipAnim')}
                </button>
              )}
            </div>

            {/* Attached table gifts decorations under the letter */}
            {attachedGifts.length > 0 && isTypingComplete && (
              <div className="w-full mt-6 bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 flex flex-wrap justify-center gap-4">
                {attachedGifts.includes('teddy') && (
                  <motion.div
                    animate={{ rotate: teddyWiggle ? [0, -12, 12, -12, 0] : 0 }}
                    onClick={() => { setTeddyWiggle(true); setTimeout(() => setTeddyWiggle(false), 800); }}
                    className="flex flex-col items-center cursor-pointer select-none hover:scale-105 transition-transform"
                    title="Click Teddy to wave"
                  >
                    <span className="text-4xl">🧸</span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-1.5">Teddy</span>
                  </motion.div>
                )}

                {attachedGifts.includes('chocolate') && (
                  <div
                    onClick={() => setChocolateOpen(!chocolateOpen)}
                    className="flex flex-col items-center cursor-pointer select-none hover:scale-105 transition-transform"
                    title="Click to open wrapper"
                  >
                    <span className="text-4xl">{chocolateOpen ? '🍫' : '📦'}</span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-1.5">
                      {chocolateOpen ? 'Opened' : 'Chocolate'}
                    </span>
                  </div>
                )}

                {attachedGifts.includes('cake') && (
                  <div className="flex flex-col items-center select-none">
                    <span className="text-4xl animate-bounce">🎂</span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-1.5">Sparkler Cake</span>
                  </div>
                )}

                {attachedGifts.includes('balloons') && (
                  <motion.div
                    animate={{ y: balloonHover ? -8 : 0 }}
                    onMouseEnter={() => setBalloonHover(true)}
                    onMouseLeave={() => setBalloonHover(false)}
                    className="flex flex-col items-center select-none"
                  >
                    <span className="text-4xl">🎈</span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-1.5">Balloons</span>
                  </motion.div>
                )}
                
                {/* Standard other gifts */}
                {attachedGifts.filter(g => !['teddy', 'chocolate', 'cake', 'balloons'].includes(g)).map((g) => (
                  <div key={g} className="flex flex-col items-center select-none">
                    <span className="text-3xl">
                      {g === 'ring' && '💍'}
                      {g === 'necklace' && '📿'}
                      {g === 'perfume' && '🧪'}
                      {g === 'gift_card' && '🎫'}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-1.5 capitalize">{g}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Photo Memory zoom overlay modal */}
      <AnimatePresence>
        {zoomedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedPhoto(null)}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img 
              src={zoomedPhoto} 
              alt="zoomed" 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="max-w-full max-h-[85vh] object-contain rounded-lg border border-white/10" 
            />
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
export default GiftPreviewOverlay;
