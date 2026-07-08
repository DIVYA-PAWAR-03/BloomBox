"use client";

import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { canvasManager } from '@/lib/editor/canvas-manager';
import { historyManager } from '@/lib/editor/history-manager';
import { DuplicateCommand } from '@/lib/editor/commands/canvas.commands';
import { useEditorStore } from '@/store/useEditorStore';
import { useCanvasEvents } from '@/hooks/editor/useCanvasEvents';
import { useEditorShortcuts } from '@/hooks/editor/useEditorShortcuts';
import { useAutoSave } from '@/hooks/editor/useAutoSave';
import { ContextMenu } from './context-menu';

interface CanvasAreaProps {
  onCanvasModified?: () => void;
}

export function CanvasArea({ onCanvasModified }: CanvasAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const settings = useEditorStore((s) => s.settings);
  const [initialized, setInitialized] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Hook into auto save and history modification events
  const { handleCanvasModified } = useAutoSave();

  const handleModified = () => {
    handleCanvasModified();
    if (onCanvasModified) onCanvasModified();
  };

  // Mount/initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || initialized) return;

    const workspaceEl = containerRef.current;
    
    // Initialize canvas manager instance
    const canvas = canvasManager.init(
      canvasRef.current, 
      workspaceEl.clientWidth, 
      workspaceEl.clientHeight
    );
    
    setInitialized(true);

    // Watch resize events with debouncing
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (canvasManager.canvas && containerRef.current) {
          canvasManager.resizeCanvas(
            useEditorStore.getState().settings.aspectRatio,
            containerRef.current.clientWidth,
            containerRef.current.clientHeight
          );
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      canvasManager.dispose();
    };
  }, [initialized]);

  // Check and prompt for crash recovery backup
  useEffect(() => {
    if (!initialized || !canvasManager.canvas) return;

    const bouquetId = useEditorStore.getState().bouquetId;
    const backupKey = `bloombox_recovery_${bouquetId}`;
    const backupData = localStorage.getItem(backupKey);

    if (backupData) {
      import('sonner').then(({ toast }) => {
        toast('Unsaved changes found', {
          description: 'We recovered edits from your last session before the browser closed.',
          action: {
            label: 'Restore',
            onClick: () => {
              canvasManager.loadCanvas(backupData)
                .then(() => {
                  toast.success('Work restored successfully!');
                  if (onCanvasModified) onCanvasModified();
                })
                .catch(() => {
                  toast.error('Failed to parse recovery snapshot.');
                });
            }
          },
          duration: 12000,
        });
      });
    }
  }, [initialized, onCanvasModified]);

  // Hook up event listeners and shortcuts
  useCanvasEvents({ 
    canvas: canvasManager.canvas, 
    onCanvasModified: handleModified 
  });
  
  useEditorShortcuts({ 
    canvas: canvasManager.canvas, 
    onCanvasModified: handleModified 
  });

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const canvas = canvasManager.canvas;
    if (!canvas) return;

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;

      const asset = JSON.parse(dataStr);

      // Add recently used asset in Zustand
      useEditorStore.getState().addRecentAsset(asset.id);

      // Coordinates math (converts drop screen coords to internal canvas coordinates)
      const canvasEl = canvas.getElement();
      const rect = canvasEl.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const zoom = canvas.getZoom();
      const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];

      const x = (clientX - vpt[4]) / zoom;
      const y = (clientY - vpt[5]) / zoom;

      // Group rendering inside Fabric
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
      });

      const group = new fabric.Group([emojiNode, textNode], {
        left: x,
        top: y,
        originX: 'center',
        originY: 'center',
      }) as any;

      // Attach custom Phase 3B metadata
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

      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.requestRenderAll();

      // Push execution in history
      const cmd = new DuplicateCommand(canvas, [group]);
      historyManager.push(cmd);

      handleModified();
    } catch (err) {
      console.error('Drag drop drop handler error:', err);
    }
  };

  // Calculate sizing style based on settings
  const canvasWrapperStyle: React.CSSProperties = {
    width: `${settings.dimensions.width}px`,
    height: `${settings.dimensions.height}px`,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    transition: 'background-color 0.3s ease',
  };

  return (
    <div 
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex-1 bg-zinc-900 overflow-hidden canvas-workspace-area w-full h-full flex items-center justify-center focus:outline-none transition-all duration-300 ${
        isDraggingOver ? 'ring-2 ring-rose-500/50 bg-zinc-900/90 shadow-[0_0_20px_rgba(244,63,94,0.15)]' : ''
      }`}
      tabIndex={0} // Allows keyboard focus for shortcuts
    >
      {/* Dynamic Grid Background CSS styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        .canvas-grid-bg {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        /* Custom scrollbars inside panels */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />

      {/* Grid Pattern Wrapper */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
        settings.showGrid ? 'canvas-grid-bg opacity-100' : 'opacity-0'
      }`} />

      {/* Actual Fabric Canvas Element */}
      <div 
        style={canvasWrapperStyle}
        className="relative z-10 border border-zinc-800/80 bg-white"
      >
        <canvas ref={canvasRef} />
      </div>

      {/* Context Menu right click overlay */}
      <ContextMenu containerRef={containerRef} onCanvasModified={handleModified} />
    </div>
  );
}
export default CanvasArea;
