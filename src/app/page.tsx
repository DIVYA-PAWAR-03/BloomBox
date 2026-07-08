'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';

const floatingPetals = [
  { id: 1, text: '🌸', x: '8%',  delay: 0,  duration: 22, size: '2rem' },
  { id: 2, text: '🌹', x: '83%', delay: 3,  duration: 28, size: '1.6rem' },
  { id: 3, text: '🌷', x: '28%', delay: 7,  duration: 25, size: '1.4rem' },
  { id: 4, text: '🌸', x: '62%', delay: 11, duration: 30, size: '1.8rem' },
  { id: 5, text: '🌿', x: '18%', delay: 15, duration: 26, size: '1.5rem' },
  { id: 6, text: '🌼', x: '88%', delay: 5,  duration: 20, size: '1.7rem' },
];

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.18 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};

export default function Home() {
  return (
    <div className="min-h-screen relative flex flex-col" style={{ background: '#faf6f0', color: '#44382e' }}>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-96 opacity-40"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, #fce7f3 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ background: '#fbcfe8', animation: 'pulse 8s infinite' }} />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: '#fde68a', animation: 'pulse 10s infinite 2s' }} />
      </div>

      {/* Floating petals */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {floatingPetals.map((p) => (
          <motion.div
            key={p.id}
            className="absolute select-none"
            style={{ left: p.x, fontSize: p.size, opacity: 0.3, filter: 'blur(0.4px)' }}
            animate={{
              y: ['-5vh', '110vh'],
              x: [p.x, `calc(${p.x} + 5vw)`, `calc(${p.x} - 3vw)`, p.x],
              rotate: [0, 360],
            }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'linear' }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-20 w-full px-8 py-5 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(251,207,232,0.2)' }}>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #fb923c)' }}>
            <Heart className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="text-xl font-semibold tracking-wide" style={{ fontFamily: 'var(--font-cormorant, serif)', color: '#5c4a3c' }}>
            BloomBox
          </span>
        </div>
        <Link href="/create">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium tracking-wide text-rose-600 border border-rose-200/60 bg-white/70 hover:bg-white shadow-sm transition-colors"
          >
            Start Creating
          </motion.button>
        </Link>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-8 max-w-2xl"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase text-rose-500"
              style={{ background: 'rgba(254,228,232,0.7)', border: '1px solid rgba(253,164,175,0.4)' }}>
              🌸 beautiful flowers, delivered digitally
            </span>
          </motion.div>

          {/* Big headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-normal leading-[1.1] tracking-tight"
            style={{ fontFamily: 'var(--font-cormorant, serif)', color: '#44382e' }}
          >
            Send a bouquet<br />
            <em className="not-italic font-semibold"
              style={{ background: 'linear-gradient(135deg, #e11d48, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              full of love.
            </em>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg leading-relaxed text-stone-500 max-w-lg mx-auto"
          >
            Pick flowers, choose a wrapping, write a heartfelt letter and seal it in a beautiful envelope.
            Create a sweet unboxing experience for someone special — completely free.
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/create">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(225,29,72,0.3)' }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 px-10 py-4 rounded-full text-sm font-medium text-white shadow-lg transition-all"
                style={{ background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)', boxShadow: '0 4px 20px rgba(225,29,72,0.25)' }}
              >
                <Heart className="h-4 w-4 fill-current" />
                Create a BloomBox
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 w-full max-w-3xl"
          style={{ borderTop: '1px solid rgba(251,207,232,0.3)', paddingTop: '3rem' }}
        >
          <p className="text-center text-xs font-medium tracking-widest uppercase text-rose-400 mb-10">
            How it works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
            {[
              {
                step: '01',
                emoji: '💐',
                title: 'Build your bouquet',
                desc: 'Choose a beautiful bouquet style, add flowers, leaves, wrapping paper and a ribbon.',
              },
              {
                step: '02',
                emoji: '✉️',
                title: 'Write a letter',
                desc: 'Pick a handwritten letter template and pour your heart into every word.',
              },
              {
                step: '03',
                emoji: '💌',
                title: 'Share with love',
                desc: 'Generate a free link and send it via WhatsApp, Telegram, or email. Completely free.',
              },
            ].map((item) => (
              <div key={item.step} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-xs font-medium text-rose-300 font-mono">{item.step}</span>
                </div>
                <h3 className="text-base font-medium" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', color: '#5c4a3c' }}>
                  {item.title}
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sample flowers strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-20 flex items-center gap-4 flex-wrap justify-center"
        >
          {['🌹', '🌷', '🌸', '🌼', '🌻', '💐', '🪷', '🌺', '🌸', '💜'].map((emoji, i) => (
            <motion.span
              key={i}
              className="text-2xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-8 text-center text-xs text-stone-400 border-t"
        style={{ borderColor: 'rgba(251,207,232,0.15)', background: 'rgba(255,255,255,0.3)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="h-3.5 w-3.5 text-rose-400 fill-current" />
          <span className="font-medium" style={{ fontFamily: 'var(--font-cormorant, serif)', color: '#7c6959', fontSize: '0.9rem' }}>
            BloomBox
          </span>
        </div>
        <p>© 2026 BloomBox — Send feelings, not just flowers.</p>
      </footer>
    </div>
  );
}
