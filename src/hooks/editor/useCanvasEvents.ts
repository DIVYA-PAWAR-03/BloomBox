import { useEffect } from 'react';
import { fabric } from 'fabric';
import { useEditorStore } from '@/store/useEditorStore';

interface UseCanvasEventsProps {
  canvas: fabric.Canvas | null;
  onCanvasModified?: () => void;
}

export function useCanvasEvents({ canvas, onCanvasModified }: UseCanvasEventsProps) {
  useEffect(() => {
    if (!canvas) return;

    const handleModification = () => {
      if (onCanvasModified) {
        onCanvasModified();
      }
    };

    // Centralized event bindings
    canvas.on('object:added', handleModification);
    canvas.on('object:removed', handleModification);
    canvas.on('object:modified', handleModification);
    
    // Mouse pan cursor improvements
    canvas.on('mouse:down', (e) => {
      const isMiddle = e.e.button === 1;
      const isSpace = canvas.defaultCursor === 'grab';
      if (isMiddle || isSpace) {
        canvas.defaultCursor = 'grabbing';
        canvas.requestRenderAll();
      }
    });

    canvas.on('mouse:up', () => {
      if (canvas.defaultCursor === 'grabbing') {
        canvas.defaultCursor = canvas.selection ? 'default' : 'grab';
        canvas.requestRenderAll();
      }
    });

    return () => {
      canvas.off('object:added', handleModification);
      canvas.off('object:removed', handleModification);
      canvas.off('object:modified', handleModification);
    };
  }, [canvas, onCanvasModified]);
}
