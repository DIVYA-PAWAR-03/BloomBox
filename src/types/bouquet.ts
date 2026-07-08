// Core types for BloomBox bouquet gifting system

export type BouquetStyle =
  | 'classic'
  | 'korean'
  | 'heart_shape'
  | 'cascade'
  | 'romantic_rose'
  | 'pink_pastel'
  | 'white_lily'
  | 'tulip'
  | 'sunflower'
  | 'luxury'
  | 'wildflower'
  | 'spring_garden'
  | 'birthday'
  | 'anniversary'
  | 'friendship'
  | 'minimal'
  | 'floral_mix';

export type FlowerType =
  | 'rose'
  | 'rose_pink'
  | 'rose_white'
  | 'rose_yellow'
  | 'tulip'
  | 'lily'
  | 'sunflower'
  | 'carnation'
  | 'peony'
  | 'hydrangea'
  | 'orchid'
  | 'cherry_blossom'
  | 'lavender'
  | 'baby_breath'
  | 'daisy'
  | 'jasmine'
  | 'lotus'
  | 'marigold'
  | 'leaf_green'
  | 'leaf_fern'
  | 'leaf_eucalyptus'
  | 'baby_breath_item'
  | 'sparkle_item';

export type FillerType =
  | 'baby_breath'
  | 'green_leaves'
  | 'fern'
  | 'eucalyptus'
  | 'small_fillers';

export type WrappingColor =
  | 'white'
  | 'pink'
  | 'cream'
  | 'kraft'
  | 'luxury_black'
  | 'lavender'
  | 'blue'
  | 'pastel';

export type RibbonColor =
  | 'white'
  | 'pink'
  | 'red'
  | 'gold'
  | 'black'
  | 'blue';

export type ExtraType =
  | 'teddy'
  | 'chocolate'
  | 'gift_box'
  | 'heart_card';

export type LetterTemplate =
  | 'love'
  | 'friendship'
  | 'birthday'
  | 'anniversary'
  | 'thank_you'
  | 'sorry'
  | 'miss_you'
  | 'graduation'
  | 'wedding'
  | 'festival'
  | 'minimal'
  | 'luxury'
  | 'vintage'
  | 'floral'
  | 'classic';

export type EnvelopeStyle =
  | 'classic'
  | 'vintage'
  | 'luxury'
  | 'floral'
  | 'minimal'
  | 'wax_seal'
  | 'heart_seal';

export interface FlowerItem {
  id: string;
  type: FlowerType;
  x: number;   // 0-100 (percentage within bouquet display area)
  y: number;   // 0-100
  rotation: number; // degrees
  scale: number;    // 0.8–1.4
  zIndex: number;
}

export interface BouquetData {
  style: BouquetStyle;
  flowers: FlowerItem[];
  fillers: FillerType[];
  wrapping: WrappingColor;
  ribbon: RibbonColor;
  extras: ExtraType[];
  letter: {
    template: LetterTemplate;
    recipientName: string;
    message: string;
    senderName: string;
  };
  envelope: EnvelopeStyle;
}

// Definitions for the flower catalogue
export interface FlowerDef {
  type: FlowerType;
  label: string;
  emoji: string;
  color: string; // CSS color for the flower badge
  description: string;
}

export const FLOWER_CATALOGUE: FlowerDef[] = [
  { type: 'rose',          label: 'Red Rose',      emoji: '🌹', color: '#e11d48', description: 'Classic crimson red rose' },
  { type: 'rose_pink',     label: 'Pink Rose',     emoji: '🌹', color: '#fda4af', description: 'Graceful and sweet pink rose' },
  { type: 'rose_white',    label: 'White Rose',    emoji: '🌹', color: '#f9fafb', description: 'Pure and elegant white rose' },
  { type: 'rose_yellow',   label: 'Yellow Rose',   emoji: '🌹', color: '#f59e0b', description: 'Warm and friendly yellow rose' },
  { type: 'tulip',         label: 'Tulip',         emoji: '🌷', color: '#f472b6', description: 'Elegant spring bloom' },
  { type: 'lily',          label: 'Lily',          emoji: '🌸', color: '#ec4899', description: 'Pure and graceful' },
  { type: 'sunflower',     label: 'Sunflower',     emoji: '🌻', color: '#f59e0b', description: 'Bright and joyful' },
  { type: 'carnation',     label: 'Carnation',     emoji: '🌺', color: '#fb7185', description: 'Heartfelt affection' },
  { type: 'peony',         label: 'Peony',         emoji: '🌸', color: '#f9a8d4', description: 'Lush and romantic' },
  { type: 'hydrangea',     label: 'Hydrangea',     emoji: '💐', color: '#a78bfa', description: 'Soft and dreamy' },
  { type: 'orchid',        label: 'Orchid',        emoji: '🌺', color: '#c084fc', description: 'Exotic and refined' },
  { type: 'cherry_blossom',label: 'Cherry Blossom',emoji: '🌸', color: '#fda4af', description: 'Fleeting and beautiful' },
  { type: 'lavender',      label: 'Lavender',      emoji: '💜', color: '#8b5cf6', description: 'Calm and soothing' },
  { type: 'baby_breath',   label: 'Baby\'s Breath', emoji: '🤍', color: '#e5e7eb', description: 'Delicate filler bloom' },
  { type: 'daisy',         label: 'Daisy',         emoji: '🌼', color: '#fde68a', description: 'Innocent and cheerful' },
  { type: 'jasmine',       label: 'Jasmine',       emoji: '🌿', color: '#86efac', description: 'Sweet and fragrant' },
  { type: 'lotus',         label: 'Lotus',         emoji: '🪷', color: '#f0abfc', description: 'Pure enlightenment' },
  { type: 'marigold',      label: 'Marigold',      emoji: '🌼', color: '#fb923c', description: 'Festive and warm' },
  { type: 'leaf_green',     label: 'Green Leaf',    emoji: '🌿', color: '#22c55e', description: 'Classic green leaf' },
  { type: 'leaf_fern',      label: 'Fern Leaf',     emoji: '🌱', color: '#16a34a', description: 'Delicate fern leaf' },
  { type: 'leaf_eucalyptus',label: 'Eucalyptus',    emoji: '🪴', color: '#86efac', description: 'Beautiful eucalyptus leaf' },
  { type: 'baby_breath_item',label: 'Baby\'s Breath',emoji: '✿', color: '#d1d5db', description: 'Single baby breath filler' },
  { type: 'sparkle_item',   label: 'Sparkles',      emoji: '✦', color: '#fcd34d', description: 'Magical golden star' },
];

export interface TemplateFlowerItem {
  type: FlowerType;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

export interface BouquetStyleDef {
  style: BouquetStyle;
  label: string;
  emoji: string;
  description: string;
  wrapping: WrappingColor;
  ribbon: RibbonColor;
  defaultFlowers: FlowerType[];
  predefinedLayout: TemplateFlowerItem[];
}

export const BOUQUET_STYLES: BouquetStyleDef[] = [
  {
    style: 'classic',
    label: 'Classic Round',
    emoji: '🌹',
    description: 'Timeless circular arrangement of red roses, pink lilies, and baby\'s breath',
    wrapping: 'white',
    ribbon: 'red',
    defaultFlowers: ['lily', 'lily', 'rose', 'rose', 'rose', 'rose', 'baby_breath_item', 'baby_breath_item', 'leaf_green', 'leaf_green'],
    predefinedLayout: [
      // Large flowers in the center
      { type: 'lily', x: 50, y: 28, rotation: 0, scale: 1.1, zIndex: 30 },
      { type: 'lily', x: 50, y: 40, rotation: 15, scale: 1.05, zIndex: 31 },
      // Medium flowers around the center
      { type: 'rose', x: 36, y: 22, rotation: -20, scale: 0.98, zIndex: 25 },
      { type: 'rose', x: 64, y: 22, rotation: 20, scale: 0.98, zIndex: 26 },
      { type: 'rose', x: 34, y: 34, rotation: -10, scale: 1.02, zIndex: 27 },
      { type: 'rose', x: 66, y: 34, rotation: 10, scale: 1.02, zIndex: 28 },
      // Small fillers filling outer spaces
      { type: 'baby_breath_item', x: 24, y: 28, rotation: -35, scale: 0.9, zIndex: 20 },
      { type: 'baby_breath_item', x: 76, y: 28, rotation: 35, scale: 0.9, zIndex: 21 },
      // Leaves fanning out at the back
      { type: 'leaf_green', x: 20, y: 18, rotation: -45, scale: 0.85, zIndex: 5 },
      { type: 'leaf_green', x: 80, y: 18, rotation: 45, scale: 0.85, zIndex: 6 }
    ]
  },
  {
    style: 'korean',
    label: 'Korean Style',
    emoji: '🎀',
    description: 'Chic Korean-inspired presentation with soft pastel tulips and carnations',
    wrapping: 'pink',
    ribbon: 'pink',
    defaultFlowers: ['peony', 'tulip', 'tulip', 'tulip', 'carnation', 'carnation', 'baby_breath_item', 'baby_breath_item', 'leaf_eucalyptus', 'leaf_eucalyptus'],
    predefinedLayout: [
      // Large center peony
      { type: 'peony', x: 50, y: 30, rotation: 0, scale: 1.15, zIndex: 30 },
      // Medium tulips & carnations around
      { type: 'tulip', x: 38, y: 20, rotation: -15, scale: 1.0, zIndex: 25 },
      { type: 'tulip', x: 62, y: 20, rotation: 15, scale: 1.0, zIndex: 26 },
      { type: 'tulip', x: 50, y: 44, rotation: 0, scale: 0.95, zIndex: 27 },
      { type: 'carnation', x: 34, y: 34, rotation: -25, scale: 1.02, zIndex: 28 },
      { type: 'carnation', x: 66, y: 34, rotation: 25, scale: 1.02, zIndex: 29 },
      // Outer fillers
      { type: 'baby_breath_item', x: 26, y: 26, rotation: -30, scale: 0.88, zIndex: 20 },
      { type: 'baby_breath_item', x: 74, y: 26, rotation: 30, scale: 0.88, zIndex: 21 },
      // Eucalyptus leaves behind
      { type: 'leaf_eucalyptus', x: 22, y: 16, rotation: -40, scale: 0.88, zIndex: 5 },
      { type: 'leaf_eucalyptus', x: 78, y: 16, rotation: 40, scale: 0.88, zIndex: 6 }
    ]
  },
  {
    style: 'heart_shape',
    label: 'Heart Shape',
    emoji: '❤️',
    description: 'Romantic heart-shaped arrangement of rich crimson roses and baby\'s breath',
    wrapping: 'luxury_black',
    ribbon: 'red',
    defaultFlowers: ['rose', 'rose', 'rose', 'rose', 'rose', 'rose', 'rose', 'baby_breath_item', 'baby_breath_item', 'leaf_green'],
    predefinedLayout: [
      // Center roses forming the heart lobes and V-shape
      { type: 'rose', x: 50, y: 36, rotation: 0, scale: 1.02, zIndex: 30 },
      { type: 'rose', x: 38, y: 22, rotation: -18, scale: 0.98, zIndex: 25 },
      { type: 'rose', x: 62, y: 22, rotation: 18, scale: 0.98, zIndex: 26 },
      { type: 'rose', x: 26, y: 30, rotation: -36, scale: 0.98, zIndex: 27 },
      { type: 'rose', x: 74, y: 30, rotation: 36, scale: 0.98, zIndex: 28 },
      { type: 'rose', x: 38, y: 46, rotation: -10, scale: 0.95, zIndex: 29 },
      { type: 'rose', x: 62, y: 46, rotation: 10, scale: 0.95, zIndex: 31 },
      // Outer fillers mapping the heart indent
      { type: 'baby_breath_item', x: 50, y: 20, rotation: 0, scale: 0.85, zIndex: 20 },
      { type: 'baby_breath_item', x: 50, y: 48, rotation: 0, scale: 0.85, zIndex: 21 },
      // Back green frame
      { type: 'leaf_green', x: 20, y: 20, rotation: -45, scale: 0.85, zIndex: 5 }
    ]
  },
  {
    style: 'cascade',
    label: 'Cascade',
    emoji: '🌿',
    description: 'Elegant waterfall cascade with cascading orchids, lilies, and ferns',
    wrapping: 'cream',
    ribbon: 'white',
    defaultFlowers: ['lily', 'orchid', 'orchid', 'rose', 'rose', 'leaf_fern', 'leaf_fern', 'baby_breath_item', 'baby_breath_item', 'sparkle_item'],
    predefinedLayout: [
      // Top center large lily
      { type: 'lily', x: 50, y: 18, rotation: 0, scale: 1.1, zIndex: 30 },
      // Cascading orchids flowing down vertically
      { type: 'orchid', x: 50, y: 30, rotation: 5, scale: 1.02, zIndex: 28 },
      { type: 'orchid', x: 50, y: 42, rotation: -5, scale: 0.95, zIndex: 27 },
      { type: 'orchid', x: 50, y: 54, rotation: 10, scale: 0.88, zIndex: 26 },
      // Medium roses framing the top sides
      { type: 'rose', x: 34, y: 24, rotation: -20, scale: 1.0, zIndex: 25 },
      { type: 'rose', x: 66, y: 24, rotation: 20, scale: 1.0, zIndex: 24 },
      // Cascade fern leaves flowing downwards
      { type: 'leaf_fern', x: 30, y: 42, rotation: -60, scale: 0.85, zIndex: 5 },
      { type: 'leaf_fern', x: 70, y: 42, rotation: 60, scale: 0.85, zIndex: 6 },
      // Small filler elements
      { type: 'baby_breath_item', x: 24, y: 16, rotation: -30, scale: 0.8, zIndex: 20 },
      { type: 'baby_breath_item', x: 76, y: 16, rotation: 30, scale: 0.8, zIndex: 21 },
      { type: 'sparkle_item', x: 50, y: 64, rotation: 0, scale: 0.85, zIndex: 40 }
    ]
  },
  {
    style: 'romantic_rose',
    label: 'Luxury Roses',
    emoji: '👑',
    description: 'Deep romantic crimson roses and dark green eucalyptus leaves',
    wrapping: 'luxury_black',
    ribbon: 'gold',
    defaultFlowers: ['rose', 'rose', 'rose', 'rose', 'rose', 'rose', 'leaf_eucalyptus', 'leaf_eucalyptus', 'baby_breath_item', 'baby_breath_item'],
    predefinedLayout: [
      // Central large rose layout
      { type: 'rose', x: 50, y: 28, rotation: 0, scale: 1.12, zIndex: 30 },
      { type: 'rose', x: 38, y: 22, rotation: -15, scale: 1.02, zIndex: 28 },
      { type: 'rose', x: 62, y: 22, rotation: 15, scale: 1.02, zIndex: 29 },
      { type: 'rose', x: 50, y: 42, rotation: 10, scale: 0.98, zIndex: 27 },
      { type: 'rose', x: 32, y: 34, rotation: -30, scale: 1.0, zIndex: 25 },
      { type: 'rose', x: 68, y: 34, rotation: 30, scale: 1.0, zIndex: 26 },
      // Eucalyptus leaves fanning back
      { type: 'leaf_eucalyptus', x: 20, y: 18, rotation: -45, scale: 0.88, zIndex: 5 },
      { type: 'leaf_eucalyptus', x: 80, y: 18, rotation: 45, scale: 0.88, zIndex: 6 },
      // Fillers
      { type: 'baby_breath_item', x: 25, y: 28, rotation: -20, scale: 0.85, zIndex: 20 },
      { type: 'baby_breath_item', x: 75, y: 28, rotation: 20, scale: 0.85, zIndex: 21 }
    ]
  },
  {
    style: 'sunflower',
    label: 'Sunflower Bouquet',
    emoji: '🌻',
    description: 'Vibrant golden sunflowers wrapped in rustic kraft paper',
    wrapping: 'kraft',
    ribbon: 'gold',
    defaultFlowers: ['sunflower', 'sunflower', 'sunflower', 'daisy', 'daisy', 'leaf_green', 'leaf_green', 'leaf_fern', 'baby_breath_item'],
    predefinedLayout: [
      // Large sunflowers in the center
      { type: 'sunflower', x: 50, y: 26, rotation: 0, scale: 1.15, zIndex: 30 },
      { type: 'sunflower', x: 36, y: 20, rotation: -15, scale: 1.05, zIndex: 28 },
      { type: 'sunflower', x: 64, y: 20, rotation: 15, scale: 1.05, zIndex: 29 },
      // Medium daisies around
      { type: 'daisy', x: 34, y: 36, rotation: -30, scale: 0.95, zIndex: 25 },
      { type: 'daisy', x: 66, y: 36, rotation: 30, scale: 0.95, zIndex: 26 },
      // Back greenery framing
      { type: 'leaf_green', x: 22, y: 16, rotation: -40, scale: 0.88, zIndex: 5 },
      { type: 'leaf_green', x: 78, y: 16, rotation: 40, scale: 0.88, zIndex: 6 },
      { type: 'leaf_fern', x: 50, y: 44, rotation: 0, scale: 0.85, zIndex: 4 },
      // Filler
      { type: 'baby_breath_item', x: 50, y: 12, rotation: 0, scale: 0.85, zIndex: 20 }
    ]
  },
  {
    style: 'tulip',
    label: 'Tulip Bouquet',
    emoji: '🌷',
    description: 'Vibrant colorful spring tulips with fresh lush green ferns',
    wrapping: 'cream',
    ribbon: 'pink',
    defaultFlowers: ['tulip', 'tulip', 'tulip', 'tulip', 'daisy', 'daisy', 'leaf_fern', 'leaf_fern', 'baby_breath_item'],
    predefinedLayout: [
      // Tulip group centered
      { type: 'tulip', x: 50, y: 26, rotation: 0, scale: 1.08, zIndex: 30 },
      { type: 'tulip', x: 38, y: 18, rotation: -12, scale: 1.0, zIndex: 28 },
      { type: 'tulip', x: 62, y: 18, rotation: 12, scale: 1.0, zIndex: 29 },
      { type: 'tulip', x: 50, y: 40, rotation: 8, scale: 0.98, zIndex: 27 },
      // Medium daisies fanning
      { type: 'daisy', x: 30, y: 30, rotation: -25, scale: 0.9, zIndex: 25 },
      { type: 'daisy', x: 70, y: 30, rotation: 25, scale: 0.9, zIndex: 26 },
      // Fern leaves behind
      { type: 'leaf_fern', x: 20, y: 16, rotation: -45, scale: 0.88, zIndex: 5 },
      { type: 'leaf_fern', x: 80, y: 16, rotation: 45, scale: 0.88, zIndex: 6 },
      // Baby breath filler
      { type: 'baby_breath_item', x: 50, y: 11, rotation: 0, scale: 0.82, zIndex: 20 }
    ]
  },
  {
    style: 'white_lily',
    label: 'White Lily',
    emoji: '🤍',
    description: 'Pure white lilies and daisies styled with fresh silver eucalyptus',
    wrapping: 'blue',
    ribbon: 'white',
    defaultFlowers: ['lily', 'lily', 'daisy', 'daisy', 'daisy', 'leaf_eucalyptus', 'leaf_eucalyptus', 'leaf_fern', 'baby_breath_item'],
    predefinedLayout: [
      // Large white lilies centered
      { type: 'lily', x: 50, y: 26, rotation: 0, scale: 1.15, zIndex: 30 },
      { type: 'lily', x: 50, y: 38, rotation: -15, scale: 1.05, zIndex: 29 },
      // Medium white daisies around
      { type: 'daisy', x: 34, y: 22, rotation: -20, scale: 0.95, zIndex: 25 },
      { type: 'daisy', x: 66, y: 22, rotation: 20, scale: 0.95, zIndex: 26 },
      { type: 'daisy', x: 32, y: 36, rotation: -30, scale: 0.95, zIndex: 27 },
      // Eucalyptus leaves framing behind
      { type: 'leaf_eucalyptus', x: 22, y: 16, rotation: -40, scale: 0.88, zIndex: 5 },
      { type: 'leaf_eucalyptus', x: 78, y: 16, rotation: 40, scale: 0.88, zIndex: 6 },
      { type: 'leaf_fern', x: 20, y: 30, rotation: -60, scale: 0.85, zIndex: 4 },
      // Baby breath filler
      { type: 'baby_breath_item', x: 68, y: 32, rotation: 20, scale: 0.85, zIndex: 20 }
    ]
  },
  {
    style: 'minimal',
    label: 'Minimal Bouquet',
    emoji: '🤍',
    description: 'Clean, modern arrangement with elegant white tulip stems',
    wrapping: 'white',
    ribbon: 'white',
    defaultFlowers: ['tulip', 'tulip', 'leaf_eucalyptus', 'leaf_eucalyptus', 'baby_breath_item'],
    predefinedLayout: [
      // Minimal tulip stems fanning slightly
      { type: 'tulip', x: 44, y: 28, rotation: -8, scale: 1.05, zIndex: 20 },
      { type: 'tulip', x: 56, y: 28, rotation: 8, scale: 1.05, zIndex: 21 },
      // Eucalyptus behind
      { type: 'leaf_eucalyptus', x: 32, y: 20, rotation: -30, scale: 0.88, zIndex: 5 },
      { type: 'leaf_eucalyptus', x: 68, y: 20, rotation: 30, scale: 0.88, zIndex: 6 },
      // Simple baby breath filler
      { type: 'baby_breath_item', x: 50, y: 40, rotation: 0, scale: 0.85, zIndex: 15 }
    ]
  },
  {
    style: 'pink_pastel',
    label: 'Romantic Pink',
    emoji: '🌸',
    description: 'Lush romantic pink peonies and cherry blossoms in a sweet wrap',
    wrapping: 'pink',
    ribbon: 'white',
    defaultFlowers: ['peony', 'peony', 'peony', 'daisy', 'daisy', 'cherry_blossom', 'leaf_eucalyptus', 'leaf_eucalyptus', 'sparkle_item', 'sparkle_item'],
    predefinedLayout: [
      // Large pink peonies in center
      { type: 'peony', x: 50, y: 28, rotation: 0, scale: 1.15, zIndex: 30 },
      { type: 'peony', x: 38, y: 22, rotation: -12, scale: 1.05, zIndex: 28 },
      { type: 'peony', x: 62, y: 22, rotation: 12, scale: 1.05, zIndex: 29 },
      // Medium daisies around
      { type: 'daisy', x: 30, y: 34, rotation: -25, scale: 0.95, zIndex: 25 },
      { type: 'daisy', x: 70, y: 34, rotation: 25, scale: 0.95, zIndex: 26 },
      // Cherry blossom fillers
      { type: 'cherry_blossom', x: 50, y: 44, rotation: 0, scale: 0.92, zIndex: 20 },
      // Leaves framing
      { type: 'leaf_eucalyptus', x: 20, y: 18, rotation: -45, scale: 0.88, zIndex: 5 },
      { type: 'leaf_eucalyptus', x: 80, y: 18, rotation: 45, scale: 0.88, zIndex: 6 },
      // Sparkles
      { type: 'sparkle_item', x: 34, y: 38, rotation: 15, scale: 0.8, zIndex: 40 },
      { type: 'sparkle_item', x: 66, y: 38, rotation: -15, scale: 0.8, zIndex: 41 }
    ]
  }
];

export interface WrappingDef {
  id: WrappingColor;
  label: string;
  color: string;        // primary CSS color
  gradient: string;     // CSS gradient string
  textureClass: string;
}

export const WRAPPING_OPTIONS: WrappingDef[] = [
  { id: 'white',        label: 'White',         color: '#f9fafb', gradient: 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)', textureClass: 'wrap-white' },
  { id: 'pink',         label: 'Pink',          color: '#fce7f3', gradient: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', textureClass: 'wrap-pink' },
  { id: 'cream',        label: 'Cream',         color: '#fefce8', gradient: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)', textureClass: 'wrap-cream' },
  { id: 'kraft',        label: 'Kraft',         color: '#d6b896', gradient: 'linear-gradient(135deg, #d6b896 0%, #b8956b 100%)', textureClass: 'wrap-kraft' },
  { id: 'luxury_black', label: 'Luxury Black',  color: '#1c1917', gradient: 'linear-gradient(135deg, #292524 0%, #1c1917 100%)', textureClass: 'wrap-black' },
  { id: 'lavender',     label: 'Lavender',      color: '#ede9fe', gradient: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)', textureClass: 'wrap-lavender' },
  { id: 'blue',         label: 'Sky Blue',      color: '#e0f2fe', gradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', textureClass: 'wrap-blue' },
  { id: 'pastel',       label: 'Pastel Dream',  color: '#fdf4ff', gradient: 'linear-gradient(135deg, #fdf4ff 0%, #fce7f3 50%, #ede9fe 100%)', textureClass: 'wrap-pastel' },
];

export interface RibbonDef {
  id: RibbonColor;
  label: string;
  color: string;
  darkColor: string;
}

export const RIBBON_OPTIONS: RibbonDef[] = [
  { id: 'white', label: 'White',  color: '#f9fafb', darkColor: '#d1d5db' },
  { id: 'pink',  label: 'Pink',   color: '#f472b6', darkColor: '#db2777' },
  { id: 'red',   label: 'Red',    color: '#ef4444', darkColor: '#b91c1c' },
  { id: 'gold',  label: 'Gold',   color: '#f59e0b', darkColor: '#b45309' },
  { id: 'black', label: 'Black',  color: '#1c1917', darkColor: '#000000' },
  { id: 'blue',  label: 'Blue',   color: '#60a5fa', darkColor: '#2563eb' },
];

export interface ExtraDef {
  id: ExtraType;
  label: string;
  emoji: string;
  description: string;
}

export const EXTRA_OPTIONS: ExtraDef[] = [
  { id: 'teddy',      label: 'Teddy Bear',   emoji: '🧸', description: 'A soft and cuddly friend' },
  { id: 'chocolate',  label: 'Chocolate',    emoji: '🍫', description: 'Sweet artisan chocolates' },
  { id: 'gift_box',   label: 'Gift Box',     emoji: '🎁', description: 'Beautifully wrapped surprise' },
  { id: 'heart_card', label: 'Heart Card',   emoji: '❤️', description: 'A little card with love' },
];

export interface LetterTemplateDef {
  id: LetterTemplate;
  label: string;
  emoji: string;
  bgColor: string;
  borderColor: string;
  fontClass: string;
  textColor: string;
  accentColor: string;
  greeting: string;
  closing: string;
  placeholder: string;
}

export const LETTER_TEMPLATES: LetterTemplateDef[] = [
  {
    id: 'love', label: 'Love', emoji: '❤️',
    bgColor: '#fff5f7', borderColor: '#fecdd3', fontClass: 'font-caveat', textColor: '#9f1239', accentColor: '#e11d48',
    greeting: 'My Dearest,', closing: 'Forever Yours,',
    placeholder: 'Every beat of my heart whispers your name...',
  },
  {
    id: 'friendship', label: 'Friendship', emoji: '🤝',
    bgColor: '#f0fdf4', borderColor: '#bbf7d0', fontClass: 'font-caveat', textColor: '#14532d', accentColor: '#16a34a',
    greeting: 'Hey there,', closing: 'Always by your side,',
    placeholder: 'You\'re one of those rare people who make the ordinary feel extraordinary...',
  },
  {
    id: 'birthday', label: 'Birthday', emoji: '🎂',
    bgColor: '#fffbeb', borderColor: '#fde68a', fontClass: 'font-caveat', textColor: '#78350f', accentColor: '#f59e0b',
    greeting: 'Happy Birthday,', closing: 'With birthday love,',
    placeholder: 'Wishing you a day as beautiful and special as you are...',
  },
  {
    id: 'anniversary', label: 'Anniversary', emoji: '💍',
    bgColor: '#fff7ed', borderColor: '#fed7aa', fontClass: 'font-caveat', textColor: '#7c2d12', accentColor: '#ea580c',
    greeting: 'My Love,', closing: 'Through every season,',
    placeholder: 'Another year of laughter, love, and beautiful memories together...',
  },
  {
    id: 'thank_you', label: 'Thank You', emoji: '🙏',
    bgColor: '#f0f9ff', borderColor: '#bae6fd', fontClass: 'font-caveat', textColor: '#0c4a6e', accentColor: '#0284c7',
    greeting: 'Dear Friend,', closing: 'With gratitude,',
    placeholder: 'Words feel small for the kindness you\'ve shown me...',
  },
  {
    id: 'sorry', label: 'Sorry', emoji: '🕊️',
    bgColor: '#faf5ff', borderColor: '#e9d5ff', fontClass: 'font-caveat', textColor: '#581c87', accentColor: '#9333ea',
    greeting: 'To the one I hurt,', closing: 'Hoping for forgiveness,',
    placeholder: 'I\'ve been thinking of the right words for so long...',
  },
  {
    id: 'miss_you', label: 'Miss You', emoji: '💭',
    bgColor: '#fdf2f8', borderColor: '#f5d0fe', fontClass: 'font-caveat', textColor: '#701a75', accentColor: '#a21caf',
    greeting: 'I miss you,', closing: 'Until we meet again,',
    placeholder: 'The distance between us feels like the whole world sometimes...',
  },
  {
    id: 'graduation', label: 'Graduation', emoji: '🎓',
    bgColor: '#f8fafc', borderColor: '#e2e8f0', fontClass: 'font-serif', textColor: '#1e293b', accentColor: '#3b82f6',
    greeting: 'Congratulations,', closing: 'So very proud,',
    placeholder: 'You did it! All those late nights and hard work have bloomed beautifully...',
  },
  {
    id: 'wedding', label: 'Wedding', emoji: '👰',
    bgColor: '#fefce8', borderColor: '#fef9c3', fontClass: 'font-great-vibes', textColor: '#713f12', accentColor: '#ca8a04',
    greeting: 'Dearest,', closing: 'With warmest blessings,',
    placeholder: 'Today two hearts become one beautiful story...',
  },
  {
    id: 'festival', label: 'Festival', emoji: '🎉',
    bgColor: '#fff7ed', borderColor: '#fdba74', fontClass: 'font-caveat', textColor: '#7c2d12', accentColor: '#f97316',
    greeting: 'Season\'s Greetings,', closing: 'With festive joy,',
    placeholder: 'May this season bring you joy, peace, and everything your heart desires...',
  },
  {
    id: 'minimal', label: 'Minimal', emoji: '✦',
    bgColor: '#ffffff', borderColor: '#f3f4f6', fontClass: 'font-serif', textColor: '#374151', accentColor: '#6b7280',
    greeting: 'Hello,', closing: 'Sincerely,',
    placeholder: 'Some things are best said simply...',
  },
  {
    id: 'luxury', label: 'Luxury', emoji: '✨',
    bgColor: '#1c1917', borderColor: '#d4a017', fontClass: 'font-great-vibes', textColor: '#fef9c3', accentColor: '#d4a017',
    greeting: 'To my cherished,', closing: 'With admiration,',
    placeholder: 'You deserve every beautiful thing this world has to offer...',
  },
  {
    id: 'vintage', label: 'Vintage', emoji: '📜',
    bgColor: '#fef3c7', borderColor: '#d97706', fontClass: 'font-great-vibes', textColor: '#78350f', accentColor: '#b45309',
    greeting: 'To you, my dear,', closing: 'Fondly and always,',
    placeholder: 'Like a letter from another era, this comes to you with old-fashioned sincerity...',
  },
  {
    id: 'floral', label: 'Floral', emoji: '🌸',
    bgColor: '#fdf2f8', borderColor: '#f9a8d4', fontClass: 'font-caveat', textColor: '#831843', accentColor: '#db2777',
    greeting: 'Dearest bloom,', closing: 'With blooming love,',
    placeholder: 'Like flowers turn to the sun, my heart always finds its way to you...',
  },
  {
    id: 'classic', label: 'Classic', emoji: '🖋️',
    bgColor: '#f9fafb', borderColor: '#d1d5db', fontClass: 'font-serif', textColor: '#111827', accentColor: '#374151',
    greeting: 'Dear,', closing: 'Yours truly,',
    placeholder: 'I hope this finds you well and happy...',
  },
];

export interface EnvelopeDef {
  id: EnvelopeStyle;
  label: string;
  emoji: string;
  color: string;
  flapColor: string;
  description: string;
}

export const ENVELOPE_OPTIONS: EnvelopeDef[] = [
  { id: 'classic',    label: 'Classic',    emoji: '✉️',  color: '#f9fafb', flapColor: '#e5e7eb', description: 'Clean white envelope' },
  { id: 'vintage',    label: 'Vintage',    emoji: '📜',  color: '#fef3c7', flapColor: '#d97706', description: 'Aged parchment paper' },
  { id: 'luxury',     label: 'Luxury',     emoji: '✨',  color: '#1c1917', flapColor: '#d4a017', description: 'Matte black with gold' },
  { id: 'floral',     label: 'Floral',     emoji: '🌸',  color: '#fdf2f8', flapColor: '#f472b6', description: 'Pink floral envelope' },
  { id: 'minimal',    label: 'Minimal',    emoji: '▭',   color: '#ffffff', flapColor: '#9ca3af', description: 'Simple and clean' },
  { id: 'wax_seal',   label: 'Wax Seal',   emoji: '🔴',  color: '#fef3c7', flapColor: '#78350f', description: 'Classic wax seal' },
  { id: 'heart_seal', label: 'Heart Seal', emoji: '❤️',  color: '#fff1f2', flapColor: '#e11d48', description: 'Sealed with a heart' },
];
