"use client";
import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { LandingPage } from './LandingPage';
import { Grid } from './Grid';
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
  const { profile, remoteUser, isLoading, isOwner, login, createAccount, updateProfile, hasClickedConnect } = useProfile();
  const [isEdit, setIsEdit] = useState(false);
  const [isNFT, setIsNFT] = useState(false);

  if (isLoading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-white font-black uppercase">Loading...</div>;
  if (!profile && (!hasClickedConnect || !remoteUser)) return <LandingPage onLogin={login} />;
  
  if (!profile && remoteUser && hasClickedConnect) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center p-10 text-center">
        <img src={remoteUser.pfpUrl} className="w-24 h-24 rounded-full mb-4 border-4 border-violet-500 shadow-2xl" />
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-6">Welcome @{remoteUser.username}</h1>
        <button onClick={createAccount} className="bg-white text-black px-10 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition">Create Profile</button>
      </div>
    );
  }

  if (profile) {
    const themeGradient = THEME_GRADIENTS[profile.theme_color || 'violet'];

    return (
      <div className={`min-h-screen bg-white dark:bg-stone-950 pb-40 theme-${profile.theme_color}`}>
        {/* BANNER AREA */}
        <div className={`h-48 w-full relative overflow-hidden bg-gradient-to-r ${themeGradient}`}>
          {profile.banner_url && (
            <img src={profile.banner_url} className="w-full h-full object-cover opacity-90" alt="banner" />
          )}
          {isOwner && (
            <button onClick={() => setIsEdit(true)} className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Edit Banner</button>
          )}
        </div>

        {/* PROFILE CONTENT */}
        <div className="px-6 relative">
          {/* PFP - Layered correctly to stop cutoff */}
          <div className="relative z-30 -mt-14 inline-block">
            <img 
                src={profile.pfp_url} 
                className="w-28 h-28 rounded-3xl border-4 border-white dark:border-stone-950 bg-stone-200 object-cover shadow-2xl" 
                alt="pfp"
            />
          </div>

          <div className="mt-4 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase">{profile.display_name}</h1>
              <p className="text-stone-500 text-xs font-bold uppercase tracking-widest">@{profile.username}</p>
            </div>
            {isOwner && (
              <button onClick={() => setIsEdit(true)} className="p-2 bg-stone-100 dark:bg-stone-800 rounded-xl">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </button>
            )}
          </div>
          {profile.bio && <p className="mt-4 text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-medium max-w-sm">{profile.bio}</p>}
        </div>

        {/* PROJECTS SECTION */}
        <div className="mt-12 px-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-6">Project Links</h3>
          <div className="grid gap-3">
            {profile.custom_links?.map((link: any, i: number) => (
              <a key={i} href={link.url} target="_blank" className="p-5 bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl flex justify-between items-center group active:scale-95 transition-all">
                <span className="font-bold tracking-tight">{link.title || "Untitled"}</span>
                <span className="text-stone-300 group-hover:translate-x-1 transition-all">→</span>
              </a>
            ))}
            {isOwner && (profile.custom_links?.length || 0) < 5 && (
              <button onClick={() => setIsEdit(true)} className="p-5 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl text-stone-400 text-xs font-bold uppercase tracking-widest hover:border-stone-400 transition-colors">
                + Add Project Link
              </button>
            )}
          </div>
        </div>

        {/* NFT GALLERY */}
        <div className="mt-14 px-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Digital Collectibles</h3>
            {isOwner && <button onClick={() => setIsNFT(true)} className="text-[10px] font-black bg-violet-600 text-white px-4 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-violet-500/20">Edit Gallery</button>}
          </div>
          <Grid nfts={profile.showcase_nfts || []} isOwner={isOwner} borderStyle={profile.border_style} />
        </div>

        {/* FLOATING ACTION BAR */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-stone-950/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl z-50">
           <button onClick={() => {
              const shareUrl = `${window.location.origin}?fid=${profile.fid}`;
              window.open(`https://warpcast.com/~/compose?text=Check out my onchain home!&embeds[]=${encodeURIComponent(shareUrl)}`, '_blank');
           }} className="px-8 py-3 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest">Share Profile</button>
        </div>

        {/* INTEGRATED EDITOR */}
        {isEdit && (
          <div className="fixed inset-0 bg-white dark:bg-stone-950 z-[100] p-6 overflow-y-auto animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black uppercase tracking-tighter italic underline decoration-violet-500">Edit Settings</h2>
              <button onClick={() => setIsEdit(false)} className="text-violet-600 font-black uppercase tracking-widest text-sm">Close</button>
            </div>
            
            <div className="space-y-10 pb-20">
               {/* Bio/Info */}
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Identity</label>
                  <input placeholder="Display Name" value={profile.display_name} onChange={e => updateProfile({display_name: e.target.value})} className="w-full p-4 bg-stone-100 dark:bg-stone-800 rounded-2xl outline-none font-bold" />
                  <textarea placeholder="Bio" value={profile.bio} onChange={e => updateProfile({bio: e.target.value})} className="w-full p-4 bg-stone-100 dark:bg-stone-800 rounded-2xl h-32 outline-none resize-none font-medium text-sm" />
                  <input placeholder="Banner URL" value={profile.banner_url || ''} onChange={e => updateProfile({banner_url: e.target.value})} className="w-full p-4 bg-stone-100 dark:bg-stone-800 rounded-2xl outline-none text-xs text-stone-500" />
               </div>

               {/* Links */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Projects</label>
                    <button onClick={() => updateProfile({ custom_links: [...(profile.custom_links || []), { title: '', url: '' }] })} className="text-[10px] font-black text-violet-600 uppercase tracking-widest">+ Add New</button>
                  </div>
                  {profile.custom_links?.map((link: any, idx: number) => (
                    <div key={idx} className="p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl relative">
                       <input placeholder="Title" value={link.title} className="w-full bg-transparent font-bold mb-1 outline-none text-sm" onChange={(e) => {
                          const nl = [...profile.custom_links]; nl[idx].title = e.target.value; updateProfile({ custom_links: nl });
                       }} />
                       <input placeholder="URL" value={link.url} className="w-full bg-transparent text-xs text-stone-500 outline-none" onChange={(e) => {
                          const nl = [...profile.custom_links]; nl[idx].url = e.target.value; updateProfile({ custom_links: nl });
                       }} />
                       <button onClick={() => {
                          const nl = profile.custom_links.filter((_:any, i:number) => i !== idx); updateProfile({ custom_links: nl });
                       }} className="absolute top-2 right-2 text-stone-400 p-2">✕</button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {isNFT && (
          <NFTPicker walletAddress={profile.custody_address} currentSelection={profile.showcase_nfts} onClose={() => setIsNFT(false)} onUpdate={nfts => updateProfile({showcase_nfts: nfts})} />
        )}
      </div>
    );
  }
  return null;
}