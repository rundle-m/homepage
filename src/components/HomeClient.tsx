"use client";

import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { LandingPage } from './LandingPage';
import { Grid } from './Grid';
import { ThemePicker } from './ThemePicker';
import { NFTPicker } from './NFTPicker'; 

export default function HomeClient() {
  const { 
    profile, remoteUser, isLoading, isOwner, 
    login, createAccount, updateProfile, hasClickedConnect 
  } = useProfile();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isPickingNFTs, setIsPickingNFTs] = useState(false);

  // 1. LOADING
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. LANDING PAGE
  // Show if: No profile exists AND (User hasn't clicked connect OR we don't have user info)
  if (!profile && (!hasClickedConnect || !remoteUser)) {
    return <LandingPage onLogin={login} />;
  }

  // 3. CREATE PROFILE / WELCOME SCREEN
  // Show if: Logged in (clicked connect) but doesn't have a profile in the DB yet
  if (!profile && remoteUser && hasClickedConnect) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-stone-950 text-white p-6 text-center overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-md mx-auto space-y-6 animate-in fade-in zoom-in duration-700">
           <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur opacity-50 animate-pulse"></div>
              <img 
                src={remoteUser.pfpUrl || ""} 
                className="relative w-28 h-28 rounded-full border-4 border-stone-950 bg-stone-900 object-cover"
                alt="Your PFP" 
              />
           </div>

           <div className="space-y-2">
             <h1 className="text-3xl font-black italic tracking-tighter uppercase">Welcome</h1>
             <p className="text-violet-400 text-xl font-bold italic lowercase tracking-tight">@{remoteUser.username}</p>
           </div>
           
           <p className="text-stone-400 text-lg leading-snug">
             Ready to claim your spot on the network? Create your profile to start curating.
           </p>
           
           <button 
             onClick={createAccount}
             className="w-full py-4 bg-white text-stone-950 rounded-2xl font-black text-xl uppercase tracking-tighter shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] hover:scale-[1.02] transition-transform active:scale-95"
           >
             Create My Home
           </button>
        </div>
      </div>
    );
  }

  // 4. MAIN PROFILE VIEW
  if (profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-950 pb-32">
        {/* Banner */}
        <div className="h-48 bg-stone-100 dark:bg-stone-900 relative overflow-hidden">
          {profile.banner_url ? (
            <img src={profile.banner_url} className="w-full h-full object-cover" alt="banner" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-800 dark:to-stone-900`} />
          )}
          
          <div className="absolute -bottom-14 left-6 z-10">
            <img src={profile.pfp_url || ""} className="w-28 h-28 rounded-3xl border-4 border-white dark:border-stone-950 bg-stone-200 object-cover" alt="pfp" />
          </div>
        </div>

        {/* Profile Identity */}
        <div className="mt-16 px-6 space-y-1">
          <h1 className="text-3xl font-black tracking-tight">{profile.display_name}</h1>
          <p className="text-stone-500 font-bold uppercase tracking-widest text-[10px]">@{profile.username}</p>
          {profile.bio && <p className="mt-4 text-stone-600 dark:text-stone-300 max-w-sm">{profile.bio}</p>}
        </div>

        {/* Links Section */}
        {profile.custom_links && profile.custom_links.length > 0 && (
          <div className="mt-10 px-6">
            <h3 className="font-black uppercase tracking-tighter text-stone-400 text-xs mb-4">Your Projects</h3>
            <div className="grid gap-3">
              {profile.custom_links.map((link: any, i: number) => (
                <a key={i} href={link.url} target="_blank" className="p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 flex justify-between items-center group">
                  <span className="font-bold text-sm tracking-tight">{link.title}</span>
                  <span className="text-stone-400 group-hover:translate-x-1 transition-transform">→</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* NFT Gallery */}
        <div className="mt-12">
          <div className="px-6 flex justify-between items-center mb-6">
            <h3 className="font-black uppercase tracking-tighter text-stone-400 text-xs">NFT Showcase</h3>
            {isOwner && (
              <button onClick={() => setIsPickingNFTs(true)} className="text-[10px] font-black uppercase tracking-widest bg-violet-600 text-white px-3 py-1 rounded-full">
                Edit
              </button>
            )}
          </div>
          <Grid nfts={profile.showcase_nfts || []} isOwner={isOwner} borderStyle={profile.border_style} />
        </div>

        {/* Floating Controls */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-stone-950/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl z-50">
           <button 
             onClick={() => {
                const shareUrl = `${window.location.origin}?fid=${profile.fid}`;
                const text = `Check out my home!`;
                window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(shareUrl)}`, '_blank');
             }} 
             className="px-6 py-3 bg-white text-black rounded-full font-black text-xs uppercase tracking-tighter"
           >
             Share Profile
           </button>
           {isOwner && (
             <button onClick={() => setIsEditingProfile(true)} className="p-3 bg-stone-800 rounded-full text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
             </button>
           )}
        </div>

        {/* Simple Edit Modal (Included for completeness) */}
        {isEditingProfile && (
           <div className="fixed inset-0 bg-white dark:bg-stone-950 z-[100] p-6 overflow-y-auto animate-in slide-in-from-bottom">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black tracking-tighter uppercase">Settings</h2>
                <button onClick={() => setIsEditingProfile(false)} className="text-violet-600 font-bold">Done</button>
              </div>
              <div className="space-y-6">
                <ThemePicker currentTheme={profile.theme_color} currentBorder={profile.border_style} onUpdate={updateProfile} />
                <div className="space-y-4">
                  <input placeholder="Name" value={profile.display_name} onChange={e => updateProfile({display_name: e.target.value})} className="w-full p-4 bg-stone-100 dark:bg-stone-800 rounded-2xl outline-none" />
                  <textarea placeholder="Bio" value={profile.bio} onChange={e => updateProfile({bio: e.target.value})} className="w-full p-4 bg-stone-100 dark:bg-stone-800 rounded-2xl h-32 outline-none" />
                </div>
              </div>
           </div>
        )}

        {isPickingNFTs && (
          <NFTPicker 
            walletAddress={profile.custody_address} 
            currentSelection={profile.showcase_nfts} 
            onClose={() => setIsPickingNFTs(false)} 
            onUpdate={nfts => updateProfile({showcase_nfts: nfts})} 
          />
        )}
      </div>
    );
  }

  return null;
}