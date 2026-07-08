import { fabric } from 'fabric';
import { Asset } from '@/types/editor';
import { canvasManager } from '@/lib/editor/canvas-manager';
import { historyManager } from '@/lib/editor/history-manager';
import { DuplicateCommand } from '@/lib/editor/commands/canvas.commands';
import { useEditorStore } from '@/store/useEditorStore';
import { toast } from 'sonner';

export interface TemplateSlot {
  role: 'large' | 'medium' | 'small' | 'leaf' | 'filler' | 'gift' | 'ribbon' | 'wrapper';
  x: number; // offset relative to canvas center X
  y: number; // offset relative to canvas center Y
  scale: number;
  rotation: number;
}

export interface BouquetTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  previewColor: string; // Tailwind bg color class
  slots: TemplateSlot[];
  backgroundColor: string;
}

// 13 categories of bouquet templates
export const TEMPLATES: BouquetTemplate[] = [
  {
    id: 'round_bouquet',
    name: 'Classic Round Bouquet',
    category: 'Round Bouquet',
    description: 'Perfect radial symmetry featuring roses and lilies.',
    previewColor: 'bg-rose-500/20 text-rose-450 border-rose-500/30',
    backgroundColor: '#fffcfc',
    slots: [
      // Wrapper background
      { role: 'wrapper', x: 0, y: 10, scale: 1.4, rotation: 0 },
      // Leaves (layered behind flowers)
      { role: 'leaf', x: -80, y: -70, scale: 1.1, rotation: -35 },
      { role: 'leaf', x: 80, y: -70, scale: 1.1, rotation: 35 },
      { role: 'leaf', x: -110, y: 0, scale: 1.1, rotation: -75 },
      { role: 'leaf', x: 110, y: 0, scale: 1.1, rotation: 75 },
      // Fillers
      { role: 'filler', x: -35, y: -45, scale: 1.0, rotation: 0 },
      { role: 'filler', x: 35, y: -45, scale: 1.0, rotation: 15 },
      { role: 'filler', x: -45, y: 15, scale: 1.0, rotation: -10 },
      { role: 'filler', x: 45, y: 15, scale: 1.0, rotation: 10 },
      // Flowers: Large Center
      { role: 'large', x: 0, y: -20, scale: 1.25, rotation: 0 },
      // Flowers: Medium around center
      { role: 'medium', x: -55, y: -20, scale: 1.0, rotation: -15 },
      { role: 'medium', x: 55, y: -20, scale: 1.0, rotation: 15 },
      { role: 'medium', x: 0, y: -70, scale: 1.0, rotation: 0 },
      { role: 'medium', x: 0, y: 35, scale: 1.0, rotation: 10 },
      // Flowers: Small outer edges
      { role: 'small', x: -85, y: -45, scale: 0.85, rotation: -45 },
      { role: 'small', x: 85, y: -45, scale: 0.85, rotation: 45 },
      { role: 'small', x: -75, y: 30, scale: 0.85, rotation: -20 },
      { role: 'small', x: 75, y: 30, scale: 0.85, rotation: 20 },
      // Ribbon tied on top foreground
      { role: 'ribbon', x: 0, y: 135, scale: 1.25, rotation: 0 }
    ]
  },
  {
    id: 'korean_bouquet',
    name: 'Korean Wrapping Bouquet',
    category: 'Korean Bouquet',
    description: 'Elegant oversized mesh wrap layout with pastel blossoms.',
    previewColor: 'bg-pink-500/20 text-pink-450 border-pink-500/30',
    backgroundColor: '#faf8f8',
    slots: [
      { role: 'wrapper', x: 0, y: 10, scale: 1.55, rotation: 0 },
      // Leaves
      { role: 'leaf', x: -60, y: -90, scale: 1.2, rotation: -20 },
      { role: 'leaf', x: 60, y: -90, scale: 1.2, rotation: 20 },
      // Flowers
      { role: 'large', x: -25, y: -40, scale: 1.1, rotation: -5 },
      { role: 'large', x: 25, y: -40, scale: 1.1, rotation: 5 },
      { role: 'medium', x: -50, y: 0, scale: 0.95, rotation: -25 },
      { role: 'medium', x: 50, y: 0, scale: 0.95, rotation: 25 },
      { role: 'medium', x: 0, y: -80, scale: 1.0, rotation: 0 },
      { role: 'medium', x: 0, y: 5, scale: 1.0, rotation: 5 },
      // Fillers
      { role: 'filler', x: -30, y: -65, scale: 1.0, rotation: 0 },
      { role: 'filler', x: 30, y: -65, scale: 1.0, rotation: 10 },
      // Ribbon
      { role: 'ribbon', x: 0, y: 140, scale: 1.2, rotation: 0 }
    ]
  },
  {
    id: 'luxury_bouquet',
    name: 'Gold Ribbon Luxury',
    category: 'Luxury Bouquet',
    description: 'Gold-wrapped layout loaded with dozens of romantic red roses.',
    previewColor: 'bg-amber-500/20 text-amber-450 border-amber-500/30',
    backgroundColor: '#fffdf9',
    slots: [
      { role: 'wrapper', x: 0, y: 15, scale: 1.6, rotation: 0 },
      // Redundant luxury leaves
      { role: 'leaf', x: -90, y: -60, scale: 1.2, rotation: -40 },
      { role: 'leaf', x: 90, y: -60, scale: 1.2, rotation: 40 },
      { role: 'leaf', x: 0, y: -95, scale: 1.2, rotation: 0 },
      // Flowers
      { role: 'large', x: 0, y: -25, scale: 1.3, rotation: 0 },
      { role: 'large', x: -45, y: -50, scale: 1.2, rotation: -10 },
      { role: 'large', x: 45, y: -50, scale: 1.2, rotation: 10 },
      { role: 'large', x: -55, y: 15, scale: 1.2, rotation: -20 },
      { role: 'large', x: 55, y: 15, scale: 1.2, rotation: 20 },
      { role: 'medium', x: 0, y: 35, scale: 1.0, rotation: 0 },
      { role: 'medium', x: -35, y: 0, scale: 1.0, rotation: -5 },
      { role: 'medium', x: 35, y: 0, scale: 1.0, rotation: 5 },
      // Fillers
      { role: 'filler', x: -65, y: -30, scale: 1.0, rotation: -30 },
      { role: 'filler', x: 65, y: -30, scale: 1.0, rotation: 30 },
      { role: 'ribbon', x: 0, y: 150, scale: 1.4, rotation: 0 }
    ]
  },
  {
    id: 'heart_bouquet',
    name: 'Romantic Heart Arrangement',
    category: 'Heart Bouquet',
    description: 'Heart-shaped placement structure symbolizing deep affection.',
    previewColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    backgroundColor: '#fffdfd',
    slots: [
      { role: 'wrapper', x: 0, y: 10, scale: 1.5, rotation: 0 },
      // Leaves framing
      { role: 'leaf', x: -110, y: -80, scale: 1.1, rotation: -45 },
      { role: 'leaf', x: 110, y: -80, scale: 1.1, rotation: 45 },
      // Flowers tracing heart shape
      { role: 'large', x: 0, y: 20, scale: 1.2, rotation: 0 }, // Bottom center
      { role: 'medium', x: -45, y: -20, scale: 1.0, rotation: -20 },
      { role: 'medium', x: 45, y: -20, scale: 1.0, rotation: 20 },
      { role: 'medium', x: -75, y: -60, scale: 1.0, rotation: -40 },
      { role: 'medium', x: 75, y: -60, scale: 1.0, rotation: 40 },
      { role: 'medium', x: -40, y: -95, scale: 1.0, rotation: -10 }, // Top Left hump
      { role: 'medium', x: 40, y: -95, scale: 1.0, rotation: 10 }, // Top Right hump
      { role: 'small', x: 0, y: -60, scale: 0.85, rotation: 0 }, // Center heart dip
      { role: 'small', x: -85, y: -10, scale: 0.85, rotation: -60 },
      { role: 'small', x: 85, y: -10, scale: 0.85, rotation: 60 },
      // Ribbon
      { role: 'ribbon', x: 0, y: 140, scale: 1.25, rotation: 0 }
    ]
  },
  {
    id: 'basket_bouquet',
    name: 'Fresh Basket Arrangement',
    category: 'Basket Bouquet',
    description: 'Rustic basket background layout with emerging leaves and blooms.',
    previewColor: 'bg-orange-500/20 text-orange-450 border-orange-500/30',
    backgroundColor: '#faf9f5',
    slots: [
      // Wrapper acting as the basket base
      { role: 'wrapper', x: 0, y: 55, scale: 1.35, rotation: 0 },
      // Leaves rising
      { role: 'leaf', x: -70, y: -60, scale: 1.2, rotation: -35 },
      { role: 'leaf', x: 70, y: -60, scale: 1.2, rotation: 35 },
      { role: 'leaf', x: 0, y: -90, scale: 1.1, rotation: 0 },
      // Flowers
      { role: 'large', x: 0, y: -30, scale: 1.2, rotation: 0 },
      { role: 'medium', x: -45, y: -45, scale: 1.0, rotation: -15 },
      { role: 'medium', x: 45, y: -45, scale: 1.0, rotation: 15 },
      { role: 'medium', x: -50, y: 10, scale: 1.0, rotation: -10 },
      { role: 'medium', x: 45, y: 10, scale: 1.0, rotation: 10 },
      // Fillers filling basket slots
      { role: 'filler', x: -25, y: -10, scale: 1.0, rotation: 0 },
      { role: 'filler', x: 25, y: -10, scale: 1.0, rotation: 5 }
    ]
  },
  {
    id: 'minimal_bouquet',
    name: 'Elegant Minimalist Stems',
    category: 'Minimal Bouquet',
    description: 'Understated single wrapper structure with selected prime tulips.',
    previewColor: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    backgroundColor: '#fafafa',
    slots: [
      { role: 'wrapper', x: 0, y: 10, scale: 1.25, rotation: 0 },
      // Only 3 flowers
      { role: 'large', x: 0, y: -40, scale: 1.2, rotation: 0 },
      { role: 'medium', x: -30, y: 10, scale: 1.0, rotation: -15 },
      { role: 'medium', x: 30, y: 10, scale: 1.0, rotation: 15 },
      // Minimalist leaf
      { role: 'leaf', x: -35, y: -70, scale: 1.0, rotation: -30 },
      { role: 'ribbon', x: 0, y: 120, scale: 1.1, rotation: 0 }
    ]
  },
  {
    id: 'wedding_bouquet',
    name: 'Pure Wedding White',
    category: 'Wedding Bouquet',
    description: 'All-white wedding template wrapped in silk white mesh.',
    previewColor: 'bg-blue-500/10 text-zinc-300 border-blue-500/20',
    backgroundColor: '#f6f9fc',
    slots: [
      { role: 'wrapper', x: 0, y: 10, scale: 1.45, rotation: 0 },
      // White floral elements
      { role: 'large', x: 0, y: -20, scale: 1.25, rotation: 0 },
      { role: 'medium', x: -45, y: -35, scale: 1.0, rotation: -10 },
      { role: 'medium', x: 45, y: -35, scale: 1.0, rotation: 10 },
      { role: 'medium', x: -45, y: 25, scale: 1.0, rotation: -10 },
      { role: 'medium', x: 45, y: 25, scale: 1.0, rotation: 10 },
      { role: 'leaf', x: -70, y: -65, scale: 1.1, rotation: -30 },
      { role: 'leaf', x: 70, y: -65, scale: 1.1, rotation: 30 },
      { role: 'ribbon', x: 0, y: 130, scale: 1.2, rotation: 0 }
    ]
  },
  {
    id: 'graduation_bouquet',
    name: 'Graduation Scholar Gift',
    category: 'Graduation Bouquet',
    description: 'Includes slots for plush teddy bears alongside graduation ribbons.',
    previewColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    backgroundColor: '#f7f8fa',
    slots: [
      { role: 'wrapper', x: 0, y: 10, scale: 1.5, rotation: 0 },
      // Pluses/Gift slot right in the center!
      { role: 'gift', x: 0, y: -30, scale: 1.25, rotation: 0 },
      // Framing flowers
      { role: 'medium', x: -55, y: -50, scale: 1.0, rotation: -15 },
      { role: 'medium', x: 55, y: -50, scale: 1.0, rotation: 15 },
      { role: 'medium', x: -65, y: 15, scale: 1.0, rotation: -20 },
      { role: 'medium', x: 65, y: 15, scale: 1.0, rotation: 20 },
      { role: 'leaf', x: -80, y: -90, scale: 1.1, rotation: -30 },
      { role: 'leaf', x: 80, y: -90, scale: 1.1, rotation: 30 },
      { role: 'ribbon', x: 0, y: 135, scale: 1.2, rotation: 0 }
    ]
  },
  {
    id: 'birthday_bouquet',
    name: 'Festive Birthday Fun',
    category: 'Birthday Bouquet',
    description: 'Bright multi-color layout mixed with chocolate and flower slots.',
    previewColor: 'bg-yellow-500/20 text-yellow-450 border-yellow-500/30',
    backgroundColor: '#fffdf5',
    slots: [
      { role: 'wrapper', x: 0, y: 10, scale: 1.5, rotation: 0 },
      // Gifts/Chocolates mixed inside
      { role: 'gift', x: -40, y: -20, scale: 1.1, rotation: -10 },
      { role: 'gift', x: 40, y: -20, scale: 1.1, rotation: 10 },
      // Flowers
      { role: 'large', x: 0, y: -45, scale: 1.2, rotation: 0 },
      { role: 'medium', x: -55, y: 30, scale: 1.0, rotation: -15 },
      { role: 'medium', x: 55, y: 30, scale: 1.0, rotation: 15 },
      { role: 'small', x: 0, y: 25, scale: 0.85, rotation: 0 },
      // Leaves
      { role: 'leaf', x: -65, y: -70, scale: 1.1, rotation: -30 },
      { role: 'leaf', x: 65, y: -70, scale: 1.1, rotation: 30 },
      { role: 'ribbon', x: 0, y: 130, scale: 1.2, rotation: 0 }
    ]
  },
  {
    id: 'anniversary_bouquet',
    name: 'Eternal Anniversary Roses',
    category: 'Anniversary Bouquet',
    description: 'Deep crimson rose bouquet with lush surrounding leaf slots.',
    previewColor: 'bg-red-950/20 text-rose-500 border-rose-955/30',
    backgroundColor: '#fffafa',
    slots: [
      { role: 'wrapper', x: 0, y: 10, scale: 1.5, rotation: 0 },
      // Lots of leaf backings
      { role: 'leaf', x: -75, y: -75, scale: 1.15, rotation: -35 },
      { role: 'leaf', x: 75, y: -75, scale: 1.15, rotation: 35 },
      { role: 'leaf', x: -105, y: -10, scale: 1.15, rotation: -70 },
      { role: 'leaf', x: 105, y: -10, scale: 1.15, rotation: 70 },
      // Flowers
      { role: 'large', x: 0, y: -25, scale: 1.25, rotation: 0 },
      { role: 'medium', x: -45, y: -35, scale: 1.0, rotation: -15 },
      { role: 'medium', x: 45, y: -35, scale: 1.0, rotation: 15 },
      { role: 'medium', x: -45, y: 25, scale: 1.0, rotation: -10 },
      { role: 'medium', x: 45, y: 25, scale: 1.0, rotation: 10 },
      { role: 'small', x: 0, y: -75, scale: 0.85, rotation: 0 },
      { role: 'ribbon', x: 0, y: 135, scale: 1.25, rotation: 0 }
    ]
  },
  {
    id: 'friendship_bouquet',
    name: 'Bright Friendship Blooms',
    category: 'Friendship Bouquet',
    description: 'Cheerful yellow sunbeams and playful wrapper layouts.',
    previewColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    backgroundColor: '#f5faf9',
    slots: [
      { role: 'wrapper', x: 0, y: 10, scale: 1.45, rotation: 0 },
      // Flowers
      { role: 'large', x: 0, y: -20, scale: 1.3, rotation: 0 },
      { role: 'medium', x: -50, y: -30, scale: 1.0, rotation: -15 },
      { role: 'medium', x: 50, y: -30, scale: 1.0, rotation: 15 },
      { role: 'medium', x: -40, y: 30, scale: 1.0, rotation: -5 },
      { role: 'medium', x: 30, y: 30, scale: 1.0, rotation: 5 },
      // Leaves
      { role: 'leaf', x: -60, y: -80, scale: 1.1, rotation: -25 },
      { role: 'leaf', x: 60, y: -80, scale: 1.1, rotation: 25 },
      { role: 'ribbon', x: 0, y: 130, scale: 1.2, rotation: 0 }
    ]
  },
  {
    id: 'proposal_bouquet',
    name: 'Will You Marry Me?',
    category: 'Proposal Bouquet',
    description: 'Large rose cluster with a center slot designed for a ring box.',
    previewColor: 'bg-red-500/20 text-rose-300 border-red-500/20',
    backgroundColor: '#fffdfd',
    slots: [
      { role: 'wrapper', x: 0, y: 15, scale: 1.65, rotation: 0 },
      // Framing leaves
      { role: 'leaf', x: -100, y: -70, scale: 1.2, rotation: -40 },
      { role: 'leaf', x: 100, y: -70, scale: 1.2, rotation: 40 },
      // Center ring gift box slot!
      { role: 'gift', x: 0, y: -15, scale: 1.3, rotation: 0 },
      // Dense red flowers tracing the gift
      { role: 'large', x: -50, y: -50, scale: 1.15, rotation: -10 },
      { role: 'large', x: 50, y: -50, scale: 1.15, rotation: 10 },
      { role: 'large', x: -55, y: 20, scale: 1.15, rotation: -20 },
      { role: 'large', x: 55, y: 20, scale: 1.15, rotation: 20 },
      { role: 'medium', x: 0, y: -75, scale: 1.0, rotation: 0 },
      { role: 'medium', x: 0, y: 40, scale: 1.0, rotation: 5 },
      { role: 'ribbon', x: 0, y: 155, scale: 1.35, rotation: 0 }
    ]
  },
  {
    id: 'valentines_bouquet',
    name: 'Sweet Heart Valentine',
    category: 'Valentine\'s Bouquet',
    description: 'Dazzling red wraps, chocolates, and roses in harmony.',
    previewColor: 'bg-rose-600/20 text-rose-500 border-rose-600/30',
    backgroundColor: '#fffcfc',
    slots: [
      { role: 'wrapper', x: 0, y: 10, scale: 1.5, rotation: 0 },
      // Chocolates
      { role: 'gift', x: -35, y: -20, scale: 1.1, rotation: -15 },
      { role: 'gift', x: 35, y: -20, scale: 1.1, rotation: 15 },
      // Flowers
      { role: 'large', x: 0, y: -50, scale: 1.25, rotation: 0 },
      { role: 'medium', x: -55, y: 25, scale: 1.0, rotation: -10 },
      { role: 'medium', x: 55, y: 25, scale: 1.0, rotation: 10 },
      // Leaves
      { role: 'leaf', x: -70, y: -80, scale: 1.1, rotation: -30 },
      { role: 'leaf', x: 70, y: -80, scale: 1.1, rotation: 30 },
      { role: 'ribbon', x: 0, y: 135, scale: 1.25, rotation: 0 }
    ]
  }
];

class TemplateService {
  // Safe localStorage favorites lists
  public getFavoriteTemplates(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem('bloombox_fav_templates');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public toggleFavoriteTemplate(id: string): string[] {
    const list = this.getFavoriteTemplates();
    const idx = list.indexOf(id);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(id);
    }
    localStorage.setItem('bloombox_fav_templates', JSON.stringify(list));
    return list;
  }

  // ----------------------------------------------------
  // AUTO ARRANGEMENT ENGINE
  // ----------------------------------------------------

  public async applyTemplate(
    canvas: fabric.Canvas, 
    templateId: string, 
    availableAssets: Asset[],
    customThemePalette?: string // optional color filter
  ): Promise<fabric.Group[]> {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template || !canvas) return [];

    // 1. Group assets by role
    const flowers = availableAssets.filter(a => a.type === 'flower');
    const leaves = availableAssets.filter(a => a.type === 'leaves');
    const fillers = availableAssets.filter(a => a.type === 'fillers');
    const wrappers = availableAssets.filter(a => a.type === 'wrapper');
    const ribbons = availableAssets.filter(a => a.type === 'ribbon');
    
    // Gifts can fall back to chocolates or teddy_bears
    const gifts = availableAssets.filter(a => 
      a.type === 'chocolate' || 
      a.type === 'teddy_bear' || 
      a.type === 'gift_box' || 
      a.type === 'gift'
    );

    // 2. Classify flowers dynamically by price/details
    // Large: price >= 2.50
    // Medium: 1.80 <= price < 2.50
    // Small: price < 1.80
    const largeFlowers = flowers.filter(f => f.price >= 2.5) || flowers;
    const mediumFlowers = flowers.filter(f => f.price >= 1.8 && f.price < 2.5) || flowers;
    const smallFlowers = flowers.filter(f => f.price < 1.8) || flowers;

    // Pick a palette harmony color theme
    const themeColor = customThemePalette || this.getRandomThemeColor(templateId);

    // Filter asset arrays based on the color palette theme (e.g. matching red wrapper with red roses)
    const filterByTheme = (list: Asset[], theme: string) => {
      const filtered = list.filter(item => {
        const itemColor = (item.properties as any)?.color || '';
        return this.isColorCompatible(itemColor, item.name, theme);
      });
      return filtered.length > 0 ? filtered : list;
    };

    const themedLarge = filterByTheme(largeFlowers, themeColor);
    const themedMedium = filterByTheme(mediumFlowers, themeColor);
    const themedSmall = filterByTheme(smallFlowers, themeColor);
    const themedWrappers = filterByTheme(wrappers, themeColor);
    const themedRibbons = filterByTheme(ribbons, themeColor);
    const themedLeaves = leaves; // Leaves are generally green
    const themedFillers = fillers; // Fillers generally match any

    // 3. Clear canvas & apply background color
    canvas.clear();
    canvas.setBackgroundColor(template.backgroundColor, canvas.renderAll.bind(canvas));
    useEditorStore.getState().setBackgroundColor(template.backgroundColor);

    const center = canvas.getCenter();
    const createdObjects: fabric.Group[] = [];

    // Helper to get random item from list
    const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    // Stacking render order lists (to preserve correct z-index layers)
    // 0: Wrapper, 1: Leaves, 2: Fillers, 3: Flowers/Gifts, 4: Ribbon
    const slotOrderingMap = {
      wrapper: 0,
      leaf: 1,
      filler: 2,
      gift: 3,
      large: 3,
      medium: 3,
      small: 3,
      ribbon: 4
    };

    // Sort template slots so they are created and added in correct stacking order
    const sortedSlots = [...template.slots].sort((a, b) => {
      return (slotOrderingMap[a.role] || 0) - (slotOrderingMap[b.role] || 0);
    });

    // We keep track of which flowers/wrappers we picked to keep design consistent
    const wrapperAsset = getRandomItem(themedWrappers);
    const ribbonAsset = getRandomItem(themedRibbons);
    const flowerLargeAsset = getRandomItem(themedLarge);
    const flowerMediumAsset = getRandomItem(themedMedium);
    const flowerSmallAsset = getRandomItem(themedSmall);
    const leafAsset = getRandomItem(themedLeaves);
    const fillerAsset = getRandomItem(themedFillers);
    const giftAsset = gifts.length > 0 ? getRandomItem(gifts) : flowerLargeAsset;

    for (const slot of sortedSlots) {
      // Resolve asset based on slot role
      let selectedAsset: Asset | undefined;
      switch (slot.role) {
        case 'wrapper':
          selectedAsset = wrapperAsset;
          break;
        case 'ribbon':
          selectedAsset = ribbonAsset;
          break;
        case 'large':
          selectedAsset = flowerLargeAsset;
          break;
        case 'medium':
          selectedAsset = flowerMediumAsset;
          break;
        case 'small':
          selectedAsset = flowerSmallAsset;
          break;
        case 'leaf':
          selectedAsset = leafAsset;
          break;
        case 'filler':
          selectedAsset = fillerAsset;
          break;
        case 'gift':
          selectedAsset = giftAsset;
          break;
      }

      if (!selectedAsset) continue;

      // Construct Fabric node
      const emojiNode = new fabric.Text(selectedAsset.assetUrl || '🌸', {
        fontSize: slot.role === 'wrapper' ? 140 : slot.role === 'ribbon' ? 75 : 54,
        originX: 'center',
        originY: 'center',
        top: slot.role === 'wrapper' ? 10 : -10,
      });

      const textNode = new fabric.Text(selectedAsset.name, {
        fontSize: 10,
        fontFamily: 'Inter',
        fill: '#a1a1aa',
        originX: 'center',
        originY: 'center',
        top: 30,
        fontWeight: 'bold',
        visible: false, // Hidden for template composition aesthetics, but accessible in details
      });

      const targetX = center.left + slot.x;
      const targetY = center.top + slot.y;

      const group = new fabric.Group([emojiNode, textNode], {
        left: targetX,
        top: targetY,
        originX: 'center',
        originY: 'center',
        angle: slot.rotation,
        scaleX: slot.scale,
        scaleY: slot.scale,
      }) as any;

      // Inject object properties matching database schema
      group.id = `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      group.assetId = selectedAsset.id;
      group.assetName = selectedAsset.name;
      group.category = selectedAsset.type;
      group.subcategory = selectedAsset.subcategory || '';
      group.createdAt = new Date().toISOString();
      group.updatedAt = new Date().toISOString();
      group.layer = slot.role === 'wrapper' || slot.role === 'leaf' ? 'background' : slot.role === 'ribbon' ? 'foreground' : 'midground';
      group.isLocked = false;
      group.isLockedFlag = false;
      
      // Save slot information for Smart Replace mapping!
      group.templateSlotRole = slot.role;

      group.metadata = {
        name: selectedAsset.name,
        price: selectedAsset.price,
        type: selectedAsset.type,
        category: selectedAsset.type,
        properties: selectedAsset.properties || {}
      };

      createdObjects.push(group);
      canvas.add(group);
    }

    // 4. Trigger flying creation animations
    this.animateArrangement(canvas, createdObjects);

    // 5. Commit to history manager
    const cmd = new DuplicateCommand(canvas, createdObjects);
    historyManager.push(cmd);

    canvas.requestRenderAll();
    return createdObjects;
  }

  // ----------------------------------------------------
  // SMART REPLACE ENGINE
  // ----------------------------------------------------

  public replaceFlower(canvas: fabric.Canvas, targetObject: any, newAsset: Asset) {
    if (!canvas || !targetObject) return;

    // Create new inner emoji text node
    const emojiNode = new fabric.Text(newAsset.assetUrl || '🌸', {
      fontSize: targetObject.templateSlotRole === 'wrapper' ? 140 : targetObject.templateSlotRole === 'ribbon' ? 75 : 54,
      originX: 'center',
      originY: 'center',
      top: targetObject.templateSlotRole === 'wrapper' ? 10 : -10,
    });

    const textNode = new fabric.Text(newAsset.name, {
      fontSize: 10,
      fontFamily: 'Inter',
      fill: '#a1a1aa',
      originX: 'center',
      originY: 'center',
      top: 30,
      fontWeight: 'bold',
      visible: false,
    });

    // Replace group elements while preserving coordinates, scale, and rotations
    targetObject.remove(targetObject.item(0));
    targetObject.remove(targetObject.item(0));
    targetObject.addWithUpdate(emojiNode);
    targetObject.addWithUpdate(textNode);

    // Update metadata properties
    targetObject.assetId = newAsset.id;
    targetObject.assetName = newAsset.name;
    targetObject.category = newAsset.type;
    targetObject.subcategory = newAsset.subcategory || '';
    targetObject.updatedAt = new Date().toISOString();
    targetObject.metadata = {
      name: newAsset.name,
      price: newAsset.price,
      type: newAsset.type,
      category: newAsset.type,
      properties: newAsset.properties || {}
    };

    canvas.requestRenderAll();
    toast.success(`Replaced with ${newAsset.name}`);
  }

  // ----------------------------------------------------
  // STAGGERED FLY-IN & UNFOLDING ANIMATION
  // ----------------------------------------------------

  private animateArrangement(canvas: fabric.Canvas, objects: fabric.Group[]) {
    const center = canvas.getCenter();

    objects.forEach((obj: any, index) => {
      const finalLeft = obj.left || center.left;
      const finalTop = obj.top || center.top;
      const finalScaleX = obj.scaleX || 1.0;
      const finalScaleY = obj.scaleY || 1.0;

      // Stagger animation timing based on stacking layers
      let delay = 0;
      let duration = 650;
      
      const role = obj.templateSlotRole;

      if (role === 'wrapper') {
        // Wrapper folds first
        delay = 50;
        duration = 800;
        obj.set({
          left: finalLeft,
          top: finalTop + 50, // slide up slightly
          scaleX: 0,
          scaleY: 0
        });
      } else if (role === 'leaf') {
        // Leaves grow behind
        delay = 250 + Math.random() * 100;
        obj.set({
          left: center.left, // fly outward from center
          top: center.top,
          scaleX: 0,
          scaleY: 0
        });
      } else if (role === 'filler') {
        delay = 400 + Math.random() * 150;
        obj.set({
          left: center.left,
          top: center.top,
          scaleX: 0,
          scaleY: 0
        });
      } else if (role === 'large' || role === 'medium' || role === 'small' || role === 'gift') {
        // Flowers burst into position
        delay = 600 + index * 40; // Staggered cascade
        obj.set({
          left: center.left,
          top: center.top - 20,
          scaleX: 0,
          scaleY: 0
        });
      } else if (role === 'ribbon') {
        // Ribbon ties itself last on top
        delay = 1100;
        duration = 500;
        obj.set({
          left: finalLeft,
          top: finalTop - 40, // drop down
          scaleX: 0,
          scaleY: 0
        });
      }

      // Execute Fabric animation curves
      setTimeout(() => {
        // Animate Scale
        fabric.util.animate({
          startValue: 0,
          endValue: finalScaleX,
          duration: duration,
          onChange: (val) => {
            obj.set({ scaleX: val, scaleY: val });
            canvas.requestRenderAll();
          },
          easing: fabric.util.ease.easeOutBack // nice elastic bounce pop!
        });

        // Animate Coordinates
        fabric.util.animate({
          startValue: obj.left,
          endValue: finalLeft,
          duration: duration,
          onChange: (val) => {
            obj.set({ left: val });
            canvas.requestRenderAll();
          }
        });

        fabric.util.animate({
          startValue: obj.top,
          endValue: finalTop,
          duration: duration,
          onChange: (val) => {
            obj.set({ top: val });
            canvas.requestRenderAll();
          }
        });
      }, delay);
    });
  }

  // ----------------------------------------------------
  // PALETTE & COLOR HARMONY HELPERS
  // ----------------------------------------------------

  private getRandomThemeColor(templateId: string): string {
    const redTemplates = ['anniversary_bouquet', 'valentines_bouquet', 'proposal_bouquet', 'heart_bouquet'];
    const pinkTemplates = ['korean_bouquet', 'wedding_bouquet'];
    const yellowTemplates = ['friendship_bouquet', 'birthday_bouquet'];

    if (redTemplates.includes(templateId)) return 'red';
    if (pinkTemplates.includes(templateId)) return 'pink';
    if (yellowTemplates.includes(templateId)) return 'yellow';

    // Default random selection
    const colors = ['red', 'pink', 'yellow', 'purple', 'blue'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private isColorCompatible(colorHex: string, name: string, theme: string): boolean {
    if (!colorHex) {
      // Infer from name
      const lowercase = name.toLowerCase();
      if (theme === 'red' && (lowercase.includes('rose') || lowercase.includes('crimson') || lowercase.includes('ruby'))) return true;
      if (theme === 'pink' && (lowercase.includes('pink') || lowercase.includes('tulip') || lowercase.includes('blossom') || lowercase.includes('lavender'))) return true;
      if (theme === 'yellow' && (lowercase.includes('sunflower') || lowercase.includes('yellow') || lowercase.includes('gold'))) return true;
      return true;
    }

    const hex = colorHex.toLowerCase();
    
    // Simple color range mapping helper
    if (theme === 'red') {
      // match crimson, rose red, gold accents
      return hex.startsWith('#b') || hex.startsWith('#r') || hex.startsWith('#e') || hex.startsWith('#f4') || hex.startsWith('#be') || hex.includes('gold');
    }
    if (theme === 'pink') {
      return hex.startsWith('#e') || hex.startsWith('#f') || hex.startsWith('#d');
    }
    if (theme === 'yellow') {
      return hex.startsWith('#e') || hex.startsWith('#f') || hex.includes('gold');
    }
    if (theme === 'purple') {
      return hex.startsWith('#8') || hex.startsWith('#a') || hex.startsWith('#9');
    }
    
    return true;
  }
}

export const templateService = new TemplateService();
export default templateService;
