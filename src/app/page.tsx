"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Layers, 
  Gift, 
  ArrowRight, 
  Heart, 
  Music, 
  Mic 
} from 'lucide-react';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-rose-500/30 selection:text-rose-400 overflow-x-hidden font-sans">
      {/* Premium Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-900 bg-zinc-950/75 backdrop-blur-md px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Heart className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="font-bold text-lg tracking-wider text-white bg-clip-text bg-gradient-to-r from-white to-zinc-400">
            BloomBox
          </span>
        </div>
        <Link href="/editor">
          <ButtonWithAnimation>
            Design Studio
          </ButtonWithAnimation>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center overflow-hidden">
        {/* Floating gradient decorative blobs */}
        <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-rose-500/10 blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-amber-500/10 blur-[80px]" />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl space-y-6 z-10"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/5 px-4 py-1.5 text-xs text-rose-400 font-semibold"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Digital Bouquet & Gift Studio
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
          >
            Craft Digital Bouquets. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-rose-400 to-amber-500">
              Gift Real Emotions.
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="mx-auto max-w-2xl text-base md:text-lg text-zinc-300 font-medium leading-relaxed"
          >
            Create heartfelt digital bouquets, write personal letters, and share unforgettable memories — completely free.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/editor" 
              className="group flex h-12 items-center justify-center gap-2 rounded-full bg-rose-600 px-8 text-sm font-bold text-white hover:bg-rose-500 hover:scale-105 transition-all duration-300 shadow-xl shadow-rose-600/25"
            >
              Start Designing
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <a 
              href="#concept"
              className="flex h-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/40 px-8 text-sm font-semibold text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
            >
              Explore Studio
            </a>
          </motion.div>
        </motion.div>
      </main>

      {/* Concept Feature Grid */}
      <section id="concept" className="bg-zinc-950/80 px-6 py-24 md:px-12 border-t border-zinc-900">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white">
              Studio Feature Highlights
            </h2>
            <p className="mx-auto max-w-xl text-sm text-zinc-400 font-medium">
              Create rich interactive gifting experiences with our advanced canvas features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 space-y-4 hover:border-zinc-800 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Advanced Canvas Engine</h3>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                Position, resize, rotate, and layer assets with infinite canvas zoom, smart guidelines alignment, and 20px grid snapping.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 space-y-4 hover:border-zinc-800 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Music className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Atmospheric Soundtracks</h3>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                Select from background tracks (Spotify, YouTube, custom uploads) to accompany the gift and play automatically on open.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 space-y-4 hover:border-zinc-800 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Gift className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Bundled Gift Addons</h3>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                Add premium chocolates, plush teddy bears, and personalized photos or letters inside the bouquet packaging wrapper.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-12 text-center text-xs text-zinc-600">
        <p>© 2026 BloomBox Gifting Studio. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Interactive helper button with magnetic effect
function ButtonWithAnimation({ children }: { children: React.ReactNode }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex h-10 items-center justify-center rounded-full bg-rose-600 px-5 text-sm font-bold text-white hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-600/15 cursor-pointer transition-colors"
    >
      {children}
    </motion.button>
  );
}
