import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Onchain Home',
    short_name: 'Home',
    description: 'My onchain space',
    start_url: '/', // Standard entry point
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7c3aed',
    icons: [
      {
        src: '/icon.png', // Ensure you have an icon.png in /public or remove this block
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    // ⚠️ THE MAGIC TRICK:
    // We explicitly OMIT 'homeUrl'.
    // By NOT having homeUrl, we signal to Farcaster: "Use the deep link provided in the Cast."
  };
}