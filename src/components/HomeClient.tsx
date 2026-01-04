"use client";
import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { LandingPage } from './LandingPage';
import { Grid } from './Grid';
import { NFTPicker } from './NFTPicker'; 

export default function HomeClient() {
  const { profile, remoteUser, isLoading, isOwner, login, createAccount, updateProfile, hasClickedConnect } = useProfile();
  const [isEdit, setIsEdit] = useState(false);
  const [isNFT, setIsNFT] = useState(false);

  if (isLoading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-white">Loading...</div>;
  if (!profile && (!hasClickedConnect || !remoteUser)) return <LandingPage onLogin={login} />;
  
  if (!profile && remoteUser && hasClickedConnect) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center p-10 text-center">
        <img src={remoteUser.pfpUrl} className="w-24 h-24 rounded-full mb-4 border-4 border-violet-500" />
        <h1 className="text-2xl font-bold mb-6">Welcome @{remoteUser.username}</h1>
        <button onClick={createAccount} className="bg-white text-black px-8 py-3 rounded-full font-bold">Create Profile</button>
      </div>
    );
  }

  if (profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-950 pb-40">
        {/* BANNER */}
        <div className="h-40 bg-gradient-to-r from-violet-600 to-indigo-600 relative">
          {profile.banner_url && <img src={profile.banner_url} className="w-full h-full object-cover" />}
        </div>

        {/* PROFILE HEADER - Fixed the "Cut Off" issue */}
        <div className="px-6 relative z-20"> 
          <div className="-mt-12 mb-4 relative">
            <img src={profile.pfp_url} className="w-24 h-24 rounded-full border-4 border-white dark:border-stone-950 bg-stone-200 object-cover shadow-lg" />
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black">{profile.display_name}</h1>
              <p className="text-stone-500 text-sm font-bold">@{profile.username}</p>
            </div>
            {isOwner && (
              <button onClick={() => setIsEdit(true)} className="bg-stone-100 dark:bg-stone-800 px-4 py-2 rounded-xl text-xs font-bold">Edit Profile</button>
            )}
          </div>
          {profile.bio && <p className="mt-4 text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-sm">{profile.bio}</p>}
        </div>

        {/* YOUR PROJECTS */}
        <div className="mt-10 px-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4">Your Projects</h3>
          <div className="grid gap-3">
            {profile.custom_links?.map((link: any, i: number) => (
              <a key={i} href={link.url} target="_blank" className="p-4 bg-stone-50 dark:bg-stone-900 border rounded-2xl flex justify-between items-center group">
                <span className="font-bold text-sm tracking-tight">{link.title}</span>
                <span className="text-stone-300 group-hover:text-black transition-colors">→</span>
              </a>
            ))}
            {isOwner && profile.custom_links?.length === 0 && (
                <button onClick={() => setIsEdit(true)} className="p-4 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 text-xs font-bold">+ Add Project Links</button>
            )}
          </div>
        </div>

        {/* NFT GALLERY */}
        <div className="mt-12 px-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">NFT Showcase</h3>
            {isOwner && <button onClick={() => setIsNFT(true)} className="text-[10px] font-black bg-violet-600 text-white px-3 py-1 rounded-full uppercase">Edit Gallery</button>}
          </div>
          <Grid nfts={profile.showcase_nfts || []} isOwner={isOwner} />
        </div>

        {/* FLOATING ACTION BAR */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-stone-950/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl z-50">
           <button onClick={() => {
              const shareUrl = `${window.location.origin}?fid=${profile.fid}`;
              window.open(`https://warpcast.com/~/compose?text=Check out my home!&embeds[]=${encodeURIComponent(shareUrl)}`, '_blank');
           }} className="px-8 py-3 bg-white text-black rounded-full font-black text-xs uppercase">Share Profile</button>
        </div>

        {/* THE INTEGRATED EDITOR MODAL */}
        {isEdit && (
          <div className="fixed inset-0 bg-white dark:bg-stone-950 z-[100] p-6 overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black uppercase tracking-tighter">Profile Settings</h2>
              <button onClick={() => setIsEdit(false)} className="text-violet-600 font-bold">Done</button>
            </div>
            
            <div className="space-y-8">
               {/* Link Management Section */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-stone-400">Manage Links</label>
                    <button onClick={() => updateProfile({ custom_links: [...(profile.custom_links || []), { title: '', url: '' }] })} className="text-[10px] font-black text-violet-600 uppercase">+ Add</button>
                  </div>
                  {profile.custom_links?.map((link: any, idx: number) => (
                    <div key={idx} className="p-4 bg-stone-100 dark:bg-stone-800 rounded-2xl relative">
                       <input placeholder="Title" value={link.title} className="w-full bg-transparent font-bold mb-1 outline-none" onChange={(e) => {
                          const nl = [...profile.custom_links]; nl[idx].title = e.target.value; updateProfile({ custom_links: nl });
                       }} />
                       <input placeholder="URL" value={link.url} className="w-full bg-transparent text-xs text-stone-500 outline-none" onChange={(e) => {
                          const nl = [...profile.custom_links]; nl[idx].url = e.target.value; updateProfile({ custom_links: nl });
                       }} />
                       <button onClick={() => {
                          const nl = profile.custom_links.filter((_:any, i:number) => i !== idx); updateProfile({ custom_links: nl });
                       }} className="absolute top-2 right-2 text-stone-400">✕</button>
                    </div>
                  ))}
               </div>

               {/* Bio/Info Section */}
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-stone-400">Info</label>
                  <input placeholder="Display Name" value={profile.display_name} onChange={e => updateProfile({display_name: e.target.value})} className="w-full p-4 bg-stone-100 dark:bg-stone-800 rounded-2xl outline-none" />
                  <textarea placeholder="Bio" value={profile.bio} onChange={e => updateProfile({bio: e.target.value})} className="w-full p-4 bg-stone-100 dark:bg-stone-800 rounded-2xl h-32 outline-none resize-none" />
                  <input placeholder="Banner URL" value={profile.banner_url || ''} onChange={e => updateProfile({banner_url: e.target.value})} className="w-full p-4 bg-stone-100 dark:bg-stone-800 rounded-2xl outline-none" />
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