import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { canvasManager } from '@/lib/editor/canvas-manager';
import { persistenceService } from '@/services/persistence.service';

export function useAutoSave() {
  const bouquetId = useEditorStore((s) => s.bouquetId);
  const bouquetName = useEditorStore((s) => s.bouquetName);
  const bouquetPublishStatus = useEditorStore((s) => s.bouquetPublishStatus);
  const setStatus = useEditorStore((s) => s.setStatus);
  const setLastSaved = useEditorStore((s) => s.setLastSaved);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Core save callback (Auto and Manual saves)
  const triggerSave = useCallback(async (isManual: boolean = false) => {
    if (!canvasManager.canvas) return;

    setStatus('saving');
    
    try {
      // 1. Serialize complete Fabric canvas
      const jsonState = canvasManager.saveCanvas();
      
      // 2. Filter out guidelines and extract object metadata lists
      const objectsList = canvasManager.canvas.getObjects().filter((o: any) => !o.excludeFromExport);

      // 3. Persist to database
      await persistenceService.saveBouquet(
        bouquetId,
        bouquetName,
        bouquetPublishStatus,
        jsonState,
        objectsList,
        isManual
      );
      
      // Clear crash recovery backup on successful save
      localStorage.removeItem(`bloombox_recovery_${bouquetId}`);

      setStatus('saved');
      setLastSaved(new Date());
    } catch (err) {
      console.error('Save operation failed:', err);
      setStatus('failed');
    }
  }, [bouquetId, bouquetName, bouquetPublishStatus, setStatus, setLastSaved]);

  // Handle auto save trigger with debouncing
  const handleCanvasModified = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setStatus('idle'); // Set status back to idle when new user edits occur
    
    // Store crash recovery backup on every canvas change
    if (canvasManager.canvas) {
      localStorage.setItem(`bloombox_recovery_${bouquetId}`, canvasManager.saveCanvas());
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      triggerSave(false);
    }, 2500); // 2.5 second debounce delay
  }, [setStatus, triggerSave, bouquetId]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    handleCanvasModified,
    forceSave: () => triggerSave(true), // Force save acts as manual save (generating a version history snapshot)
  };
}
export default useAutoSave;
