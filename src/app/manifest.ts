import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BloomBox Premium Digital Gifting Platform',
    short_name: 'BloomBox',
    description: 'Create heartfelt digital bouquets, write personal letters, and share memories completely free.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b', // zinc-950
    theme_color: '#e11d48', // rose-600
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
