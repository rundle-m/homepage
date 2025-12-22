"use client";

// Define prop types to fix the 'onLogin' flag
interface LandingPageProps {
  onLogin?: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-stone-950 text-white p-6 text-center overflow-hidden animate-in fade-in duration-700">
      
      {/* Background Decor (Gradients) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/30 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] -z-10" />

      {/* Main Content */}
      <div className="space-y-6 z-10">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-br from-white via-stone-200 to-stone-500 bg-clip-text text-transparent">
          NFT Gallery
        </h1>
        
        <p className="text-stone-400 text-lg md:text-xl max-w-md mx-auto leading-relaxed">
          Your onchain identity, reimagined. <br/> Curate, share, and connect.
        </p>
        
        <div className="pt-8">
          <button 
            onClick={onLogin}
            className="group relative px-8 py-4 bg-white text-stone-950 rounded-full font-bold text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300"
          >
            Connect Farcaster
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 flex gap-4 text-xs font-mono text-stone-600 uppercase tracking-widest">
        <span>Alchemy</span>
        <span>•</span>
        <span>Neynar</span>
        <span>•</span>
        <span>Base</span>
      </div>
    </div>
  );
}