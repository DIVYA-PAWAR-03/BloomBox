import { create } from 'zustand';

export type EnvelopeCategory =
  | 'love' | 'birthday' | 'friendship' | 'wedding' | 'minimal'
  | 'luxury' | 'royal' | 'vintage' | 'christmas' | 'valentine'
  | 'mother' | 'father' | 'graduation' | 'congrats';

export type EnvelopeTexture = 'smooth' | 'linen' | 'parchment' | 'kraft';
export type WaxSealType = 'rose' | 'heart' | 'ring' | 'star' | 'none';
export type LetterTemplate =
  | 'love' | 'birthday' | 'friendship' | 'anniversary' | 'wedding'
  | 'minimal' | 'vintage' | 'royal' | 'handwritten' | 'fairy';

export type TypingSpeed = 'slow' | 'medium' | 'fast' | 'skip';
export type PhotoLayout = 'single' | 'grid' | 'polaroid' | 'heart' | 'filmstrip' | 'collage';
export type EffectType = 'sparkles' | 'petals' | 'butterflies' | 'fireflies' | 'snow' | 'confetti' | 'glow' | 'none';
export type AppLocale = 'en' | 'hi' | 'mr' | 'ja' | 'fr' | 'de' | 'es';
export type TimelineStyle = 'love' | 'friendship' | 'minimal' | 'luxury' | 'scrapbook' | 'vintage' | 'floral';

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
  setIsPrivate: (priv: boolean) => void;
  setPassword: (pass: string) => void;
  setExpiryDate: (date: string) => void;
  setDisableComments: (dis: boolean) => void;
  setDisableReactions: (dis: boolean) => void;

  // Journey Timeline (Phase 8)
  timelineStyle: TimelineStyle;
  journeyMemories: JourneyMemory[];
  recipientReturnedMemory: JourneyMemory | null;
  setTimelineStyle: (style: TimelineStyle) => void;
  addJourneyMemory: (memory: Omit<JourneyMemory, 'id'>) => void;
  removeJourneyMemory: (id: string) => void;
  setRecipientReturnedMemory: (memory: JourneyMemory | null) => void;
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
  setIsPrivate: (isPrivate) => set({ isPrivate }),
  setPassword: (password) => set({ password }),
  setExpiryDate: (expiryDate) => set({ expiryDate }),
  setDisableComments: (disableComments) => set({ disableComments }),
  setDisableReactions: (disableReactions) => set({ disableReactions }),

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
  addJourneyMemory: (memory) => set((s) => ({
    journeyMemories: [...s.journeyMemories, { ...memory, id: crypto.randomUUID() }]
  })),
  removeJourneyMemory: (id) => set((s) => ({
    journeyMemories: s.journeyMemories.filter(m => m.id !== id)
  })),
  setRecipientReturnedMemory: (recipientReturnedMemory) => set({ recipientReturnedMemory })
}));
export default useGiftStore;
