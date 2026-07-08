"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { EffectType } from '@/store/useGiftStore';

interface AmbientEffectsProps {
  type: EffectType;
}

interface Particle {
  id: number;
  char: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  rotate: number;
}

export function AmbientEffects({ type }: AmbientEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (type === 'none') {
      setParticles([]);
      return;
    }

    let charList = ['🌸', '💮']; // Default petals
    if (type === 'sparkles') charList = ['✨', '⭐', '🌟'];
    if (type === 'butterflies') charList = ['🦋', '🧚'];
    if (type === 'fireflies') charList = ['💡', '🟡', '✨'];
    if (type === 'snow') charList = ['❄️', '⚪'];
    if (type === 'confetti') charList = ['🎉', '🟡', '🟩', '🟥', '🟦'];

    const temp: Particle[] = [];
    const count = type === 'snow' || type === 'confetti' ? 45 : 20;

    for (let i = 0; i < count; i++) {
      temp.push({
        id: i,
        char: charList[Math.floor(Math.random() * charList.length)],
        x: Math.random() * 100, // percentage width
        y: -10 - Math.random() * 20, // start above viewport
        size: 12 + Math.random() * 18,
        delay: Math.random() * 8,
        duration: 8 + Math.random() * 10,
        rotate: Math.random() * 360
      });
    }

    setParticles(temp);
  }, [type]);

  if (type === 'none') return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 select-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ 
            opacity: 0, 
            x: `${p.x}vw`, 
            y: `${p.y}vh`, 
            rotate: p.rotate 
          }}
          animate={{
            opacity: [0, 0.8, 0.8, 0],
            y: '110vh',
            x: [
              `${p.x}vw`, 
              `${p.x + (type === 'confetti' ? 15 : 5) - Math.random() * 10}vw`,
              `${p.x + (type === 'confetti' ? -15 : -5) + Math.random() * 10}vw`
            ],
            rotate: p.rotate + 360
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            position: 'absolute',
            fontSize: `${p.size}px`,
            filter: type === 'fireflies' || type === 'glow' ? 'blur(1px) drop-shadow(0 0 8px rgba(234,179,8,0.5))' : 'none'
          }}
        >
          {type === 'fireflies' ? (
            <div className="h-3 w-3 rounded-full bg-yellow-400 opacity-60" />
          ) : (
            p.char
          )}
        </motion.div>
      ))}

      {/* Special ambient radial glow effect */}
      {type === 'glow' && (
        <motion.div
          initial={{ opacity: 0.15 }}
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-radial from-rose-500/10 via-amber-500/5 to-transparent pointer-events-none"
        />
      )}
    </div>
  );
}
export default AmbientEffects;
