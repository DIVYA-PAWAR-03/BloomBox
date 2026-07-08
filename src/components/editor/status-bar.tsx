"use client";

import { useEditorStore } from '@/store/useEditorStore';
import { HelpCircle, Keyboard, MousePointer } from 'lucide-react';

export function StatusBar() {
  const selectedObjectProps = useEditorStore((s) => s.selectedObjectProps);
  const zoom = useEditorStore((s) => s.zoom);

  return (
    <div className="flex h-7 w-full items-center justify-between border-t border-zinc-800 bg-zinc-950 px-4 text-[10px] text-zinc-500 font-medium">
      {/* Keyboard hints */}
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <Keyboard className="h-3 w-3 text-rose-500/80" />
          <span>Space + Drag to Pan</span>
        </span>
        <span className="h-3 w-[1px] bg-zinc-900" />
        <span className="flex items-center gap-1">
          <MousePointer className="h-3 w-3 text-rose-500/80" />
          <span>Wheel to Zoom</span>
        </span>
        <span className="h-3 w-[1px] bg-zinc-900" />
        <span>Del to Delete</span>
        <span className="h-3 w-[1px] bg-zinc-900" />
        <span>Ctrl+D to Duplicate</span>
      </div>

      {/* Selected object coordinate output */}
      <div className="flex items-center gap-4">
        {selectedObjectProps ? (
          <div className="flex items-center gap-3 text-rose-400">
            <span>
              Type: <strong className="capitalize">{selectedObjectProps.type}</strong>
            </span>
            <span>
              X: <strong>{Math.round(selectedObjectProps.left || 0)}px</strong>
            </span>
            <span>
              Y: <strong>{Math.round(selectedObjectProps.top || 0)}px</strong>
            </span>
            {selectedObjectProps.locked && (
              <span className="bg-rose-950/60 text-rose-500 px-1 py-0.5 rounded border border-rose-900/30 text-[8px]">Locked</span>
            )}
          </div>
        ) : (
          <span>Select an object to inspect coordinates</span>
        )}
        <span className="h-3 w-[1px] bg-zinc-900" />
        <span>Zoom: {Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}
export default StatusBar;
