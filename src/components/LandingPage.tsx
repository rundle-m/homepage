"use client";

interface LandingPageProps {
  onLogin?: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-stone-950 text-white p-6 text-center overflow-hidden">
      {/* The "Glowing Blob" we designed earlier */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -z-10" />

      <div className="space-y-6 z-10 animate-in fade-in zoom-in duration-700">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-br from-white via-stone-200 to-stone-500 bg-clip-text text-transparent">
          Onchain Home
        </h1>
        
        <p className="text-stone-400 text-lg md:text-xl max-w-md mx-auto leading-relaxed">
          Your Farcaster identity, curated. <br/> Showcase your projects and collectibles.
        </p>
        
        <div className="pt-8">
          <button 
            onClick={onLogin}
            className="group relative px-10 py-4 bg-white text-stone-950 rounded-full font-bold text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300"
          >
            Connect Farcaster
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 flex gap-4 text-[10px] font-mono text-stone-600 uppercase tracking-[0.2em]">
        <span>Built on Base</span>
        <span>•</span>
        <span>Alchemy</span>
      </div>
    </div>
  );
}