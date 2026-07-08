"use client";

import dynamic from 'next/dynamic';
import { LoadingScreen } from '@/components/editor/loading-screen';

// Dynamically import the main Editor component with SSR disabled
const EditorContainer = dynamic(
  () => import('@/components/editor/editor-container'),
  {
    ssr: false,
    loading: () => <LoadingScreen />
  }
);

export default function EditorPage() {
  return <EditorContainer />;
}
