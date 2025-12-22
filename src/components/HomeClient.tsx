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

  if (isLoading) return <Loading />;
  if (!profile && !remoteUser) return <LandingPage onLogin={login} />;

  if (!profile && remoteUser) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
           <h2 className="text-3xl font-bold mb-2">Welcome, {remoteUser.username}!</h2>
           <button onClick={createAccount} className="bg-violet-600 text-white px-8 py-3 rounded-full font-bold shadow-xl mt-4">
             Create Profile
           </button>
        </div>
     );
  }

  if (profile) {
    const themeGradient = THEME_GRADIENTS[profile.theme_color || 'violet'] || THEME_GRADIENTS.violet;
    
    const handleShare = () => {
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}?fid=${profile.fid}`;
      const text = `Check out my Onchain Home! 🏠`;
      const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(shareUrl)}`;
      window.open(warpcastUrl, '_blank');
    };

    // Helper to update a single link in the array
    const updateLink = (index: number, field: 'title' | 'url', value: string) => {
        const newLinks = [...(profile.custom_links || [])];
        newLinks[index] = { ...newLinks[index], [field]: value };
        updateProfile({ custom_links: newLinks });
    };

    // Helper to add a new empty link
    const addLink = () => {
        const newLinks = [...(profile.custom_links || []), { title: '', url: '' }];
        updateProfile({ custom_links: newLinks });
    };

    // Helper to remove a link
    const removeLink = (index: number) => {
        const newLinks = profile.custom_links?.filter((_, i) => i !== index);
        updateProfile({ custom_links: newLinks });
    };

    return (
      <div className={`min-h-screen pb-32 bg-white dark:bg-stone-950 text-stone-900 dark:text-white theme-${profile.theme_color || 'violet'}`}>
         
         {/* BANNER HEADER */}
         <div className="relative">
             <div className="h-48 w-full overflow-hidden relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${themeGradient}`} />
                {profile.banner_url && <img src={profile.banner_url} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-90" />}
             </div>
         </div>

         {/* PROFILE INFO */}
         <div className="px-6 relative z-10">
             <div className="-mt-16 mb-4">
               <div className="inline-block p-1.5 bg-white dark:bg-stone-950 rounded-full">
                  <img src={profile.pfp_url || ""} alt={profile.username} className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-stone-900" />
               </div>
             </div>
             <div className="mb-8">
               <h1 className="text-3xl font-black mb-1">{profile.display_name}</h1>
               <p className="text-stone-500 font-medium">@{profile.username}</p>
               {profile.bio && <p className="mt-4 text-stone-600 dark:text-stone-300 leading-relaxed max-w-lg">{profile.bio}</p>}
             </div>
         </div>

         {/* --- 🚀 YOUR PROJECTS SECTION (RESTORED!) --- */}
         {profile.custom_links && profile.custom_links.length > 0 && (
            <div className="mt-4 px-6 mb-10">
                <h3 className="font-bold text-xl mb-4">Your Projects</h3>
                <div className="grid gap-3">
                    {profile.custom_links.map((link: any, index: number) => (
                        <a 
                            key={index} 
                            href={link.url.startsWith('http') ? link.url : `https://${link.url}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${themeGradient} flex items-center justify-center text-white font-bold`}>
                                    {link.title ? link.title.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{link.title || 'Untitled Project'}</p>
                                    <p className="text-xs text-stone-500 truncate max-w-[200px]">{link.url || 'No URL'}</p>
                                </div>
                            </div>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-300 group-hover:text-stone-600 dark:group-hover:text-white transition-colors">
                                <path d="M7 17l10-10M7 7h10v10"/>
                            </svg>
                        </a>
                    ))}
                </div>
            </div>
         )}

         {/* SHOWCASE SECTION */}
         <div className="mt-2">
            <div className="px-6 flex justify-between items-end mb-6">
               <h3 className="font-bold text-xl">NFT Gallery</h3>
               {isOwner && (
                 <button onClick={() => setIsPickingNFTs(true)} className="text-xs font-bold text-violet-600 bg-violet-50 dark:bg-violet-900/30 px-4 py-2 rounded-xl hover:bg-violet-100 transition">
                   + Edit Gallery
                 </button>
               )}
            </div>
            <Grid nfts={profile.showcase_nfts || []} isOwner={isOwner} borderStyle={profile.border_style} />
         </div>

         {/* FLOATING ACTION BAR */}
         <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-2 py-2 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200 dark:border-stone-800 rounded-full shadow-2xl">
             <button onClick={handleShare} className="flex items-center gap-2 px-6 py-3 bg-stone-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-sm hover:scale-105 transition">
               <span>Share Profile</span>
               <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 9v8c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2h4v2H6v8h12v-8h-4v-2h4c1.1 0 2 .9 2 2z"/></svg>
             </button>
             {isOwner && (
               <button onClick={() => setIsEditingProfile(true)} className="p-3 bg-stone-100 dark:bg-stone-800 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-200 transition">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
               </button>
             )}
         </div>

         {/* EDIT PROFILE MODAL */}
         {isEditingProfile && (
            <div className="fixed inset-0 bg-white dark:bg-stone-900 z-50 flex flex-col animate-in slide-in-from-bottom-10">
               <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
                  <h2 className="text-xl font-bold">Edit Profile</h2>
                  <button onClick={() => setIsEditingProfile(false)} className="font-bold text-violet-600">Done</button>
               </div>
               <div className="p-6 space-y-8 overflow-y-auto flex-1 pb-32">
                  <ThemePicker currentTheme={profile.theme_color || 'violet'} currentBorder={profile.border_style || 'rounded-3xl'} onUpdate={updateProfile} />
                  
                  {/* --- 🔗 LINKS EDITOR SECTION (RESTORED!) --- */}
                  <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Your Projects</label>
                        <button onClick={addLink} className="text-xs font-bold text-violet-600">+ Add Link</button>
                      </div>
                      <div className="space-y-3">
                        {profile.custom_links?.map((link: any, idx: number) => (
                            <div key={idx} className="p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl relative border border-stone-100 dark:border-stone-700">
                                <button onClick={() => removeLink(idx)} className="absolute top-2 right-2 text-stone-400 hover:text-red-500">✕</button>
                                <div className="space-y-3">
                                    <input 
                                        placeholder="Project Name" 
                                        value={link.title} 
                                        onChange={e => updateLink(idx, 'title', e.target.value)} 
                                        className="w-full bg-transparent font-bold outline-none text-sm"
                                    />
                                    <input 
                                        placeholder="URL (e.g. google.com)" 
                                        value={link.url} 
                                        onChange={e => updateLink(idx, 'url', e.target.value)} 
                                        className="w-full bg-transparent text-xs text-stone-500 outline-none"
                                    />
                                </div>
                            </div>
                        ))}
                      </div>
                  </div>

                  <div className="space-y-4">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Personal Info</label>
                      <input placeholder="Display Name" value={profile.display_name || ''} onChange={e => updateProfile({ display_name: e.target.value })} className="w-full p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl outline-none" />
                      <textarea placeholder="Bio" value={profile.bio || ''} onChange={e => updateProfile({ bio: e.target.value })} className="w-full p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl h-24 outline-none resize-none" />
                      <input placeholder="Banner Image URL" value={profile.banner_url || ''} onChange={e => updateProfile({ banner_url: e.target.value })} className="w-full p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl outline-none" />
                  </div>
               </div>
            </div>
         )}

         {/* NFT PICKER MODAL */}
         {isPickingNFTs && profile.custody_address && (
            <NFTPicker 
               walletAddress={profile.custody_address} 
               currentSelection={profile.showcase_nfts || []}
               onClose={() => setIsPickingNFTs(false)}
               onUpdate={(newNFTs) => updateProfile({ showcase_nfts: newNFTs })}
            />
         )}
      </div>
    );
  }

  return <Loading />;
}