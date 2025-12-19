"use client"; 

interface LandingPageProps {
  username: string;
  pfpUrl: string;
  onCreate: () => void;
  isCreating: boolean;
}

export function LandingPage({ username, pfpUrl, onCreate, isCreating }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50 text-center">
      <div className="w-full max-w-sm bg-white p-8 rounded-[40px] shadow-xl border border-stone-100">
        
        {/* Animated Icon */}
        <div className="mb-6 relative">
          <div className="w-20 h-20 bg-violet-100 rounded-full mx-auto flex items-center justify-center text-4xl animate-bounce-slow">
            🏠
          </div>
          <img 
            src={pfpUrl} 
            className="w-10 h-10 rounded-full border-2 border-white absolute bottom-0 right-1/3 shadow-md"
            alt="User PFP"
          />
        </div>
        
        <h1 className="text-3xl font-black text-stone-900 mb-2 tracking-tight">Welcome Home</h1>
        <p className="text-stone-500 mb-8 leading-relaxed">
          Hi <span className="font-bold text-stone-700">@{username}</span>! <br/>
          It looks like you're new here. Let's build your onchain corner of the internet.
        </p>

        <button 
          onClick={onCreate}
          disabled={isCreating}
          className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-violet-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
        >
          {isCreating ? 'Building...' : 'Create My Space'}
        </button>
        
        <p className="text-[10px] text-stone-400 mt-6 uppercase tracking-widest">
            Farcaster Native
        </p>
      </div>
    </div>
  );
}