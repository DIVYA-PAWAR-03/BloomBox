import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { historyManager } from '@/lib/editor/history-manager';
import { DeleteCommand, DuplicateCommand, MoveCommand } from '@/lib/editor/commands/canvas.commands';

interface UseEditorShortcutsProps {
  canvas: fabric.Canvas | null;
  onCanvasModified?: () => void;
}

export function useEditorShortcuts({ canvas, onCanvasModified }: UseEditorShortcutsProps) {
  const clipboardRef = useRef<fabric.Object | null>(null);

  useEffect(() => {
    if (!canvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if typing in form inputs
      const activeEl = document.activeElement;
      const isInput = 
        activeEl?.tagName === 'INPUT' || 
        activeEl?.tagName === 'TEXTAREA' || 
        activeEl?.hasAttribute('contenteditable') ||
        activeEl?.classList.contains('canvas-container'); // fabric focus state

      // If active element is an input, ignore shortcuts unless it is ESC to blur
      if (isInput && activeEl?.tagName !== 'BODY' && activeEl?.tagName !== 'DIV') {
        if (e.key === 'Escape') {
          (activeEl as HTMLElement).blur();
        }
        return;
      }

      const activeObject = canvas.getActiveObject();
      const ctrlOrCmd = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // 1. UNDO / REDO
      if (ctrlOrCmd && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (shift) {
          historyManager.redo();
        } else {
          historyManager.undo();
        }
        if (onCanvasModified) onCanvasModified();
        return;
      }
      if (ctrlOrCmd && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        historyManager.redo();
        if (onCanvasModified) onCanvasModified();
        return;
      }

      // 2. DELETE OBJECTS
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (activeObject) {
          e.preventDefault();
          const targets = activeObject.type === 'activeSelection'
            ? (activeObject as fabric.ActiveSelection).getObjects()
            : [activeObject];
          
          const cmd = new DeleteCommand(canvas, targets);
          historyManager.execute(cmd);
          if (onCanvasModified) onCanvasModified();
        }
        return;
      }

      // 3. COPY (Ctrl + C)
      if (ctrlOrCmd && e.key.toLowerCase() === 'c') {
        if (activeObject) {
          e.preventDefault();
          activeObject.clone((cloned: fabric.Object) => {
            clipboardRef.current = cloned;
          });
        }
        return;
      }

      // 4. PASTE (Ctrl + V)
      if (ctrlOrCmd && e.key.toLowerCase() === 'v') {
        if (clipboardRef.current) {
          e.preventDefault();
          clipboardRef.current.clone((clonedObj: fabric.Object) => {
            canvas.discardActiveObject();
            
            // Offset the duplicate placement
            clonedObj.set({
              left: (clonedObj.left || 0) + 20,
              top: (clonedObj.top || 0) + 20,
              evented: true,
            });

            if (clonedObj.type === 'activeSelection') {
              clonedObj.canvas = canvas;
              (clonedObj as fabric.ActiveSelection).forEachObject((obj) => {
                canvas.add(obj);
              });
              clonedObj.setCoords();
            } else {
              canvas.add(clonedObj);
            }

            // Adjust clipboard offset for subsequent pastes
            clipboardRef.current!.left = (clipboardRef.current!.left || 0) + 20;
            clipboardRef.current!.top = (clipboardRef.current!.top || 0) + 20;

            canvas.setActiveObject(clonedObj);
            canvas.requestRenderAll();

            const cmd = new DuplicateCommand(canvas, [clonedObj]);
            historyManager.push(cmd);
            if (onCanvasModified) onCanvasModified();
          });
        }
        return;
      }

      // 5. DUPLICATE (Ctrl + D)
      if (ctrlOrCmd && e.key.toLowerCase() === 'd') {
        if (activeObject) {
          e.preventDefault();
          activeObject.clone((cloned: fabric.Object) => {
            canvas.discardActiveObject();
            cloned.set({
              left: (cloned.left || 0) + 20,
              top: (cloned.top || 0) + 20,
              evented: true,
            });

            if (cloned.type === 'activeSelection') {
              cloned.canvas = canvas;
              (cloned as fabric.ActiveSelection).forEachObject((obj) => {
                canvas.add(obj);
              });
              cloned.setCoords();
            } else {
              canvas.add(cloned);
            }

            canvas.setActiveObject(cloned);
            canvas.requestRenderAll();

            const cmd = new DuplicateCommand(canvas, [cloned]);
            historyManager.push(cmd);
            if (onCanvasModified) onCanvasModified();
          });
        }
        return;
      }

      // 6. SELECT ALL (Ctrl + A)
      if (ctrlOrCmd && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const objs = canvas.getObjects().filter(o => !o.excludeFromExport);
        if (objs.length > 0) {
          canvas.discardActiveObject();
          const activeSelection = new fabric.ActiveSelection(objs, { canvas });
          canvas.setActiveObject(activeSelection);
          canvas.requestRenderAll();
        }
        return;
      }

      // 7. ARROW KEYS MOVE
      const isArrowKey = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key);
      if (isArrowKey && activeObject) {
        e.preventDefault();
        
        // Fine move vs coarse move
        const moveStep = shift ? 1 : 10;
        let dx = 0;
        let dy = 0;

        if (e.key === 'ArrowLeft') dx = -moveStep;
        if (e.key === 'ArrowRight') dx = moveStep;
        if (e.key === 'ArrowUp') dy = -moveStep;
        if (e.key === 'ArrowDown') dy = moveStep;

        const targets = activeObject.type === 'activeSelection'
          ? (activeObject as fabric.ActiveSelection).getObjects()
          : [activeObject];

        const oldCoords = targets.map(t => ({ left: t.left || 0, top: t.top || 0 }));
        
        targets.forEach(t => {
          t.set({
            left: (t.left || 0) + dx,
            top: (t.top || 0) + dy
          });
          t.setCoords();
        });

        canvas.requestRenderAll();

        const newCoords = targets.map(t => ({ left: t.left || 0, top: t.top || 0 }));
        const cmd = new MoveCommand(targets, oldCoords, newCoords);
        historyManager.push(cmd);
        if (onCanvasModified) onCanvasModified();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvas, onCanvasModified]);
}
