"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { canvasManager } from '@/lib/editor/canvas-manager';
import { historyManager } from '@/lib/editor/history-manager';
import { DeleteCommand } from '@/lib/editor/commands/canvas.commands';
import { useEditorStore } from '@/store/useEditorStore';
import { 
  Copy, 
  Clipboard, 
  Trash2, 
  Layers, 
  Lock, 
  Unlock, 
  CopyPlus, 
  ArrowUp, 
  ArrowDown 
} from 'lucide-react';

interface ContextMenuProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCanvasModified?: () => void;
}

export function ContextMenu({ containerRef, onCanvasModified }: ContextMenuProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hasSelection, setHasSelection] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [clipboardExists, setClipboardExists] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const localClipboardRef = useRef<any>(null);

  // Check if target is inside canvas element
  const handleContextMenu = useCallback((e: MouseEvent) => {
    if (!containerRef.current || !canvasManager.canvas) return;

    const canvasWrapper = containerRef.current.querySelector('.canvas-container');
    if (!canvasWrapper || !canvasWrapper.contains(e.target as Node)) {
      setVisible(false);
      return;
    }

    e.preventDefault();
    
    // Position menu
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPosition({ x, y });

    // Selection states
    const active = canvasManager.canvas.getActiveObject();
    setHasSelection(!!active);
    setIsLocked(active ? (active as any).isLockedFlag || false : false);
    
    // Show menu
    setVisible(true);
  }, [containerRef]);

  const handleGlobalClick = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('contextmenu', handleContextMenu);
    }
    document.addEventListener('click', handleGlobalClick);

    return () => {
      if (container) {
        container.removeEventListener('contextmenu', handleContextMenu);
      }
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [containerRef, handleContextMenu, handleGlobalClick]);

  // Actions
  const handleCopy = () => {
    const active = canvasManager.canvas?.getActiveObject();
    if (active) {
      active.clone((cloned: any) => {
        localClipboardRef.current = cloned;
        setClipboardExists(true);
      });
    }
    setVisible(false);
  };

  const handlePaste = () => {
    const canvas = canvasManager.canvas;
    if (canvas && localClipboardRef.current) {
      localClipboardRef.current.clone((clonedObj: any) => {
        canvas.discardActiveObject();
        clonedObj.set({
          left: (clonedObj.left || 0) + 20,
          top: (clonedObj.top || 0) + 20,
          evented: true,
        });

        if (clonedObj.type === 'activeSelection') {
          clonedObj.canvas = canvas;
          clonedObj.forEachObject((obj: any) => {
            canvas.add(obj);
          });
          clonedObj.setCoords();
        } else {
          canvas.add(clonedObj);
        }

        // Adjust clipboard offset for subsequent pastes
        localClipboardRef.current.left = (localClipboardRef.current.left || 0) + 20;
        localClipboardRef.current.top = (localClipboardRef.current.top || 0) + 20;

        canvas.setActiveObject(clonedObj);
        canvas.requestRenderAll();
        
        if (onCanvasModified) onCanvasModified();
      });
    }
    setVisible(false);
  };

  const handleDuplicate = () => {
    const canvas = canvasManager.canvas;
    const active = canvas?.getActiveObject();
    if (canvas && active) {
      active.clone((cloned: any) => {
        canvas.discardActiveObject();
        cloned.set({
          left: (cloned.left || 0) + 20,
          top: (cloned.top || 0) + 20,
          evented: true,
        });

        if (cloned.type === 'activeSelection') {
          cloned.canvas = canvas;
          cloned.forEachObject((obj: any) => {
            canvas.add(obj);
          });
          cloned.setCoords();
        } else {
          canvas.add(cloned);
        }

        canvas.setActiveObject(cloned);
        canvas.requestRenderAll();
        
        if (onCanvasModified) onCanvasModified();
      });
    }
    setVisible(false);
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
      
      if (onCanvasModified) onCanvasModified();
    }
    setVisible(false);
  };

  const handleLock = () => {
    canvasManager.lockSelected();
    setVisible(false);
  };

  const handleUnlock = () => {
    const selectedId = useEditorStore.getState().selectedObjectId;
    if (selectedId) {
      canvasManager.unlockObjectById(selectedId);
    }
    setVisible(false);
  };

  const handleBringFront = () => {
    canvasManager.bringToFront();
    setVisible(false);
  };

  const handleSendBack = () => {
    canvasManager.sendToBack();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      style={{ top: position.y, left: position.x }}
      className="absolute z-[99] min-w-[180px] rounded-lg border border-zinc-800 bg-zinc-950 p-1 text-sm shadow-xl shadow-black/50 backdrop-blur-md"
    >
      {/* Copy / Paste / Duplicate */}
      <button
        onClick={handleCopy}
        disabled={!hasSelection || isLocked}
        className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-900 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <Copy className="h-3.5 w-3.5" />
        Copy
      </button>
      <button
        onClick={handlePaste}
        disabled={!clipboardExists}
        className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-900 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <Clipboard className="h-3.5 w-3.5" />
        Paste
      </button>
      <button
        onClick={handleDuplicate}
        disabled={!hasSelection || isLocked}
        className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-900 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <CopyPlus className="h-3.5 w-3.5" />
        Duplicate
      </button>

      <div className="my-1 border-t border-zinc-900" />

      {/* Lock / Unlock */}
      {isLocked ? (
        <button
          onClick={handleUnlock}
          className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-rose-400 hover:bg-zinc-900"
        >
          <Unlock className="h-3.5 w-3.5" />
          Unlock Object
        </button>
      ) : (
        <button
          onClick={handleLock}
          disabled={!hasSelection}
          className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-900 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Lock className="h-3.5 w-3.5" />
          Lock Object
        </button>
      )}

      <div className="my-1 border-t border-zinc-900" />

      {/* Layers */}
      <button
        onClick={handleBringFront}
        disabled={!hasSelection || isLocked}
        className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-900 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <ArrowUp className="h-3.5 w-3.5" />
        Bring to Front
      </button>
      <button
        onClick={handleSendBack}
        disabled={!hasSelection || isLocked}
        className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-900 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <ArrowDown className="h-3.5 w-3.5" />
        Send to Back
      </button>

      <div className="my-1 border-t border-zinc-900" />

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={!hasSelection || isLocked}
        className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-rose-500 hover:bg-rose-500/10 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  );
}
export default ContextMenu;
