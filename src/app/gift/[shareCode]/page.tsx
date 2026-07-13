'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Music, Send } from 'lucide-react';
import Link from 'next/link';
import {
  WRAPPING_OPTIONS,
  RIBBON_OPTIONS,
  LETTER_TEMPLATES,
  ENVELOPE_OPTIONS,
  EXTRA_OPTIONS,
} from '@/types/bouquet';
import type {
  FlowerItem,
  FillerType,
  WrappingColor,
  RibbonColor,
  ExtraType,
  LetterTemplate,
  EnvelopeStyle,
  BouquetStyle,
} from '@/types/bouquet';
import BouquetPreview from '@/components/create/BouquetPreview';
import { arrangeFlowers } from '@/store/useBouquetStore';
import EnvelopeUnboxer from '@/components/create/EnvelopeUnboxer';

interface GiftData {
  bouquet_style: BouquetStyle;
  flowers: FlowerItem[];
  fillers: FillerType[];
  wrapping: WrappingColor;
  ribbon: RibbonColor;
  extras: ExtraType[];
  letter_template: LetterTemplate;
  recipient_name: string;
  message: string;
  sender_name: string;
  envelope: EnvelopeStyle;
}

export default function RecipientPage() {
  const params = useParams();
  const shareCode = params?.shareCode as string;

  const [gift, setGift] = useState<GiftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Flow stages: 'welcome' | 'open'
  const [stage, setStage] = useState<'welcome' | 'open'>('welcome');
  const [unboxingFinished, setUnboxingFinished] = useState(false);

  const [reactions, setReactions] = useState<{ emoji: string; count: number }[]>([
    { emoji: '❤️', count: 0 },
    { emoji: '😭', count: 0 },
    { emoji: '🥰', count: 0 },
    { emoji: '😍', count: 0 },
    { emoji: '💐', count: 0 },
  ]);

  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<{ text: string; time: string }[]>([]);
  const [musicOn, setMusicOn] = useState(false);
  const normalizedFlowers = useMemo(() => {
    if (!gift?.flowers) return [];
    
    const normalized = gift.flowers.map((f: any, i) => {
      if (typeof f === 'string') {
        return {
          id: `${f}-${i}`,
          type: f as any,
          x: 50,
          y: 36,
          rotation: 0,
          scale: 1,
          zIndex: i,
        };
      }
      return {
        id: f.id || `${f.type}-${i}`,
        type: f.type,
        x: typeof f.x === 'number' ? f.x : 50,
        y: typeof f.y === 'number' ? f.y : 36,
        rotation: typeof f.rotation === 'number' ? f.rotation : 0,
        scale: typeof f.scale === 'number' ? f.scale : 1,
        zIndex: typeof f.zIndex === 'number' ? f.zIndex : i,
      };
    });

    const needsArrangement = gift.flowers.some(
      (f: any) => typeof f === 'string' || typeof f.x !== 'number'
    );

    if (needsArrangement) {
      return arrangeFlowers(normalized, 'dome');
    }
    
    return normalized;
  }, [gift?.flowers]);
  useEffect(() => {
    if (shareCode) {
      fetchGift();
    }
  }, [shareCode]);

  const fetchGift = async () => {
    try {
      // Decode compressed base64url fallback codes instantly client-side without API latency
      if (shareCode && shareCode.startsWith('u_')) {
        try {
          const base64Str = shareCode.slice(2);
          const base64 = base64Str.replace(/-/g, '+').replace(/_/g, '/');
          const jsonStr = decodeURIComponent(
            escape(window.atob(base64))
          );
          const decoded = JSON.parse(jsonStr);
          
          const gift = {
            bouquet_style: decoded.sty || 'classic',
            flowers: (decoded.fl || []).map((arr: any, i: number) => ({
              id: `${arr[0]}-${i}-${Math.random().toString(36).slice(2, 6)}`,
              type: arr[0],
              x: arr[1],
              y: arr[2],
              rotation: arr[3],
              scale: arr[4],
              zIndex: 20 + i,
            })),
            fillers: decoded.fi || ['baby_breath', 'green_leaves', 'eucalyptus'],
            wrapping: decoded.wr || 'white',
            ribbon: decoded.ri || 'pink',
            extras: decoded.ex || [],
            letter_template: decoded.lt || 'love',
            recipient_name: decoded.rec || '',
            message: decoded.msg || '',
            sender_name: decoded.sen || '',
            envelope: decoded.ev || 'classic',
          };
          setGift(gift);
          setLoading(false);
          return;
        } catch (err) {
          console.error('Failed to decode fallback link client-side:', err);
          // Fall back to API fetch if decoding fails
        }
      }

      // Try fetching from API
      const res = await fetch(`/api/gifts?code=${shareCode}`);
      if (res.ok) {
        const { gift } = await res.json();
        setGift(gift);
      } else {
        // Try decoding older legacy base64 URL fallback
        try {
          const base64 = shareCode.replace(/-/g, '+').replace(/_/g, '/');
          const jsonStr = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decoded = JSON.parse(jsonStr);
          setGift(decoded);
        } catch (err) {
          console.error('Failed to decode fallback link:', err);
          setError(true);
        }
      }
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Auto scroll down to the letter once unboxing finishes
  useEffect(() => {
    if (unboxingFinished) {
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth',
        });
      }, 350);
    }
  }, [unboxingFinished]);

  const addReaction = (idx: number) => {
    setReactions((r) =>
      r.map((item, i) => (i === idx ? { ...item, count: item.count + 1 } : item))
    );
  };

  const addComment = () => {
    if (!comment.trim()) return;
    setComments((c) => [...c, { text: comment.trim(), time: 'Just now' }]);
    setComment('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf6f0]">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="text-6xl select-none"
        >
          🌸
        </motion.div>
      </div>
    );
  }

  if (error || !gift) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#faf6f0] px-6">
        <span className="text-6xl">🥀</span>
        <h1 className="text-2xl font-heading text-rose-900 text-center">
          This bouquet could not be found
        </h1>
        <p className="text-stone-500 text-sm text-center">
          The link may be corrupted, truncated, or has expired.
        </p>
        <Link
          href="/"
          className="mt-4 px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md transition-colors"
        >
          Create a New Bouquet
        </Link>
      </div>
    );
  }

  const templateDef =
    LETTER_TEMPLATES.find((t) => t.id === gift.letter_template) || LETTER_TEMPLATES[0];
  const envelopeDef =
    ENVELOPE_OPTIONS.find((e) => e.id === gift.envelope) || ENVELOPE_OPTIONS[0];

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: '#faf6f0', color: '#44382e' }}>
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: '#fed7aa' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: '#fbcfe8' }} />
      </div>

      {/* Floating petals */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-25">
        {['🌸', '🌹', '🌷', '🌿', '🌼'].map((petal, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl select-none"
            style={{ left: `${15 + i * 20}%` }}
            animate={{
              y: ['-10vh', '110vh'],
              x: [`${15 + i * 20}%`, `${15 + i * 20 + (i % 2 === 0 ? 5 : -5)}%`],
              rotate: [0, 360],
            }}
            transition={{
              duration: 20 + i * 4,
              repeat: Infinity,
              delay: i * 2.5,
              ease: 'linear',
            }}
          >
            {petal}
          </motion.div>
        ))}
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        <AnimatePresence mode="wait">
          {stage === 'welcome' ? (
            /* STAGE: Welcome Screen */
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.7 }}
              className="text-center space-y-6 max-w-md w-full"
            >
              <motion.div
                animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.06, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="text-7xl select-none"
              >
                💐
              </motion.div>
              <div className="space-y-2">
                <span className="text-[11px] tracking-widest text-rose-400 uppercase font-semibold block">
                  A beautiful gift is waiting
                </span>
                <h1 className="text-4xl md:text-5xl font-heading text-rose-900 leading-snug">
                  {gift.recipient_name ? (
                    <>
                      Hello, <em className="not-italic text-rose-500 font-semibold">{gift.recipient_name}</em> 🌸
                    </>
                  ) : (
                    <>Someone made a bouquet for you</>
                  )}
                </h1>
                <p className="text-stone-500 text-sm">
                  {gift.sender_name
                    ? `From ${gift.sender_name}, wrapped with love and care.`
                    : 'Created and sealed with love.'}
                </p>
              </div>

              <motion.button
                onClick={() => setStage('open')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-4 rounded-full text-white text-sm font-semibold shadow-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
                  boxShadow: '0 6px 20px rgba(225,29,72,0.25)',
                }}
              >
                Open your gift ✨
              </motion.button>
            </motion.div>
          ) : (
            /* STAGE: Open Bouquet & Envelope View */
            <motion.div
              key="open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-5xl mx-auto"
            >
              {/* Header Title */}
              <div className="text-center mb-8 space-y-2">
                <span className="text-xs uppercase font-bold tracking-widest text-rose-400 block">
                  BloomBox
                </span>
                <h2 className="text-3xl md:text-5xl font-heading text-rose-900 leading-snug">
                  Hi, I made this bouquet for you!
                </h2>
                {gift.sender_name && (
                  <p className="font-serif text-lg text-rose-400 italic">
                    A special gift from {gift.sender_name}
                  </p>
                )}
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Bouquet Preview */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="lg:col-span-6 flex flex-col items-center justify-center bg-white rounded-3xl p-6 shadow-md border border-rose-100/50"
                >
                  <h3 className="font-heading text-xl text-stone-700 mb-4 self-start pl-2">
                    Your Bouquet
                  </h3>
                  <div className="w-full max-w-85 aspect-3/4 relative">
                    <BouquetPreview
                      style={gift.bouquet_style}
                      flowers={normalizedFlowers}
                      fillers={gift.fillers}
                      wrapping={gift.wrapping}
                      ribbon={gift.ribbon}
                      extras={gift.extras}
                    />
                  </div>
                </motion.div>

                {/* Right Column: Envelope & Letter */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="lg:col-span-6 space-y-6"
                >
                  <div className="bg-white rounded-3xl p-6 shadow-md border border-rose-100/50 space-y-4">
                    <h3 className="font-heading text-xl text-rose-900 border-b border-rose-100 pb-2">
                      Handwritten Letter
                    </h3>
                    <EnvelopeUnboxer
                      envelope={gift.envelope}
                      letterTemplate={gift.letter_template}
                      recipientName={gift.recipient_name}
                      message={gift.message}
                      senderName={gift.sender_name}
                      onComplete={() => setUnboxingFinished(true)}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Reactions & Comments (Once message typing finishes) */}
              {unboxingFinished && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mt-16 space-y-8 max-w-2xl mx-auto w-full"
                >
                  {/* React Section */}
                  <div className="text-center space-y-4">
                    <h3 className="text-xs font-semibold tracking-wider text-stone-400 uppercase">
                      Send a reaction back
                    </h3>
                    <div className="flex justify-center gap-4">
                      {reactions.map((r, i) => (
                        <motion.button
                          key={r.emoji}
                          onClick={() => addReaction(i)}
                          whileHover={{ scale: 1.25 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white border border-rose-100/40 shadow-sm cursor-pointer hover:bg-rose-50"
                        >
                          <span className="text-3xl select-none">{r.emoji}</span>
                          {r.count > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-xs font-semibold text-rose-500"
                            >
                              {r.count}
                            </motion.span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Reply / Comment Box */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold tracking-wider text-stone-400 uppercase text-center">
                      Leave a comment
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addComment()}
                        placeholder="Write a sweet message back..."
                        className="flex-1 rounded-full px-5 py-3 text-sm border border-stone-200 focus:border-rose-300 outline-none bg-white shadow-inner"
                        style={{ fontFamily: 'var(--font-caveat, cursive)', fontSize: '18px' }}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addComment}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white cursor-pointer shadow-md"
                        style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}
                      >
                        <Send className="h-4 w-4" />
                      </motion.button>
                    </div>

                    {/* List of comments */}
                    <div className="space-y-3 pt-2">
                      {comments.map((c, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100"
                        >
                          <p className="text-stone-700" style={{ fontFamily: 'var(--font-caveat, cursive)', fontSize: '18px' }}>
                            {c.text}
                          </p>
                          <span className="text-[10px] text-stone-400 block mt-1">
                            {c.time}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Monospace elegant footer credit */}
                  <div className="text-center pt-8 border-t border-rose-100/40">
                    <p className="font-mono text-stone-400 text-xs leading-relaxed uppercase tracking-wider">
                      made with BloomBox, a tool by Divya
                    </p>
                    <p className="mt-2">
                      <Link
                        href="/"
                        className="font-mono text-xs text-rose-500 hover:text-rose-600 font-bold uppercase tracking-widest underline decoration-2 underline-offset-4 decoration-rose-200 hover:decoration-rose-400 transition-colors"
                      >
                        create a bouquet now!
                      </Link>
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Music Controller */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => setMusicOn(!musicOn)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="w-12 h-12 rounded-full shadow-md flex items-center justify-center border transition-all cursor-pointer"
          style={{
            background: musicOn ? 'linear-gradient(135deg, #e11d48, #f43f5e)' : '#ffffff',
            borderColor: '#fecdd3',
          }}
        >
          <Music className="h-5 w-5" style={{ color: musicOn ? '#ffffff' : '#e11d48' }} />
        </motion.button>
      </div>

      {/* Ambient background track player */}
      {musicOn && (
        <audio
          autoPlay
          loop
          src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
}

// ── SUB-COMPONENT: Envelope Display ──────────────────────────────────────────

function EnvelopeDisplay({
  envelopeDef,
  isOpen,
  onClick,
}: {
  envelopeDef: any;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="relative w-72 h-44 cursor-pointer select-none transition-transform hover:scale-[1.03] active:scale-[0.98] z-10"
    >
      {/* Outer Envelope body pocket */}
      <div
        onClick={onClick}
        className="absolute inset-0 rounded-2xl shadow-xl overflow-hidden border border-stone-200/40"
        style={{ backgroundColor: envelopeDef.color }}
      >
        {/* Bottom folding crease shadow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[64px]"
          style={{
            background: `${envelopeDef.flapColor}15`,
            clipPath: 'polygon(0% 0%, 50% 100%, 100% 0%)',
          }}
        />
        {/* Left folding crease shadow */}
        <div
          className="absolute bottom-0 left-0 w-1/2 h-full"
          style={{
            background: `${envelopeDef.flapColor}08`,
            clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)',
          }}
        />
        {/* Right folding crease shadow */}
        <div
          className="absolute bottom-0 right-0 w-1/2 h-full"
          style={{
            background: `${envelopeDef.flapColor}08`,
            clipPath: 'polygon(0% 50%, 100% 0%, 100% 100%)',
          }}
        />
        {/* Sealed central wax/heart stamp */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full w-8 h-8 flex items-center justify-center shadow-md z-30 select-none cursor-pointer hover:scale-110 active:scale-95 transition-transform"
          style={{
            backgroundColor: envelopeDef.flapColor,
            border: `2px solid ${envelopeDef.color}`,
          }}
        >
          {envelopeDef.id === 'wax_seal' ? '🔴' : envelopeDef.id === 'heart_seal' ? '❤️' : '❤'}
        </div>
      </div>

      {/* Top Folding flap */}
      <motion.div
        onClick={onClick}
        className="absolute top-0 left-0 right-0 origin-top z-20 cursor-pointer"
        style={{
          height: '60%',
          background: envelopeDef.flapColor,
          clipPath: 'polygon(0% 0%, 50% 100%, 100% 0%)',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
        } as any}
        animate={isOpen ? { rotateX: -180, y: -2, zIndex: 0 } : { rotateX: 0, y: 0, zIndex: 20 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
