'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBouquetStore } from '@/store/useBouquetStore';
import BouquetPreview from '../BouquetPreview';
import EnvelopeUnboxer from '../EnvelopeUnboxer';
import {
  BOUQUET_STYLES,
  WRAPPING_OPTIONS,
  RIBBON_OPTIONS,
  LETTER_TEMPLATES,
  ENVELOPE_OPTIONS,
  EXTRA_OPTIONS,
} from '@/types/bouquet';
import { Copy, Send, Mail, Heart, Check, Sparkles, Loader2 } from 'lucide-react';

export default function Step9Preview() {
  const store = useBouquetStore();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const styleDef = BOUQUET_STYLES.find((s) => s.style === store.bouquetStyle);
  const wrappingDef = WRAPPING_OPTIONS.find((w) => w.id === store.wrapping);
  const ribbonDef = RIBBON_OPTIONS.find((r) => r.id === store.ribbon);
  const letterDef = LETTER_TEMPLATES.find((t) => t.id === store.letterTemplate);
  const envelopeDef = ENVELOPE_OPTIONS.find((e) => e.id === store.envelope);

  const selectedExtras = store.extras.map((extraId) =>
    EXTRA_OPTIONS.find((e) => e.id === extraId)
  ).filter(Boolean);

  const saveGift = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bouquet_style: store.bouquetStyle,
          flowers: store.flowers,
          fillers: store.fillers,
          wrapping: store.wrapping,
          ribbon: store.ribbon,
          extras: store.extras,
          letter_template: store.letterTemplate,
          recipient_name: store.recipientName,
          message: store.message,
          sender_name: store.senderName,
          envelope: store.envelope,
        }),
      });
      const { shareCode } = await res.json();
      const url = `${window.location.origin}/gift/${shareCode}`;
      store.setShareUrl(url);
      store.setGiftId(shareCode);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (store.shareUrl) {
      navigator.clipboard.writeText(store.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareText = `I created a digital flower bouquet and sealed a handwritten letter for you on BloomBox. Open it here: `;
  
  const whatsappUrl = store.shareUrl
    ? `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + store.shareUrl)}`
    : '#';

  const telegramUrl = store.shareUrl
    ? `https://t.me/share/url?url=${encodeURIComponent(store.shareUrl)}&text=${encodeURIComponent(shareText)}`
    : '#';

  const emailUrl = store.shareUrl
    ? `mailto:?subject=${encodeURIComponent('A digital flower bouquet for you 🌸')}&body=${encodeURIComponent(shareText + store.shareUrl)}`
    : '#';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Confetti Animation Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex items-center justify-center">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{
                  x: 0,
                  y: '100vh',
                  scale: 0.5,
                  opacity: 1,
                  rotate: 0,
                }}
                animate={{
                  x: (Math.random() - 0.5) * window.innerWidth * 0.8,
                  y: '-10vh',
                  scale: [0.5, 1.2, 0.8],
                  opacity: [1, 1, 0],
                  rotate: Math.random() * 360 * 2,
                }}
                transition={{
                  duration: 2.5 + Math.random() * 1.5,
                  ease: 'easeOut',
                }}
              >
                {['🌸', '🌹', '🌷', '✨', '💖', '🌼'][Math.floor(Math.random() * 6)]}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-heading text-4xl md:text-5xl text-rose-900 mb-3">
          Your BloomBox is ready! 🎉
        </h2>
        <p className="font-serif text-lg text-rose-400 italic">
          Preview what your loved one will see
        </p>
      </motion.div>

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
            Bouquet Preview
          </h3>
          <div className="w-full max-w-85 aspect-3/4 relative">
            <BouquetPreview
              style={store.bouquetStyle}
              flowers={store.flowers}
              fillers={store.fillers}
              wrapping={store.wrapping}
              ribbon={store.ribbon}
              extras={store.extras}
            />
          </div>
        </motion.div>

        {/* Right Column: Details & Share */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="lg:col-span-6 space-y-6"
        >
          {/* Interactive Envelope Preview */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-rose-100/50 space-y-4">
            <h3 className="font-heading text-xl text-rose-900 border-b border-rose-100 pb-2">
              Envelope & Letter Preview
            </h3>
            <EnvelopeUnboxer
              envelope={store.envelope}
              letterTemplate={store.letterTemplate}
              recipientName={store.recipientName}
              message={store.message}
              senderName={store.senderName}
            />
          </div>

          {/* Share Box */}
          <div className="bg-rose-50/40 rounded-3xl p-6 border-2 border-dashed border-rose-200/80 text-center space-y-6">
            {!store.shareUrl ? (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto text-rose-500">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-heading text-lg text-rose-900 font-semibold">
                    Ready to send?
                  </h4>
                  <p className="text-xs text-stone-500">
                    Generate a secret link to share this digital experience with your loved one.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveGift}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-white font-medium shadow-lg shadow-rose-200"
                  style={{
                    background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Weaving your bouquet...
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 fill-current" />
                      Generate Gift Link
                    </>
                  )}
                </motion.button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-500">
                  <Check className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-heading text-lg text-stone-800 font-semibold">
                    Link Generated!
                  </h4>
                  <p className="text-xs text-stone-500">
                    Send this link to your recipient so they can open their gift.
                  </p>
                </div>

                {/* Link display & copy */}
                <div className="flex items-center gap-2 bg-white rounded-full p-1.5 border border-stone-200 pl-4 shadow-inner">
                  <span className="text-xs text-stone-500 truncate flex-1 text-left">
                    {store.shareUrl}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy Link
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Social buttons */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block">
                    Share directly via
                  </span>
                  <div className="flex justify-center gap-4">
                    {/* WhatsApp */}
                    <motion.a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm"
                    >
                      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.59 1.97 14.12 1.027 11.5 1.027c-5.444 0-9.873 4.38-9.876 9.808-.001 1.73.466 3.424 1.353 4.927l-.982 3.587 3.662-.968z" />
                      </svg>
                    </motion.a>

                    {/* Telegram */}
                    <motion.a
                      href={telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-sm"
                    >
                      <Send className="h-5 w-5 text-white" />
                    </motion.a>

                    {/* Email */}
                    <motion.a
                      href={emailUrl}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm"
                    >
                      <Mail className="h-5 w-5 text-white" />
                    </motion.a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
