"use client";

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { useGiftStore } from '@/store/useGiftStore';
import { canvasManager } from '@/lib/editor/canvas-manager';
import { historyManager } from '@/lib/editor/history-manager';
import { persistenceService, BouquetMetadata, BouquetVersion } from '@/services/persistence.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  RefreshCw, 
  Save, 
  Check, 
  AlertCircle,
  Share2,
  History,
  Download,
  Upload, 
  Folder, 
  Plus, 
  Copy, 
  ExternalLink,
  ChevronDown,
  Trash,
  Sparkles,
  Gift
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TopToolbarProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onForceSave: () => Promise<void>;
}

export function TopToolbar({ containerRef, onForceSave }: TopToolbarProps) {
  // Zustand Store states
  const bouquetId = useEditorStore((s) => s.bouquetId);
  const bouquetName = useEditorStore((s) => s.bouquetName);
  const bouquetPublishStatus = useEditorStore((s) => s.bouquetPublishStatus);
  const setBouquetId = useEditorStore((s) => s.setBouquetId);
  const setBouquetName = useEditorStore((s) => s.setBouquetName);
  const setBouquetPublishStatus = useEditorStore((s) => s.setBouquetPublishStatus);
  
  const zoom = useEditorStore((s) => s.zoom);
  const status = useEditorStore((s) => s.status);
  const lastSavedAt = useEditorStore((s) => s.lastSavedAt);
  const historyCanUndo = useEditorStore((s) => s.historyCanUndo);
  const historyCanRedo = useEditorStore((s) => s.historyCanRedo);

  // Dialog and panel states
  const [drafts, setDrafts] = useState<BouquetMetadata[]>([]);
  const [versions, setVersions] = useState<BouquetVersion[]>([]);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [shareInfo, setShareInfo] = useState<{ code: string; url: string } | null>(null);

  // Local draft rename values
  const [renameText, setRenameText] = useState(bouquetName);

  // Gift Settings states from Zustand (Phase 7)
  const isPrivate = useGiftStore((s) => s.isPrivate);
  const setIsPrivate = useGiftStore((s) => s.setIsPrivate);
  const password = useGiftStore((s) => s.password);
  const setPassword = useGiftStore((s) => s.setPassword);
  const expiryDate = useGiftStore((s) => s.expiryDate);
  const setExpiryDate = useGiftStore((s) => s.setExpiryDate);
  const disableComments = useGiftStore((s) => s.disableComments);
  const setDisableComments = useGiftStore((s) => s.setDisableComments);
  const disableReactions = useGiftStore((s) => s.disableReactions);
  const setDisableReactions = useGiftStore((s) => s.setDisableReactions);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setRenameText(bouquetName);
  }, [bouquetName]);

  // Load drafts database
  const loadDraftsList = async () => {
    const list = await persistenceService.getDrafts();
    setDrafts(list);
  };

  // Load versions history
  const loadVersionsList = async () => {
    const list = await persistenceService.getVersions(bouquetId);
    setVersions(list);
  };

  const handleManualSave = async () => {
    await onForceSave();
    
    // Celebrate manual save checkpoint
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.1 },
      colors: ['#f43f5e', '#fb7185', '#fbbf24', '#34d399']
    });
    toast.success('Checkpoint version saved successfully!');
  };

  // Rename top toolbar input
  const handleRenameSubmit = async () => {
    if (!renameText.trim()) return;
    setBouquetName(renameText);
    await persistenceService.renameDraft(bouquetId, renameText);
    toast.success('Project renamed');
  };

  // Create new project draft
  const handleCreateNewDraft = async () => {
    try {
      const newId = await persistenceService.createDraft('My New Floral Bouquet');
      canvasManager.canvas?.clear();
      
      setBouquetId(newId);
      setBouquetName('My New Floral Bouquet');
      setBouquetPublishStatus('draft');

      toast.success('Created new blank draft!');
      setIsDraftsOpen(false);
    } catch (err) {
      toast.error('Failed to create new draft');
    }
  };

  // Load selected draft project
  const handleSelectDraft = async (id: string) => {
    try {
      const versionsList = await persistenceService.getVersions(id);
      
      if (versionsList.length > 0) {
        // Load latest version JSON snapshot
        const latestSnapshot = versionsList[0].json_snapshot;
        await canvasManager.loadCanvas(latestSnapshot);
      } else {
        // No saved state yet, clear canvas
        canvasManager.canvas?.clear();
      }

      const list = await persistenceService.getDrafts();
      const meta = list.find(d => d.id === id);
      
      if (meta) {
        setBouquetId(id);
        setBouquetName(meta.name);
        setBouquetPublishStatus(meta.status);
      }

      toast.success('Project loaded successfully!');
      setIsDraftsOpen(false);
    } catch (err) {
      console.error('Error loading project:', err);
      toast.error('Could not load project snapshot');
    }
  };

  // Stacking re-orders: Restore version snapshot
  const handleRestoreVersion = async (v: BouquetVersion) => {
    try {
      const snapshot = await persistenceService.restoreVersion(bouquetId, v.version_number);
      await canvasManager.loadCanvas(snapshot);
      
      toast.success(`Restored Version #${v.version_number}`);
      setIsVersionsOpen(false);
    } catch (err) {
      toast.error('Could not restore selected version');
    }
  };

  // Stacking re-orders: Delete version
  const handleDeleteVersion = async (v: BouquetVersion) => {
    try {
      await persistenceService.deleteVersion(bouquetId, v.version_number);
      await loadVersionsList();
      toast.success('Version checkpoint deleted');
    } catch (err) {
      toast.error('Could not delete version');
    }
  };

  // Generate Gift link flow
  const handleGenerateGift = async () => {
    setIsGenerating(true);
    try {
      const giftState = useGiftStore.getState();
      const giftConfig = {
        envelopeCategory: giftState.envelopeCategory,
        envelopeColor: giftState.envelopeColor,
        envelopeTexture: giftState.envelopeTexture,
        waxSealType: giftState.waxSealType,
        sealColor: giftState.sealColor,
        ribbonColor: giftState.ribbonColor,
        envelopeStickers: giftState.envelopeStickers,
        letterTemplate: giftState.letterTemplate,
        fontFamily: giftState.fontFamily,
        fontSize: giftState.fontSize,
        textColor: giftState.textColor,
        paperTexture: giftState.paperTexture,
        borderStyle: giftState.borderStyle,
        textContent: giftState.textContent,
        signatureText: giftState.signatureText,
        typingSpeed: giftState.typingSpeed,
        effectType: giftState.effectType,
        locale: giftState.locale,
        voiceUrl: giftState.voiceUrl,
        voiceDuration: giftState.voiceDuration,
        musicUrl: giftState.musicUrl,
        musicTitle: giftState.musicTitle,
        musicVolume: giftState.musicVolume,
        photos: giftState.photos,
        photoLayout: giftState.photoLayout,
        attachedGifts: giftState.attachedGifts,
        isPrivate: giftState.isPrivate,
        password: giftState.password,
        expiryDate: giftState.expiryDate,
        disableComments: giftState.disableComments,
        disableReactions: giftState.disableReactions
      };

      const canvasJson = canvasManager.exportToTemplateJSON();
      const res = await persistenceService.publishGift(bouquetId, canvasJson, giftConfig);
      
      setBouquetPublishStatus('published');
      setShareInfo({ code: res.shareCode, url: res.publicUrl });
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.3 }
      });
      toast.success('Your digital bouquet gift is generated!');
    } catch (err) {
      toast.error('Failed to generate bouquet gift link');
    } finally {
      setIsGenerating(false);
    }
  };

  // Export handlers
  const handleExportJSON = () => {
    const jsonStr = canvasManager.exportToTemplateJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${bouquetName.toLowerCase().replace(/\s+/g, '_')}_template.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Template JSON exported!');
  };

  const handleExportPNG = () => {
    if (!canvasManager.canvas) return;
    const url = canvasManager.canvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 2 // High res multiplier
    });
    const link = document.createElement('a');
    link.href = url;
    link.download = `${bouquetName.toLowerCase().replace(/\s+/g, '_')}.png`;
    link.click();
    toast.success('Image exported successfully!');
  };

  const handleExportSVG = () => {
    if (!canvasManager.canvas) return;
    const svgStr = canvasManager.canvas.toSVG();
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${bouquetName.toLowerCase().replace(/\s+/g, '_')}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Vector SVG exported!');
  };

  const handleExportPDF = () => {
    if (!canvasManager.canvas) return;
    // Client-side PDF fallback print view triggers high-res printing layout
    const dataUrl = canvasManager.canvas.toDataURL({ format: 'png', quality: 1.0 });
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Bouquet PDF - ${bouquetName}</title>
            <style>
              body { margin: 0; display: flex; items-center: center; justify-content: center; height: 100vh; background-color: white; }
              img { max-width: 100%; max-height: 100%; object-fit: contain; }
              @media print {
                body { margin: 0; }
                img { width: 100%; height: auto; }
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
      toast.success('Print PDF dialog triggered');
    }
  };

  // Import handler (Restores canvas exactly from local JSON config)
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);
        
        // Validation check
        if (data.version && data.objects) {
          // If template JSON has settings, apply them in store
          if (data.aspectRatio) {
            useEditorStore.getState().setAspectRatio(data.aspectRatio);
          }
          if (data.backgroundColor) {
            useEditorStore.getState().setBackgroundColor(data.backgroundColor);
          }

          // Load array elements onto canvas
          const serializedState = JSON.stringify({ objects: data.objects });
          await canvasManager.loadCanvas(serializedState);
          
          toast.success('Template imported and restored successfully!');
        } else {
          toast.error('Invalid template JSON format');
        }
      } catch (err) {
        toast.error('Could not parse template file');
      }
    };
    reader.readAsText(file);
  };

  const handleFitScreen = () => {
    if (containerRef.current) {
      const workspace = containerRef.current.querySelector('.canvas-workspace-area');
      if (workspace) {
        canvasManager.fitToScreen(workspace.clientWidth, workspace.clientHeight);
      }
    }
  };

  const handleResetZoom = () => {
    canvasManager.resetZoom();
    if (containerRef.current) {
      const workspace = containerRef.current.querySelector('.canvas-workspace-area');
      if (workspace) {
        canvasManager.centerCanvas(workspace.clientWidth, workspace.clientHeight);
      }
    }
  };

  return (
    <div className="flex h-14 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 text-zinc-200 shrink-0">
      
      {/* 1. Left controls (Undo/Redo & Project Managers) */}
      <div className="flex items-center gap-2">
        
        {/* Project Drafts Dropdown Dialog */}
        <Dialog open={isDraftsOpen} onOpenChange={setIsDraftsOpen}>
          <DialogTrigger 
            onClick={() => { loadDraftsList(); setIsDraftsOpen(true); }}
            className="h-8 border border-zinc-805 bg-zinc-900 text-zinc-300 hover:bg-zinc-850 hover:text-white text-xs font-semibold gap-1.5 cursor-pointer inline-flex items-center justify-center px-3 rounded-md"
          >
            <Folder className="h-3.5 w-3.5" />
            My Studio
          </DialogTrigger>
          <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-200 max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Folder className="h-4.5 w-4.5 text-rose-500" />
                Floral Gift Studio
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <Button
                onClick={handleCreateNewDraft}
                className="w-full h-9 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs gap-1.5 rounded-lg cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Create New Blank Draft
              </Button>

              <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-1">Recent Drafts</span>
                
                {drafts.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 text-xs font-medium">No saved drafts. Click button above to create.</div>
                ) : (
                  drafts.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => handleSelectDraft(d.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-800 transition-all cursor-pointer ${
                        d.id === bouquetId ? 'border-rose-500/25 bg-rose-500/5' : ''
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-zinc-200 truncate">{d.name}</span>
                        <span className="text-[10px] text-zinc-500 font-semibold mt-0.5 capitalize">
                          Status: {d.status} • Updated {new Date(d.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {d.id === bouquetId && (
                        <span className="text-[9px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-bold">
                          Active
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Separator */}
        <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

        {/* Undo / Redo buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => historyManager.undo()}
            disabled={!historyCanUndo}
            title="Undo (Ctrl + Z)"
            className="h-8 w-8 rounded-lg hover:bg-zinc-900 hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => historyManager.redo()}
            disabled={!historyCanRedo}
            title="Redo (Ctrl + Shift + Z)"
            className="h-8 w-8 rounded-lg hover:bg-zinc-900 hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 2. Middle section (Inline Title Rename input & Zoom) */}
      <div className="flex items-center gap-6">
        
        {/* Title Rename Input field */}
        <div className="flex items-center gap-1 max-w-[200px]">
          <Input
            value={renameText}
            onChange={(e) => setRenameText(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
            className="h-7 text-xs border-zinc-850 bg-zinc-900/40 text-zinc-100 font-bold px-2 py-0 focus-visible:ring-rose-500 rounded text-center tracking-wide focus:bg-zinc-900"
          />
        </div>

        {/* Viewport Zoom Option buttons */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => canvasManager.zoomOut()}
            title="Zoom Out"
            className="h-8 w-8 rounded-lg hover:bg-zinc-900 hover:text-white cursor-pointer"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <button 
            onClick={handleResetZoom}
            className="min-w-[55px] px-1.5 py-0.5 rounded text-center text-xs font-bold hover:bg-zinc-900 hover:text-white cursor-pointer"
            title="Reset Zoom to 100%"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => canvasManager.zoomIn()}
            title="Zoom In"
            className="h-8 w-8 rounded-lg hover:bg-zinc-900 hover:text-white cursor-pointer"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <div className="h-3.5 w-[1px] bg-zinc-800 mx-1.5" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFitScreen}
            className="h-8 gap-1.5 rounded-lg px-2 hover:bg-zinc-900 hover:text-white text-zinc-300 text-xs cursor-pointer"
          >
            <Maximize className="h-3 w-3" />
            Fit
          </Button>
        </div>
      </div>

      {/* 3. Right Section (Auto-save Indicator, Checkpoints history, Exports, Publishing) */}
      <div className="flex items-center gap-3">
        
        {/* Auto save status indicator messages */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          {status === 'saving' && (
            <>
              <RefreshCw className="h-3 w-3 animate-spin text-rose-500" />
              <span>Saving...</span>
            </>
          )}
          {status === 'saved' && (
            <>
              <Check className="h-3 w-3 text-emerald-500" />
              <span>Auto-saved</span>
            </>
          )}
          {status === 'failed' && (
            <>
              <AlertCircle className="h-3 w-3 text-rose-500" />
              <span className="text-rose-400">Save Failed</span>
            </>
          )}
          {status === 'idle' && lastSavedAt && (
            <span>Saved {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>

        {/* Version History Checkpoints Dialog */}
        <Dialog open={isVersionsOpen} onOpenChange={setIsVersionsOpen}>
          <DialogTrigger 
            onClick={() => { loadVersionsList(); setIsVersionsOpen(true); }}
            title="Version History checkpoints"
            className="h-8 w-8 border border-zinc-808 bg-zinc-900 hover:bg-zinc-850 hover:text-white cursor-pointer inline-flex items-center justify-center rounded-md"
          >
            <History className="h-3.5 w-3.5" />
          </DialogTrigger>
          <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-200 max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <History className="h-4.5 w-4.5 text-rose-500" />
                Version Checkpoint History
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-1.5 max-h-72 overflow-y-auto no-scrollbar">
              {versions.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs font-semibold">
                  No manual checkpoints saved yet. Click the &quot;Save Version&quot; button in the toolbar to record a new state.
                </div>
              ) : (
                versions.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-zinc-900 bg-zinc-900/30 hover:border-zinc-800 transition-all"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-200">Version #{v.version_number}</span>
                      <span className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                        Recorded: {new Date(v.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleRestoreVersion(v)}
                        size="sm"
                        className="h-7 px-2.5 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-rose-400 font-bold text-[10px] cursor-pointer"
                      >
                        Restore
                      </Button>
                      <Button
                        onClick={() => handleDeleteVersion(v)}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-md cursor-pointer"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Export / Import Dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger 
            title="Export or Import files"
            className="h-8 w-8 border border-zinc-805 bg-zinc-900 hover:bg-zinc-850 hover:text-white cursor-pointer inline-flex items-center justify-center rounded-md"
          >
            <Download className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-zinc-800 bg-zinc-950 text-zinc-200 w-48 rounded-lg shadow-xl shadow-black/80">
            <div className="px-2 py-1.5 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Export As</div>
            <DropdownMenuItem onClick={handleExportPNG} className="text-xs font-semibold py-2 hover:bg-zinc-900 cursor-pointer flex items-center gap-2">
              <Download className="h-3.5 w-3.5 text-zinc-400" />
              Download PNG Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportSVG} className="text-xs font-semibold py-2 hover:bg-zinc-900 cursor-pointer flex items-center gap-2">
              <Download className="h-3.5 w-3.5 text-zinc-400" />
              Download Vector SVG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPDF} className="text-xs font-semibold py-2 hover:bg-zinc-900 cursor-pointer flex items-center gap-2">
              <Download className="h-3.5 w-3.5 text-zinc-400" />
              Print PDF Layout
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportJSON} className="text-xs font-semibold py-2 hover:bg-zinc-900 cursor-pointer flex items-center gap-2">
              <Download className="h-3.5 w-3.5 text-rose-400" />
              Download JSON Template
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-zinc-900" />
            
            <div className="px-2 py-1.5 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Import</div>
            <div className="relative w-full">
              <input
                id="import-json-file"
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <DropdownMenuItem className="text-xs font-semibold py-2 hover:bg-zinc-900 cursor-pointer flex items-center gap-2">
                <Upload className="h-3.5 w-3.5 text-zinc-400" />
                Upload JSON Template
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Manual Save version button */}
        <Button
          onClick={handleManualSave}
          disabled={status === 'saving'}
          variant="outline"
          size="sm"
          className="h-8 border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-850 hover:text-white text-xs font-semibold gap-1.5 cursor-pointer"
        >
          <Save className="h-3.5 w-3.5 text-rose-500" />
          Save Version
        </Button>

        {/* Preview Gift Opening trigger button */}
        <Button
          onClick={() => useGiftStore.getState().setIsPreviewOpen(true)}
          className="h-8 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-500 text-white font-bold text-xs gap-1.5 rounded-lg px-3 cursor-pointer shadow-[0_0_10px_rgba(244,63,94,0.15)] hover:scale-102 transition-transform"
        >
          <Gift className="h-3.5 w-3.5" />
          Preview Gift
        </Button>
        {/* Generate Gift / Sharing Dropdown Dialog */}
        <Dialog open={isPublishOpen} onOpenChange={setIsPublishOpen}>
          <DialogTrigger 
            onClick={() => {
              setShareInfo(null);
              setIsPublishOpen(true);
            }}
            className="h-8 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs gap-1.5 rounded-lg px-3 cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.3)] hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] inline-flex items-center justify-center border-none"
          >
            <Gift className="h-3.5 w-3.5" />
            Generate Gift
          </DialogTrigger>
          <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-200 max-w-md rounded-xl space-y-4">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-amber-500" />
                Bouquet Gift Generated!
              </DialogTitle>
            </DialogHeader>

            {!shareInfo ? (
              <div className="space-y-4 py-2 text-zinc-300">
                <p className="text-xs font-medium leading-relaxed text-zinc-400">
                  Configure optional recipient privacy parameters before creating your public gift link:
                </p>

                {/* Privacy select */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Privacy Mode</Label>
                  <select
                    value={isPrivate ? 'private' : 'public'}
                    onChange={(e) => setIsPrivate(e.target.value === 'private')}
                    className="w-full h-8 px-2 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-200 focus:outline-none cursor-pointer"
                  >
                    <option value="public">🔓 Public (Anyone with link can open)</option>
                    <option value="private">🔒 Password Protected (Requires a code)</option>
                  </select>
                </div>

                {/* Password input */}
                {isPrivate && (
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Access Password</Label>
                    <Input
                      type="text"
                      placeholder="Enter a 4-8 digit lock code"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-8 text-xs border-zinc-800 bg-zinc-900 focus-visible:ring-rose-500"
                    />
                  </div>
                )}

                {/* Expiry Date */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Expiration Date (Optional)</Label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full h-8 px-2 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-200 focus:outline-none cursor-pointer"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-2 pt-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="disable-comments"
                      checked={disableComments}
                      onChange={(e) => setDisableComments(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-zinc-800 text-rose-600 bg-zinc-900 focus:ring-rose-500 cursor-pointer accent-rose-500"
                    />
                    <label htmlFor="disable-comments" className="text-xs text-zinc-300 cursor-pointer font-medium">
                      Disable Recipient Comments
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="disable-reactions"
                      checked={disableReactions}
                      onChange={(e) => setDisableReactions(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-zinc-800 text-rose-600 bg-zinc-900 focus:ring-rose-500 cursor-pointer accent-rose-500"
                    />
                    <label htmlFor="disable-reactions" className="text-xs text-zinc-300 cursor-pointer font-medium">
                      Disable Recipient Reactions
                    </label>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateGift}
                  disabled={isGenerating}
                  className="w-full h-9 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-500 text-white font-bold text-xs gap-1.5 rounded-lg mt-3 cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  {isGenerating ? 'Generating Gift URL...' : 'Confirm & Create Free Gift Link'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 py-2 text-zinc-300">
                <p className="text-xs font-medium leading-relaxed">
                  Your digital bouquet arrangement has been generated successfully. Anyone with the share link can open it for free!
                </p>

                {/* Public Link row */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Shareable Public Link</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={shareInfo.url}
                      className="h-9 border-zinc-800 bg-zinc-900 text-zinc-300 text-xs truncate"
                    />
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(shareInfo.url);
                        toast.success('Share URL copied!');
                      }}
                      className="h-9 w-9 shrink-0 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      onClick={() => window.open(shareInfo.url, '_blank')}
                      className="h-9 w-9 shrink-0 bg-zinc-900 border border-zinc-800 hover:bg-rose-900/20 text-rose-450 hover:text-rose-350 cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Quick Share Grid */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                  <Label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Quick Share Options</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {/* Copy Link */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shareInfo.url);
                        toast.success('Share URL copied!');
                      }}
                      className="flex flex-col items-center justify-center p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-zinc-300 hover:text-white cursor-pointer select-none text-xs gap-1"
                      title="Copy Link"
                    >
                      <Copy className="h-4 w-4 text-blue-400" />
                      <span className="text-[8px] font-bold">Copy Link</span>
                    </button>

                    {/* WhatsApp */}
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent('I created a beautiful digital bouquet and personal letter for you! Open it here: ' + shareInfo.url)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-zinc-300 hover:text-white cursor-pointer select-none text-xs gap-1"
                      title="Share via WhatsApp"
                    >
                      <span className="text-base">💬</span>
                      <span className="text-[8px] font-bold">WhatsApp</span>
                    </a>

                    {/* Telegram */}
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(shareInfo.url)}&text=${encodeURIComponent('I created a beautiful digital bouquet and personal letter for you!')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-zinc-300 hover:text-white cursor-pointer select-none text-xs gap-1"
                      title="Share via Telegram"
                    >
                      <span className="text-base">✈️</span>
                      <span className="text-[8px] font-bold">Telegram</span>
                    </a>

                    {/* Instagram */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shareInfo.url);
                        toast.success('Link copied! Open Instagram and paste it in DMs.');
                        window.open('https://instagram.com', '_blank');
                      }}
                      className="flex flex-col items-center justify-center p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-zinc-300 hover:text-white cursor-pointer select-none text-xs gap-1"
                      title="Share via Instagram"
                    >
                      <span className="text-base">📸</span>
                      <span className="text-[8px] font-bold">Instagram</span>
                    </button>

                    {/* Email */}
                    <a
                      href={`mailto:?subject=${encodeURIComponent('A Digital Floral Bouquet for You!')}&body=${encodeURIComponent('Open your personalized digital bouquet here: ' + shareInfo.url)}`}
                      className="flex flex-col items-center justify-center p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-zinc-300 hover:text-white cursor-pointer select-none text-xs gap-1"
                      title="Share via Email"
                    >
                      <span className="text-base">✉️</span>
                      <span className="text-[8px] font-bold">Email</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                onClick={() => setIsPublishOpen(false)}
                className="h-9 bg-zinc-850 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg px-4 cursor-pointer"
              >
                Close Panel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
export default TopToolbar;
