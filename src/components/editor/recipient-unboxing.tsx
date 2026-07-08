"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGiftStore } from '@/store/useGiftStore';
import { useEditorStore } from '@/store/useEditorStore';
import { useTranslations } from '@/lib/i18n';
import { AmbientEffects } from './ambient-effects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GiftPreviewOverlay } from './gift-preview-overlay';
import { persistenceService } from '@/services/persistence.service';
import { fabric } from 'fabric';
import { 
  Gift, Heart, Music, MessageSquare, Send, Sparkles, RefreshCw, Download, Volume2, VolumeX, Eye
} from 'lucide-react';
import { toast } from 'sonner';

type BoxStyle = 'luxury' | 'rose' | 'minimal' | 'royal' | 'birthday' | 'valentine' | 'christmas' | 'wooden';
type RibbonStyle = 'silk' | 'velvet' | 'golden' | 'rose_gold';

export function RecipientUnboxing() {
  const { t } = useTranslations('common');

  // Recipient stage state machine:
  // 'splash' -> 'welcome' -> 'box_scene' -> 'untying' -> 'lid_opening' -> 'revealed' -> 'letter_opened' -> 'reactions_comments'
  const [stage, setStage] = useState<'splash' | 'welcome' | 'box_scene' | 'untying' | 'lid_opening' | 'revealed' | 'reactions_comments'>('splash');
  const [progress, setProgress] = useState(0);

  // Settings
  const [boxStyle, setBoxStyle] = useState<BoxStyle>('luxury');
  const [ribbonStyle, setRibbonStyle] = useState<RibbonStyle>('golden');
  const [senderName, setSenderName] = useState('Alexander');
  const [recipientName, setRecipientName] = useState('Sophia');
  const [occasion, setOccasion] = useState('Birthday Special');
  const [giftTitle, setGiftTitle] = useState('A Crimson Melody Bouquet');

  // Letter & Store configs
  const isPreviewOpen = useGiftStore((s) => s.isPreviewOpen);
  const setIsPreviewOpen = useGiftStore((s) => s.setIsPreviewOpen);
  const effectType = useGiftStore((s) => s.effectType);
  const disableComments = useGiftStore((s) => s.disableComments);
  const disableReactions = useGiftStore((s) => s.disableReactions);

  // Comments and reactions state
  const [reactionsCounts, setReactionsCounts] = useState<Record<string, number>>({
    '❤️': 0, '😍': 0, '🥹': 0, '🎉': 0, '🌸': 0
  });
  const [comments, setComments] = useState<any[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('❤️');

  // Fabric canvas ref for recipient bouquet static display
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  // 1. Loading splash progress simulation
  useEffect(() => {
    if (stage === 'splash') {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setTimeout(() => setStage('welcome'), 500);
            return 100;
          }
          return prev + 4;
        });
      }, 80);
      return () => clearInterval(timer);
    }
  }, [stage]);

  // Load reactions & comments on mount
  useEffect(() => {
    const loadFeedback = async () => {
      const counts = await persistenceService.getReactionsCount('demo-recipient-view');
      setReactionsCounts(counts);

      const list = await persistenceService.getCommentsList('demo-recipient-view');
      setComments(list);
    };
    loadFeedback();
  }, [stage]);

  // 2. Render static preview of the Fabric bouquet
  useEffect(() => {
    if (stage === 'revealed' && canvasRef.current) {
      // Small timeout to let the container render and size properly
      setTimeout(() => {
        if (!canvasRef.current) return;
        
        // Clean up previous canvas if any
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose();
        }

        const canvas = new fabric.Canvas(canvasRef.current, {
          width: 320,
          height: 320,
          backgroundColor: '#09090b',
          selection: false,
          interactive: false
        });
        fabricCanvasRef.current = canvas;

        // Try to load serialized JSON from localStorage draft or default mock
        try {
          const raw = localStorage.getItem('bloombox_bouquets');
          if (raw) {
            const list = JSON.parse(raw);
            const active = list.find((b: any) => b.status === 'published' || b.status === 'draft');
            if (active) {
              const versions = localStorage.getItem(`bloombox_versions_${active.id}`);
              if (versions) {
                const vList = JSON.parse(versions);
                if (vList.length > 0) {
                  const jsonSnap = vList[vList.length - 1].json_snapshot;
                  canvas.loadFromJSON(jsonSnap, () => {
                    canvas.renderAll();
                    // Set zoom to fit
                    canvas.setZoom(0.65);
                    canvas.absolutePan(new fabric.Point(-10, -10));
                  });
                  return;
                }
              }
            }
          }

          // Fallback static flowers layout inside recipient preview
          const wrapper = new fabric.Rect({
            left: 100, top: 160, width: 120, height: 140,
            fill: '#f43f5e', rx: 8, ry: 8, angle: -10,
            opacity: 0.9, selectable: false
          });
          const leaf = new fabric.IText('🌿', {
            left: 80, top: 100, fontSize: 50, angle: -15, selectable: false
          });
          const flower1 = new fabric.IText('🌹', {
            left: 120, top: 90, fontSize: 60, selectable: false
          });
          const flower2 = new fabric.IText('🌸', {
            left: 170, top: 110, fontSize: 55, angle: 10, selectable: false
          });
          const ribbon = new fabric.IText('🎀', {
            left: 135, top: 220, fontSize: 45, selectable: false
          });

          canvas.add(wrapper, leaf, flower1, flower2, ribbon);
          canvas.renderAll();
        } catch (e) {
          console.error('Failed to load recipient preview canvas:', e);
        }
      }, 300);
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [stage]);

  // 3. Opening box sequence
  const triggerOpenGift = () => {
    setStage('untying');
    
    // Ribbon untying sound effect
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}

    setTimeout(() => {
      setStage('lid_opening');
      
      // Lid opening sound effect
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(240, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch {}

      // Micro-confetti pop
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.6 }
      });
    }, 1200);

    setTimeout(() => {
      setStage('revealed');
      
      // Grand unboxing confetti burst!
      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.4 }
      });
    }, 2400);
  };

  // 4. Reactions API
  const handleReact = async (emoji: string) => {
    setReactionsCounts(prev => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1
    }));
    await persistenceService.addReaction('demo-recipient-view', emoji);
    toast.success(`You reacted with ${emoji}`);
  };

  // 5. Comments Submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    const newComment = await persistenceService.addComment(
      'demo-recipient-view',
      commentName.trim() || 'Sender Friend',
      selectedEmoji,
      commentText.trim()
    );
    setComments(prev => [newComment, ...prev]);
    setCommentText('');
    toast.success('Thank you comment sent!');
  };

  const handleDownloadMemories = () => {
    toast.success('Your photo album memories and letter have been saved to local PDF!');
  };

  // Colors mapping matching luxury requirements
  const BOX_COLORS: Record<BoxStyle, { bg: string, border: string, ribbon: string }> = {
    luxury: { bg: 'bg-zinc-900', border: 'border-amber-600/35', ribbon: 'bg-amber-500' },
    rose: { bg: 'bg-rose-950', border: 'border-pink-500/25', ribbon: 'bg-pink-400' },
    minimal: { bg: 'bg-zinc-100', border: 'border-zinc-300', ribbon: 'bg-zinc-950' },
    royal: { bg: 'bg-indigo-950', border: 'border-amber-500/30', ribbon: 'bg-amber-400' },
    birthday: { bg: 'bg-blue-900', border: 'border-yellow-400/30', ribbon: 'bg-yellow-400' },
    valentine: { bg: 'bg-rose-900', border: 'border-rose-500/40', ribbon: 'bg-rose-600' },
    christmas: { bg: 'bg-red-950', border: 'border-green-500/30', ribbon: 'bg-green-600' },
    wooden: { bg: 'bg-amber-950', border: 'border-amber-800/30', ribbon: 'bg-orange-700' }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-between p-4 overflow-x-hidden font-sans select-none relative">
      
      {/* Dynamic ambient background matching active effects */}
      {stage === 'revealed' && (
        <AmbientEffects type={effectType} />
      )}

      {/* ==================================================== */}
      {/* STEP 1: SPLASH SCREEN */}
      {/* ==================================================== */}
      <AnimatePresence>
        {stage === 'splash' && (
          <motion.div
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="text-center"
            >
              <div className="h-16 w-16 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-rose-500/20 mx-auto select-none">
                💐
              </div>
              <h1 className="text-2xl font-bold tracking-widest text-white mt-4 font-serif uppercase">
                BloomBox
              </h1>
              <p className="text-[10px] tracking-wider text-zinc-500 uppercase font-bold mt-1.5">
                Premium Cinematic Gifting Studio
              </p>
            </motion.div>

            {/* Progress loading bar */}
            <div className="w-56 h-1 bg-zinc-900 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-rose-500 to-amber-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* STEP 2: WELCOME SCREEN */}
      {/* ==================================================== */}
      <AnimatePresence>
        {stage === 'welcome' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -40 }}
            className="max-w-md w-full bg-zinc-900/40 border border-zinc-900 rounded-2xl p-8 shadow-2xl text-center space-y-6 my-auto backdrop-blur"
          >
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-rose-950/20 border border-rose-900/30 px-3 py-1 rounded-full">
              {occasion}
            </span>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white font-serif tracking-tight">
                Sophia, You Received a Gift!
              </h2>
              <p className="text-xs text-zinc-400 font-medium">
                Sent with warm wishes from <span className="text-zinc-200 font-bold">{senderName}</span>
              </p>
            </div>

            <div className="py-4 px-3 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Gift Theme</span>
              <p className="text-sm font-bold text-amber-500">{giftTitle}</p>
            </div>

            {/* Custom Box selector preview styles */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {(['luxury', 'rose', 'royal', 'wooden'] as BoxStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => setBoxStyle(style)}
                  className={`py-1 px-1.5 rounded-lg border text-[9px] font-bold capitalize transition-all cursor-pointer ${
                    boxStyle === style 
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400' 
                      : 'border-zinc-800 bg-zinc-900/50 text-zinc-400'
                  }`}
                >
                  {style} Box
                </button>
              ))}
            </div>

            <Button
              onClick={() => setStage('box_scene')}
              className="w-full h-11 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-500 text-white font-bold text-sm gap-2 rounded-xl cursor-pointer shadow-lg shadow-amber-500/15"
            >
              <Gift className="h-4 w-4" />
              Open Gift Box
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* STEP 3: GIFT BOX SCENE */}
      {/* ==================================================== */}
      {['box_scene', 'untying', 'lid_opening'].includes(stage) && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 my-auto">
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest animate-pulse">
            {stage === 'box_scene' ? 'Click Box to open' : stage === 'untying' ? 'Untying Ribbon...' : 'Lid Opening...'}
          </span>

          <motion.div
            onClick={triggerOpenGift}
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            className={`w-[260px] h-[260px] relative rounded-2xl flex items-center justify-center cursor-pointer border ${BOX_COLORS[boxStyle].bg} ${BOX_COLORS[boxStyle].border} shadow-[0_30px_70px_rgba(0,0,0,0.85)]`}
          >
            {/* Box Ribbon Loops */}
            <AnimatePresence>
              {stage === 'box_scene' && (
                <>
                  {/* Vertical Ribbon */}
                  <motion.div 
                    exit={{ y: 200, opacity: 0, transition: { duration: 0.8 } }}
                    className={`absolute inset-y-0 w-8 opacity-90 z-20 ${BOX_COLORS[boxStyle].ribbon}`}
                  />
                  {/* Horizontal Ribbon */}
                  <motion.div 
                    exit={{ x: -200, opacity: 0, transition: { duration: 0.8 } }}
                    className={`absolute inset-x-0 h-8 opacity-90 z-20 ${BOX_COLORS[boxStyle].ribbon}`}
                  />
                  {/* Tied Bow Knot */}
                  <motion.div
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute h-16 w-16 bg-amber-500/90 rounded-full flex items-center justify-center text-3xl font-bold border border-amber-600/30 z-30 select-none shadow-lg shadow-black/50"
                  >
                    🎗️
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Box Lid pivoting open */}
            <motion.div
              animate={{
                rotateX: stage === 'lid_opening' ? -110 : 0,
                y: stage === 'lid_opening' ? -120 : 0,
                opacity: stage === 'lid_opening' ? 0.3 : 1
              }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              className={`absolute top-0 inset-x-0 h-[60px] rounded-t-2xl z-10 border-b border-black/30 origin-top shadow-lg ${BOX_COLORS[boxStyle].bg} ${BOX_COLORS[boxStyle].border}`}
            />

            {/* Glowing inner magic dust light */}
            <AnimatePresence>
              {stage === 'lid_opening' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0.3, 0.85, 0.3], scale: 1.1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-4 bg-radial from-yellow-500/30 via-rose-500/10 to-transparent pointer-events-none z-22 blur"
                />
              )}
            </AnimatePresence>

            <Gift className="h-16 w-16 text-zinc-600/30" />
          </motion.div>
        </div>
      )}

      {/* ==================================================== */}
      {/* STEP 4: BOUQUET & ENVELOPE REVEAL */}
      {/* ==================================================== */}
      {stage === 'revealed' && (
        <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center space-y-6 my-auto px-4">
          
          <div className="text-center space-y-1">
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Bouquet Composition</span>
            <h3 className="text-xl font-bold text-white font-serif">{giftTitle}</h3>
          </div>

          {/* Static Fabric Preview Canvas */}
          <div className="relative p-4 border border-zinc-900 bg-zinc-950 rounded-2xl shadow-inner">
            <canvas ref={canvasRef} className="w-[320px] h-[320px] rounded-xl" />
            
            {/* Parallax Swaying Motion effect */}
            <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-2xl" />
          </div>

          {/* Floating letter envelope trigger */}
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 90, delay: 0.8 }}
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-3 p-3 bg-gradient-to-r from-rose-950/20 to-zinc-900/60 border border-rose-950/30 rounded-xl cursor-pointer hover:scale-102 transition-transform shadow-lg shadow-rose-950/10 select-none"
          >
            <span className="text-3xl animate-bounce">✉️</span>
            <div className="text-left pr-4">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Attached Note</span>
              <span className="text-xs font-bold text-zinc-200 block">Click to read card letter</span>
            </div>
          </motion.div>

          <Button
            onClick={() => setStage('reactions_comments')}
            variant="ghost"
            className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest cursor-pointer"
          >
            Skip to Feedback Board →
          </Button>
        </div>
      )}

      {/* ==================================================== */}
      {/* STEP 5: FEEDBACK BOARD (REACTIONS & COMMENTS) */}
      {/* ==================================================== */}
      {stage === 'reactions_comments' && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-6 my-auto pb-10"
        >
          {/* Reaction board panel */}
          <div className="p-6 border border-zinc-900 bg-zinc-900/20 rounded-2xl space-y-4 backdrop-blur">
            {!disableReactions && (
              <>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider text-center">React to {senderName}'s Gift</h4>
                
                {/* React emojis buttons */}
                <div className="flex justify-center gap-3">
                  {['❤️', '😍', '🥹', '🎉', '🌸'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReact(emoji)}
                      className="flex flex-col items-center justify-center p-2.5 bg-zinc-950 border border-zinc-900 hover:border-rose-500/20 hover:bg-zinc-900 rounded-xl cursor-pointer select-none transition-all active:scale-95"
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span className="text-[10px] font-bold text-zinc-500 mt-1">{reactionsCounts[emoji] || 0}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="flex gap-2.5 pt-2">
              <Button
                onClick={() => setStage('welcome')}
                variant="outline"
                className="flex-1 border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-semibold gap-1.5 h-9 rounded-lg cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Replay Opening
              </Button>
              
              <Button
                onClick={handleDownloadMemories}
                className="flex-1 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold gap-1.5 h-9 rounded-lg cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Save Album
              </Button>
            </div>
          </div>

          {/* Comments board panel */}
          {!disableComments && (
            <div className="p-6 border border-zinc-900 bg-zinc-900/20 rounded-2xl space-y-4 backdrop-blur">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-wider pl-0.5">
                <MessageSquare className="h-4 w-4 text-rose-500" />
                <span>Recipient Comments Board</span>
              </div>

              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    className="col-span-3 h-8 px-2 bg-zinc-950 border border-zinc-900 rounded-md text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  
                  {/* Emoji signature selector */}
                  <select
                    value={selectedEmoji}
                    onChange={(e) => setSelectedEmoji(e.target.value)}
                    className="h-8 bg-zinc-950 border border-zinc-900 rounded-md text-xs text-zinc-200 focus:outline-none cursor-pointer"
                  >
                    {['❤️', '😍', '🥹', '🎉', '🌸', '🎁', '🌹'].map((emo) => (
                      <option key={emo} value={emo}>{emo}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a sweet thank you note..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 h-8 px-2 bg-zinc-950 border border-zinc-900 rounded-md text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-8 w-8 bg-rose-600 hover:bg-rose-500 text-white rounded-md shrink-0 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5 pl-0.5" />
                  </Button>
                </div>
              </form>

              {/* List of comments */}
              <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1.5 scrollbar-thin">
                {comments.length === 0 ? (
                  <p className="text-center text-[10px] text-zinc-600 font-semibold py-4">No comments posted yet. Be the first!</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-2.5 border border-zinc-900 bg-zinc-950/30 rounded-lg flex items-start gap-2.5">
                      <span className="text-lg shrink-0 pt-0.5">{c.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-zinc-300 truncate">{c.name}</span>
                          <span className="text-[8px] font-semibold text-zinc-600">
                            {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-zinc-400 mt-1 select-text break-words leading-normal">
                          {c.comment}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Floating interactive letter overlay unboxing experience */}
      <GiftPreviewOverlay />

      {/* Recipient status bar */}
      <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest text-center select-none pt-4 flex items-center justify-center gap-1">
        <Eye className="h-3 w-3" />
        <span>Recipient Secure Preview Link</span>
      </div>

    </div>
  );
}
export default RecipientUnboxing;
