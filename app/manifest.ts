import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '韩币人民币汇率换算',
    short_name: '汇率换算',
    description: '韩币和人民币实时汇率换算工具',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#FFD700',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
