import { Asset } from '@/types/editor';

export interface IAssetService {
  getAssets(): Promise<Asset[]>;
  getAssetsByType(type: string): Promise<Asset[]>;
  getAssetById(id: string): Promise<Asset | null>;
}

export class MockAssetService implements IAssetService {
  private mockAssets: Asset[] = [
    // 1. FLOWERS
    {
      id: 'ast-rose-red',
      name: 'Crimson Rose',
      description: 'A deep crimson red velvet rose representing romance.',
      type: 'flower',
      subcategory: 'Roses',
      previewUrl: '',
      assetUrl: '🌹',
      price: 2.50,
      isTrending: true,
      isActive: true,
      properties: { color: '#be123c', scale: 1.5 }
    },
    {
      id: 'ast-tulip-pink',
      name: 'Pastel Pink Tulip',
      description: 'A delicate tulip showing care and affection.',
      type: 'flower',
      subcategory: 'Tulips',
      previewUrl: '',
      assetUrl: '🌷',
      price: 1.80,
      isActive: true,
      properties: { color: '#ec4899', scale: 1.3 }
    },
    {
      id: 'ast-sunflower',
      name: 'Sunbeam Sunflower',
      description: 'Radiant yellow sunflower symbolizing warmth and energy.',
      type: 'flower',
      subcategory: 'Sunflowers',
      previewUrl: '',
      assetUrl: '🌻',
      price: 3.00,
      isTrending: true,
      isActive: true,
      properties: { color: '#eab308', scale: 1.8 }
    },
    {
      id: 'ast-cherry-blossom',
      name: 'Blossoming Cherry',
      description: 'Spring cherry blossom represent beauty.',
      type: 'flower',
      subcategory: 'Blossoms',
      previewUrl: '',
      assetUrl: '🌸',
      price: 2.00,
      isActive: true
    },

    // 2. LEAVES
    {
      id: 'ast-eucalyptus',
      name: 'Silver Dollar Eucalyptus',
      description: 'A structural dusty green sage branch.',
      type: 'leaves',
      subcategory: 'Eucalyptus',
      previewUrl: '',
      assetUrl: '🌿',
      price: 1.20,
      isTrending: true,
      isActive: true
    },
    {
      id: 'ast-fern',
      name: 'Forest Fern Leaf',
      description: 'Delicate textured green fern leaf.',
      type: 'leaves',
      subcategory: 'Ferns',
      previewUrl: '',
      assetUrl: '🍃',
      price: 1.00,
      isActive: true
    },

    // 3. FILLERS
    {
      id: 'ast-babys-breath',
      name: 'Baby\'s Breath Spray',
      description: 'Soft white clusters to surround major focal blooms.',
      type: 'fillers',
      subcategory: 'Gypsophila',
      previewUrl: '',
      assetUrl: '🌾',
      price: 1.50,
      isActive: true
    },
    {
      id: 'ast-lavender',
      name: 'English Lavender Stem',
      description: 'Fragrant purple lavender spike.',
      type: 'fillers',
      subcategory: 'Lavender',
      previewUrl: '',
      assetUrl: '🪻',
      price: 1.60,
      isActive: true
    },

    // 4. WRAPPERS
    {
      id: 'ast-wrap-kraft',
      name: 'Organic Kraft Roll',
      description: 'Warm brown wrapping paper for a rustic style.',
      type: 'wrapper',
      subcategory: 'Kraft',
      previewUrl: '',
      assetUrl: '📁',
      price: 4.50,
      isActive: true
    },
    {
      id: 'ast-wrap-mesh',
      name: 'Pastel Mesh Wrap',
      description: 'Soft pink translucent design mesh layer.',
      type: 'wrapper',
      subcategory: 'Pastel',
      previewUrl: '',
      assetUrl: '🎀',
      price: 6.00,
      isTrending: true,
      isActive: true
    },

    // 5. RIBBONS
    {
      id: 'ast-ribbon-gold',
      name: 'Gold Metallic Ribbon',
      description: 'A shimmering gold accent ribbon bow.',
      type: 'ribbon',
      subcategory: 'Gold',
      previewUrl: '',
      assetUrl: '🎗️',
      price: 1.50,
      isActive: true
    },
    {
      id: 'ast-ribbon-silk',
      name: 'Rose Silk Bow',
      description: 'Delicate pink silk tying bow.',
      type: 'ribbon',
      subcategory: 'Silk',
      previewUrl: '',
      assetUrl: '🎀',
      price: 1.30,
      isActive: true
    },

    // 6. TEDDY BEARS
    {
      id: 'ast-plush-bear',
      name: 'Fluffy Teddy Bear',
      description: 'A small brown plush bear addition.',
      type: 'teddy_bear',
      subcategory: 'Bears',
      previewUrl: '',
      assetUrl: '🧸',
      price: 12.00,
      isTrending: true,
      isActive: true
    },

    // 7. CHOCOLATES
    {
      id: 'ast-sweet-chocolate',
      name: 'Hazelnut Truffles',
      description: 'Foil-wrapped gold hazelnut chocolates.',
      type: 'chocolate',
      subcategory: 'Truffles',
      previewUrl: '',
      assetUrl: '🍫',
      price: 8.50,
      isActive: true
    },

    // 8. GIFT BOXES
    {
      id: 'ast-gift-red',
      name: 'Luxury Velvet Box',
      description: 'Velvet gift box containing customization spaces.',
      type: 'gift_box',
      subcategory: 'Velvet',
      previewUrl: '',
      assetUrl: '🎁',
      price: 15.00,
      isActive: true
    },

    // 9. BALLOONS
    {
      id: 'ast-balloon-heart',
      name: 'Mylar Heart Balloon',
      description: 'Helium heart balloon floating addition.',
      type: 'balloon',
      subcategory: 'Heart',
      previewUrl: '',
      assetUrl: '🎈',
      price: 3.50,
      isActive: true
    },

    // 10. CAKES
    {
      id: 'ast-cake-slice',
      name: 'Strawberry Velvet Slice',
      description: 'Gourmet velvet cake slice.',
      type: 'cake',
      subcategory: 'Slices',
      previewUrl: '',
      assetUrl: '🍰',
      price: 7.00,
      isActive: true
    },

    // 11. PHOTO FRAMES
    {
      id: 'ast-frame-polaroid',
      name: 'Polaroid Border Frame',
      description: 'Retro Polaroid-style mockup border.',
      type: 'photo_frame',
      subcategory: 'Retro',
      previewUrl: '',
      assetUrl: '🖼️',
      price: 4.00,
      isActive: true
    },

    // 12. LETTERS
    {
      id: 'ast-letter-love',
      name: 'Scroll Love Letter',
      description: 'Personal scroll letter text layout.',
      type: 'letter',
      subcategory: 'Love',
      previewUrl: '',
      assetUrl: '✉️',
      price: 2.00,
      isActive: true
    },

    // 13. ENVELOPES
    {
      id: 'ast-envelope-wax',
      name: 'Wax-Sealed Kraft Envelope',
      description: 'Rustic envelope with a crimson wax seal.',
      type: 'envelope',
      subcategory: 'Wax Seal',
      previewUrl: '',
      assetUrl: '📩',
      price: 2.50,
      isActive: true
    },

    // 14. BACKGROUNDS
    {
      id: 'ast-bg-marble',
      name: 'Carrara Marble Wall',
      description: 'Luxury white marble background texture.',
      type: 'background',
      subcategory: 'Textures',
      previewUrl: '',
      assetUrl: '⚪',
      price: 0.00,
      isActive: true
    },

    // 15. DECORATIONS
    {
      id: 'ast-deco-stars',
      name: 'Gold Star Sparkles',
      description: 'Floating gold foil stars overlay.',
      type: 'decoration',
      subcategory: 'Stars',
      previewUrl: '',
      assetUrl: '✨',
      price: 1.80,
      isTrending: true,
      isActive: true
    },

    // 16. STICKERS
    {
      id: 'ast-sticker-butterfly',
      name: 'Holographic Butterfly',
      description: 'A decorative butterfly sticker overlay.',
      type: 'sticker',
      subcategory: 'Insects',
      previewUrl: '',
      assetUrl: '🦋',
      price: 0.50,
      isActive: true
    },

    // 17. MUSIC ICONS
    {
      id: 'ast-music-note',
      name: 'Vinyl Record Icon',
      description: 'A retro spinning music disc overlay.',
      type: 'music_icon',
      subcategory: 'Controls',
      previewUrl: '',
      assetUrl: '🎵',
      price: 0.00,
      isActive: true
    },

    // 18. VOICE MESSAGE ICONS
    {
      id: 'ast-voice-mic',
      name: 'Golden Microphone Icon',
      description: 'Record indicator badge.',
      type: 'voice_icon',
      subcategory: 'Badges',
      previewUrl: '',
      assetUrl: '🎙️',
      price: 0.00,
      isActive: true
    }
  ];

  async getAssets(): Promise<Asset[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.mockAssets.filter(asset => asset.isActive);
  }

  async getAssetsByType(type: string): Promise<Asset[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return this.mockAssets.filter(asset => asset.type === type && asset.isActive);
  }

  async getAssetById(id: string): Promise<Asset | null> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const asset = this.mockAssets.find(a => a.id === id);
    return asset && asset.isActive ? asset : null;
  }
}

export const assetService = new MockAssetService();
