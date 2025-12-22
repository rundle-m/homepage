"use client";

interface LandingPageProps {
  onLogin?: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-stone-950 text-white p-6 text-center overflow-hidden">
      
      {/* 🎨 THE "GLOW" SYSTEM (Fixes the black void) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in duration-1000">
        
        {/* Branding/Logo Area */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-600 mb-4 shadow-2xl shadow-violet-500/20">
           <span className="text-2xl">🏠</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-b from-white via-white to-stone-500 bg-clip-text text-transparent">
            Onchain Home
          </h1>
          <p className="text-stone-400 text-lg md:text-xl font-medium max-w-sm mx-auto leading-relaxed">
            A beautiful, curated space for your projects and digital collectibles.
          </p>
        </div>
        
        <div className="pt-4">
          <button 
            onClick={onLogin}
            className="group relative px-10 py-4 bg-white text-stone-950 rounded-full font-bold text-lg shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)] hover:shadow-[0_0_60px_-5px_rgba(255,255,255,0.6)] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Connect Farcaster
          </button>
        </div>

        {/* Status Indicators */}
        <div className="pt-12 flex items-center justify-center gap-6 opacity-40">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest uppercase">Live on Base</span>
           </div>
           <div className="w-px h-4 bg-stone-800" />
           <span className="text-[10px] font-mono tracking-widest uppercase">Powered by Alchemy</span>
        </div>
      </div>
    </div>
  );
}