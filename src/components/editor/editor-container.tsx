"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAutoSave } from '@/hooks/editor/useAutoSave';
import { TopToolbar } from './top-toolbar';
import { LeftSidebar } from './left-sidebar';
import { RightSidebar } from './right-sidebar';
import { CanvasArea } from './canvas-area';
import { StatusBar } from './status-bar';
import { LoadingScreen } from './loading-screen';
import { EditorErrorBoundary } from './error-boundary';
import { TooltipProvider } from '@/components/ui/tooltip';

import { GiftPreviewOverlay } from './gift-preview-overlay';

export function EditorContainer() {
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Connect to auto save hooks
  const { handleCanvasModified, forceSave } = useAutoSave();

  // Simulate loading assets / pre-fetch (1.2 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <EditorErrorBoundary>
      <TooltipProvider>
        <div 
          ref={containerRef}
          className="relative flex h-screen w-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100 font-sans"
        >
          {/* Top Navbar Toolbar */}
          <TopToolbar 
            containerRef={containerRef} 
            onForceSave={forceSave} 
          />

          {/* Main workspace area */}
          <div className="flex flex-1 w-full overflow-hidden">
            {/* Left Sidebar - Dynamic Asset Catalog */}
            <LeftSidebar 
              onCanvasModified={handleCanvasModified} 
            />

            {/* Center Fabric Canvas */}
            <CanvasArea 
              onCanvasModified={handleCanvasModified} 
            />

            {/* Right Sidebar - Properties/Setup Inspector */}
            <RightSidebar 
              onCanvasModified={handleCanvasModified}
            />
          </div>

          {/* Bottom Status Bar */}
          <StatusBar />

          {/* Unboxing Gift Preview Overlay */}
          <GiftPreviewOverlay />
        </div>
      </TooltipProvider>
    </EditorErrorBoundary>
  );
}
export default EditorContainer;
