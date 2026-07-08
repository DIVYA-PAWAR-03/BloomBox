'use client';

import { motion } from 'framer-motion';
import { useBouquetStore } from '@/store/useBouquetStore';
import { LETTER_TEMPLATES } from '@/types/bouquet';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Step7Letter() {
  const {
    letterTemplate,
    recipientName,
    message,
    senderName,
    setLetterTemplate,
    setRecipientName,
    setMessage,
    setSenderName,
  } = useBouquetStore();

  const selectedTemplate =
    LETTER_TEMPLATES.find((t) => t.id === letterTemplate) ?? LETTER_TEMPLATES[0];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-heading text-4xl md:text-5xl text-rose-900 mb-3">
          Write from the heart
        </h2>
        <p className="font-serif text-lg text-rose-400 italic">
          Choose a template and write your own message
        </p>
      </motion.div>

      {/* Horizontal Templates Scroll */}
      <div className="mb-8 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-rose-200">
        <motion.div
          className="flex gap-4 px-2 min-w-max"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {LETTER_TEMPLATES.map((tpl) => {
            const isSelected = letterTemplate === tpl.id;
            return (
              <motion.button
                key={tpl.id}
                variants={cardVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLetterTemplate(tpl.id)}
                className="flex flex-col items-center p-3 rounded-xl border-2 transition-all cursor-pointer bg-white"
                style={{
                  borderColor: isSelected ? tpl.accentColor : 'rgba(225,29,72,0.1)',
                  boxShadow: isSelected ? `0 4px 12px ${tpl.borderColor}` : 'none',
                  background: isSelected ? tpl.bgColor : '#ffffff',
                }}
              >
                <span className="text-2xl mb-1">{tpl.emoji}</span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: isSelected ? tpl.textColor : '#78716c' }}
                >
                  {tpl.label}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Stationery Letter Area */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full rounded-3xl border-4 p-8 md:p-12 shadow-xl relative overflow-hidden transition-all duration-500"
        style={{
          backgroundColor: selectedTemplate.bgColor,
          borderColor: selectedTemplate.borderColor,
          color: selectedTemplate.textColor,
        }}
      >
        {/* Subtle decorative background elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none flex items-center justify-center text-[10rem]">
          {selectedTemplate.emoji}
        </div>

        {/* Outer decorative line border */}
        <div
          className="absolute inset-2 border pointer-events-none rounded-[1.25rem] opacity-40"
          style={{ borderColor: selectedTemplate.textColor }}
        />

        {/* Greeting line */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 mb-6 font-serif text-lg md:text-xl">
          <span>{selectedTemplate.greeting}</span>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Recipient's Name"
            className="flex-1 min-w-[200px] border-b-2 bg-transparent px-2 py-1 outline-none transition-all duration-300 placeholder:text-stone-400 focus:placeholder:opacity-50"
            style={{
              borderColor: selectedTemplate.accentColor,
              fontFamily: 'var(--font-serif)',
            }}
          />
        </div>

        {/* Letter content textarea */}
        <div className="relative z-10 mb-6">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={selectedTemplate.placeholder}
            rows={8}
            className="w-full bg-transparent resize-none outline-none leading-relaxed text-2xl md:text-3xl border-none placeholder:opacity-40"
            style={{
              fontFamily:
                selectedTemplate.fontClass === 'font-caveat'
                  ? 'var(--font-caveat)'
                  : selectedTemplate.fontClass === 'font-great-vibes'
                  ? 'var(--font-great-vibes)'
                  : 'var(--font-serif)',
            }}
          />
        </div>

        {/* Closing line */}
        <div className="relative z-10 flex flex-col items-end gap-2 text-right mt-4 font-serif text-lg md:text-xl ml-auto max-w-sm">
          <span>{selectedTemplate.closing}</span>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Your Name"
            className="w-full text-right border-b-2 bg-transparent px-2 py-1 outline-none transition-all duration-300 placeholder:text-stone-400 focus:placeholder:opacity-50"
            style={{
              borderColor: selectedTemplate.accentColor,
              fontFamily: 'var(--font-serif)',
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
