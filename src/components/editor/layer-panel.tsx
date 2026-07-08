"use client";

import React, { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { canvasManager } from '@/lib/editor/canvas-manager';
import { historyManager } from '@/lib/editor/history-manager';
import { LayerCommand, PropertyCommand } from '@/lib/editor/commands/canvas.commands';
import { useEditorStore } from '@/store/useEditorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  GripVertical, 
  Edit2, 
  Check, 
  Layers,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface LayerPanelProps {
  onCanvasModified?: () => void;
}

export function LayerPanel({ onCanvasModified }: LayerPanelProps) {
  const [layers, setLayers] = useState<fabric.Object[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);

  // Sync canvas objects to list state reactively
  useEffect(() => {
    const canvas = canvasManager.canvas;
    if (!canvas) return;

    const updateLayers = () => {
      // Filter out guidelines/alignment markers
      const objs = canvas.getObjects().filter(o => !o.excludeFromExport);
      // Reverse order: top of canvas stack is rendered at the top of the UI list
      setLayers([...objs].reverse());
    };

    updateLayers();

    // Attach event listeners
    canvas.on('object:added', updateLayers);
    canvas.on('object:removed', updateLayers);
    canvas.on('selection:created', updateLayers);
    canvas.on('selection:cleared', updateLayers);
    canvas.on('after:render', updateLayers);

    return () => {
      canvas.off('object:added', updateLayers);
      canvas.off('object:removed', updateLayers);
      canvas.off('selection:created', updateLayers);
      canvas.off('selection:cleared', updateLayers);
      canvas.off('after:render', updateLayers);
    };
  }, []);

  // Selection trigger from panel click
  const handleSelectObject = (obj: fabric.Object) => {
    const canvas = canvasManager.canvas;
    if (!canvas) return;
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
  };

  // Lock toggling
  const handleToggleLock = (e: React.MouseEvent, obj: any) => {
    e.stopPropagation();
    const isLocked = obj.isLockedFlag || false;
    if (isLocked) {
      canvasManager.unlockObjectById(obj.id);
    } else {
      // Ensure selected before locking
      const canvas = canvasManager.canvas;
      if (canvas) {
        canvas.setActiveObject(obj);
        canvasManager.lockSelected();
      }
    }
    if (onCanvasModified) onCanvasModified();
  };

  // Visibility toggling
  const handleToggleVisibility = (e: React.MouseEvent, obj: fabric.Object) => {
    e.stopPropagation();
    const isVisible = obj.visible !== false;
    
    const cmd = new PropertyCommand([obj], 'visible', [isVisible], [!isVisible]);
    historyManager.execute(cmd);

    // Sync flags
    obj.set({ visible: !isVisible } as any);
    (obj as any).isHiddenFlag = isVisible;
    
    if (canvasManager.canvas) {
      // Deselect if hidden
      if (isVisible && canvasManager.canvas.getActiveObject() === obj) {
        canvasManager.canvas.discardActiveObject();
      }
      canvasManager.canvas.requestRenderAll();
    }
    if (onCanvasModified) onCanvasModified();
  };

  // Renaming Layer
  const handleStartRename = (e: React.MouseEvent, obj: any) => {
    e.stopPropagation();
    setEditingId(obj.id);
    setEditingText(obj.assetName || obj.type || 'Element');
  };

  const handleSaveRename = (e: React.FormEvent, obj: any) => {
    e.preventDefault();
    if (!editingText.trim()) return;

    const oldName = obj.assetName || '';
    const cmd = new PropertyCommand([obj], 'assetName', [oldName], [editingText]);
    historyManager.execute(cmd);

    obj.assetName = editingText;
    setEditingId(null);
    if (onCanvasModified) onCanvasModified();
  };

  // Stacking re-orders (Manual adjustments via buttons)
  const handleMoveLayer = (e: React.MouseEvent, index: number, direction: 'up' | 'down') => {
    e.stopPropagation();
    const canvas = canvasManager.canvas;
    if (!canvas) return;

    const objects = canvas.getObjects().filter(o => !o.excludeFromExport);
    const totalCount = objects.length;
    
    const oldCanvasIndex = (totalCount - 1) - index;
    const newCanvasIndex = direction === 'up' ? oldCanvasIndex + 1 : oldCanvasIndex - 1;

    if (newCanvasIndex >= 0 && newCanvasIndex < totalCount) {
      const targetObj = objects[oldCanvasIndex];
      const cmd = new LayerCommand(canvas, targetObj, oldCanvasIndex, newCanvasIndex);
      historyManager.execute(cmd);
      
      if (onCanvasModified) onCanvasModified();
    }
  };

  // Draggables (HTML5 Drag and Drop events)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const canvas = canvasManager.canvas;
    if (!canvas) return;

    const objects = canvas.getObjects().filter(o => !o.excludeFromExport);
    const totalCount = objects.length;
    
    const oldCanvasIndex = (totalCount - 1) - draggedIndex;
    const newCanvasIndex = (totalCount - 1) - dropIndex;

    const targetObj = objects[oldCanvasIndex];
    if (targetObj) {
      const cmd = new LayerCommand(canvas, targetObj, oldCanvasIndex, newCanvasIndex);
      historyManager.execute(cmd);
      if (onCanvasModified) onCanvasModified();
    }

    setDraggedIndex(null);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-200">
      
      {/* Panel header */}
      <div className="p-3 border-b border-zinc-900 flex items-center gap-2">
        <Layers className="h-4 w-4 text-rose-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-white">
          Layers & Stacking ({layers.length})
        </span>
      </div>

      {/* Layers list container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
        {layers.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            No objects placed on canvas. Add floral items to arrange layers.
          </div>
        ) : (
          layers.map((layer: any, idx) => {
            const isSelected = selectedObjectId === layer.id;
            const isLocked = layer.isLockedFlag || false;
            const isVisible = layer.visible !== false;
            
            // Icon helper
            const emojiStr = layer.getObjects 
              ? '📁' 
              : (layer.text || '🌸');

            return (
              <div
                key={layer.id}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onClick={() => handleSelectObject(layer)}
                className={`group flex items-center justify-between p-2 rounded-lg border transition-all select-none cursor-pointer ${
                  isSelected 
                    ? 'bg-rose-500/10 border-rose-500/30' 
                    : 'bg-zinc-900/40 border-zinc-900 hover:border-zinc-800'
                }`}
              >
                {/* Left Section (Drag handle, emoji/icon and name) */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="text-zinc-600 group-hover:text-zinc-400 cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-3.5 w-3.5" />
                  </div>
                  
                  <span className="text-lg shrink-0 w-6 text-center select-none">
                    {emojiStr}
                  </span>

                  {editingId === layer.id ? (
                    <form 
                      onSubmit={(e) => handleSaveRename(e, layer)} 
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 flex-1 min-w-0"
                    >
                      <Input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="h-6 text-[11px] bg-zinc-950 border-zinc-800 pl-1.5 focus-visible:ring-rose-500 py-0"
                        autoFocus
                      />
                      <Button 
                        size="icon" 
                        type="submit"
                        className="h-6 w-6 shrink-0 bg-emerald-600 hover:bg-emerald-500 cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5 text-white" />
                      </Button>
                    </form>
                  ) : (
                    <span className="text-xs font-semibold text-zinc-300 truncate tracking-wide">
                      {layer.assetName || layer.type || 'Element'}
                    </span>
                  )}
                </div>

                {/* Right Section (Rename, Layer Moves, Lock/Unlock, Show/Hide buttons) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                  {editingId !== layer.id && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => handleStartRename(e, layer)}
                      className="h-6 w-6 text-zinc-500 hover:text-zinc-300 rounded cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  )}

                  {/* Manual stacking coordinates */}
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={idx === 0}
                    onClick={(e) => handleMoveLayer(e, idx, 'up')}
                    className="h-6 w-6 text-zinc-500 hover:text-zinc-300 rounded cursor-pointer disabled:opacity-30"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={idx === layers.length - 1}
                    onClick={(e) => handleMoveLayer(e, idx, 'down')}
                    className="h-6 w-6 text-zinc-500 hover:text-zinc-300 rounded cursor-pointer disabled:opacity-30"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>

                  {/* Lock/Unlock */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => handleToggleLock(e, layer)}
                    className={`h-6 w-6 rounded cursor-pointer ${
                      isLocked ? 'text-rose-500 hover:text-rose-400' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  </Button>

                  {/* Show/Hide */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => handleToggleVisibility(e, layer)}
                    className="h-6 w-6 text-zinc-500 hover:text-zinc-300 rounded cursor-pointer"
                  >
                    {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-rose-400" />}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
export default LayerPanel;
