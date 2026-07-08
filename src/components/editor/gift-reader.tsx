"use client";

import React, { useState, useEffect } from 'react';
import { useGiftStore } from '@/store/useGiftStore';
import { RecipientUnboxing } from './recipient-unboxing';
import { LoadingScreen } from './loading-screen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { persistenceService } from '@/services/persistence.service';
import { Lock, AlertTriangle, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface GiftReaderProps {
  shareCode: string;
}

export function GiftReader({ shareCode }: GiftReaderProps) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [realPassword, setRealPassword] = useState('');
  const [giftId, setGiftId] = useState('');
  
  // Track open time analytics
  const startTimeRef = React.useRef<number>(0);

  useEffect(() => {
    const loadGiftData = async () => {
      setLoading(true);
      try {
        const data = await persistenceService.loadGiftByShareCode(shareCode);
        if (!data) {
          setNotFound(true);
          return;
        }

        const { bouquet, canvasJson, giftConfig } = data;
        setGiftId(bouquet.id);

        if (giftConfig) {
          // 1. Expiry Check
          if (giftConfig.expiryDate) {
            const exp = new Date(giftConfig.expiryDate);
            const now = new Date();
            if (exp.getTime() < now.getTime()) {
              setIsExpired(true);
              setLoading(false);
              return;
            }
          }

          // 2. Password Check
          if (giftConfig.isPrivate && giftConfig.password) {
            setIsLocked(true);
            setRealPassword(giftConfig.password);
          }

          // 3. Load gift config states into Zustand store
          const setStore = useGiftStore.setState;
          setStore({
            envelopeCategory: giftConfig.envelopeCategory || 'love',
            envelopeColor: giftConfig.envelopeColor || '#e11d48',
            envelopeTexture: giftConfig.envelopeTexture || 'linen',
            waxSealType: giftConfig.waxSealType || 'rose',
            sealColor: giftConfig.sealColor || '#fbbf24',
            ribbonColor: giftConfig.ribbonColor || '#be123c',
            envelopeStickers: giftConfig.envelopeStickers || [],
            letterTemplate: giftConfig.letterTemplate || 'love',
            fontFamily: giftConfig.fontFamily || 'Caveat',
            fontSize: giftConfig.fontSize || 18,
            textColor: giftConfig.textColor || '#4c0519',
            paperTexture: giftConfig.paperTexture || 'parchment',
            borderStyle: giftConfig.borderStyle || 'floral',
            textContent: giftConfig.textContent || '',
            signatureText: giftConfig.signatureText || '',
            typingSpeed: giftConfig.typingSpeed || 'medium',
            effectType: giftConfig.effectType || 'petals',
            locale: giftConfig.locale || 'en',
            voiceUrl: giftConfig.voiceUrl || null,
            voiceDuration: giftConfig.voiceDuration || 0,
            musicUrl: giftConfig.musicUrl || '',
            musicTitle: giftConfig.musicTitle || '',
            musicVolume: giftConfig.musicVolume || 0.5,
            photos: giftConfig.photos || [],
            photoLayout: giftConfig.photoLayout || 'polaroid',
            attachedGifts: giftConfig.attachedGifts || [],
            isPrivate: giftConfig.isPrivate || false,
            password: giftConfig.password || '',
            expiryDate: giftConfig.expiryDate || '',
            disableComments: giftConfig.disableComments || false,
            disableReactions: giftConfig.disableReactions || false,
            isPreviewOpen: false,
            timelineStyle: giftConfig.timelineStyle || 'love',
            journeyMemories: giftConfig.journeyMemories || [],
            recipientReturnedMemory: giftConfig.recipientReturnedMemory || null
          });
        }

        // 4. Track View Analytics
        // Check if visitor has viewed this gift recently using session storage
        const viewKey = `bloombox_viewed_${bouquet.id}`;
        const hasViewed = sessionStorage.getItem(viewKey);
        if (!hasViewed) {
          sessionStorage.setItem(viewKey, 'true');
          persistenceService.trackView(bouquet.id, true);
        } else {
          persistenceService.trackView(bouquet.id, false);
        }

        startTimeRef.current = Date.now();
      } catch (err) {
        console.error('Error loading gift reader details:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadGiftData();

    // Log open time duration on unmount
    return () => {
      if (startTimeRef.current > 0 && giftId) {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        if (elapsed > 0) {
          persistenceService.trackOpenTime(giftId, elapsed);
        }
      }
    };
  }, [shareCode, giftId]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === realPassword) {
      setIsLocked(false);
      toast.success('Gift Box unlocked!');
      startTimeRef.current = Date.now();
    } else {
      toast.error('Invalid password code');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // Beautiful 404 Gift not found page
  if (notFound) {
    return (
      <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center space-y-4 px-4 select-none">
        <div className="h-14 w-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500 text-2xl">
          🥀
        </div>
        <div className="text-center space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight text-white">Gift Box Not Found</h1>
          <p className="text-xs text-zinc-500 font-medium">The link might be broken, or the sender has deleted the gift.</p>
        </div>
        <Button 
          onClick={() => window.location.href = '/'}
          className="h-8.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs rounded-lg px-4 cursor-pointer"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  // Expired view
  if (isExpired) {
    return (
      <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center space-y-4 px-4 select-none">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <div className="text-center space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight text-white">This Gift Has Expired</h1>
          <p className="text-xs text-zinc-500 font-medium">Digital gifts expire automatically after their scheduled timeframe.</p>
        </div>
        <Button 
          onClick={() => window.location.href = '/'}
          className="h-8.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs rounded-lg px-4 cursor-pointer"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  // Password Unlock screen
  if (isLocked) {
    return (
      <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center px-4 select-none">
        <form 
          onSubmit={handleUnlock}
          className="max-w-sm w-full p-8 border border-zinc-900 bg-zinc-900/30 rounded-2xl shadow-2xl text-center space-y-5 backdrop-blur"
        >
          <div className="h-11 w-11 rounded-full bg-zinc-950 border border-zinc-850 flex items-center justify-center mx-auto">
            <Lock className="h-5 w-5 text-amber-500" />
          </div>

          <div className="space-y-1">
            <h1 className="text-lg font-bold text-white">Password Protected Gift</h1>
            <p className="text-[11px] text-zinc-500 leading-normal">
              Enter the passcode shared by the sender to open this BloomBox gift.
            </p>
          </div>

          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Enter passcode"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="h-9 text-center bg-zinc-950 border-zinc-800 text-xs tracking-wider"
              autoFocus
            />
            <Button
              type="submit"
              className="w-full h-9 bg-amber-500 hover:bg-amber-450 text-zinc-950 font-bold text-xs rounded-lg cursor-pointer"
            >
              Unlock Gift Box
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Return the recipient experience unboxing card
  return <RecipientUnboxing />;
}
export default GiftReader;
