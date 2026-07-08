import { create } from 'zustand';

export type EnvelopeCategory =
  | 'love' | 'birthday' | 'friendship' | 'wedding' | 'minimal'
  | 'luxury' | 'royal' | 'vintage' | 'christmas' | 'valentine'
  | 'mother' | 'father' | 'graduation' | 'congrats';

export type EnvelopeTexture = 'smooth' | 'linen' | 'parchment' | 'kraft';
export type WaxSealType = 'rose' | 'heart' | 'ring' | 'star' | 'none';
export type LetterTemplate =
  | 'love' | 'birthday' | 'friendship' | 'anniversary' | 'wedding'
  | 'minimal' | 'vintage' | 'royal' | 'handwritten' | 'fairy'
  | 'apology' | 'thank_you' | 'sympathy' | 'get_well' | 'just_because';

export type TypingSpeed = 'slow' | 'medium' | 'fast' | 'skip';
export type PhotoLayout = 'single' | 'grid' | 'polaroid' | 'heart' | 'filmstrip' | 'collage';
export type EffectType = 'sparkles' | 'petals' | 'butterflies' | 'fireflies' | 'snow' | 'confetti' | 'glow' | 'none';
export type AppLocale = 'en' | 'hi' | 'mr' | 'ja' | 'fr' | 'de' | 'es';
export type TimelineStyle = 'love' | 'friendship' | 'minimal' | 'luxury' | 'scrapbook' | 'vintage' | 'floral' | 'birthday' | 'wedding' | 'anniversary';

export interface JourneyMemory {
  id: string;
  date: string;
  title: string;
  description: string;
  photoUrl?: string;
  voiceUrl?: string;
  emoji?: string;
  location?: string;
  type: string;
  bgColor?: string;
  stickers?: string[];
  photoLayout?: 'single' | 'grid' | 'filmstrip' | 'polaroid' | 'scrapbook' | 'heart';
  photos?: string[];
  position?: number;
}

export interface PhotoMemory {
  id: string;
  url: string;
  caption?: string;
}

interface GiftStateStore {
  // Locale / Translations
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;

  // Envelope configurations
  envelopeCategory: EnvelopeCategory;
  envelopeColor: string;
  envelopeTexture: EnvelopeTexture;
  waxSealType: WaxSealType;
  sealColor: string;
  ribbonColor: string; // 'none' or color hex
  envelopeStickers: string[]; // Emojis / Sticker icons
  setEnvelopeCategory: (cat: EnvelopeCategory) => void;
  setEnvelopeColor: (color: string) => void;
  setEnvelopeTexture: (tex: EnvelopeTexture) => void;
  setWaxSealType: (seal: WaxSealType) => void;
  setSealColor: (color: string) => void;
  setRibbonColor: (color: string) => void;
  addEnvelopeSticker: (sticker: string) => void;
  clearEnvelopeStickers: () => void;

  // Letter configurations
  letterTemplate: LetterTemplate;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  paperTexture: string;
  borderStyle: string;
  textContent: string;
  signatureText: string;
  typingSpeed: TypingSpeed;
  setLetterTemplate: (tpl: LetterTemplate) => void;
  setFontFamily: (font: string) => void;
  setFontSize: (size: number) => void;
  setTextColor: (color: string) => void;
  setPaperTexture: (tex: string) => void;
  setBorderStyle: (style: string) => void;
  setTextContent: (text: string) => void;
  setSignatureText: (sig: string) => void;
  setTypingSpeed: (speed: TypingSpeed) => void;

  // Voice details
  voiceUrl: string | null;
  voiceDuration: number;
  setVoiceUrl: (url: string | null) => void;
  setVoiceDuration: (sec: number) => void;

  // Music parameters
  musicUrl: string;
  musicTitle: string;
  musicVolume: number;
  musicPlaying: boolean;
  musicLoop: boolean;
  setMusicUrl: (url: string) => void;
  setMusicTitle: (title: string) => void;
  setMusicVolume: (vol: number) => void;
  setMusicPlaying: (play: boolean) => void;
  setMusicLoop: (loop: boolean) => void;

  // Photo Memories
  photos: PhotoMemory[];
  photoLayout: PhotoLayout;
  addPhoto: (url: string, caption?: string) => void;
  removePhoto: (id: string) => void;
  setPhotoLayout: (layout: PhotoLayout) => void;
  clearPhotos: () => void;

  // Attached Gifts list
  attachedGifts: string[]; // e.g. ['teddy', 'chocolate']
  toggleAttachedGift: (giftId: string) => void;
  clearAttachedGifts: () => void;

  // Special Ambient Effects
  effectType: EffectType;
  setEffectType: (effect: EffectType) => void;

  // Preview overlay trigger
  isPreviewOpen: boolean;
  setIsPreviewOpen: (open: boolean) => void;

  // Gift Settings (Phase 7)
  isPrivate: boolean;
  password: string;
  expiryDate: string;
  disableComments: boolean;
  disableReactions: boolean;
  senderName: string;
  recipientName: string;
  occasion: string;
  giftTitle: string;
  setIsPrivate: (priv: boolean) => void;
  setPassword: (pass: string) => void;
  setExpiryDate: (date: string) => void;
  setDisableComments: (dis: boolean) => void;
  setDisableReactions: (dis: boolean) => void;
  setSenderName: (name: string) => void;
  setRecipientName: (name: string) => void;
  setOccasion: (occ: string) => void;
  setGiftTitle: (title: string) => void;

  // Journey Timeline (Phase 8)
  timelineStyle: TimelineStyle;
  journeyMemories: JourneyMemory[];
  recipientReturnedMemory: JourneyMemory | null;
  setTimelineStyle: (style: TimelineStyle) => void;
  addJourneyMemory: (memory: Omit<JourneyMemory, 'id'>) => void;
  removeJourneyMemory: (id: string) => void;
  updateJourneyMemory: (id: string, updates: Partial<JourneyMemory>) => void;
  setJourneyMemories: (memories: JourneyMemory[]) => void;
  duplicateJourneyMemory: (id: string) => void;
  setRecipientReturnedMemory: (memory: JourneyMemory | null) => void;

  // Custom Bouquet properties
  bouquetStyle: string;
  wrappingPaper: string;
  flowers: any[];
  setBouquetStyle: (style: string) => void;
  setWrappingPaper: (paper: string) => void;
  setFlowers: (flowers: any[]) => void;
  addFlower: (flower: any) => void;
  removeFlower: (id: string) => void;
  updateFlowerPosition: (id: string, x: number, y: number) => void;
  clearFlowers: () => void;
}

export const useGiftStore = create<GiftStateStore>((set) => ({
  locale: 'en',
  setLocale: (locale) => set({ locale }),

  // Envelopes default values
  envelopeCategory: 'love',
  envelopeColor: '#e11d48', // deep crimson rose
  envelopeTexture: 'linen',
  waxSealType: 'rose',
  sealColor: '#fbbf24', // gold stamp
  ribbonColor: '#be123c',
  envelopeStickers: [],
  setEnvelopeCategory: (envelopeCategory) => set({ envelopeCategory }),
  setEnvelopeColor: (envelopeColor) => set({ envelopeColor }),
  setEnvelopeTexture: (envelopeTexture) => set({ envelopeTexture }),
  setWaxSealType: (waxSealType) => set({ waxSealType }),
  setSealColor: (sealColor) => set({ sealColor }),
  setRibbonColor: (ribbonColor) => set({ ribbonColor }),
  addEnvelopeSticker: (sticker) => set((s) => ({ envelopeStickers: [...s.envelopeStickers, sticker] })),
  clearEnvelopeStickers: () => set({ envelopeStickers: [] }),

  // Letters default values
  letterTemplate: 'love',
  fontFamily: 'Caveat',
  fontSize: 18,
  textColor: '#4c0519', // romantic rose tint
  paperTexture: 'parchment',
  borderStyle: 'floral',
  textContent: 'My Dearest,\n\nWords cannot express the joy you bring into my life. Every petal in this bouquet is a reminder of our beautiful moments together.\n\nAlways and forever yours.',
  signatureText: 'With Love',
  typingSpeed: 'medium',
  setLetterTemplate: (letterTemplate) => set({ letterTemplate }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setFontSize: (fontSize) => set({ fontSize }),
  setTextColor: (textColor) => set({ textColor }),
  setPaperTexture: (paperTexture) => set({ paperTexture }),
  setBorderStyle: (borderStyle) => set({ borderStyle }),
  setTextContent: (textContent) => set({ textContent }),
  setSignatureText: (signatureText) => set({ signatureText }),
  setTypingSpeed: (typingSpeed) => set({ typingSpeed }),

  // Voice details
  voiceUrl: null,
  voiceDuration: 0,
  setVoiceUrl: (voiceUrl) => set({ voiceUrl }),
  setVoiceDuration: (voiceDuration) => set({ voiceDuration }),

  // Music parameters
  musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // default royalty-free classical piano song
  musicTitle: 'Soft Romantic Melody',
  musicVolume: 0.5,
  musicPlaying: false,
  musicLoop: true,
  setMusicUrl: (musicUrl) => set({ musicUrl }),
  setMusicTitle: (musicTitle) => set({ musicTitle }),
  setMusicVolume: (musicVolume) => set({ musicVolume }),
  setMusicPlaying: (musicPlaying) => set({ musicPlaying }),
  setMusicLoop: (musicLoop) => set({ musicLoop }),

  // Photo Memories
  photos: [
    { id: 'm1', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=600', caption: 'Our Unforgettable Sunset' }
  ],
  photoLayout: 'polaroid',
  addPhoto: (url, caption) => set((s) => ({
    photos: [...s.photos, { id: crypto.randomUUID(), url, caption }]
  })),
  removePhoto: (id) => set((s) => ({
    photos: s.photos.filter(p => p.id !== id)
  })),
  setPhotoLayout: (photoLayout) => set({ photoLayout }),
  clearPhotos: () => set({ photos: [] }),

  // Attached Gifts
  attachedGifts: ['teddy', 'chocolate'],
  toggleAttachedGift: (giftId) => set((s) => {
    const list = s.attachedGifts.includes(giftId)
      ? s.attachedGifts.filter(g => g !== giftId)
      : [...s.attachedGifts, giftId];
    return { attachedGifts: list };
  }),
  clearAttachedGifts: () => set({ attachedGifts: [] }),

  // Effects
  effectType: 'petals',
  setEffectType: (effectType) => set({ effectType }),

  // Preview overlay trigger
  isPreviewOpen: false,
  setIsPreviewOpen: (isPreviewOpen) => set({ isPreviewOpen }),

  // Gift Settings (Phase 7)
  isPrivate: false,
  password: '',
  expiryDate: '',
  disableComments: false,
  disableReactions: false,
  senderName: 'Alexander',
  recipientName: 'Sophia',
  occasion: 'Anniversary Special',
  giftTitle: 'A Crimson Melody Bouquet',
  setIsPrivate: (isPrivate) => set({ isPrivate }),
  setPassword: (password) => set({ password }),
  setExpiryDate: (expiryDate) => set({ expiryDate }),
  setDisableComments: (disableComments) => set({ disableComments }),
  setDisableReactions: (disableReactions) => set({ disableReactions }),
  setSenderName: (senderName) => set({ senderName }),
  setRecipientName: (recipientName) => set({ recipientName }),
  setOccasion: (occasion) => set({ occasion }),
  setGiftTitle: (giftTitle) => set({ giftTitle }),

  // Journey Timeline (Phase 8)
  timelineStyle: 'love',
  journeyMemories: [
    {
      id: 'jm1',
      type: 'First Meeting',
      date: '2024-05-14',
      title: 'Our First Encounter',
      description: 'A beautiful sunny afternoon at the local coffee house. Time stood still.',
      emoji: '☕',
      location: 'Roast Coffee Co.',
      photoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600'
    }
  ],
  recipientReturnedMemory: null,
  setTimelineStyle: (timelineStyle) => set({ timelineStyle }),
  addJourneyMemory: (memory) => set((s) => {
    const nextPos = s.journeyMemories.length > 0 
      ? Math.max(...s.journeyMemories.map(m => m.position || 0)) + 1 
      : 0;
    return {
      journeyMemories: [...s.journeyMemories, { ...memory, id: crypto.randomUUID(), position: nextPos }]
    };
  }),
  removeJourneyMemory: (id) => set((s) => ({
    journeyMemories: s.journeyMemories.filter(m => m.id !== id)
  })),
  updateJourneyMemory: (id, updates) => set((s) => ({
    journeyMemories: s.journeyMemories.map(m => m.id === id ? { ...m, ...updates } : m)
  })),
  setJourneyMemories: (journeyMemories) => set({ journeyMemories }),
  duplicateJourneyMemory: (id) => set((s) => {
    const target = s.journeyMemories.find(m => m.id === id);
    if (!target) return {};
    const duplicated = {
      ...target,
      id: crypto.randomUUID(),
      title: `${target.title} (Copy)`,
      position: (target.position || 0) + 0.5 // insert nearby
    };
    const updatedList = [...s.journeyMemories, duplicated].sort((a, b) => (a.position || 0) - (b.position || 0));
    // re-normalize positions
    const normalized = updatedList.map((m, idx) => ({ ...m, position: idx }));
    return { journeyMemories: normalized };
  }),
  setRecipientReturnedMemory: (recipientReturnedMemory) => set({ recipientReturnedMemory }),

  // Custom Bouquet defaults and methods
  bouquetStyle: 'classic',
  wrappingPaper: 'pink',
  flowers: [],
  setBouquetStyle: (bouquetStyle) => set({ bouquetStyle }),
  setWrappingPaper: (wrappingPaper) => set({ wrappingPaper }),
  setFlowers: (flowers) => set({ flowers }),
  addFlower: (flower) => set((s) => ({ flowers: [...s.flowers, flower] })),
  removeFlower: (id) => set((s) => ({ flowers: s.flowers.filter((f) => f.id !== id) })),
  updateFlowerPosition: (id, x, y) => set((s) => ({
    flowers: s.flowers.map((f) => (f.id === id ? { ...f, x, y } : f))
  })),
  clearFlowers: () => set({ flowers: [] })
}));
export default useGiftStore;
