"use client";

import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { LandingPage } from './LandingPage';
import { Grid } from './Grid';
import { ThemePicker } from './ThemePicker';
import { NFTPicker } from './NFTPicker'; 

export default function HomeClient() {
  const { profile, remoteUser, isLoading, isOwner, login, createAccount, updateProfile } = useProfile();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isPickingNFTs, setIsPickingNFTs] = useState(false);

  if (isLoading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>;
  
  // 1. Landing Page (If no profile and not logged in)
  if (!profile && !remoteUser) return <LandingPage onLogin={login} />;

  // 2. Create Profile Page (If logged in but no DB entry)
  if (!profile && remoteUser) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome @{remoteUser.username}</h1>
        <button onClick={createAccount} className="px-8 py-3 bg-white text-black rounded-full font-bold shadow-lg">Create My Gallery</button>
      </div>
    );
  }

  // 3. Main Profile View
  if (profile) {
    const handleShare = () => {
      const shareUrl = `${window.location.origin}?fid=${profile.fid}`;
      const warpcastUrl = `https://warpcast.com/~/compose?text=Check out my Gallery!&embeds[]=${encodeURIComponent(shareUrl)}`;
      window.open(warpcastUrl, '_blank');
    };

    return (
      <div className="min-h-screen bg-white dark:bg-stone-950 pb-32">
        {/* Banner & PFP */}
        <div className="h-40 bg-gradient-to-r from-violet-600 to-indigo-600 relative">
          {profile.banner_url && <img src={profile.banner_url} className="w-full h-full object-cover" />}
          <div className="absolute -bottom-12 left-6">
            <img src={profile.pfp_url || ''} className="w-24 h-24 rounded-full border-4 border-white dark:border-stone-950 bg-stone-200" />
          </div>
        </div>

        <div className="mt-16 px-6">
          <h1 className="text-2xl font-bold">{profile.display_name}</h1>
          <p className="text-stone-500">@{profile.username}</p>
          <p className="mt-4 text-stone-600 dark:text-stone-400">{profile.bio}</p>
        </div>

        {/* Your Projects Section */}
        {profile.custom_links && profile.custom_links.length > 0 && (
          <div className="mt-10 px-6">
            <h3 className="font-bold mb-4">Your Projects</h3>
            <div className="grid gap-3">
              {profile.custom_links.map((link: any, i: number) => (
                <a key={i} href={link.url} target="_blank" className="p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 flex justify-between items-center">
                  <span className="font-bold">{link.title}</span>
                  <span className="text-stone-400">→</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* NFT Gallery Section */}
        <div className="mt-10">
          <div className="px-6 flex justify-between items-center mb-4">
            <h3 className="font-bold">NFT Gallery</h3>
            {isOwner && <button onClick={() => setIsPickingNFTs(true)} className="text-violet-600 font-bold text-sm">+ Edit</button>}
          </div>
          <Grid nfts={profile.showcase_nfts || []} isOwner={isOwner} />
        </div>

        {/* Floating Bar */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border rounded-full shadow-2xl z-50">
          <button onClick={handleShare} className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-sm">Share Profile</button>
          {isOwner && (
            <button onClick={() => setIsEditingProfile(true)} className="p-3 bg-stone-100 dark:bg-stone-800 rounded-full">⚙️</button>
          )}
        </div>

        {/* Modals */}
        {isEditingProfile && (
          <div className="fixed inset-0 bg-white dark:bg-stone-950 z-[100] p-6 overflow-y-auto">
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-bold">Edit Profile</h2>
               <button onClick={() => setIsEditingProfile(false)} className="text-violet-600 font-bold">Done</button>
             </div>
             {/* Text Inputs */}
             <div className="space-y-4">
               <input placeholder="Display Name" value={profile.display_name} onChange={e => updateProfile({display_name: e.target.value})} className="w-full p-4 bg-stone-100 dark:bg-stone-800 rounded-2xl" />
               <textarea placeholder="Bio" value={profile.bio} onChange={e => updateProfile({bio: e.target.value})} className="w-full p-4 bg-stone-100 dark:bg-stone-800 rounded-2xl h-32" />
             </div>
          </div>
        )}

        {isPickingNFTs && (
          <NFTPicker walletAddress={profile.custody_address} currentSelection={profile.showcase_nfts} onClose={() => setIsPickingNFTs(false)} onUpdate={nfts => updateProfile({showcase_nfts: nfts})} />
        )}
      </div>
    );
  }
  return null;
}