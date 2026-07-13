import { create } from 'zustand';
import type {
  BouquetStyle,
  FlowerType,
  FlowerItem,
  FillerType,
  WrappingColor,
  RibbonColor,
  ExtraType,
  LetterTemplate,
  EnvelopeStyle,
} from '@/types/bouquet';
import { BOUQUET_STYLES, FLOWER_CATALOGUE } from '@/types/bouquet';

if (typeof window !== 'undefined') {
  localStorage.removeItem('bloombox-bouquet');
}

// Smart flower arrangement presets
interface FloristSlot {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

// V-shaped bouquet limits: prevents flowers from floating in mid-air on the sides
function clampToBouquetV(x: number, y: number): { x: number; y: number } {
  const clampedY = Math.max(10, Math.min(54, y));
  const progress = (clampedY - 10) / (54 - 10);
  const clampedProgress = Math.max(0, Math.min(1, progress));
  // Limit horizontal fanning space: Y=10 gives +/- 35% margin, Y=54 (near ribbon) gives +/- 12% margin
  const maxDX = 35 - clampedProgress * (35 - 12);
  const clampedX = Math.max(50 - maxDX, Math.min(50 + maxDX, x));
  return { x: clampedX, y: clampedY };
}

function resolveCollisions(flowers: FlowerItem[]): FlowerItem[] {
  const threshold = 12.5; // spacing in % of container to prevent overlap
  let changed = true;
  let iterations = 0;
  
  // Clone flowers list
  const list = flowers.map((f) => ({ ...f }));
  
  while (changed && iterations < 15) {
    changed = false;
    iterations++;
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const f1 = list[i];
        const f2 = list[j];
        
        // Skip sparkles or foliage collision checks if they are allowed to overlap
        if (f1.type === 'sparkle_item' || f2.type === 'sparkle_item') continue;
        
        const dx = f2.x - f1.x;
        const dy = f2.y - f1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Dynamic threshold based on flower scales
        const minSpacing = threshold * ((f1.scale + f2.scale) / 2);
        
        if (dist < minSpacing && dist > 0.01) {
          const overlap = minSpacing - dist;
          // Calculate force
          const forceX = (dx / dist) * overlap * 0.5;
          const forceY = (dy / dist) * overlap * 0.5;
          
          // Push apart
          f1.x -= forceX;
          f1.y -= forceY;
          f2.x += forceX;
          f2.y += forceY;
          
          // Clamp to V-shaped flower container limits
          const c1 = clampToBouquetV(f1.x, f1.y);
          f1.x = c1.x;
          f1.y = c1.y;
          
          const c2 = clampToBouquetV(f2.x, f2.y);
          f2.x = c2.x;
          f2.y = c2.y;
          
          changed = true;
        }
      }
    }
  }

  // Natural layering resolution: Sort active flowers by y ascending
  // The ones with larger y are in front, so they get higher zIndex.
  const isFoliage = (type: string) =>
    ['leaf_green', 'leaf_fern', 'leaf_eucalyptus'].includes(type);
    
  const foliageList = list.filter((f) => isFoliage(f.type));
  const flowerList = list.filter((f) => !isFoliage(f.type) && f.type !== 'sparkle_item');
  const sparklesList = list.filter((f) => f.type === 'sparkle_item');
  
  // Sort flower heads by y coordinate
  flowerList.sort((a, b) => a.y - b.y);
  
  // Re-assign zIndices
  foliageList.forEach((f, idx) => {
    f.zIndex = 5 + idx;
  });
  
  flowerList.forEach((f, idx) => {
    f.zIndex = 20 + idx;
  });
  
  sparklesList.forEach((f, idx) => {
    f.zIndex = 90 + idx;
  });
  
  return [...foliageList, ...flowerList, ...sparklesList];
}

function getFloristSlots(pattern: 'dome' | 'heart' | 'cascade', count: number): FloristSlot[] {
  const slots: FloristSlot[] = [];
  
  // Base scale based on count
  let baseScale = 1.0;
  if (count <= 10) baseScale = 1.12;
  else if (count <= 20) baseScale = 1.0;
  else if (count <= 40) baseScale = 0.88;
  else baseScale = 0.76;

  if (pattern === 'heart') {
    // Generate inner slots first, then outer slots
    const innerSlots: FloristSlot[] = [];
    const outerSlots: FloristSlot[] = [];
    
    for (let i = 0; i < count; i++) {
      let t = 0;
      let rX = 1.0;
      let rY = 1.0;
      let scale = 1.0;
      let isOuter = false;
      
      if (count <= 7) {
        t = (i * 2 * Math.PI) / count - Math.PI / 2;
        rX = 15;
        rY = 13;
        scale = 1.05;
        isOuter = true;
      } else {
        const outerCount = Math.floor(count * 0.60);
        if (i < outerCount) {
          t = (i * 2 * Math.PI) / outerCount - Math.PI / 2;
          rX = 18.0;
          rY = 15.0;
          scale = 0.98;
          isOuter = true;
        } else {
          const innerIdx = i - outerCount;
          const innerCount = count - outerCount;
          t = (innerIdx * 2 * Math.PI) / innerCount - Math.PI / 2;
          rX = 10.0;
          rY = 8.5;
          scale = 0.92;
          isOuter = false;
        }
      }
      
      const xOffset = 16 * Math.pow(Math.sin(t), 3);
      const yOffset = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      
      const rawX = 50 + (xOffset / 16) * rX;
      const rawY = 30 + (yOffset / 13) * rY;
      
      // V-taper transformation (wider at the top, narrower at the bottom)
      const taperFactor = 1.15 - (rawY - 16) / 48;
      const x = 50 + (rawX - 50) * taperFactor;
      const y = rawY;
      
      const dx = x - 50;
      const dy = y - 30;
      const angle = dx === 0 && dy === 0 ? 0 : Math.atan2(dy, dx) * (180 / Math.PI) - 90;
      
      // Apply natural variation using index i to guarantee matching shared coordinates
      const scaleVariation = scale * baseScale * (0.95 + Math.sin(i * 1.7) * 0.05); // 90% to 100% of scale
      const rotationVariation = Math.max(-45, Math.min(45, angle * 0.4)) + (Math.cos(i * 3.1) * 8); // -8 to +8 deg variation
      
      const clamped = clampToBouquetV(x, y);
      const slot: FloristSlot = {
        x: clamped.x,
        y: clamped.y,
        rotation: rotationVariation,
        scale: scaleVariation,
        zIndex: 20 + i,
      };
      
      if (isOuter) {
        outerSlots.push(slot);
      } else {
        innerSlots.push(slot);
      }
    }
    
    // Sort slots so inner slots (focal points) are placed first
    slots.push(...innerSlots, ...outerSlots);
    
  } else if (pattern === 'cascade') {
    // Cascade arrangement fanning outwards at top, fanning inwards at bottom
    const rows: number[][] = [];
    let remaining = count;
    let rowIdx = 0;
    const capacities = [4, 4, 3, 3, 2, 2, 2, 2, 1, 1];
    
    while (remaining > 0) {
      const cap = Math.min(remaining, capacities[rowIdx] || 1);
      const rowSlots = [];
      for (let j = 0; j < cap; j++) {
        rowSlots.push(j);
      }
      rows.push(rowSlots);
      remaining -= cap;
      rowIdx++;
    }
    
    let slotIdx = 0;
    rows.forEach((row, r) => {
      const rowY = 14 + r * 4.2; // tighter row spacing to fit in the V-shape bouquet
      const rowCount = row.length;
      
      let rowWidth = 32;
      if (r === 1) rowWidth = 26;
      else if (r === 2) rowWidth = 18;
      else if (r === 3) rowWidth = 12;
      else if (r >= 4) rowWidth = 4;
      
      row.forEach((item, col) => {
        let rawX = 50;
        if (rowCount > 1) {
          const step = rowWidth / (rowCount - 1);
          rawX = 50 - rowWidth / 2 + col * step;
        }
        
        // V-taper transformation
        const taperFactor = 1.15 - (rowY - 16) / 48;
        const x = 50 + (rawX - 50) * taperFactor;
        const y = rowY;
        
        let rot = 0;
        if (r < 3) {
          rot = (x - 50) * 1.3;
        } else {
          rot = Math.sin(slotIdx * 2.3) * 8;
        }
        
        const depthScale = (1.0 - r * 0.05) * baseScale;
        const scaleVariation = depthScale * (0.95 + Math.sin(slotIdx * 1.7) * 0.05);
        const rotationVariation = rot + (Math.cos(slotIdx * 3.1) * 8);
        
        const clamped = clampToBouquetV(x, y);
        slots.push({
          x: clamped.x,
          y: clamped.y,
          rotation: rotationVariation,
          scale: scaleVariation,
          zIndex: 20 + slotIdx,
        });
        slotIdx++;
      });
    });
    
  } else {
    // Dome: Concentric rings
    // Center slot first
    slots.push({
      x: 50,
      y: 32,
      rotation: 0,
      scale: 1.05 * baseScale,
      zIndex: 50,
    });
    
    let allocated = 1;
    let ringIdx = 1;
    const rings = [
      { cap: 6, rx: 11, ry: 7 },
      { cap: 12, rx: 20, ry: 13 },
      { cap: 18, rx: 29, ry: 18 },
      { cap: 24, rx: 36, ry: 22 },
    ];
    
    while (allocated < count) {
      const ring = rings[ringIdx - 1] || { cap: 12, rx: 12 + ringIdx * 6, ry: 8 + ringIdx * 4 };
      const cap = Math.min(count - allocated, ring.cap);
      const startAngle = (ringIdx * 17) % 360;
      
      for (let j = 0; j < cap; j++) {
        const angle = startAngle + (j * 360) / cap;
        const rad = (angle * Math.PI) / 180;
        
        const rawX = 50 + Math.sin(rad) * ring.rx;
        const rawY = 32 + Math.cos(rad) * ring.ry;
        
        // V-taper transformation
        const taperFactor = 1.15 - (rawY - 16) / 48;
        const x = 50 + (rawX - 50) * taperFactor;
        const y = rawY;
        
        const scale = (1.0 - ringIdx * 0.04) * baseScale;
        const scaleVariation = scale * (0.95 + Math.sin(allocated * 1.7) * 0.05);
        const rotationVariation = angle - 90 + (Math.cos(allocated * 3.1) * 8);
        
        const clamped = clampToBouquetV(x, y);
        slots.push({
          x: clamped.x,
          y: clamped.y,
          rotation: rotationVariation,
          scale: scaleVariation,
          zIndex: 40 - ringIdx,
        });
        allocated++;
      }
      ringIdx++;
    }
  }
  
  return slots;
}

export function arrangeFlowers(
  flowers: FlowerItem[],
  pattern: 'dome' | 'heart' | 'cascade'
): FlowerItem[] {
  if (flowers.length === 0) return [];

  const foliage: FlowerItem[] = [];
  const activeFlowers: FlowerItem[] = [];

  const isFoliage = (type: string) =>
    ['leaf_green', 'leaf_fern', 'leaf_eucalyptus'].includes(type);
  const isLarge = (type: string) =>
    ['peony', 'lily', 'sunflower', 'hydrangea'].includes(type);
  const isMedium = (type: string) =>
    ['rose', 'rose_pink', 'rose_white', 'rose_yellow', 'tulip', 'carnation', 'orchid', 'daisy', 'jasmine', 'lotus', 'marigold'].includes(type);

  flowers.forEach((f) => {
    if (isFoliage(f.type)) foliage.push(f);
    else activeFlowers.push(f);
  });

  const getWeight = (type: string) => {
    if (isLarge(type)) return 3;
    if (isMedium(type)) return 2;
    return 1;
  };
  
  // Sort flowers by size: Large -> Medium -> Small
  activeFlowers.sort((a, b) => getWeight(b.type) - getWeight(a.type));

  const flowerSlots = getFloristSlots(pattern, activeFlowers.length);
  const arranged: FlowerItem[] = [];

  activeFlowers.forEach((f, idx) => {
    const slot = flowerSlots[idx] || {
      x: 50 + ((idx % 3) - 1) * 12,
      y: 32 + ((Math.floor(idx / 3) % 3) - 1) * 8,
      rotation: (idx % 2 === 0 ? -15 : 15) * idx,
      scale: 0.85,
      zIndex: 20 + idx,
    };

    // Apply scale multiplier: Large gets boosted, Small gets reduced
    const scaleBoost = isLarge(f.type) ? 1.06 : isMedium(f.type) ? 0.96 : 0.82;

    const clamped = clampToBouquetV(slot.x, slot.y);
    arranged.push({
      ...f,
      x: clamped.x,
      y: clamped.y,
      scale: slot.scale * scaleBoost,
      rotation: slot.rotation,
      zIndex: slot.zIndex,
    });
  });

  foliage.forEach((f, idx) => {
    const angle = (idx * 360) / Math.max(1, foliage.length);
    const rad = (angle * Math.PI) / 180;
    
    // Position foliage/leaves in the middle space (in between flowers) rather than on the far outside ring
    let x = 50 + Math.sin(rad) * (15 + Math.sin(idx * 2.1) * 5);
    let y = 30 + Math.cos(rad) * (10 + Math.cos(idx * 2.7) * 3);

    if (pattern === 'heart') {
      const t = (idx * 2 * Math.PI) / Math.max(1, foliage.length) - Math.PI / 2;
      x = 50 + 10 * Math.pow(Math.sin(t), 3) * 1.5;
      y = 30 - 8.5 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16 * 1.1;
    } else if (pattern === 'cascade') {
      const angleRange = 100;
      const angleStep = foliage.length > 1 ? angleRange / (foliage.length - 1) : 0;
      const ang = -angleRange / 2 + angleStep * idx;
      const r = (ang * Math.PI) / 180;
      x = 50 + Math.sin(r) * 18;
      y = 26 + Math.cos(r) * 10;
    }

    const clamped = clampToBouquetV(x, y);
    arranged.push({
      ...f,
      x: clamped.x,
      y: clamped.y,
      scale: 0.78,
      rotation: angle - 90 + 35 * Math.sin(idx),
      zIndex: 5 + idx,
    });
  });

  return resolveCollisions(arranged);
}

function findEmptiestPosition(flowers: FlowerItem[]): { x: number; y: number } {
  if (flowers.length === 0) return { x: 50, y: 36 };
  
  let bestX = 50;
  let bestY = 36;
  let maxMinDistance = -1;
  
  for (let x = 20; x <= 80; x += 6) {
    for (let y = 18; y <= 54; y += 6) {
      let minDistance = Infinity;
      for (const f of flowers) {
        const dx = f.x - x;
        const dy = f.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          minDistance = dist;
        }
      }
      if (minDistance > maxMinDistance) {
        maxMinDistance = minDistance;
        bestX = x;
        bestY = y;
      }
    }
  }
  return { x: bestX, y: bestY };
}

export interface BouquetState {
  // Step tracking
  currentStep: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Step 1: Bouquet style
  bouquetStyle: BouquetStyle;
  setBouquetStyle: (style: BouquetStyle) => void;

  // Step 2: Flowers
  flowers: FlowerItem[];
  arrangementPattern: 'dome' | 'heart' | 'cascade' | 'custom';
  setArrangementPattern: (pattern: 'dome' | 'heart' | 'cascade') => void;
  addFlower: (type: FlowerType) => void;
  removeFlower: (id: string) => void;
  clearFlowers: () => void;
  updateFlowerPosition: (id: string, x: number, y: number) => void;
  getFlowerCount: (type: FlowerType) => number;

  // Step 3: Fillers
  fillers: FillerType[];
  toggleFiller: (filler: FillerType) => void;

  // Step 4: Wrapping
  wrapping: WrappingColor;
  setWrapping: (color: WrappingColor) => void;

  // Step 5: Ribbon
  ribbon: RibbonColor;
  setRibbon: (color: RibbonColor) => void;

  // Step 6: Extras
  extras: ExtraType[];
  toggleExtra: (extra: ExtraType) => void;

  // Step 7: Letter
  letterTemplate: LetterTemplate;
  recipientName: string;
  message: string;
  senderName: string;
  setLetterTemplate: (tpl: LetterTemplate) => void;
  setRecipientName: (name: string) => void;
  setMessage: (msg: string) => void;
  setSenderName: (name: string) => void;

  // Step 8: Envelope
  envelope: EnvelopeStyle;
  setEnvelope: (style: EnvelopeStyle) => void;

  // Sharing
  giftId: string | null;
  shareUrl: string | null;
  isSharing: boolean;
  setGiftId: (id: string | null) => void;
  setShareUrl: (url: string | null) => void;
  setIsSharing: (sharing: boolean) => void;

  // Selection & Advanced edits
  selectedFlowerId: string | null;
  selectFlower: (id: string | null) => void;
  updateFlowerRotation: (id: string, rotation: number) => void;
  updateFlowerScale: (id: string, scale: number) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  duplicateFlower: (id: string) => void;
  deleteFlower: (id: string) => void;

  // Reset
  resetBouquet: () => void;
}

const defaultFillers: FillerType[] = ['baby_breath', 'green_leaves', 'eucalyptus'];

const initialState = {
  currentStep: 1,
  bouquetStyle: 'classic' as BouquetStyle,
  flowers: [] as FlowerItem[],
  arrangementPattern: 'dome' as 'dome' | 'heart' | 'cascade' | 'custom',
  fillers: defaultFillers,
  wrapping: 'white' as WrappingColor,
  ribbon: 'red' as RibbonColor,
  extras: [] as ExtraType[],
  letterTemplate: 'love' as LetterTemplate,
  recipientName: '',
  message: '',
  senderName: '',
  envelope: 'classic' as EnvelopeStyle,
  giftId: null as string | null,
  shareUrl: null as string | null,
  isSharing: false,
  selectedFlowerId: null as string | null,
};

export const useBouquetStore = create<BouquetState>()(
  (set, get) => ({
    ...initialState,

    setStep: (step) => set({ currentStep: step }),
    nextStep: () => set((s) => ({ currentStep: Math.min(9, s.currentStep + 1) })),
    prevStep: () => set((s) => ({ currentStep: Math.max(1, s.currentStep - 1) })),

    setBouquetStyle: (bouquetStyle) => {
      const styleDef = BOUQUET_STYLES.find((s) => s.style === bouquetStyle);
      if (!styleDef) {
        set({ bouquetStyle });
        return;
      }

      const prearrangedFlowers: FlowerItem[] = styleDef.predefinedLayout.map((item, i) => ({
        id: `${item.type}-default-${i}-${Math.random().toString(36).slice(2, 6)}`,
        type: item.type,
        x: item.x,
        y: item.y,
        rotation: item.rotation,
        scale: item.scale,
        zIndex: item.zIndex,
      }));

      // Resolve collisions and clamp to the realistic V-shape space
      const resolved = resolveCollisions(prearrangedFlowers);

      set({
        bouquetStyle,
        arrangementPattern: 'dome',
        flowers: resolved,
        wrapping: styleDef.wrapping,
        ribbon: styleDef.ribbon,
      });
    },

      setArrangementPattern: (arrangementPattern) => {
        const activeFlowers = get().flowers;
        const arranged = arrangeFlowers(activeFlowers, arrangementPattern);
        set({
          arrangementPattern,
          flowers: arranged,
        });
      },

      addFlower: (type) => {
        const flowerDef = FLOWER_CATALOGUE.find((f) => f.type === type);
        if (!flowerDef) return;

        set((s) => {
          const emptiest = findEmptiestPosition(s.flowers);
          const newFlower: FlowerItem = {
            id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type,
            x: s.arrangementPattern === 'custom' ? emptiest.x : 50,
            y: s.arrangementPattern === 'custom' ? emptiest.y : 36,
            rotation: (Math.random() - 0.5) * 15,
            scale: 1.0,
            zIndex: s.flowers.length,
          };

          const updated = [...s.flowers, newFlower];
          if (s.arrangementPattern === 'custom') {
            const resolved = resolveCollisions(updated);
            return { flowers: resolved, selectedFlowerId: newFlower.id };
          }
          const arranged = arrangeFlowers(updated, s.arrangementPattern);
          return { flowers: arranged, selectedFlowerId: newFlower.id };
        });
      },

      removeFlower: (id) => {
        set((s) => {
          const updated = s.flowers.filter((f) => f.id !== id);
          if (s.arrangementPattern === 'custom') {
            return { flowers: updated };
          }
          return { flowers: arrangeFlowers(updated, s.arrangementPattern) };
        });
      },

      clearFlowers: () => set({ flowers: [] }),

      updateFlowerPosition: (id, x, y) => {
        set((s) => {
          // Clamp to dynamic V-shaped container limits so dragged flowers stay within realistic boundaries
          const clamped = clampToBouquetV(x, y);

          const updated = s.flowers.map((f) => (f.id === id ? { ...f, x: clamped.x, y: clamped.y } : f));
          
          // Resolve collisions so other flowers slide to make room and maintain correct depth layers
          const resolved = resolveCollisions(updated);
          
          return {
            arrangementPattern: 'custom',
            flowers: resolved,
          };
        });
      },

      getFlowerCount: (type) => {
        return get().flowers.filter((f) => f.type === type).length;
      },

      toggleFiller: (filler) => {
        set((s) => {
          const has = s.fillers.includes(filler);
          return {
            fillers: has
              ? s.fillers.filter((f) => f !== filler)
              : [...s.fillers, filler],
          };
        });
      },

      setWrapping: (wrapping) => set({ wrapping }),
      setRibbon: (ribbon) => set({ ribbon }),

      toggleExtra: (extra) => {
        set((s) => {
          const has = s.extras.includes(extra);
          return {
            extras: has
              ? s.extras.filter((e) => e !== extra)
              : [...s.extras, extra],
          };
        });
      },

      setLetterTemplate: (letterTemplate) => set({ letterTemplate }),
      setRecipientName: (recipientName) => set({ recipientName }),
      setMessage: (message) => set({ message }),
      setSenderName: (senderName) => set({ senderName }),

      setEnvelope: (envelope) => set({ envelope }),

      setGiftId: (giftId) => set({ giftId }),
      setShareUrl: (shareUrl) => set({ shareUrl }),
      setIsSharing: (isSharing) => set({ isSharing }),

      selectFlower: (selectedFlowerId) => set({ selectedFlowerId }),
      
      updateFlowerRotation: (id, rotation) => {
        set((s) => ({
          flowers: s.flowers.map((f) => (f.id === id ? { ...f, rotation } : f)),
        }));
      },
      
      updateFlowerScale: (id, scale) => {
        set((s) => ({
          flowers: s.flowers.map((f) => (f.id === id ? { ...f, scale } : f)),
        }));
      },

      bringForward: (id) => {
        set((s) => {
          const idx = s.flowers.findIndex((f) => f.id === id);
          if (idx === -1) return {};
          const currentZ = s.flowers[idx].zIndex ?? idx;
          return {
            flowers: s.flowers.map((f) => (f.id === id ? { ...f, zIndex: currentZ + 1 } : f)),
          };
        });
      },

      sendBackward: (id) => {
        set((s) => {
          const idx = s.flowers.findIndex((f) => f.id === id);
          if (idx === -1) return {};
          const currentZ = s.flowers[idx].zIndex ?? idx;
          return {
            flowers: s.flowers.map((f) => (f.id === id ? { ...f, zIndex: Math.max(0, currentZ - 1) } : f)),
          };
        });
      },

      duplicateFlower: (id) => {
        const source = get().flowers.find((f) => f.id === id);
        if (!source) return;
        
        const duplicate: FlowerItem = {
          ...source,
          id: `${source.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          x: Math.min(95, source.x + 6),
          y: Math.min(60, source.y + 4),
          zIndex: get().flowers.length,
        };
        
        set((s) => ({
          flowers: [...s.flowers, duplicate],
          selectedFlowerId: duplicate.id,
          arrangementPattern: 'custom',
        }));
      },

      deleteFlower: (id) => {
        set((s) => {
          const updated = s.flowers.filter((f) => f.id !== id);
          if (s.arrangementPattern === 'custom') {
            return {
              flowers: updated,
              selectedFlowerId: s.selectedFlowerId === id ? null : s.selectedFlowerId,
            };
          }
          return {
            flowers: arrangeFlowers(updated, s.arrangementPattern),
            selectedFlowerId: s.selectedFlowerId === id ? null : s.selectedFlowerId,
          };
        });
      },

      resetBouquet: () => set({ ...initialState }),
    })
);
