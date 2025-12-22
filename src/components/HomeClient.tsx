"use client";

import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { LandingPage } from './LandingPage';
import { Grid } from './Grid';
import { ThemePicker } from './ThemePicker';
import { NFTPicker } from './NFTPicker'; 

const THEME_GRADIENTS: Record<string, string> = {
  violet: 'from-violet-600 to-indigo-600',
  blue: 'from-blue-500 to-cyan-500',
  emerald: 'from-emerald-500 to-teal-500',
  rose: 'from-rose-500 to-pink-500',
  amber: 'from-amber-500 to-orange-500',
  stone: 'from-stone-600 to-stone-800',
};

export default function HomeClient() {
  const { profile, remoteUser, isLoading, isOwner, login, createAccount, updateProfile } = useProfile();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isPickingNFTs, setIsPickingNFTs] = useState(false);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-stone-950"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>;
  if (!profile && !remoteUser) return <LandingPage onLogin={login} />;
  
  // Account Creation State
  if (!profile && remoteUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-stone-950 text-white">
        <h2 className="text-3xl font-bold mb-2">Welcome!</h2>
        <p className="text-stone-400 mb-8">Ready to create your profile?</p>
        <button onClick={createAccount} className="bg-white text-black px-10 py-4 rounded-full font-bold">Create Profile</button>
      </div>
    );
  }

  if (profile) {
    const themeGradient = THEME_GRADIENTS[profile.theme_color || 'violet'];

    const handleShare = () => {
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}?fid=${profile.fid}`;
      const text = `Check out my Onchain Home! 🏠`;
      const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(shareUrl)}`;
      window.open(warpcastUrl, '_blank');
    };

    return (
      <div className={`min-h-screen pb-32 bg-white dark:bg-stone-950 text-stone-900 dark:text-white theme-${profile.theme_color}`}>
        
        {/* Banner */}
        <div className={`h-40 w-full bg-gradient-to-r ${themeGradient} relative`}>
          {profile.banner_url && <img src={profile.banner_url} className="w-full h-full object-cover opacity-80" />}
        </div>

        {/* Profile Header */}
        <div className="px-6 -mt-12 relative z-10">
          <img src={profile.pfp_url || ''} className="w-24 h-24 rounded-full border-4 border-white dark:border-stone-950 bg-stone-200" />
          <div className="mt-4">
            <h1 className="text-2xl font-black">{profile.display_name}</h1>
            <p className="text-stone-500 font-medium text-sm">@{profile.username}</p>
            {profile.bio && <p className="mt-4 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{profile.bio}</p>}
          </div>
        </div>

        {/* Your Projects (Restored) */}
        {profile.custom_links && profile.custom_links.length > 0 && (
          <div className="mt-10 px-6">
            <h3 className="text-lg font-bold mb-4">Your Projects</h3>
            <div className="grid gap-3">
              {profile.custom_links.map((link: any, i: number) => (
                <a key={i} href={link.url} target="_blank" className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${themeGradient} flex items-center justify-center text-white font-bold`}>
                    {link.title[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{link.title}</p>
                    <p className="text-[10px] text-stone-500 truncate">{link.url}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* NFT Gallery */}
        <div className="mt-10">
          <div className="px-6 flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">NFT Gallery</h3>
            {isOwner && (
              <button onClick={() => setIsPickingNFTs(true)} className="text-xs font-bold text-violet-600">+ Edit</button>
            )}
          </div>
          <Grid nfts={profile.showcase_nfts || []} isOwner={isOwner} borderStyle={profile.border_style} />
        </div>

        {/* THE FLOATING ACTION BAR (Restored) */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-stone-200 dark:border-stone-800 rounded-full shadow-2xl">
          <button onClick={handleShare} className="px-8 py-3 bg-stone-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-sm hover:scale-105 transition">
            Share Profile
          </button>
          {isOwner && (
            <button onClick={() => setIsEditingProfile(true)} className="p-3 bg-stone-100 dark:bg-stone-800 rounded-full text-stone-600 dark:text-stone-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
          )}
        </div>

        {/* Modals (Editing logic stays same as last version) */}
        {isEditingProfile && (
           <div className="fixed inset-0 bg-white dark:bg-stone-900 z-[60] p-6 overflow-y-auto">
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-bold">Edit Profile</h2>
               <button onClick={() => setIsEditingProfile(false)} className="font-bold text-violet-600">Done</button>
             </div>
             <ThemePicker currentTheme={profile.theme_color} currentBorder={profile.border_style} onUpdate={updateProfile} />
             {/* ... link editing inputs ... */}
           </div>
        )}

        {isPickingNFTs && (
          <NFTPicker walletAddress={profile.custody_address} currentSelection={profile.showcase_nfts} onClose={() => setIsPickingNFTs(false)} onUpdate={(nfts) => updateProfile({ showcase_nfts: nfts })} />
        )}
      </div>
    );
  }
  return null;
}