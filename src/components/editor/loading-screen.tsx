"use client";

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="relative flex flex-col items-center">
        {/* Animated Floral Rings */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="relative h-24 w-24 flex items-center justify-center"
        >
          {/* Petal 1 */}
          <div className="absolute top-0 h-8 w-8 rounded-full bg-rose-500/20 border border-rose-500/30 blur-[1px]"></div>
          {/* Petal 2 */}
          <div className="absolute right-0 h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 blur-[1px]"></div>
          {/* Petal 3 */}
          <div className="absolute bottom-0 h-8 w-8 rounded-full bg-amber-500/20 border border-amber-500/30 blur-[1px]"></div>
          {/* Petal 4 */}
          <div className="absolute left-0 h-8 w-8 rounded-full bg-rose-400/20 border border-rose-400/30 blur-[1px]"></div>
        </motion.div>

        {/* Pulsing Core */}
        <motion.div 
          animate={{ scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-8 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-rose-500/40 shadow-rose-500/20 shadow-lg"
        >
          <Sparkles className="h-4 w-4 text-rose-400 animate-pulse" />
        </motion.div>
        
        {/* Loading Text */}
        <motion.h3 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-lg font-semibold tracking-wide text-zinc-200"
        >
          Blooming your workspace...
        </motion.h3>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.6 }}
          className="mt-1 text-xs text-zinc-400"
        >
          Preparing Bouquet & Gift Studio
        </motion.p>
      </div>
    </div>
  );
}
export default LoadingScreen;
