'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ShareAttributionProps {
  shareUrl?: string;
  className?: string;
}

export default function ShareAttribution({ shareUrl, className = '' }: ShareAttributionProps) {
  const [copied, setCopied] = useState(false);

  const getTargetUrl = () => {
    if (shareUrl) return shareUrl;
    if (typeof window !== 'undefined') return window.location.href;
    return 'https://bloombox.app';
  };

  const handleCopyLink = async () => {
    const url = getTargetUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = async () => {
    const url = getTargetUrl();
    const shareData = {
      title: 'BloomBox',
      text: 'I created a digital flower bouquet for you! Open it here:',
      url: url,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-6 py-6 ${className}`}>
      {/* Top Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleCopyLink}
          className="text-white font-mono text-xs sm:text-sm font-bold tracking-wider px-6 py-2.5 rounded-full shadow-md shadow-rose-200/50 hover:scale-105 active:scale-95 transition-all cursor-pointer uppercase select-none min-w-[120px] text-center"
          style={{
            background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
          }}
        >
          {copied ? 'COPIED!' : 'COPY LINK'}
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="bg-white text-rose-600 border border-rose-300 hover:bg-rose-50 hover:border-rose-400 font-mono text-xs sm:text-sm font-bold tracking-wider px-6 py-2.5 rounded-full shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer uppercase select-none min-w-[100px] text-center"
        >
          SHARE
        </button>
      </div>

      {/* Attribution Text Block */}
      <div className="text-center font-mono text-xs sm:text-sm text-stone-700 leading-relaxed space-y-1 select-none">
        <p className="tracking-tight">
          made with bloombox, a tool by{' '}
          <a
            href="https://github.com/DIVYA-PAWAR-03"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 text-rose-600 hover:text-rose-700 transition-colors font-medium"
          >
            @divyapawar
          </a>
        </p>
        <p className="tracking-tight">
          <Link
            href="/create"
            className="underline underline-offset-2 text-stone-800 hover:text-rose-600 transition-colors font-medium"
          >
            make a bouquet now!
          </Link>
        </p>
      </div>
    </div>
  );
}
