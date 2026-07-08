"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { assetService } from '@/services/asset.service';
import { templateService, TEMPLATES } from '@/services/template.service';
import { Asset } from '@/types/editor';
import { useEditorStore } from '@/store/useEditorStore';
import { canvasManager } from '@/lib/editor/canvas-manager';
import { historyManager } from '@/lib/editor/history-manager';
import { DuplicateCommand } from '@/lib/editor/commands/canvas.commands';
import { fabric } from 'fabric';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HoverPreviewCard } from './hover-preview-card';
import { EnvelopeStyler } from './envelope-styler';
import { LetterWriter } from './letter-writer';
import { TimelineBuilder } from './timeline-builder';
import { toast } from 'sonner';
import { 
  Search, 
  Grid, 
  List, 
  Heart, 
  Sparkles, 
  Clock, 
  ChevronDown,
  Flower, 
  Leaf, 
  Sprout, 
  Bookmark, 
  Gift, 
  Smile, 
  Cookie, 
  Package, 
  Cake, 
  Image as ImageIcon, 
  FileText, 
  Mail, 
  Layout, 
  Tag, 
  Music, 
  Mic, 
  Plus, 
  Loader2,
  Milestone
} from 'lucide-react';

interface LeftSidebarProps {
  onCanvasModified?: () => void;
}

// 19 categories configuration including Templates first
const CATEGORIES = [
  { id: 'templates', label: 'Templates', icon: Sparkles },
  { id: 'flower', label: 'Flowers', icon: Flower },
  { id: 'leaves', label: 'Leaves', icon: Leaf },
  { id: 'fillers', label: 'Fillers', icon: Sprout },
  { id: 'wrapper', label: 'Wrappers', icon: Bookmark },
  { id: 'ribbon', label: 'Ribbons', icon: Gift },
  { id: 'teddy_bear', label: 'Teddy Bears', icon: Smile },
  { id: 'chocolate', label: 'Chocolates', icon: Cookie },
  { id: 'gift_box', label: 'Gift Boxes', icon: Package },
  { id: 'balloon', label: 'Balloons', icon: Heart },
  { id: 'cake', label: 'Cakes', icon: Cake },
  { id: 'photo_frame', label: 'Photo Frames', icon: ImageIcon },
  { id: 'letter', label: 'Letters', icon: FileText },
  { id: 'envelope', label: 'Envelopes', icon: Mail },
  { id: 'background', label: 'Backgrounds', icon: Layout },
  { id: 'decoration', label: 'Decorations', icon: Sparkles },
  { id: 'sticker', label: 'Stickers', icon: Tag },
  { id: 'music_icon', label: 'Music Icons', icon: Music },
  { id: 'voice_icon', label: 'Voice Message Icons', icon: Mic },
  { id: 'journey', label: 'Our Journey', icon: Milestone }
];

export function LeftSidebar({ onCanvasModified }: LeftSidebarProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('templates'); // Default to Templates library!
  const [favTemplates, setFavTemplates] = useState<string[]>([]);
  
  // Local input for debouncing
  const [localSearch, setLocalSearch] = useState('');
  
  // Zustand Store mappings
  const favoriteAssetIds = useEditorStore((s) => s.favoriteAssetIds);
  const recentAssetIds = useEditorStore((s) => s.recentAssetIds);
  const searchQuery = useEditorStore((s) => s.searchQuery);
  const setSearchQuery = useEditorStore((s) => s.setSearchQuery);
  const viewMode = useEditorStore((s) => s.viewMode);
  const setViewMode = useEditorStore((s) => s.setViewMode);
  const selectedSubcategory = useEditorStore((s) => s.selectedSubcategory);
  const setSelectedSubcategory = useEditorStore((s) => s.setSelectedSubcategory);
  const toggleFavorite = useEditorStore((s) => s.toggleFavoriteAsset);

  // Hover card preview state
  const [hoveredAsset, setHoveredAsset] = useState<Asset | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  // Collapsible sections
  const [showRecents, setShowRecents] = useState(true);
  const [showFavorites, setShowFavorites] = useState(true);
  const [showTrending, setShowTrending] = useState(true);

  // Load assets & template favorites
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const items = await assetService.getAssets();
        setAssets(items);
        setFavTemplates(templateService.getFavoriteTemplates());
      } catch (err) {
        console.error('Failed to load assets:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Debounce search input (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 250);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  // Derive subcategories for active tab
  const subcategories = useMemo(() => {
    if (activeTab === 'templates') return [];
    const activeAssets = assets.filter(a => a.type === activeTab);
    const subs = new Set<string>();
    activeAssets.forEach(a => {
      if (a.subcategory) subs.add(a.subcategory);
    });
    return Array.from(subs);
  }, [assets, activeTab]);

  // Reset subcategory filter when category tab changes
  const handleCategoryChange = (tabId: string) => {
    setActiveTab(tabId);
    setSelectedSubcategory(null);
  };

  // Filtered Assets list
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesType = asset.type === activeTab;
      const matchesSearch = searchQuery
        ? asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (asset.subcategory && asset.subcategory.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      const matchesSubcategory = selectedSubcategory
        ? asset.subcategory === selectedSubcategory
        : true;

      return matchesType && matchesSearch && matchesSubcategory;
    });
  }, [assets, activeTab, searchQuery, selectedSubcategory]);

  // Derived lists for collapsible rows
  const recentAssetsList = useMemo(() => {
    return recentAssetIds
      .map(id => assets.find(a => a.id === id))
      .filter((a): a is Asset => !!a);
  }, [recentAssetIds, assets]);

  const favoriteAssetsList = useMemo(() => {
    return favoriteAssetIds
      .map(id => assets.find(a => a.id === id))
      .filter((a): a is Asset => !!a);
  }, [favoriteAssetIds, assets]);

  const trendingAssetsList = useMemo(() => {
    return assets.filter(a => a.isTrending && a.type === activeTab);
  }, [assets, activeTab]);

  // Add asset via click (re-arranged layout parameters)
  const handleAddAsset = (asset: Asset) => {
    if (!canvasManager.canvas) return;

    // Smart Replace logic: if a flower is selected, we replace it preserving coords/scale!
    const active = canvasManager.canvas.getActiveObject() as any;
    if (active && active.templateSlotRole && active.templateSlotRole !== 'wrapper' && active.templateSlotRole !== 'ribbon') {
      templateService.replaceFlower(canvasManager.canvas, active, asset);
      if (onCanvasModified) onCanvasModified();
      return;
    }

    const center = canvasManager.canvas.getCenter();
    const emojiNode = new fabric.Text(asset.assetUrl || '🌸', {
      fontSize: 54,
      originX: 'center',
      originY: 'center',
      top: -10,
    });

    const textNode = new fabric.Text(asset.name, {
      fontSize: 10,
      fontFamily: 'Inter',
      fill: '#a1a1aa',
      originX: 'center',
      originY: 'center',
      top: 30,
      fontWeight: 'bold',
      visible: false, // default subtitle set invisible
    });

    const group = new fabric.Group([emojiNode, textNode], {
      left: center.left,
      top: center.top,
      originX: 'center',
      originY: 'center',
    }) as any;

    group.id = `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    group.assetId = asset.id;
    group.assetName = asset.name;
    group.category = asset.type;
    group.subcategory = asset.subcategory || '';
    group.createdAt = new Date().toISOString();
    group.updatedAt = new Date().toISOString();
    group.rotation = 0;
    group.scaleX = 1;
    group.scaleY = 1;
    group.layer = 'midground';
    group.isLocked = false;
    group.isLockedFlag = false;
    group.metadata = {
      name: asset.name,
      price: asset.price,
      type: asset.type,
      category: asset.type,
      properties: asset.properties || {}
    };

    canvasManager.canvas.add(group);
    canvasManager.canvas.setActiveObject(group);
    canvasManager.canvas.requestRenderAll();

    const cmd = new DuplicateCommand(canvasManager.canvas, [group]);
    historyManager.push(cmd);
    
    useEditorStore.getState().addRecentAsset(asset.id);
    if (onCanvasModified) onCanvasModified();
  };

  // Drag and Drop payload binders
  const handleDragStart = (e: React.DragEvent, asset: Asset) => {
    e.dataTransfer.setData('application/json', JSON.stringify(asset));
  };

  // Hover previews
  const handleCardMouseEnter = (e: React.MouseEvent, asset: Asset) => {
    setHoveredAsset(asset);
    setHoverPosition({ x: e.clientX, y: e.clientY });
  };

  const handleCardMouseMove = (e: React.MouseEvent, asset: Asset) => {
    setHoverPosition({ x: e.clientX, y: e.clientY });
  };

  const handleCardMouseLeave = () => {
    setHoveredAsset(null);
    setHoverPosition(null);
  };

  // ----------------------------------------------------
  // TEMPLATES HANDLERS
  // ----------------------------------------------------

  const handleToggleFavoriteTemplate = (id: string) => {
    const list = templateService.toggleFavoriteTemplate(id);
    setFavTemplates(list);
    toast.success('Template favorites updated');
  };

  const handleApplyTemplate = async (id: string) => {
    if (!canvasManager.canvas) return;
    try {
      await templateService.applyTemplate(canvasManager.canvas, id, assets);
      const tpl = TEMPLATES.find(t => t.id === id);
      if (tpl) {
        useEditorStore.getState().setBouquetName(tpl.name);
      }
      toast.success('Bouquet template arranged!');
      if (onCanvasModified) onCanvasModified();
    } catch (err) {
      toast.error('Failed to arrange templates composition');
    }
  };

  const handleSurpriseMe = async () => {
    if (!canvasManager.canvas) return;
    try {
      const randomTpl = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
      const colors = ['red', 'pink', 'yellow', 'purple', 'blue'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      await templateService.applyTemplate(canvasManager.canvas, randomTpl.id, assets, randomColor);
      
      useEditorStore.getState().setBouquetName(`Surprise ${randomTpl.name}`);
      toast.success(`Surprise ${randomTpl.name} generated!`);
      if (onCanvasModified) onCanvasModified();
    } catch (err) {
      toast.error('Surprise generation failed');
    }
  };

  return (
    <div className="flex h-full w-[280px] flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-200 select-none shrink-0 relative">
      
      {/* Search Header Area */}
      <div className="p-4 space-y-3.5 border-b border-zinc-900 bg-zinc-950/40">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-0.5">Asset Catalog</span>
          
          <div className="flex items-center gap-1 bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-850">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={`h-7 w-7 rounded-md cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-zinc-800 text-white' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('list')}
              className={`h-7 w-7 rounded-md cursor-pointer ${
                viewMode === 'list' 
                  ? 'bg-zinc-800 text-white' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-zinc-500" />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search catalog assets..."
            className="h-9 pl-9 border-zinc-800 bg-zinc-900/60 focus-visible:ring-rose-500 text-xs text-zinc-100"
          />
        </div>
      </div>

      {/* Categories horizontal list */}
      <div className="border-b border-zinc-900 bg-zinc-950/60">
        <div className="flex overflow-x-auto no-scrollbar scroll-smooth px-3 py-2 gap-1.5 max-w-full">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-rose-500/15 border border-rose-500/30 text-rose-450' 
                    : 'border border-zinc-850 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategory Pills Row */}
      {subcategories.length > 0 && (
        <div className="px-4 py-2 border-b border-zinc-900/60 bg-zinc-900/10 flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedSubcategory(null)}
            className={`px-2.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
              selectedSubcategory === null
                ? 'bg-zinc-800 text-zinc-100'
                : 'bg-zinc-900/50 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            All
          </button>
          {subcategories.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              className={`px-2.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                selectedSubcategory === sub
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'bg-zinc-900/50 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Primary Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
        {loading ? (
          <div className="flex h-40 w-full flex-col items-center justify-center gap-2 text-zinc-500">
            <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
            <span className="text-xs">Gathering studio catalog...</span>
          </div>
        ) : activeTab === 'templates' ? (
          
          /* TEMPLATES VIEW */
          <div className="space-y-4">
            
            {/* Surprise Me (Randomize) Button */}
            <button
              onClick={handleSurpriseMe}
              className="w-full flex flex-col items-center justify-center p-4 rounded-xl border border-rose-500/25 bg-gradient-to-br from-rose-600/10 via-rose-600/5 to-amber-500/15 hover:from-rose-600/15 hover:to-amber-500/20 text-center cursor-pointer shadow-md select-none group transition-all"
            >
              <Sparkles className="h-5 w-5 text-amber-450 animate-pulse mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-extrabold text-zinc-100 uppercase tracking-wider pl-0.5">Surprise Me!</span>
              <span className="text-[10px] text-zinc-400 font-semibold mt-1">
                Generate a randomized, professional composition instantly.
              </span>
            </button>

            {/* List header */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-0.5">
                Arrangement Templates ({TEMPLATES.length})
              </h4>

              {/* Grid listing */}
              <div className="grid grid-cols-1 gap-2.5">
                {TEMPLATES.map((tpl) => {
                  const isFav = favTemplates.includes(tpl.id);
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => handleApplyTemplate(tpl.id)}
                      className="group relative flex flex-col p-3 border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900/40 hover:border-rose-500/25 cursor-pointer rounded-xl select-none transition-all"
                    >
                      {/* Favorite toggle for templates */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavoriteTemplate(tpl.id);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md bg-zinc-950/80 border border-zinc-800 text-zinc-400 hover:text-rose-500 transition-all cursor-pointer z-10"
                      >
                        <Heart className={`h-3 w-3 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>

                      <div className="flex items-center gap-3">
                        <div className={`h-11 w-11 rounded-lg shrink-0 flex items-center justify-center font-bold border border-zinc-900 ${tpl.previewColor} text-base select-none shadow-inner`}>
                          💐
                        </div>
                        <div className="flex-1 min-w-0 pr-5">
                          <h5 className="text-[11px] font-bold text-zinc-100 truncate">{tpl.name}</h5>
                          <p className="text-[9px] text-zinc-500 line-clamp-2 mt-0.5 leading-tight font-medium">
                            {tpl.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : activeTab === 'envelope' ? (
          <EnvelopeStyler />
        ) : activeTab === 'letter' ? (
          <LetterWriter />
        ) : activeTab === 'journey' ? (
          <TimelineBuilder />
        ) : (
          
          /* ORIGINAL ASSETS COLLAPSIBLE LISTS */
          <>
            {/* COLLAPSIBLE ROW: RECENT ASSETS */}
            {recentAssetsList.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowRecents(!showRecents)}
                  className="flex w-full items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-zinc-500" />
                    Recently Used
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showRecents ? '' : '-rotate-90'}`} />
                </button>
                {showRecents && (
                  <div className="grid grid-cols-4 gap-2">
                    {recentAssetsList.map((asset) => (
                      <button
                        key={`rec-${asset.id}`}
                        onClick={() => handleAddAsset(asset)}
                        className="group flex h-14 w-full items-center justify-center rounded-lg border border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900 hover:border-zinc-800 cursor-pointer text-3xl select-none"
                        title={asset.name}
                      >
                        {asset.assetUrl}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* COLLAPSIBLE ROW: FAVORITES */}
            {favoriteAssetsList.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowFavorites(!showFavorites)}
                  className="flex w-full items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-rose-500/80 fill-rose-500/10" />
                    My Favorites
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFavorites ? '' : '-rotate-90'}`} />
                </button>
                {showFavorites && (
                  <div className="grid grid-cols-4 gap-2">
                    {favoriteAssetsList.map((asset) => (
                      <button
                        key={`fav-${asset.id}`}
                        onClick={() => handleAddAsset(asset)}
                        className="group flex h-14 w-full items-center justify-center rounded-lg border border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900 hover:border-zinc-800 cursor-pointer text-3xl select-none"
                        title={asset.name}
                      >
                        {asset.assetUrl}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* COLLAPSIBLE ROW: TRENDING */}
            {trendingAssetsList.length > 0 && !searchQuery && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowTrending(!showTrending)}
                  className="flex w-full items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Trending Now
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showTrending ? '' : '-rotate-90'}`} />
                </button>
                {showTrending && (
                  <div className="grid grid-cols-4 gap-2">
                    {trendingAssetsList.map((asset) => (
                      <button
                        key={`trend-${asset.id}`}
                        onClick={() => handleAddAsset(asset)}
                        className="group flex h-14 w-full items-center justify-center rounded-lg border border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900 hover:border-zinc-800 cursor-pointer text-3xl select-none"
                        title={asset.name}
                      >
                        {asset.assetUrl}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MAIN CATEGORY ASSETS GRID / LIST */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-1">
                Category Results ({filteredAssets.length})
              </h4>
              
              {filteredAssets.length === 0 ? (
                <div className="text-center text-xs text-zinc-500 py-10">
                  No matching assets found. Try adjusting filters or searches.
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-3">
                  {filteredAssets.map((asset) => {
                    const isFav = favoriteAssetIds.includes(asset.id);
                    return (
                      <div
                        key={asset.id}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, asset)}
                        onClick={() => handleAddAsset(asset)}
                        onMouseMove={(e) => handleCardMouseMove(e, asset)}
                        onMouseEnter={(e) => handleCardMouseEnter(e, asset)}
                        onMouseLeave={handleCardMouseLeave}
                        className="group relative flex flex-col items-center justify-center p-3.5 border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900/60 hover:border-rose-500/30 cursor-grab active:cursor-grabbing transition-all rounded-xl select-none"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(asset.id);
                          }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-zinc-950/80 border border-zinc-800 text-zinc-400 hover:text-rose-500 transition-all cursor-pointer z-10"
                        >
                          <Heart className={`h-3 w-3 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>

                        <div className="text-4xl filter drop-shadow mb-2 group-hover:scale-110 transition-transform">
                          {asset.assetUrl}
                        </div>
                        <span className="text-[11px] font-bold text-zinc-200 text-center line-clamp-1 w-full">
                          {asset.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAssets.map((asset) => {
                    const isFav = favoriteAssetIds.includes(asset.id);
                    return (
                      <div
                        key={asset.id}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, asset)}
                        onClick={() => handleAddAsset(asset)}
                        onMouseMove={(e) => handleCardMouseMove(e, asset)}
                        onMouseEnter={(e) => handleCardMouseEnter(e, asset)}
                        onMouseLeave={handleCardMouseLeave}
                        className="group flex items-center justify-between p-2.5 border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900/60 hover:border-rose-500/20 cursor-grab active:cursor-grabbing transition-all rounded-xl select-none gap-3"
                      >
                        <div className="text-3xl select-none shrink-0 group-hover:scale-105 transition-transform">
                          {asset.assetUrl}
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <h5 className="text-[11px] font-bold text-zinc-200 truncate leading-tight">
                            {asset.name}
                          </h5>
                          {asset.description && (
                            <p className="text-[9px] text-zinc-500 truncate font-medium">
                              {asset.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(asset.id);
                            }}
                            className="p-1 rounded bg-zinc-950/60 border border-zinc-900 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <Heart className={`h-2.5 w-2.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                          </button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 rounded bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Floating Hover Preview Card */}
      <HoverPreviewCard
        asset={hoveredAsset}
        position={hoverPosition}
        isFavorite={hoveredAsset ? favoriteAssetIds.includes(hoveredAsset.id) : false}
      />
    </div>
  );
}
export default LeftSidebar;
