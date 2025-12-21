"use client";

import { type FC } from 'react';

// 1. Define the props interface so TypeScript knows 'onLogin' is a function
interface LandingPageProps {
  onLogin?: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 text-white p-6 text-center animate-in fade-in duration-700">
      
      {/* Decorative Gradient Blob */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] -z-10" />

      {/* Main Content */}
      <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-white to-stone-400 bg-clip-text text-transparent">
        NFT Gallery
      </h1>
      
      <p className="text-stone-400 mb-8 max-w-sm leading-relaxed">
        Curate your digital collectibles and share your collection with Farcaster.
      </p>
      
      {/* Login Button */}
      <button 
        onClick={onLogin}
        className="group relative px-8 py-3 bg-violet-600 rounded-full font-bold text-white shadow-lg shadow-violet-500/30 hover:bg-violet-500 hover:shadow-violet-500/50 hover:-translate-y-0.5 transition-all duration-200"
      >
        <span className="relative z-10 flex items-center gap-2">
          {/* Farcaster Logo Icon (Simple SVG) */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm0-2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
          </svg>
          Connect Farcaster
        </span>
      </button>

      {/* Footer / Disclaimer */}
      <p className="absolute bottom-8 text-xs text-stone-600">
        Powered by Alchemy & Neynar
      </p>
    </div>
  );
}