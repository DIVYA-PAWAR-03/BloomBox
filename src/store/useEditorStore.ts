import { create } from 'zustand';
import { CanvasSettings, CanvasStatus, AspectRatio, CanvasDimensions } from '@/types/editor';

interface EditorStateStore {
  // General State
  bouquetId: string;
  bouquetName: string;
  bouquetPublishStatus: 'draft' | 'published' | 'archived' | 'scheduled' | 'deleted';
  zoom: number;
  status: CanvasStatus;
  lastSavedAt: Date | null;
  selectedObjectId: string | null;
  selectedObjectProps: Record<string, any> | null;
  historyCanUndo: boolean;
  historyCanRedo: boolean;
  
  // Settings
  settings: CanvasSettings;

  // 3B Asset Library States
  favoriteAssetIds: string[];
  recentAssetIds: string[];
  searchQuery: string;
  viewMode: 'grid' | 'list';
  selectedSubcategory: string | null;

  // Actions
  setBouquetId: (id: string) => void;
  setBouquetName: (name: string) => void;
  setBouquetPublishStatus: (status: 'draft' | 'published' | 'archived' | 'scheduled' | 'deleted') => void;
  setZoom: (zoom: number) => void;
  setStatus: (status: CanvasStatus) => void;
  setLastSaved: (date: Date | null) => void;
  setSelectedObjectId: (id: string | null) => void;
  setSelectedObjectProps: (props: Record<string, any> | null) => void;
  updateSelectedObjectProp: (key: string, value: any) => void;
  setHistoryStates: (canUndo: boolean, canRedo: boolean) => void;
  
  // Settings Actions
  updateSettings: (settings: Partial<CanvasSettings>) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setBackgroundColor: (color: string) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  toggleGuidelines: () => void;
  resetEditor: () => void;

  // 3B Asset Library Actions
  toggleFavoriteAsset: (id: string) => void;
  addRecentAsset: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSelectedSubcategory: (sub: string | null) => void;
}

const DEFAULT_DIMENSIONS: Record<AspectRatio, CanvasDimensions> = {
  portrait: { width: 600, height: 800 },
  landscape: { width: 800, height: 600 },
  square: { width: 600, height: 600 },
  custom: { width: 600, height: 600 },
};

const initialSettings: CanvasSettings = {
  backgroundColor: '#ffffff',
  showGrid: true,
  snapToGrid: true,
  showGuidelines: true,
  gridSize: 20,
  snapThreshold: 10,
  aspectRatio: 'square',
  dimensions: { width: 600, height: 600 },
  theme: 'light',
};

// Safe localStorage checks
const getLocalStorageList = (key: string): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLocalStorageList = (key: string, list: string[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {}
};

export const useEditorStore = create<EditorStateStore>((set) => ({
  // Initial States
  bouquetId: 'draft-bouquet-1',
  bouquetName: 'My Floral Gift',
  bouquetPublishStatus: 'draft',
  zoom: 1.0,
  status: 'idle',
  lastSavedAt: null,
  selectedObjectId: null,
  selectedObjectProps: null,
  historyCanUndo: false,
  historyCanRedo: false,
  settings: initialSettings,

  // 3B Asset Library States
  favoriteAssetIds: getLocalStorageList('bloombox_favs'),
  recentAssetIds: getLocalStorageList('bloombox_recents'),
  searchQuery: '',
  viewMode: 'grid',
  selectedSubcategory: null,

  // Actions
  setBouquetId: (bouquetId) => set({ bouquetId }),
  setBouquetName: (bouquetName) => set({ bouquetName }),
  setBouquetPublishStatus: (bouquetPublishStatus) => set({ bouquetPublishStatus }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(zoom, 5.0)) }), // Zoom bounds 10% to 500%
  setStatus: (status) => set({ status }),
  setLastSaved: (lastSavedAt) => set({ lastSavedAt }),
  setSelectedObjectId: (selectedObjectId) => set({ selectedObjectId }),
  setSelectedObjectProps: (selectedObjectProps) => set({ selectedObjectProps }),
  
  updateSelectedObjectProp: (key, value) => set((state) => {
    if (!state.selectedObjectProps) return {};
    return {
      selectedObjectProps: {
        ...state.selectedObjectProps,
        [key]: value
      }
    };
  }),

  setHistoryStates: (historyCanUndo, historyCanRedo) => set({ historyCanUndo, historyCanRedo }),

  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),

  setAspectRatio: (aspectRatio) => set((state) => {
    const dimensions = DEFAULT_DIMENSIONS[aspectRatio] || state.settings.dimensions;
    return {
      settings: {
        ...state.settings,
        aspectRatio,
        dimensions,
      }
    };
  }),

  setBackgroundColor: (backgroundColor) => set((state) => ({
    settings: { ...state.settings, backgroundColor }
  })),

  toggleGrid: () => set((state) => ({
    settings: { ...state.settings, showGrid: !state.settings.showGrid }
  })),

  toggleSnap: () => set((state) => ({
    settings: { ...state.settings, snapToGrid: !state.settings.snapToGrid }
  })),

  toggleGuidelines: () => set((state) => ({
    settings: { ...state.settings, showGuidelines: !state.settings.showGuidelines }
  })),

  resetEditor: () => set({
    zoom: 1.0,
    status: 'idle',
    lastSavedAt: null,
    selectedObjectId: null,
    selectedObjectProps: null,
    historyCanUndo: false,
    historyCanRedo: false,
    settings: initialSettings,
    favoriteAssetIds: [],
    recentAssetIds: [],
    searchQuery: '',
    viewMode: 'grid',
    selectedSubcategory: null,
  }),

  // 3B Asset Library Actions
  toggleFavoriteAsset: (id) => set((state) => {
    const isFav = state.favoriteAssetIds.includes(id);
    const updated = isFav 
      ? state.favoriteAssetIds.filter(favId => favId !== id)
      : [...state.favoriteAssetIds, id];
    
    saveLocalStorageList('bloombox_favs', updated);
    return { favoriteAssetIds: updated };
  }),

  addRecentAsset: (id) => set((state) => {
    // Keep list clean of duplicates, push to front, limit size to 10
    const filtered = state.recentAssetIds.filter(recentId => recentId !== id);
    const updated = [id, ...filtered].slice(0, 10);
    
    saveLocalStorageList('bloombox_recents', updated);
    return { recentAssetIds: updated };
  }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedSubcategory: (selectedSubcategory) => set({ selectedSubcategory }),
}));
