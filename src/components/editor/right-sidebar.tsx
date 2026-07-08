"use client";

import React, { useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { canvasManager } from '@/lib/editor/canvas-manager';
import { historyManager } from '@/lib/editor/history-manager';
import { useEditorStore } from '@/store/useEditorStore';
import { PropertyCommand, DeleteCommand, DuplicateCommand } from '@/lib/editor/commands/canvas.commands';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LayerPanel } from './layer-panel';
import { 
  Settings, 
  Trash2, 
  Copy, 
  Unlock, 
  Lock, 
  ChevronUp, 
  ChevronDown, 
  ChevronsUp, 
  ChevronsDown,
  LayoutGrid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignEndVertical,
  AlignCenterVertical,
  FlipHorizontal,
  FlipVertical,
  Layers,
  Sparkles,
  Sliders,
  Group,
  Ungroup
} from 'lucide-react';

interface RightSidebarProps {
  onCanvasModified?: () => void;
}

export function RightSidebar({ onCanvasModified }: RightSidebarProps) {
  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const selectedObjectProps = useEditorStore((s) => s.selectedObjectProps);
  const settings = useEditorStore((s) => s.settings);

  // Phase 3C Shadows State
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowBlur, setShadowBlur] = useState(10);
  const [shadowOffsetX, setShadowOffsetX] = useState(5);
  const [shadowOffsetY, setShadowOffsetY] = useState(5);
  const [shadowColor, setShadowColor] = useState('rgba(0,0,0,0.3)');

  // Phase 3C WebGL Filters State
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);

  // Stacking re-orders
  const activeSelectionType = selectedObjectProps?.type || '';

  // Synchronize dynamic properties when selection shifts
  useEffect(() => {
    const canvas = canvasManager.canvas;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      // Sync Shadows
      if (active.shadow) {
        const shadow = active.shadow as fabric.Shadow;
        setShadowEnabled(true);
        setShadowBlur(shadow.blur || 10);
        setShadowOffsetX(shadow.offsetX || 5);
        setShadowOffsetY(shadow.offsetY || 5);
        setShadowColor((shadow.color as string) || 'rgba(0,0,0,0.3)');
      } else {
        setShadowEnabled(false);
      }

      // Sync Filters
      setBrightness((active as any).brightness || 0);
      setContrast((active as any).contrast || 0);
      setSaturation((active as any).saturation || 0);
    }
  }, [selectedObjectId]);

  // Handle generic transform changes
  const handleObjectPropChange = (prop: string, val: any) => {
    const canvas = canvasManager.canvas;
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (!active || (active as any).isLockedFlag) return;

    const targets = active.type === 'activeSelection'
      ? (active as fabric.ActiveSelection).getObjects()
      : [active];

    const oldVals = targets.map((t: any) => t.get(prop));
    const newVals = targets.map(() => val);

    const cmd = new PropertyCommand(targets, prop, oldVals, newVals);
    historyManager.execute(cmd);

    // Apply values directly
    targets.forEach((t: any) => {
      t.set(prop, val);
      t.setCoords();
    });
    
    canvas.requestRenderAll();
    
    // Sync state
    useEditorStore.getState().updateSelectedObjectProp(prop, val);
    if (onCanvasModified) onCanvasModified();
  };

  const handleOpacityChange = (value: number | readonly number[]) => {
    const val = Array.isArray(value) ? value[0] : (value as number);
    handleObjectPropChange('opacity', val);
  };

  const handlePositionChange = (prop: 'left' | 'top', strVal: string) => {
    const num = parseFloat(strVal);
    if (!isNaN(num)) {
      handleObjectPropChange(prop, num);
    }
  };

  const handleLock = () => {
    canvasManager.lockSelected();
    if (onCanvasModified) onCanvasModified();
  };

  const handleUnlock = () => {
    if (selectedObjectId) {
      canvasManager.unlockObjectById(selectedObjectId);
      if (onCanvasModified) onCanvasModified();
    }
  };

  const handleDelete = () => {
    const canvas = canvasManager.canvas;
    const active = canvas?.getActiveObject();
    if (canvas && active) {
      const targets = active.type === 'activeSelection'
        ? (active as fabric.ActiveSelection).getObjects()
        : [active];
      
      const cmd = new DeleteCommand(canvas, targets);
      historyManager.execute(cmd);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      if (onCanvasModified) onCanvasModified();
    }
  };

  const handleDuplicate = () => {
    const canvas = canvasManager.canvas;
    const active = canvas?.getActiveObject();
    if (canvas && active) {
      const targets = active.type === 'activeSelection'
        ? (active as fabric.ActiveSelection).getObjects()
        : [active];
      
      const cmd = new DuplicateCommand(canvas, targets);
      historyManager.execute(cmd);
      if (onCanvasModified) onCanvasModified();
    }
  };

  // Shadow Updater
  const applyShadow = (enabled: boolean, blur: number, ox: number, oy: number, color: string) => {
    const canvas = canvasManager.canvas;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;

    const shadowObj = enabled 
      ? new fabric.Shadow({ blur, offsetX: ox, offsetY: oy, color }) 
      : undefined;

    const oldShadows = [active.shadow || undefined];
    const newShadows = [shadowObj];

    const cmd = new PropertyCommand([active], 'shadow', oldShadows, newShadows);
    historyManager.execute(cmd);

    active.set({ shadow: shadowObj });
    canvas.requestRenderAll();
    if (onCanvasModified) onCanvasModified();
  };

  const handleToggleShadow = (checked: boolean) => {
    setShadowEnabled(checked);
    applyShadow(checked, shadowBlur, shadowOffsetX, shadowOffsetY, shadowColor);
  };

  const handleShadowParamChange = (param: 'blur' | 'ox' | 'oy', val: number) => {
    let b = shadowBlur;
    let x = shadowOffsetX;
    let y = shadowOffsetY;

    if (param === 'blur') { b = val; setShadowBlur(val); }
    if (param === 'ox') { x = val; setShadowOffsetX(val); }
    if (param === 'oy') { y = val; setShadowOffsetY(val); }

    applyShadow(shadowEnabled, b, x, y, shadowColor);
  };

  // Dynamic Tint / Appearance filters (Brightness, Contrast, Saturation)
  const applyFilterChange = (filterType: 'brightness' | 'contrast' | 'saturation', value: number) => {
    const canvas = canvasManager.canvas;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;

    if (filterType === 'brightness') setBrightness(value);
    if (filterType === 'contrast') setContrast(value);
    if (filterType === 'saturation') setSaturation(value);

    // Save in history
    const oldVal = (active as any)[filterType] || 0;
    const cmd = new PropertyCommand([active], filterType, [oldVal], [value]);
    historyManager.execute(cmd);

    // Store property flag on base node
    (active as any)[filterType] = value;

    // Apply WebGL canvas filter
    const applyFilters = (obj: any) => {
      if (obj.type === 'image') {
        const img = obj as fabric.Image;
        img.filters = img.filters || [];
        
        // Remove existing matches
        img.filters = img.filters.filter(f => {
          if (filterType === 'brightness' && f instanceof fabric.Image.filters.Brightness) return false;
          if (filterType === 'contrast' && f instanceof fabric.Image.filters.Contrast) return false;
          if (filterType === 'saturation' && f instanceof fabric.Image.filters.Saturation) return false;
          return true;
        });

        // Insert fresh Fabric filter
        if (filterType === 'brightness' && value !== 0) {
          img.filters.push(new fabric.Image.filters.Brightness({ brightness: value }));
        } else if (filterType === 'contrast' && value !== 0) {
          img.filters.push(new fabric.Image.filters.Contrast({ contrast: value }));
        } else if (filterType === 'saturation' && value !== 0) {
          img.filters.push(new fabric.Image.filters.Saturation({ saturation: value }));
        }

        img.applyFilters();
      } else if (obj.getObjects) {
        obj.getObjects().forEach((child: any) => applyFilters(child));
      }
    };

    applyFilters(active);
    canvas.requestRenderAll();
    if (onCanvasModified) onCanvasModified();
  };

  // Color Swatches
  const colorSwatches = [
    '#ffffff', // White
    '#f4f4f5', // Zinc-100
    '#ffe4e6', // Rose-100
    '#d1fae5', // Emerald-100
    '#fef3c7', // Amber-100
    '#e0f2fe', // Sky-100
    '#18181b', // Zinc-900 (Dark Mode Base)
    '#881337', // Deep Burgundy Rose
  ];

  return (
    <div className="flex h-full w-72 flex-col border-l border-zinc-800 bg-zinc-950 text-zinc-200">
      
      {/* Tabs Layout: switcher properties vs layers */}
      <Tabs defaultValue="properties" className="w-full flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-3 pb-2 border-b border-zinc-900 bg-zinc-950/60 shrink-0">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900 h-8 rounded-lg">
            <TabsTrigger value="properties" className="text-[11px] font-bold py-1 select-none flex items-center gap-1 cursor-pointer">
              <Sliders className="h-3 w-3" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="layers" className="text-[11px] font-bold py-1 select-none flex items-center gap-1 cursor-pointer">
              <Layers className="h-3 w-3" />
              Layers
            </TabsTrigger>
          </TabsList>
        </div>

        {/* PROPERTIES TAB PANEL */}
        <TabsContent value="properties" className="flex-1 overflow-y-auto p-4 space-y-6 focus-visible:outline-none scroll-smooth">
          {selectedObjectId && selectedObjectProps ? (
            
            // --- OBJECT INSPECTOR ACTIVE PANEL ---
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide mb-0.5">Object Properties</h3>
                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">
                  Type: {selectedObjectProps.type || 'Object'} {selectedObjectProps.category ? `• ${selectedObjectProps.category}` : ''}
                </span>
              </div>

              {/* Alignments & Distribution Toolbox */}
              <div className="space-y-2">
                <Label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Align & Distribute</Label>
                <div className="grid grid-cols-4 gap-1">
                  <Button
                    onClick={() => canvasManager.align('left')}
                    variant="outline"
                    size="icon"
                    title="Align Left"
                    className="h-8 border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 hover:text-white cursor-pointer"
                  >
                    <AlignLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => canvasManager.align('center')}
                    variant="outline"
                    size="icon"
                    title="Align Horizontal Center"
                    className="h-8 border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 hover:text-white cursor-pointer"
                  >
                    <AlignCenter className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => canvasManager.align('right')}
                    variant="outline"
                    size="icon"
                    title="Align Right"
                    className="h-8 border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 hover:text-white cursor-pointer"
                  >
                    <AlignRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => canvasManager.align('top')}
                    variant="outline"
                    size="icon"
                    title="Align Top"
                    className="h-8 border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 hover:text-white cursor-pointer"
                  >
                    <AlignStartVertical className="h-3.5 w-3.5" />
                  </Button>
                  
                  <Button
                    onClick={() => canvasManager.align('middle')}
                    variant="outline"
                    size="icon"
                    title="Align Vertical Middle"
                    className="h-8 border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 hover:text-white cursor-pointer"
                  >
                    <AlignCenterVertical className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => canvasManager.align('bottom')}
                    variant="outline"
                    size="icon"
                    title="Align Bottom"
                    className="h-8 border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 hover:text-white cursor-pointer"
                  >
                    <AlignEndVertical className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => canvasManager.distribute('horizontal')}
                    variant="outline"
                    size="icon"
                    title="Distribute Horizontally"
                    disabled={activeSelectionType !== 'activeSelection'}
                    className="h-8 border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 hover:text-white cursor-pointer disabled:opacity-30"
                  >
                    <Group className="h-3.5 w-3.5 -rotate-90" />
                  </Button>
                  <Button
                    onClick={() => canvasManager.distribute('vertical')}
                    variant="outline"
                    size="icon"
                    title="Distribute Vertically"
                    disabled={activeSelectionType !== 'activeSelection'}
                    className="h-8 border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 hover:text-white cursor-pointer disabled:opacity-30"
                  >
                    <Group className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Advanced Grouping & Flips */}
              <div className="space-y-2">
                <Label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Transform Adjustments</Label>
                <div className="grid grid-cols-4 gap-1.5">
                  <Button
                    onClick={() => canvasManager.groupSelected()}
                    variant="outline"
                    size="icon"
                    title="Group Selections"
                    disabled={activeSelectionType !== 'activeSelection'}
                    className="h-8 border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 hover:text-white cursor-pointer disabled:opacity-30"
                  >
                    <Group className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => canvasManager.ungroupSelected()}
                    variant="outline"
                    size="icon"
                    title="Ungroup Element"
                    disabled={activeSelectionType !== 'group'}
                    className="h-8 border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 hover:text-white cursor-pointer disabled:opacity-30"
                  >
                    <Ungroup className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => canvasManager.flipHorizontal()}
                    variant="outline"
                    size="icon"
                    title="Flip Horizontal"
                    disabled={selectedObjectProps.locked}
                    className="h-8 border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 hover:text-white cursor-pointer"
                  >
                    <FlipHorizontal className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => canvasManager.flipVertical()}
                    variant="outline"
                    size="icon"
                    title="Flip Vertical"
                    disabled={selectedObjectProps.locked}
                    className="h-8 border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 hover:text-white cursor-pointer"
                  >
                    <FlipVertical className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Coordinates positions */}
              <div className="grid grid-cols-2 gap-3 border-t border-zinc-900/80 pt-3">
                <div className="space-y-1.5">
                  <Label htmlFor="left-pos" className="text-[11px] text-zinc-400">Position X</Label>
                  <Input
                    id="left-pos"
                    type="number"
                    value={Math.round(selectedObjectProps.left || 0)}
                    onChange={(e) => handlePositionChange('left', e.target.value)}
                    disabled={selectedObjectProps.locked}
                    className="h-8 border-zinc-800 bg-zinc-900 text-zinc-100 text-xs focus-visible:ring-rose-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="top-pos" className="text-[11px] text-zinc-400">Position Y</Label>
                  <Input
                    id="top-pos"
                    type="number"
                    value={Math.round(selectedObjectProps.top || 0)}
                    onChange={(e) => handlePositionChange('top', e.target.value)}
                    disabled={selectedObjectProps.locked}
                    className="h-8 border-zinc-800 bg-zinc-900 text-zinc-100 text-xs focus-visible:ring-rose-500"
                  />
                </div>
              </div>

              {/* Opacity slider */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Opacity</span>
                  <span className="font-semibold">{Math.round((selectedObjectProps.opacity || 1.0) * 100)}%</span>
                </div>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[selectedObjectProps.opacity !== undefined ? selectedObjectProps.opacity : 1.0]}
                  onValueChange={handleOpacityChange}
                  disabled={selectedObjectProps.locked}
                  className="py-1 cursor-pointer"
                />
              </div>

              {/* Border & Stroke width */}
              <div className="space-y-3 border-t border-zinc-900/80 pt-3">
                <Label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Border & Stroke</Label>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Stroke Width</span>
                  <span className="font-semibold">{selectedObjectProps.strokeWidth || 0}px</span>
                </div>
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[selectedObjectProps.strokeWidth || 0]}
                  onValueChange={(val) => {
                    const num = Array.isArray(val) ? val[0] : (val as number);
                    handleObjectPropChange('strokeWidth', num);
                  }}
                  disabled={selectedObjectProps.locked}
                  className="py-1 cursor-pointer"
                />
              </div>

              {/* Shadows section */}
              <div className="space-y-3 border-t border-zinc-900/80 pt-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Drop Shadow</Label>
                  <Switch
                    checked={shadowEnabled}
                    onCheckedChange={handleToggleShadow}
                    disabled={selectedObjectProps.locked}
                    className="cursor-pointer data-[state=checked]:bg-rose-500"
                  />
                </div>
                
                {shadowEnabled && (
                  <div className="space-y-3.5 pl-1.5 pt-1">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-zinc-400">
                        <span>Blur Radius</span>
                        <span>{shadowBlur}px</span>
                      </div>
                      <Slider
                        min={0}
                        max={30}
                        step={1}
                        value={[shadowBlur]}
                        onValueChange={(val) => {
                          const num = Array.isArray(val) ? val[0] : (val as number);
                          handleShadowParamChange('blur', num);
                        }}
                        disabled={selectedObjectProps.locked}
                        className="py-0.5"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-zinc-400">
                        <span>Offset X</span>
                        <span>{shadowOffsetX}px</span>
                      </div>
                      <Slider
                        min={-15}
                        max={15}
                        step={1}
                        value={[shadowOffsetX]}
                        onValueChange={(val) => {
                          const num = Array.isArray(val) ? val[0] : (val as number);
                          handleShadowParamChange('ox', num);
                        }}
                        disabled={selectedObjectProps.locked}
                        className="py-0.5"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-zinc-400">
                        <span>Offset Y</span>
                        <span>{shadowOffsetY}px</span>
                      </div>
                      <Slider
                        min={-15}
                        max={15}
                        step={1}
                        value={[shadowOffsetY]}
                        onValueChange={(val) => {
                          const num = Array.isArray(val) ? val[0] : (val as number);
                          handleShadowParamChange('oy', num);
                        }}
                        disabled={selectedObjectProps.locked}
                        className="py-0.5"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Filters (Brightness / Saturation / Contrast) */}
              <div className="space-y-3.5 border-t border-zinc-900/80 pt-3">
                <Label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Graphic Adjustments</Label>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Brightness</span>
                    <span>{Math.round(brightness * 100)}%</span>
                  </div>
                  <Slider
                    min={-1}
                    max={1}
                    step={0.05}
                    value={[brightness]}
                    onValueChange={(val) => {
                      const num = Array.isArray(val) ? val[0] : (val as number);
                      applyFilterChange('brightness', num);
                    }}
                    disabled={selectedObjectProps.locked}
                    className="py-0.5 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Contrast</span>
                    <span>{Math.round(contrast * 100)}%</span>
                  </div>
                  <Slider
                    min={-1}
                    max={1}
                    step={0.05}
                    value={[contrast]}
                    onValueChange={(val) => {
                      const num = Array.isArray(val) ? val[0] : (val as number);
                      applyFilterChange('contrast', num);
                    }}
                    disabled={selectedObjectProps.locked}
                    className="py-0.5 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Saturation</span>
                    <span>{Math.round(saturation * 100)}%</span>
                  </div>
                  <Slider
                    min={-1}
                    max={1}
                    step={0.05}
                    value={[saturation]}
                    onValueChange={(val) => {
                      const num = Array.isArray(val) ? val[0] : (val as number);
                      applyFilterChange('saturation', num);
                    }}
                    disabled={selectedObjectProps.locked}
                    className="py-0.5 cursor-pointer"
                  />
                </div>
              </div>

              {/* Arrange Stacking Order */}
              <div className="space-y-2 border-t border-zinc-900/80 pt-3">
                <Label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Layer Depth Stacking</Label>
                <div className="grid grid-cols-4 gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => canvasManager.bringToFront()}
                    disabled={selectedObjectProps.locked}
                    title="Bring to Front"
                    className="h-9 border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 hover:text-white cursor-pointer"
                  >
                    <ChevronsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => canvasManager.bringForward()}
                    disabled={selectedObjectProps.locked}
                    title="Bring Forward"
                    className="h-9 border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 hover:text-white cursor-pointer"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => canvasManager.sendBackward()}
                    disabled={selectedObjectProps.locked}
                    title="Send Backward"
                    className="h-9 border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 hover:text-white cursor-pointer"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => canvasManager.sendToBack()}
                    disabled={selectedObjectProps.locked}
                    title="Send to Back"
                    className="h-9 border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 hover:text-white cursor-pointer"
                  >
                    <ChevronsDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Locks & duplicates */}
              <div className="flex gap-2 border-t border-zinc-900/80 pt-4">
                {selectedObjectProps.locked ? (
                  <Button
                    onClick={handleUnlock}
                    variant="outline"
                    className="flex-1 h-9 border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold cursor-pointer"
                  >
                    <Unlock className="h-3.5 w-3.5 mr-1.5" />
                    Unlock
                  </Button>
                ) : (
                  <Button
                    onClick={handleLock}
                    variant="outline"
                    className="flex-1 h-9 border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-850 hover:text-white text-xs font-semibold cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5 mr-1.5" />
                    Lock
                  </Button>
                )}
                <Button
                  onClick={handleDuplicate}
                  variant="outline"
                  title="Duplicate Selection"
                  disabled={selectedObjectProps.locked}
                  className="h-9 w-9 border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  title="Delete Selection"
                  className="h-9 w-9 bg-rose-950 border border-rose-500/25 hover:bg-rose-900 text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            
            // --- DEFAULT CANVAS SETTINGS PANEL ---
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide mb-0.5">Canvas Setup</h3>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Global Workspace Settings</p>
              </div>

              {/* Aspect Ratio Presets */}
              <div className="space-y-2.5">
                <Label className="text-xs text-zinc-400 flex items-center gap-1">
                  <Settings className="h-3.5 w-3.5 text-rose-500" />
                  Aspect Ratio Preset
                </Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['square', 'portrait', 'landscape'] as const).map((ratio) => (
                    <Button
                      key={ratio}
                      variant="outline"
                      onClick={() => useEditorStore.getState().setAspectRatio(ratio)}
                      className={`h-8 text-[10px] font-bold capitalize cursor-pointer ${
                        settings.aspectRatio === ratio
                          ? 'border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                          : 'border-zinc-850 bg-zinc-900/50 hover:bg-zinc-850 hover:text-white text-zinc-400'
                      }`}
                    >
                      {ratio}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Background Color Swatches */}
              <div className="space-y-2.5">
                <Label className="text-xs text-zinc-400">Background Tint</Label>
                <div className="grid grid-cols-4 gap-2">
                  {colorSwatches.map((color) => (
                    <button
                      key={color}
                      onClick={() => useEditorStore.getState().setBackgroundColor(color)}
                      style={{ backgroundColor: color }}
                      className={`h-8 w-full rounded-md border cursor-pointer transition-all ${
                        settings.backgroundColor.toLowerCase() === color.toLowerCase()
                          ? 'border-rose-500 scale-95 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Grid Snapping Switches */}
              <div className="space-y-3.5 border-t border-zinc-900/80 pt-4">
                <Label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Workspace Helpers</Label>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="grid-toggle" className="text-xs text-zinc-300">Show Editor Grid</Label>
                    <p className="text-[9px] text-zinc-500 font-semibold leading-none">Renders background ticks</p>
                  </div>
                  <Switch
                    id="grid-toggle"
                    checked={settings.showGrid}
                    onCheckedChange={() => useEditorStore.getState().toggleGrid()}
                    className="cursor-pointer data-[state=checked]:bg-rose-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="snap-toggle" className="text-xs text-zinc-300">Snap to Grid</Label>
                    <p className="text-[9px] text-zinc-500 font-semibold leading-none">Snaps items at 20px ticks</p>
                  </div>
                  <Switch
                    id="snap-toggle"
                    checked={settings.snapToGrid}
                    onCheckedChange={() => useEditorStore.getState().toggleSnap()}
                    className="cursor-pointer data-[state=checked]:bg-rose-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="guide-toggle" className="text-xs text-zinc-300">Smart Snapping Guides</Label>
                    <p className="text-[9px] text-zinc-500 font-semibold leading-none">Draws boundary snap overlays</p>
                  </div>
                  <Switch
                    id="guide-toggle"
                    checked={settings.showGuidelines}
                    onCheckedChange={() => useEditorStore.getState().toggleGuidelines()}
                    className="cursor-pointer data-[state=checked]:bg-rose-500"
                  />
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* LAYERS TAB PANEL */}
        <TabsContent value="layers" className="flex-1 overflow-y-auto focus-visible:outline-none bg-zinc-950 min-h-0">
          <LayerPanel onCanvasModified={onCanvasModified} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
export default RightSidebar;
