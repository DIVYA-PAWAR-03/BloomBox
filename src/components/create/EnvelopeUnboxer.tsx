'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LETTER_TEMPLATES, ENVELOPE_OPTIONS } from '@/types/bouquet';
import type { EnvelopeStyle, LetterTemplate } from '@/types/bouquet';

interface EnvelopeUnboxerProps {
  envelope: EnvelopeStyle;
  letterTemplate: LetterTemplate;
  recipientName: string;
  message: string;
  senderName: string;
  onComplete?: () => void;
  /** Called once the download handler is ready — parent can store it and invoke it from outside */
  onDownloadReady?: (handler: () => Promise<void>, isDownloading: boolean) => void;
}

export default function EnvelopeUnboxer({
  envelope,
  letterTemplate,
  recipientName,
  message,
  senderName,
  onComplete,
  onDownloadReady,
}: EnvelopeUnboxerProps) {
  // Stages: 'closed' | 'opening' | 'sliding' | 'open'
  const [stage, setStage] = useState<'closed' | 'opening' | 'sliding' | 'open'>('closed');
  const [revealedChars, setRevealedChars] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  const envelopeDef = ENVELOPE_OPTIONS.find((e) => e.id === envelope) || ENVELOPE_OPTIONS[0];
  const templateDef = LETTER_TEMPLATES.find((t) => t.id === letterTemplate) || LETTER_TEMPLATES[0];

  const handleOpenSequence = () => {
    if (stage !== 'closed') return;
    setStage('opening');
    setTimeout(() => setStage('sliding'), 850);
    setTimeout(() => setStage('open'), 1750);
  };

  // Typing effect — stops at end, never repeats
  useEffect(() => {
    if (stage !== 'open') return;

    // If no message at all, mark done immediately
    if (!message || message.length === 0) {
      setTypingDone(true);
      if (onComplete) onComplete();
      return;
    }

    setRevealedChars(0);
    setTypingDone(false);

    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setRevealedChars(i);
      if (i >= message.length) {
        clearInterval(timer);
        setTypingDone(true);
        if (onComplete) onComplete();
      }
    }, 25);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // Download letter as PDF using html2canvas + jsPDF
  const handleDownloadPDF = useCallback(async () => {
    if (!letterRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(letterRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: templateDef.bgColor,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const padding = 15;
      const availableWidth = pageWidth - padding * 2;
      const availableHeight = pageHeight - padding * 2;
      const imgAspect = canvas.height / canvas.width;

      let imgWidth = availableWidth;
      let imgHeight = imgWidth * imgAspect;
      if (imgHeight > availableHeight) {
        imgHeight = availableHeight;
        imgWidth = imgHeight / imgAspect;
      }

      const xOffset = (pageWidth - imgWidth) / 2;
      pdf.addImage(imgData, 'PNG', xOffset, padding, imgWidth, imgHeight);

      const recipientLabel = recipientName ? `_to_${recipientName.replace(/\s+/g, '_')}` : '';
      const senderLabel = senderName ? `_from_${senderName.replace(/\s+/g, '_')}` : '';
      pdf.save(`BloomBox_Letter${recipientLabel}${senderLabel}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, templateDef.bgColor, recipientName, senderName]);

  // Expose download handler to parent whenever it changes
  useEffect(() => {
    if (onDownloadReady) {
      onDownloadReady(handleDownloadPDF, isDownloading);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleDownloadPDF, isDownloading]);

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-6 min-h-[300px]">
      <AnimatePresence mode="wait">
        {stage !== 'open' ? (
          /* ── Envelope closed / opening animation ── */
          <motion.div
            key="envelope-arena"
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            onClick={handleOpenSequence}
            className="relative w-80 h-48 cursor-pointer select-none transition-transform hover:scale-[1.03] active:scale-[0.98] mt-6"
          >
            {stage === 'closed' && (
              <div className="absolute -top-10 left-0 right-0 text-center pointer-events-none z-50">
                <span className="bg-rose-500 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full shadow-md animate-bounce inline-block">
                  ✉️ Click to open letter
                </span>
              </div>
            )}

            {/* Envelope base */}
            <div
              className="absolute inset-0 rounded-2xl shadow-lg border border-stone-200/40"
              style={{ backgroundColor: envelopeDef.color }}
            >
              <div className="absolute bottom-0 left-0 w-1/2 h-full" style={{ background: `${envelopeDef.flapColor}08`, clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)' }} />
              <div className="absolute bottom-0 right-0 w-1/2 h-full" style={{ background: `${envelopeDef.flapColor}08`, clipPath: 'polygon(0% 50%, 100% 0%, 100% 100%)' }} />
              <div className="absolute bottom-0 left-0 right-0 h-[72px]" style={{ background: `${envelopeDef.flapColor}12`, clipPath: 'polygon(0% 0%, 50% 100%, 100% 0%)' }} />
            </div>

            {/* Sliding letter peek */}
            <motion.div
              className="absolute left-6 right-6 h-36 shadow-inner rounded-xl border p-4 overflow-hidden z-10"
              style={{ backgroundColor: templateDef.bgColor, borderColor: templateDef.borderColor, top: 24 }}
              animate={stage === 'sliding' ? { y: -130, scale: 1.05, zIndex: 25 } : { y: 0, scale: 0.98, zIndex: 5 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-full h-full border border-dashed rounded-lg opacity-40 p-2 flex flex-col justify-between" style={{ borderColor: templateDef.textColor, color: templateDef.textColor }}>
                <span className="font-serif text-[9px] uppercase tracking-wider block">{templateDef.greeting} {recipientName || 'Dear'}...</span>
                <span className="font-serif text-[9px] text-right block">{senderName || 'With love'}</span>
              </div>
            </motion.div>

            {/* Flap */}
            <motion.div
              className="absolute top-0 left-0 right-0 origin-top z-20 cursor-pointer"
              style={{ height: '60%', background: envelopeDef.flapColor, clipPath: 'polygon(0% 0%, 50% 100%, 100% 0%)', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' } as any}
              animate={stage !== 'closed' ? { rotateX: -180, y: -2, zIndex: 0 } : { rotateX: 0, y: 0, zIndex: 20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Wax seal */}
            {stage === 'closed' && (
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full w-8 h-8 flex items-center justify-center shadow-md z-30 select-none cursor-pointer"
                style={{ backgroundColor: envelopeDef.flapColor, border: `2px solid ${envelopeDef.color}` }}
              >
                {envelopeDef.id === 'wax_seal' ? '🔴' : envelopeDef.id === 'heart_seal' ? '❤️' : '❤'}
              </div>
            )}
          </motion.div>
        ) : (
          /* ── Letter open — full stationery card ── */
          <motion.div
            key="letter-stationary"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-full max-w-lg flex flex-col items-center gap-5"
          >
            {/* Letter card — captured for PDF */}
            <div
              ref={letterRef}
              className="w-full rounded-3xl border-4 p-8 md:p-10 shadow-2xl relative overflow-hidden"
              style={{
                backgroundColor: templateDef.bgColor,
                borderColor: templateDef.borderColor,
                color: templateDef.textColor,
              }}
            >
              {/* Decorative inner border */}
              <div className="absolute inset-2 border pointer-events-none rounded-[1.15rem] opacity-35" style={{ borderColor: templateDef.textColor }} />

              {/* Template emoji watermark */}
              <div className="absolute top-4 right-4 text-3xl opacity-30 select-none">{templateDef.emoji}</div>

              {/* Greeting */}
              <p className="font-serif text-lg md:text-xl font-bold mb-5">
                {templateDef.greeting} {recipientName || 'My Dear'}
              </p>

              {/* Typing message body */}
              <p
                className="text-2xl md:text-3xl leading-loose whitespace-pre-wrap min-h-[140px] mb-8"
                style={{
                  fontFamily:
                    templateDef.fontClass === 'font-caveat'
                      ? 'var(--font-caveat)'
                      : templateDef.fontClass === 'font-great-vibes'
                      ? 'var(--font-great-vibes)'
                      : 'var(--font-serif)',
                }}
              >
                {(message || '').slice(0, revealedChars)}
                {/* Blinking cursor — removed entirely when typing done */}
                {!typingDone && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-0.5 h-6 bg-current ml-0.5 align-text-bottom"
                  />
                )}
              </p>

              {/* Signature */}
              <div className="border-t pt-4 text-right" style={{ borderColor: templateDef.borderColor }}>
                <p className="font-serif text-sm opacity-70">{templateDef.closing}</p>
                <p className="font-serif text-lg font-bold mt-1">{senderName || 'With love ❤️'}</p>
              </div>
            </div>


          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
