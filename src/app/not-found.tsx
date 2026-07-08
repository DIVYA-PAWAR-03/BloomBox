"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center space-y-6 px-4 select-none relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-rose-950/20 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-5 max-w-sm z-10"
      >
        <div className="h-16 w-16 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-3xl mx-auto shadow-lg">
          🥀
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white font-heading">Page Withered Away</h1>
          <p className="text-xs text-zinc-400 leading-relaxed font-medium">
            The digital gift bouquet or sharing page you are looking for does not exist or has expired.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex h-9 items-center justify-center bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl px-5 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.35)] border-none transition-colors"
        >
          Return to Home
        </Link>
      </motion.div>
    </div>
  );
}
