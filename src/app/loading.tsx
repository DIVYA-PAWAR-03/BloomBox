"use client";

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center space-y-6 select-none relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-rose-500/10 blur-[100px] pointer-events-none" />

      <div className="relative">
        {/* Pulsing logo icon border */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-2 border-rose-500/20 border-t-rose-500"
        />
        {/* Center flower icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl">
          🌸
        </div>
      </div>

      <div className="text-center space-y-1.5 z-10">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest font-heading">BloomBox</h2>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Loading premium experience...</p>
      </div>
    </div>
  );
}
