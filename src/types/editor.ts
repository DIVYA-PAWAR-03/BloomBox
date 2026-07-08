import { fabric } from 'fabric';

// Extend the basic Fabric Object interface to support custom fields
export interface CustomFabricObject extends fabric.Object {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  assetId?: string;
  assetName?: string;
  category?: string;
  subcategory?: string;
  isLocked?: boolean;
  layer?: string;
  metadata?: Record<string, any>;
  isLockedFlag?: boolean;
  isHiddenFlag?: boolean;
}

export type CanvasStatus = 'idle' | 'saving' | 'saved' | 'failed';

export type AspectRatio = 'portrait' | 'landscape' | 'square' | 'custom';

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface CanvasSettings {
  backgroundColor: string;
  showGrid: boolean;
  snapToGrid: boolean;
  showGuidelines: boolean;
  gridSize: number;
  snapThreshold: number;
  aspectRatio: AspectRatio;
  dimensions: CanvasDimensions;
  theme: 'light' | 'dark';
}

export interface EditorState {
  zoom: number; // Viewport zoom multiplier (e.g. 1.0 = 100%)
  settings: CanvasSettings;
  status: CanvasStatus;
  lastSavedAt: string | null;
  selectedObjectId: string | null;
  selectedObjectProps: Record<string, any> | null;
}

// Interface for dynamic assets (flowers, wrappers, stickers, etc.)
export interface Asset {
  id: string;
  name: string;
  description?: string;
  type: string; // Dynamic category type (e.g. flower, wrapper, gift_box, etc.)
  subcategory?: string;
  previewUrl: string;
  assetUrl: string; // Image path, SVG path, or emoji character
  price: number;
  isTrending?: boolean;
  properties?: Record<string, any>;
  isActive: boolean;
}
