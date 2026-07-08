'use client';

import React from 'react';

interface FlowerAssetProps {
  type: string;
  className?: string;
  style?: React.CSSProperties;
}

interface BloomPresentation {
  scale: number;
  translateX: string;
  translateY: string;
  objectPosition: string;
  filter: string;
}

function getBloomPresentation(type: string): BloomPresentation {
  switch (type) {
    case 'tulip':
      return {
        scale: 1.18,
        translateX: '0%',
        translateY: '-1.5%',
        objectPosition: 'center top',
        filter: 'drop-shadow(0 7px 14px rgba(120,53,15,0.16)) saturate(1.08) contrast(1.02)',
      };
    case 'lily':
      return {
        scale: 1.14,
        translateX: '0%',
        translateY: '-2%',
        objectPosition: 'center 16%',
        filter: 'drop-shadow(0 8px 16px rgba(76,29,149,0.16)) saturate(1.05) contrast(1.03)',
      };
    case 'peony':
      return {
        scale: 1.12,
        translateX: '0%',
        translateY: '-1%',
        objectPosition: 'center center',
        filter: 'drop-shadow(0 8px 16px rgba(157,23,77,0.16)) saturate(1.05)',
      };
    case 'sunflower':
      return {
        scale: 1.1,
        translateX: '0%',
        translateY: '-1%',
        objectPosition: 'center center',
        filter: 'drop-shadow(0 8px 16px rgba(180,83,9,0.18)) saturate(1.06)',
      };
    case 'rose':
    case 'rose_pink':
    case 'rose_white':
    case 'rose_yellow':
      return {
        scale: 1.06,
        translateX: '0%',
        translateY: '-0.5%',
        objectPosition: 'center center',
        filter: 'drop-shadow(0 8px 16px rgba(88,28,135,0.14)) saturate(1.04) contrast(1.02)',
      };
    case 'hydrangea':
      return {
        scale: 1.06,
        translateX: '0%',
        translateY: '0%',
        objectPosition: 'center center',
        filter: 'drop-shadow(0 8px 18px rgba(67,56,202,0.16)) saturate(1.03)',
      };
    case 'orchid':
      return {
        scale: 1.08,
        translateX: '0%',
        translateY: '-2%',
        objectPosition: 'center 18%',
        filter: 'drop-shadow(0 8px 16px rgba(168,85,247,0.16)) saturate(1.05)',
      };
    case 'cherry_blossom':
      return {
        scale: 1.06,
        translateX: '0%',
        translateY: '0%',
        objectPosition: 'center center',
        filter: 'drop-shadow(0 8px 14px rgba(244,114,182,0.12)) saturate(1.04)',
      };
    case 'lavender':
      return {
        scale: 1.04,
        translateX: '0%',
        translateY: '0%',
        objectPosition: 'center center',
        filter: 'drop-shadow(0 8px 14px rgba(124,58,237,0.14)) saturate(1.05)',
      };
    case 'jasmine':
      return {
        scale: 1.06,
        translateX: '0%',
        translateY: '0%',
        objectPosition: 'center center',
        filter: 'drop-shadow(0 7px 14px rgba(34,197,94,0.16)) saturate(1.03)',
      };
    case 'lotus':
      return {
        scale: 1.08,
        translateX: '0%',
        translateY: '-1%',
        objectPosition: 'center center',
        filter: 'drop-shadow(0 8px 16px rgba(236,72,153,0.16)) saturate(1.05)',
      };
    case 'marigold':
      return {
        scale: 1.06,
        translateX: '0%',
        translateY: '0%',
        objectPosition: 'center center',
        filter: 'drop-shadow(0 8px 16px rgba(245,158,11,0.18)) saturate(1.06)',
      };
    default:
      return {
        scale: 1,
        translateX: '0%',
        translateY: '0%',
        objectPosition: 'center center',
        filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.12))',
      };
  }
}

export default function FlowerAssetRenderer({ type, className, style }: FlowerAssetProps) {
  const presentation = getBloomPresentation(type);

  // Render PNG images for generated premium watercolor/ink sketch assets
  const pngAssets = [
    'rose',
    'rose_pink',
    'rose_white',
    'rose_yellow',
    'sunflower',
    'tulip',
    'lily',
    'peony',
    'daisy'
  ];

  if (pngAssets.includes(type)) {
    let srcName = type;
    if (type === 'rose') srcName = 'rose_red'; // Map default rose to rose_red.png
    return (
      <img
        src={`/assets/flowers/${srcName}.png`}
        alt={type}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
            objectPosition: presentation.objectPosition,
            transform: `translate(${presentation.translateX}, ${presentation.translateY}) scale(${presentation.scale})`,
            transformOrigin: 'center center',
            filter: presentation.filter,
          pointerEvents: 'none',
          display: 'block',
            willChange: 'transform, filter',
          ...style
        }}
      />
    );
  }

  // Fallback to hand-drawn ink-sketch style watercolor SVGs
  switch (type) {
    case 'cherry_blossom':
      return <CherryBlossomSVG className={className} style={style} />;
    case 'lavender':
      return <LavenderSVG className={className} style={style} />;
    case 'carnation':
      return <CarnationSVG className={className} style={style} />;
    case 'hydrangea':
      return <HydrangeaSVG className={className} style={style} />;
    case 'orchid':
      return <OrchidSVG className={className} style={style} />;
    case 'jasmine':
      return <JasmineSVG className={className} style={style} />;
    case 'lotus':
      return <LotusSVG className={className} style={style} />;
    case 'marigold':
      return <MarigoldSVG className={className} style={style} />;
    case 'baby_breath':
    case 'baby_breath_item':
      return <BabyBreathSVG className={className} style={style} />;
    case 'leaf_green':
      return <LeafGreenSVG className={className} style={style} />;
    case 'leaf_fern':
      return <FernSVG className={className} style={style} />;
    case 'leaf_eucalyptus':
      return <EucalyptusSVG className={className} style={style} />;
    case 'sparkle_item':
      return <SparkleSVG className={className} style={style} />;
    default:
      return (
        <img
          src="/assets/flowers/rose_red.png"
          alt="rose"
          className={className}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            display: 'block',
            ...style
          }}
        />
      );
  }
}

// ─── WATERCOLOR DISPLACEMENT FILTER ─────────────────────────────────────────

function WatercolorFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" result="displaced" />
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" result="paperNoise" />
      <feDiffuseLighting in="paperNoise" lighting-color="#ffffff" surfaceScale="0.8" result="light">
        <feDistantLight azimuth="45" elevation="60" />
      </feDiffuseLighting>
      <feBlend mode="multiply" in="displaced" in2="light" />
    </filter>
  );
}

// ─── DYNAMIC SKETCH OUTLINE COMPONENT ─────────────────────────────────────────

function SketchOutline({ d, stroke = "#1c1917", strokeWidth = 1.8 }: { d: string; stroke?: string; strokeWidth?: number }) {
  return (
    <g opacity="0.85">
      {/* Primary sketch stroke */}
      <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {/* Offset sketchy helper stroke for hand-drawn pencil/pen effect */}
      <path
        d={d}
        fill="none"
        stroke="#2d2a27"
        strokeWidth={strokeWidth * 0.55}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="rotate(0.5 50 50) translate(0.3, 0.3)"
        opacity="0.6"
      />
    </g>
  );
}

// ─── HAND-DRAWN INK & WATERCOLOR SVGS ──────────────────────────────────────────

function CherryBlossomSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const filterId = "sketch-cherry-filter";
  return (
    <svg viewBox="0 0 100 100" className={className} style={{ width: '100%', height: '100%', overflow: 'visible', ...style }}>
      <defs>
        <WatercolorFilter id={filterId} />
        <radialGradient id="cherryPetalGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fef2f2" />
          <stop offset="40%" stopColor="#fbcfe8" />
          <stop offset="75%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#be185d" />
        </radialGradient>
        <radialGradient id="cherryCenterGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="70%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#c2410c" />
        </radialGradient>
      </defs>
      
      {/* Outer shadow/depth layer */}
      <circle cx="50" cy="50" r="38" fill="none" stroke="#db2777" strokeWidth="2" opacity="0.15" filter={`url(#${filterId})`} />
      
      {/* 5 realistic petals with translucent overlapping */}
      <g filter={`url(#${filterId})`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const rot = i * 72;
          const skewFactor = Math.sin((i % 2) * Math.PI) * 8;
          return (
            <g key={`petal-${i}`} opacity="0.95">
              {/* Petal base with gradient */}
              <path
                d="M50 50 C 25 25, 18 8, 35 5 C 45 3, 52 20, 50 50 Z"
                fill="url(#cherryPetalGrad)"
                transform={`rotate(${rot} 50 50) skewX(${skewFactor})`}
                stroke="#be185d"
                strokeWidth="0.85"
                opacity="0.9"
              />
              {/* Petal detail veins */}
              <path
                d="M50 50 Q 35 30 30 12"
                stroke="#be185d"
                strokeWidth="0.6"
                fill="none"
                transform={`rotate(${rot} 50 50)`}
                opacity="0.5"
              />
            </g>
          );
        })}
      </g>
      
      {/* Inner petal layer for depth */}
      <g opacity="0.7">
        {Array.from({ length: 5 }).map((_, i) => {
          const rot = i * 72 + 36;
          return (
            <path
              key={`inner-petal-${i}`}
              d="M50 50 C 30 30, 25 15, 38 12 C 45 11, 50 25, 50 50 Z"
              fill="#fbcfe8"
              transform={`rotate(${rot} 50 50) scale(0.7)`}
              stroke="#f472b6"
              strokeWidth="0.7"
              opacity="0.8"
            />
          );
        })}
      </g>
      
      {/* Center cluster - realistic stamens and pistil */}
      <g filter="drop-shadow(0 3px 6px rgba(190, 24, 110, 0.2))">
        {/* Center disk */}
        <circle cx="50" cy="50" r="12" fill="url(#cherryCenterGrad)" stroke="#92400e" strokeWidth="0.8" />
        
        {/* Golden stamens radiating from center */}
        {Array.from({ length: 15 }).map((_, i) => {
          const angle = (i * 360) / 15;
          const rad = (angle * Math.PI) / 180;
          const x2 = 50 + Math.cos(rad) * 11;
          const y2 = 50 + Math.sin(rad) * 11;
          return (
            <g key={`stamen-${i}`}>
              <line x1="50" y1="50" x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="0.9" opacity="0.85" />
              <circle cx={x2} cy={y2} r="1.8" fill="#fde047" stroke="#1c1917" strokeWidth="0.4" />
            </g>
          );
        })}
        
        {/* Central pistil */}
        <circle cx="50" cy="50" r="2.5" fill="#1c1917" opacity="0.6" />
      </g>
      
      {/* Sketch outlines for definition */}
      {Array.from({ length: 5 }).map((_, i) => {
        const rot = i * 72;
        return (
          <path
            key={`outline-${i}`}
            d="M50 50 C 25 25, 18 8, 35 5 C 45 3, 52 20, 50 50 Z"
            fill="none"
            stroke="#1c1917"
            strokeWidth="0.95"
            opacity="0.4"
            transform={`rotate(${rot} 50 50)`}
          />
        );
      })}
    </svg>
  );
}

function LavenderSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const filterId = "sketch-lavender-filter";
  return (
    <svg viewBox="0 0 100 100" className={className} style={{ width: '100%', height: '100%', overflow: 'visible', ...style }}>
      <defs>
        <WatercolorFilter id={filterId} />
        <linearGradient id="lavWash" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="60%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#ddd6fe" />
        </linearGradient>
      </defs>
      
      {/* Stems sketch */}
      <g stroke="#1c1917" strokeWidth="1.6" fill="none" opacity="0.85">
        <path d="M50 98 Q 48 55 50 10" />
      </g>
      
      {/* Color wash layers */}
      <g filter={`url(#${filterId})`} opacity="0.85">
        {Array.from({ length: 8 }).map((_, i) => {
          const y = 82 - i * 9;
          return (
            <g key={`wash-${i}`}>
              <circle cx="42" cy={y} r="5" fill="url(#lavWash)" />
              <circle cx="58" cy={y} r="5" fill="url(#lavWash)" />
              <circle cx="50" cy={y - 4} r="4.5" fill="#7c3aed" />
            </g>
          );
        })}
      </g>
      
      {/* Sketch outlines for buds */}
      {Array.from({ length: 8 }).map((_, i) => {
        const y = 82 - i * 9;
        return (
          <g key={`sketch-${i}`} stroke="#1c1917" strokeWidth="1.2" fill="none">
            {/* Left bud */}
            <path d={`M50 ${y} Q 36 ${y - 4} 42 ${y - 6} Q 46 ${y - 8} 50 ${y}`} />
            {/* Right bud */}
            <path d={`M50 ${y} Q 64 ${y - 4} 58 ${y - 6} Q 54 ${y - 8} 50 ${y}`} />
            {/* Top bud */}
            <circle cx="50" cy="55" r="2.5" fill="#c084fc" stroke="#1c1917" strokeWidth="0.8" />
          </g>
        );
      })}
    </svg>
  );
}

function CarnationSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const filterId = "sketch-carna-filter";
  return (
    <svg viewBox="0 0 100 100" className={className} style={{ width: '100%', height: '100%', overflow: 'visible', ...style }}>
      <defs>
        <WatercolorFilter id={filterId} />
        <radialGradient id="carnationMain" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#fee2e2" />
          <stop offset="35%" stopColor="#fbcfe8" />
          <stop offset="70%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#be123c" />
        </radialGradient>
        <radialGradient id="carnationDarker" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="80%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Outer shadow depth */}
      <circle cx="50" cy="50" r="42" fill="none" stroke="#be123c" strokeWidth="1.5" opacity="0.12" filter={`url(#${filterId})`} />
      
      {/* Multiple layers of ruffled petals - outer ring */}
      <g filter={`url(#${filterId})`}>
        {Array.from({ length: 24 }).map((_, i) => {
          const rot = i * 15;
          const depth = 0.7 + Math.sin((i / 24) * Math.PI) * 0.3;
          return (
            <path
              key={`outer-ruffle-${i}`}
              d="M50 50 Q 45 28, 50 12 Q 55 28, 50 50 Z"
              fill="url(#carnationMain)"
              transform={`rotate(${rot} 50 50) scaleY(${depth})`}
              stroke="#9f1239"
              strokeWidth="0.6"
              opacity="0.88"
            />
          );
        })}
      </g>
      
      {/* Middle layer - medium ruffles with darker tone */}
      <g opacity="0.82">
        {Array.from({ length: 18 }).map((_, i) => {
          const rot = i * 20 + 10;
          return (
            <path
              key={`mid-ruffle-${i}`}
              d="M50 50 Q 46 32, 50 20 Q 54 32, 50 50 Z"
              fill="#fca5a5"
              transform={`rotate(${rot} 50 50) scale(0.85)`}
              stroke="#be123c"
              strokeWidth="0.55"
              opacity="0.8"
            />
          );
        })}
      </g>
      
      {/* Inner dense petals - darker center */}
      <g opacity="0.9" filter={`url(#${filterId})`}>
        {Array.from({ length: 12 }).map((_, i) => {
          const rot = i * 30;
          return (
            <path
              key={`inner-ruffle-${i}`}
              d="M50 50 Q 48 38, 50 28 Q 52 38, 50 50 Z"
              fill="url(#carnationDarker)"
              transform={`rotate(${rot} 50 50) scale(0.72)`}
              stroke="#991b1b"
              strokeWidth="0.5"
            />
          );
        })}
      </g>
      
      {/* Center dark core */}
      <circle cx="50" cy="50" r="8" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.7" filter="drop-shadow(0 2px 4px rgba(127, 29, 29, 0.3))" />
      <circle cx="50" cy="50" r="4.5" fill="#7f1d1d" opacity="0.6" />
      
      {/* Sketch outlines for petal definition */}
      {Array.from({ length: 16 }).map((_, i) => {
        const rot = i * 22.5;
        return (
          <path
            key={`define-${i}`}
            d="M50 50 Q 45 30, 50 14 Q 55 30, 50 50 Z"
            fill="none"
            stroke="#1c1917"
            strokeWidth="0.7"
            opacity="0.25"
            transform={`rotate(${rot} 50 50) scaleY(0.9)`}
          />
        );
      })}
    </svg>
  );
}

function HydrangeaSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const filterId = "sketch-hyd-filter";
  return (
    <svg viewBox="0 0 100 100" className={className} style={{ width: '100%', height: '100%', overflow: 'visible', ...style }}>
      <defs>
        <WatercolorFilter id={filterId} />
        <radialGradient id="hydWash" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="70%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#312e81" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Base color wash */}
      <g filter={`url(#${filterId})`} opacity="0.8">
        <circle cx="50" cy="50" r="43" fill="url(#hydWash)" />
      </g>
      
      {/* Individual petal clusters */}
      {[
        { x: 32, y: 32 }, { x: 50, y: 22 }, { x: 68, y: 32 },
        { x: 22, y: 50 }, { x: 40, y: 44 }, { x: 60, y: 44 }, { x: 78, y: 50 },
        { x: 32, y: 68 }, { x: 50, y: 74 }, { x: 68, y: 68 },
        { x: 50, y: 58 }
      ].map((pos, idx) => {
        return (
          <g key={idx} transform={`translate(${pos.x} ${pos.y}) scale(0.26)`}>
            {/* Soft petal background wash */}
            <path d="M-15 -15 L 15 -15 L 15 15 L -15 15 Z" fill="#e0e7ff" opacity="0.75" />
            {/* Sketch petals */}
            <g stroke="#1c1917" strokeWidth="3" fill="none">
              {/* Petal 1 */}
              <path d="M0 0 C -15 -15, -25 -5, 0 0" />
              {/* Petal 2 */}
              <path d="M0 0 C 15 -15, 25 -5, 0 0" />
              {/* Petal 3 */}
              <path d="M0 0 C 15 15, 25 5, 0 0" />
              {/* Petal 4 */}
              <path d="M0 0 C -15 15, -25 5, 0 0" />
            </g>
            <circle cx="0" cy="0" r="3.5" fill="#f59e0b" />
          </g>
        );
      })}
    </svg>
  );
}

function OrchidSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const filterId = "sketch-orchid-filter";
  const uniqueId = React.useId().replace(/:/g, '');
  const orchidGradId = `orchidMain-${uniqueId}`;
  const labelGradId = `orchidLabel-${uniqueId}`;
  return (
    <svg viewBox="0 0 100 100" className={className} style={{ width: '100%', height: '100%', overflow: 'visible', ...style }}>
      <defs>
        <WatercolorFilter id={filterId} />
        <radialGradient id={orchidGradId} cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#faf5ff" />
          <stop offset="25%" stopColor="#f3e8ff" />
          <stop offset="50%" stopColor="#e879f9" />
          <stop offset="85%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7c3aed" />
        </radialGradient>
        <radialGradient id={labelGradId} cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="60%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
      
      {/* Outer bloom shadow */}
      <circle cx="50" cy="50" r="40" fill="none" stroke="#7c3aed" strokeWidth="1.8" opacity="0.1" filter={`url(#${filterId})`} />
      
      {/* Upper lateral petals (sepal petals) */}
      <g filter={`url(#${filterId})`} opacity="0.92">
        {/* Left upper petal */}
        <path
          d="M50 50 C 28 42, 12 32, 18 14 C 24 8, 32 15, 50 50"
          fill={`url(#${orchidGradId})`}
          stroke="#6d28d9"
          strokeWidth="0.85"
          opacity="0.9"
        />
        {/* Right upper petal */}
        <path
          d="M50 50 C 72 42, 88 32, 82 14 C 76 8, 68 15, 50 50"
          fill={`url(#${orchidGradId})`}
          stroke="#6d28d9"
          strokeWidth="0.85"
          opacity="0.9"
        />
        
        {/* Top center petal (dorsal sepal) */}
        <path
          d="M50 50 L 50 8 C 60 12, 65 25, 50 50"
          fill="#e9d5ff"
          stroke="#a78bfa"
          strokeWidth="0.8"
          opacity="0.88"
        />
      </g>
      
      {/* Lower lateral petals (wing petals) */}
      <g opacity="0.85">
        {/* Left lower petal */}
        <path
          d="M50 50 C 32 62, 18 74, 20 86 C 22 92, 32 84, 50 50"
          fill="#e9d5ff"
          stroke="#a78bfa"
          strokeWidth="0.75"
        />
        {/* Right lower petal */}
        <path
          d="M50 50 C 68 62, 82 74, 80 86 C 78 92, 68 84, 50 50"
          fill="#e9d5ff"
          stroke="#a78bfa"
          strokeWidth="0.75"
        />
      </g>
      
      {/* Center labellum (lip) with complex shape */}
      <g filter="drop-shadow(0 4px 8px rgba(124, 58, 237, 0.2))">
        {/* Labellum main body */}
        <path
          d="M50 50 Q 42 68 45 82 Q 50 88 55 82 Q 58 68, 50 50"
          fill={`url(#${labelGradId})`}
          stroke="#d97706"
          strokeWidth="0.85"
          opacity="0.95"
        />
        
        {/* Labellum ridges/texture */}
        <path d="M47 60 Q 50 72 47 80" stroke="#f59e0b" strokeWidth="0.5" fill="none" opacity="0.6" />
        <path d="M50 60 Q 50 75 50 82" stroke="#f59e0b" strokeWidth="0.5" fill="none" opacity="0.6" />
        <path d="M53 60 Q 50 72 53 80" stroke="#f59e0b" strokeWidth="0.5" fill="none" opacity="0.6" />
        
        {/* Column (anther) - pistil cluster */}
        <ellipse cx="50" cy="50" rx="3.5" ry="4.5" fill="#dc2626" stroke="#1c1917" strokeWidth="0.6" />
        <circle cx="50" cy="48" r="2" fill="#f59e0b" opacity="0.7" />
      </g>
      
      {/* Definition outlines */}
      <g stroke="#1c1917" strokeWidth="0.7" fill="none" opacity="0.3">
        <path d="M50 50 C 28 42, 12 32, 18 14 C 24 8, 32 15, 50 50" />
        <path d="M50 50 C 72 42, 88 32, 82 14 C 76 8, 68 15, 50 50" />
        <path d="M50 50 L 50 8 C 60 12, 65 25, 50 50" />
      </g>
    </svg>
  );
}

function BabyBreathSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={{ width: '100%', height: '100%', overflow: 'visible', ...style }}>
      {/* Stem sketch lines */}
      <g stroke="#1c1917" strokeWidth="1.6" fill="none" opacity="0.8">
        <path d="M50 95 Q 48 60 30 45" />
        <path d="M50 95 Q 52 55 70 40" />
        <path d="M30 45 Q 20 30 18 20" />
        <path d="M30 45 Q 40 30 42 18" />
        <path d="M70 40 Q 60 25 58 15" />
        <path d="M70 40 Q 80 25 82 15" />
      </g>
      
      {/* Tiny white blossom groups with sketch borders */}
      {[{ x: 18, y: 20 }, { x: 42, y: 18 }, { x: 58, y: 15 }, { x: 82, y: 15 }, { x: 30, y: 45 }, { x: 70, y: 40 }].map((pos, i) => (
        <g key={i} transform={`translate(${pos.x} ${pos.y}) scale(0.13)`}>
          {/* Watercolor blossom wash */}
          <circle cx="0" cy="0" r="35" fill="#ffffff" opacity="0.9" />
          <g stroke="#1c1917" strokeWidth="6" fill="none">
            <circle cx="0" cy="0" r="30" />
            <path d="M -30 0 L 30 0" />
            <path d="M 0 -30 L 0 30" />
          </g>
          <circle cx="0" cy="0" r="10" fill="#fde68a" />
        </g>
      ))}
    </svg>
  );
}

function LeafGreenSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const filterId = "sketch-leaf-filter";
  return (
    <svg viewBox="0 0 100 100" className={className} style={{ width: '100%', height: '100%', overflow: 'visible', ...style }}>
      <defs>
        <WatercolorFilter id={filterId} />
        <linearGradient id="leafWash" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="60%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      
      {/* Color wash */}
      <g filter={`url(#${filterId})`} opacity="0.85">
        <path d="M50 95 C 10 70, 10 30, 50 5 C 90 30, 90 70, 50 95 Z" fill="url(#leafWash)" />
      </g>
      
      {/* Sketch outlines */}
      <SketchOutline d="M50 95 C 10 70, 10 30, 50 5 C 90 30, 90 70, 50 95" />
      
      {/* Veins */}
      <g stroke="#1c1917" strokeWidth="1.2" fill="none" opacity="0.75" strokeLinecap="round">
        <path d="M50 90 L 50 10" />
        <path d="M50 70 Q 30 60 22 55" />
        <path d="M50 70 Q 70 60 78 55" />
        <path d="M50 50 Q 30 40 24 35" />
        <path d="M50 50 Q 70 40 76 35" />
      </g>
    </svg>
  );
}

function FernSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const filterId = "sketch-fern-filter";
  return (
    <svg viewBox="0 0 100 100" className={className} style={{ width: '100%', height: '100%', overflow: 'visible', ...style }}>
      <defs>
        <WatercolorFilter id={filterId} />
      </defs>
      
      {/* Stem sketch line */}
      <g stroke="#1c1917" strokeWidth="1.8" fill="none" opacity="0.85" strokeLinecap="round">
        <path d="M50 98 Q 48 55 50 10" />
      </g>
      
      {/* Leaf wash & sketch */}
      {Array.from({ length: 9 }).map((_, i) => {
        const y = 85 - i * 8;
        const width = 36 - i * 2.5;
        return (
          <g key={i}>
            {/* Color wash */}
            <g filter={`url(#${filterId})`} opacity="0.8">
              <path d={`M50 ${y} Q ${50 - width} ${y - 4} ${50 - width} ${y - 10} Z`} fill="#16a34a" />
              <path d={`M50 ${y} Q ${50 + width} ${y - 4} ${50 + width} ${y - 10} Z`} fill="#16a34a" />
            </g>
            {/* Sketch border */}
            <g stroke="#1c1917" strokeWidth="1.2" fill="none" opacity="0.85" strokeLinecap="round">
              <path d={`M50 ${y} Q ${50 - width} ${y - 4} ${50 - width} ${y - 10} Q ${50 - width / 2} ${y - 5} 50 ${y}`} />
              <path d={`M50 ${y} Q ${50 + width} ${y - 4} ${50 + width} ${y - 10} Q ${50 + width / 2} ${y - 5} 50 ${y}`} />
            </g>
          </g>
        );
      })}
    </svg>
  );
}

function EucalyptusSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const filterId = "sketch-euc-filter";
  return (
    <svg viewBox="0 0 100 100" className={className} style={{ width: '100%', height: '100%', overflow: 'visible', ...style }}>
      <defs>
        <WatercolorFilter id={filterId} />
        <linearGradient id="eucWash" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      
      {/* Stem sketch */}
      <g stroke="#1c1917" strokeWidth="1.8" fill="none" opacity="0.85">
        <path d="M50 98 Q 49 55 50 10" />
      </g>
      
      {/* Leaves wash and sketch */}
      {Array.from({ length: 6 }).map((_, i) => {
        const y = 80 - i * 13;
        const r = 16 - i * 1.5;
        return (
          <g key={i}>
            {/* Color wash */}
            <g filter={`url(#${filterId})`} opacity="0.8">
              <circle cx={50 - r} cy={y} r={r} fill="url(#eucWash)" />
              <circle cx={50 + r} cy={y} r={r} fill="url(#eucWash)" />
            </g>
            {/* Sketch outline */}
            <g stroke="#1c1917" strokeWidth="1.4" fill="none" opacity="0.85">
              <circle cx={50 - r} cy={y} r={r} />
              <circle cx={50 + r} cy={y} r={r} />
              <circle cx="50" cy={y} r="3" fill="#1c1917" />
            </g>
          </g>
        );
      })}
    </svg>
  );
}

function JasmineSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const uniqueId = React.useId().replace(/:/g, '');
  const bloomGradientId = `jasmineBloom-${uniqueId}`;
  return (
    <svg viewBox="0 0 100 100" className={className} style={{ width: '100%', height: '100%', overflow: 'visible', ...style }}>
      <defs>
        <radialGradient id={bloomGradientId} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#fffef7" />
          <stop offset="65%" stopColor="#fff7d6" />
          <stop offset="100%" stopColor="#f5d98b" />
        </radialGradient>
      </defs>

      <g stroke="#1c1917" strokeWidth="1.35" fill="none" opacity="0.9" strokeLinecap="round">
        <path d="M50 96 Q 50 63 50 14" />
        <path d="M50 56 Q 39 47 31 42" />
        <path d="M50 56 Q 61 48 69 42" />
        <path d="M50 74 Q 43 70 37 66" />
        <path d="M50 74 Q 57 70 63 66" />
      </g>

      <g transform="translate(50 28)">
        {[0, 72, 144, 216, 288].map((rot, idx) => (
          <g key={idx} transform={`rotate(${rot})`}>
            <path d="M0 0 C -8 -4, -16 4, -11 12 C -6 20, 6 20, 11 12 C 16 4, 8 -4, 0 0 Z" fill={`url(#${bloomGradientId})`} stroke="#1c1917" strokeWidth="1.25" />
          </g>
        ))}
        <circle cx="0" cy="0" r="4.8" fill="#f59e0b" stroke="#1c1917" strokeWidth="1" />
      </g>

      <g transform="translate(50 58)">
        {[0, 72, 144, 216, 288].map((rot, idx) => (
          <g key={idx} transform={`rotate(${rot})`}>
            <path d="M0 0 C -6 -3, -13 3, -9 9 C -5 15, 5 15, 9 9 C 13 3, 6 -3, 0 0 Z" fill="#fffdf2" stroke="#1c1917" strokeWidth="1" opacity="0.98" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function LotusSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const uniqueId = React.useId().replace(/:/g, '');
  const glowGradientId = `lotusGlow-${uniqueId}`;
  const stemGradientId = `lotusStem-${uniqueId}`;
  return (
    <svg viewBox="0 0 100 100" className={className} style={{ width: '100%', height: '100%', overflow: 'visible', ...style }}>
      <defs>
        <radialGradient id={glowGradientId} cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#fff1f2" />
          <stop offset="55%" stopColor="#f9a8d4" />
          <stop offset="100%" stopColor="#db2777" />
        </radialGradient>
        <linearGradient id={stemGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
      </defs>

      <g stroke="#1c1917" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
        <path d="M50 96 Q 50 78 50 64" />
        <path d="M50 70 Q 40 63 34 58" />
        <path d="M50 70 Q 60 63 66 58" />
      </g>

      <g filter="drop-shadow(0 8px 16px rgba(190,24,93,0.12))">
        <path d="M50 18 C 42 30, 38 41, 50 53 C 62 41, 58 30, 50 18 Z" fill={`url(#${glowGradientId})`} stroke="#1c1917" strokeWidth="1.4" />
        <path d="M34 23 C 26 35, 24 47, 37 58 C 44 47, 42 33, 34 23 Z" fill="#fbcfe8" stroke="#1c1917" strokeWidth="1.2" />
        <path d="M66 23 C 74 35, 76 47, 63 58 C 56 47, 58 33, 66 23 Z" fill="#fbcfe8" stroke="#1c1917" strokeWidth="1.2" />
        <path d="M22 42 C 26 58, 38 68, 50 66 C 38 54, 32 44, 22 42 Z" fill="#f472b6" opacity="0.95" stroke="#1c1917" strokeWidth="1.2" />
        <path d="M78 42 C 74 58, 62 68, 50 66 C 62 54, 68 44, 78 42 Z" fill="#f472b6" opacity="0.95" stroke="#1c1917" strokeWidth="1.2" />
        <path d="M38 52 C 41 71, 46 81, 50 83 C 54 81, 59 71, 62 52 C 57 56, 53 58, 50 60 C 47 58, 43 56, 38 52 Z" fill="#fff1f2" stroke="#1c1917" strokeWidth="1.25" />
        <path d="M42 60 C 45 69, 47 75, 50 77 C 53 75, 55 69, 58 60" fill="none" stroke="#1c1917" strokeWidth="0.95" opacity="0.65" />
      </g>

      <path d="M50 96 Q 50 78 50 64" stroke={`url(#${stemGradientId})`} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

function MarigoldSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const uniqueId = React.useId().replace(/:/g, '');
  const glowGradientId = `marigoldGlow-${uniqueId}`;
  return (
    <svg viewBox="0 0 100 100" className={className} style={{ width: '100%', height: '100%', overflow: 'visible', ...style }}>
      <defs>
        <radialGradient id={glowGradientId} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="55%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#c2410c" />
        </radialGradient>
      </defs>

      <g stroke="#1c1917" strokeWidth="1.25" fill="none" strokeLinecap="round" opacity="0.92">
        <path d="M50 96 Q 50 66 50 14" />
      </g>

      <g filter="drop-shadow(0 8px 14px rgba(180,83,9,0.14))">
        {Array.from({ length: 14 }).map((_, i) => {
          const rot = i * 25.714;
          return (
            <g key={i} transform={`rotate(${rot} 50 42)`}>
              <path d="M50 42 C 39 28, 38 16, 50 12 C 62 16, 61 28, 50 42 Z" fill={`url(#${glowGradientId})`} stroke="#1c1917" strokeWidth="1.1" />
            </g>
          );
        })}
        <circle cx="50" cy="42" r="14" fill="#f59e0b" stroke="#1c1917" strokeWidth="1.2" />
        <circle cx="50" cy="42" r="8" fill="#fb923c" stroke="#1c1917" strokeWidth="0.95" />
      </g>
    </svg>
  );
}

// Sparkle element
function SparkleSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={{ width: '100%', height: '100%', overflow: 'visible', ...style }}>
      <defs>
        <radialGradient id="sparkleWash" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M50 0 Q 50 50 0 50 Q 50 50 50 100 Q 50 50 100 50 Q 50 50 50 0 Z" fill="url(#sparkleWash)" opacity="0.8" />
      <polygon points="50,15 54,46 85,50 54,54 50,85 46,54 15,50 46,46" fill="#f59e0b" stroke="#1c1917" strokeWidth="1.2" />
    </svg>
  );
}