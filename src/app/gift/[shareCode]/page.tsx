"use client";

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { LoadingScreen } from '@/components/editor/loading-screen';

// Dynamically import the GiftReader component with SSR disabled
const GiftReader = dynamic(
  () => import('@/components/editor/gift-reader').then((mod) => mod.GiftReader),
  {
    ssr: false,
    loading: () => <LoadingScreen />
  }
);

export default function GiftPage() {
  const params = useParams();
  const shareCode = params?.shareCode as string;

  return <GiftReader shareCode={shareCode} />;
}
