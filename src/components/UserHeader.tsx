"use client";

import type { Profile } from '../types/types';

interface UserHeaderProps {
  profile: Profile;
  isOwner: boolean;
  onEditProfile: () => void;
}

// Re-introduce the theme map here so the banner respects your color choice
const THEME_GRADIENTS: Record<string, string> = {
  violet: 'from-violet-600 to-indigo-600',
  blue: 'from-blue-500 to-cyan-500',
  emerald: 'from-emerald-500 to-teal-500',
  rose: 'from-rose-500 to-pink-500',
  amber: 'from-amber-500 to-orange-500',
  stone: 'from-stone-600 to-stone-800',
};

export function UserHeader({ profile, isOwner, onEditProfile }: UserHeaderProps) {
  
  const handleShare = () => {
    // 🔙 REVERTED LOGIC: Use the current website URL
    // This works automatically without needing a specific App ID
    const baseUrl = window.location.origin; 
    const shareUrl = `${baseUrl}?fid=${profile.fid}`;
    
    // Construct the Warpcast composer link
    // This opens Warpcast and pre-fills the text with your link
    const text = `Check out my Onchain Home! 🏠`;
    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(shareUrl)}`;
    
    // Open in new tab (works on mobile and desktop)
    window.open(warpcastUrl, '_blank');
  };

  const themeGradient = THEME_GRADIENTS[profile.theme_color || 'violet'] || THEME_GRADIENTS.violet;

  return (
    <div className="relative mb-6">
      {/* Banner Area */}
      <div className={`h-32 w-full overflow-hidden relative`}>
         {/* 1. Gradient Background (Always there as base) */}
         <div className={`absolute inset-0 bg-gradient-to-r ${themeGradient}`} />
         
         {/* 2. Image (If exists, sits on top) */}
         {profile.banner_url && (
           <img 
             src={profile.banner_url} 
             alt="Banner" 
             className="absolute inset-0 w-full h-full object-cover opacity-90" 
           />
         )}
      </div>

      <div className="px-6 relative">
        {/* Avatar & Buttons Row */}
        <div className="-mt-12 mb-4 flex justify-between items-end">
          {/* Avatar */}
          <div className="relative rounded-full p-1 bg-white dark:bg-stone-950 z-10">
            <img 
              src={profile.pfp_url || "https://via.placeholder.com/100"} 
              alt={profile.username}
              className="w-24 h-24 rounded-full object-cover bg-stone-100"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 mb-1 z-10">
             <button 
                onClick={handleShare}
                className="px-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm rounded-full text-xs font-bold hover:scale-105 transition"
             >
                Share
             </button>
             {isOwner && (
               <button 
                  onClick={onEditProfile}
                  className="px-4 py-2 bg-violet-100 text-violet-700 border border-violet-200 rounded-full text-xs font-bold hover:bg-violet-200 transition"
               >
                  Edit Profile
               </button>
             )}
          </div>
        </div>

        {/* Name & Bio */}
        <div>
          <h1 className="text-xl font-bold">{profile.display_name}</h1>
          <p className="text-stone-500 text-sm">@{profile.username}</p>
          <p className="mt-3 text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-md">
             {profile.bio || "Welcome to my gallery!"}
          </p>
        </div>
      </div>
    </div>
  );
}