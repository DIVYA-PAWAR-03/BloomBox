"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class EditorErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Canvas Editor uncaught exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-950 p-6 text-zinc-100">
          <div className="max-w-md rounded-2xl border border-rose-500/20 bg-zinc-900/60 p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-8 w-8" />
            </div>
            
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">Studio Crash Restored</h2>
            <p className="mb-6 text-sm text-zinc-400">
              An error occurred in the Canvas engine. Do not worry—your progress was saved locally. You can reload the editor canvas to restore it.
            </p>

            {this.state.error && (
              <div className="mb-6 overflow-x-auto rounded-lg bg-zinc-950 p-3 text-left text-xs font-mono text-rose-400 max-h-36 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <Button 
              onClick={this.handleReset}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium gap-2 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Studio Canvas
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default EditorErrorBoundary;
