"use client";

import dynamic from 'next/dynamic';
import { LoadingScreen } from '@/components/editor/loading-screen';

// Dynamically import the RecipientUnboxing component with SSR disabled
const RecipientUnboxing = dynamic(
  () => import('@/components/editor/recipient-unboxing'),
  {
    ssr: false,
    loading: () => <LoadingScreen />
  }
);

export default function RecipientPage() {
  return <RecipientUnboxing />;
}
