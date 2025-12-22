"use client";

import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { LandingPage } from './LandingPage';
import { Grid } from './Grid';
import { ThemePicker } from './ThemePicker';
import { NFTPicker } from './NFTPicker'; 

// THEME MAP (Restored for the banner background)
const THEME_GRADIENTS: Record<string, string> = {
  violet: 'from-violet-600 to-indigo-600',
  blue: 'from-blue-500 to-cyan-500',
  emerald: 'from-emerald-500 to-teal-500',
  rose: 'from-rose-500 to-pink-500',
  amber: 'from-amber-500 to-orange-500',
  stone: 'from-stone-600 to-stone-800',
};

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-stone-950">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800 dark:border-white"></div>
    </div>
  );
}

export default function HomeClient() {
  const { 
    profile, remoteUser, isLoading, isOwner, 
    login, createAccount, updateProfile 
  } = useProfile();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isPickingNFTs, setIsPickingNFTs] = useState(false);

  // 1. Loading
  if (isLoading) return <Loading />;

  // 2. Landing Page (Not logged in, no profile loaded)
  if (!profile && !remoteUser) {
     return <LandingPage onLogin={login} />;
  }

  // 3. Create Account (Logged in, but no profile yet)
  if (!profile && remoteUser) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
           <h2 className="text-3xl font-bold mb-2">Welcome, {remoteUser.username}!</h2>
           <p className="text-stone-500 mb-8">Let's set up your Onchain Gallery.</p>
           <button 
             onClick={createAccount}
             className="bg-violet-600 text-white px-8 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition"
           >
             Create Profile
           </button>
        </div>
     );
  }

  // 4. Main Profile View
  if (profile) {
    const themeGradient = THEME_GRADIENTS[profile.theme_color || 'violet'] || THEME_GRADIENTS.violet;
    
    // SHARE LOGIC (Restored & Fixed)
    const handleShare = () => {
      // Logic: Use current URL + FID
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}?fid=${profile.fid}`;
      
      const text = `Check out my Onchain Home! 🏠`;
      // Open Warpcast Composer
      const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(shareUrl)}`;
      window.open(warpcastUrl, '_blank');
    };

    return (
      <div className={`min-h-screen pb-32 bg-white dark:bg-stone-950 text-stone-900 dark:text-white theme-${profile.theme_color || 'violet'}`}>
         
         {/* --- BANNER HEADER (Restored) --- */}
         <div className="relative">
             <div className={`h-48 w-full overflow-hidden relative`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${themeGradient}`} />
                {profile.banner_url && (
                  <img src={profile.banner_url} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                )}
             </div>
             
             {/* Edit Theme Button (Top Right) */}
             {isOwner && (
                <button 
                   onClick={() => setIsEditingProfile(true)}
                   className="absolute top-4 right-4 bg-black/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-black/40 transition"
                >
                   Edit Theme
                </button>
             )}
         </div>

         {/* --- PROFILE INFO --- */}
         <div className="px-6 relative z-10">
             <div className="-mt-16 mb-4">
               <div className="inline-block p-1.5 bg-white dark:bg-stone-950 rounded-full">
                  <img 
                    src={profile.pfp_url || "https://via.placeholder.com/100"} 
                    alt={profile.username}
                    className="w-32 h-32 rounded-full object-cover bg-stone-100 border-4 border-white dark:border-stone-900"
                  />
               </div>
             </div>
             
             <div className="mb-8">
               <h1 className="text-3xl font-black mb-1">{profile.display_name}</h1>
               <p className="text-stone-500 font-medium">@{profile.username}</p>
               {profile.bio && (
                  <p className="mt-4 text-stone-600 dark:text-stone-300 leading-relaxed max-w-lg">
                    {profile.bio}
                  </p>
               )}
             </div>
         </div>

         {/* --- SHOWCASE GRID --- */}
         <div className="mt-2">
            <div className="px-6 flex justify-between items-end mb-6">
               <h3 className="font-bold text-xl">Showcase</h3>
               {isOwner && (
                 <button 
                   onClick={() => setIsPickingNFTs(true)}
                   className="text-xs font-bold text-violet-600 bg-violet-50 dark:bg-violet-900/30 px-4 py-2 rounded-xl hover:bg-violet-100 transition"
                 >
                   + Add NFTs
                 </button>
               )}
            </div>
            
            <Grid 
              nfts={profile.showcase_nfts || []}
              isOwner={isOwner}
              borderStyle={profile.border_style}
            />
         </div>

         {/* --- FLOATING ACTION BAR (The "Nice" Feature) --- */}
         <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-2 py-2 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200 dark:border-stone-800 rounded-full shadow-2xl shadow-stone-500/20">
             <button 
               onClick={handleShare}
               className="flex items-center gap-2 px-6 py-3 bg-stone-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-sm hover:scale-105 transition"
             >
               <span>Share Profile</span>
               {/* Share Icon */}
               <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 9v8c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2h4v2H6v8h12v-8h-4v-2h4c1.1 0 2 .9 2 2z"/></svg>
             </button>
             
             {isOwner && (
               <button 
                 onClick={() => setIsEditingProfile(true)}
                 className="p-3 bg-stone-100 dark:bg-stone-800 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-200 transition"
                 aria-label="Settings"
               >
                 {/* Pencil/Edit Icon */}
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
               </button>
             )}
         </div>

         {/* --- MODALS --- */}
         
         {/* 1. Theme/Bio Editor */}
         {isEditingProfile && (
            <div className="fixed inset-0 bg-white dark:bg-stone-900 z-50 flex flex-col animate-in slide-in-from-bottom-10">
               <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
                  <h2 className="text-xl font-bold">Edit Profile</h2>
                  <button onClick={() => setIsEditingProfile(false)} className="font-bold text-stone-500">Done</button>
               </div>
               <div className="p-6 space-y-6 overflow-y-auto flex-1 pb-20">
                  <ThemePicker 
                    currentTheme={profile.theme_color || 'violet'}
                    currentBorder={profile.border_style || 'rounded-3xl'}
                    onUpdate={updateProfile}
                  />
                  <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-stone-400 uppercase block mb-1">Display Name</label>
                        <input 
                          value={profile.display_name || ''} 
                          onChange={e => updateProfile({ display_name: e.target.value })} 
                          className="w-full p-3 bg-stone-100 dark:bg-stone-800 rounded-xl outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-400 uppercase block mb-1">Bio</label>
                        <textarea 
                          value={profile.bio || ''} 
                          onChange={e => updateProfile({ bio: e.target.value })} 
                          className="w-full p-3 bg-stone-100 dark:bg-stone-800 rounded-xl h-24 outline-none resize-none" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-400 uppercase block mb-1">Banner Image URL</label>
                        <input 
                          value={profile.banner_url || ''} 
                          onChange={e => updateProfile({ banner_url: e.target.value })} 
                          placeholder="https://..."
                          className="w-full p-3 bg-stone-100 dark:bg-stone-800 rounded-xl outline-none text-sm" 
                        />
                      </div>
                   </div>
               </div>
            </div>
         )}

         {/* 2. NFT Picker */}
         {isPickingNFTs && profile.custody_address && (
            <NFTPicker 
               walletAddress={profile.custody_address} 
               currentSelection={profile.showcase_nfts || []}
               onClose={() => setIsPickingNFTs(false)}
               onUpdate={(newNFTs) => {
                  updateProfile({ showcase_nfts: newNFTs });
               }}
            />
         )}
      </div>
    );
  }

  return <Loading />;
}