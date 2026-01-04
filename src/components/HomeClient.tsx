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
  const { profile, remoteUser, isLoading, isOwner, login, createAccount, updateProfile, hasClickedConnect } = useProfile();
  const [isEdit, setIsEdit] = useState(false);
  const [isNFT, setIsNFT] = useState(false);

  if (isLoading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-white font-black uppercase tracking-widest">Loading...</div>;
  if (!profile && (!hasClickedConnect || !remoteUser)) return <LandingPage onLogin={login} />;
  
  if (!profile && remoteUser && hasClickedConnect) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center p-10 text-center">
        <img src={remoteUser.pfpUrl} className="w-24 h-24 rounded-full mb-4 border-4 border-violet-500 shadow-2xl" alt="PFP" />
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-6">Welcome @{remoteUser.username}</h1>
        <button onClick={createAccount} className="bg-white text-black px-10 py-4 rounded-full font-black uppercase tracking-widest">Create Profile</button>
      </div>
    );
  }

  if (profile) {
    const themeGradient = THEME_GRADIENTS[profile.theme_color || 'violet'];

    return (
      <div className={`min-h-screen bg-white dark:bg-stone-950 pb-40 theme-${profile.theme_color}`}>
        {/* MAIN VIEW BANNER */}
        <div className={`h-48 w-full relative overflow-hidden bg-gradient-to-r ${themeGradient}`}>
          {profile.banner_url && <img src={profile.banner_url} className="w-full h-full object-cover opacity-90" alt="banner" />}
        </div>

        {/* MAIN VIEW CONTENT */}
        <div className="px-6 relative">
          <div className="relative z-30 -mt-14 inline-block">
            <img src={profile.pfp_url} className="w-28 h-28 rounded-3xl border-4 border-white dark:border-stone-950 bg-stone-200 object-cover shadow-2xl" alt="pfp" />
          </div>

          <div className="mt-4 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase">{profile.display_name}</h1>
              <p className="text-stone-500 text-xs font-bold uppercase tracking-widest">@{profile.username}</p>
            </div>
            {isOwner && (
              <button 
                onClick={() => setIsEdit(true)} 
                className="px-5 py-2.5 bg-violet-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-500/30 active:scale-95 transition-all"
              >
                 Edit My Home
              </button>
            )}
          </div>
          {profile.bio && <p className="mt-4 text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-medium max-w-sm">{profile.bio}</p>}
        </div>

        {/* PROJECTS SECTION (Display only) */}
        {profile.custom_links && profile.custom_links.length > 0 && (
          <div className="mt-12 px-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-6">Project Links</h3>
            <div className="grid gap-3">
              {profile.custom_links.map((link: any, i: number) => (
                <a key={i} href={link.url} target="_blank" className="p-5 bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl flex justify-between items-center group">
                  <span className="font-bold tracking-tight">{link.title}</span>
                  <span className="text-stone-300 group-hover:text-violet-500 transition-all">→</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* NFT GALLERY (Display only) */}
        <div className="mt-14 px-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-6 italic">Digital Collectibles</h3>
          <Grid nfts={profile.showcase_nfts || []} isOwner={isOwner} borderStyle={profile.border_style} />
        </div>

        {/* FLOATING SHARE BAR */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center p-1.5 bg-stone-950/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl z-50">
           <button onClick={() => {
              const shareUrl = `${window.location.origin}?fid=${profile.fid}`;
              window.open(`https://warpcast.com/~/compose?text=Check out my home!&embeds[]=${encodeURIComponent(shareUrl)}`, '_blank');
           }} className="px-8 py-3 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest">Share My Home</button>
        </div>

        {/* 🛠️ THE SUPER MODAL: ALL EDITING OPTIONS HERE */}
        {isEdit && (
          <div className="fixed inset-0 bg-white dark:bg-stone-950 z-[100] p-6 overflow-y-auto animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">Settings</h2>
              <button onClick={() => setIsEdit(false)} className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-full font-black uppercase tracking-widest text-[10px]">Close</button>
            </div>
            
            <div className="space-y-12 pb-32">
               
               {/* SECTION 1: NFT GALLERY TRIGGER */}
               <div className="p-6 bg-violet-600 rounded-3xl text-white shadow-2xl shadow-violet-500/40">
                  <h3 className="font-black uppercase tracking-widest text-xs mb-2 italic">NFT Gallery</h3>
                  <p className="text-violet-100 text-sm mb-4">Select the pieces you want to feature on your profile.</p>
                  <button 
                    onClick={() => setIsNFT(true)} 
                    className="w-full py-3 bg-white text-violet-600 rounded-xl font-black uppercase tracking-widest text-xs"
                  >
                    Open NFT Picker
                  </button>
               </div>

               {/* SECTION 2: THEME & STYLE */}
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest italic">Theme & Aesthetics</label>
                  <ThemePicker 
                    currentTheme={profile.theme_color} 
                    currentBorder={profile.border_style} 
                    onUpdate={updateProfile} 
                  />
               </div>

               {/* SECTION 3: PROJECT LINKS */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest italic">Your Projects</label>
                    <button 
                        onClick={() => updateProfile({ custom_links: [...(profile.custom_links || []), { title: '', url: '' }] })} 
                        className="text-[10px] font-black text-violet-600 uppercase tracking-widest"
                    >
                        + Add New Link
                    </button>
                  </div>
                  <div className="space-y-3">
                    {profile.custom_links?.map((link: any, idx: number) => (
                      <div key={idx} className="p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl relative group">
                        <input placeholder="Project Name" value={link.title} className="w-full bg-transparent font-bold text-sm outline-none mb-1" onChange={(e) => {
                          const nl = [...profile.custom_links]; nl[idx].title = e.target.value; updateProfile({ custom_links: nl });
                        }} />
                        <input placeholder="URL (e.g. warpcast.com)" value={link.url} className="w-full bg-transparent text-xs text-stone-500 outline-none" onChange={(e) => {
                          const nl = [...profile.custom_links]; nl[idx].url = e.target.value; updateProfile({ custom_links: nl });
                        }} />
                        <button onClick={() => {
                          const nl = profile.custom_links.filter((_:any, i:number) => i !== idx); updateProfile({ custom_links: nl });
                        }} className="absolute top-4 right-4 text-stone-300 hover:text-red-500 transition-colors">✕</button>
                      </div>
                    ))}
                  </div>
               </div>

               {/* SECTION 4: BIO & BANNER */}
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest italic">Identity Info</label>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-stone-400 ml-1">Display Name</span>
                      <input value={profile.display_name} onChange={e => updateProfile({display_name: e.target.value})} className="w-full p-4 bg-stone-100 dark:bg-stone-800 rounded-2xl outline-none font-bold" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-stone-400 ml-1">Bio Description</span>
                      <textarea value={profile.bio} onChange={e => updateProfile({bio: e.target.value})} className="w-full p-4 bg-stone-100 dark:bg-stone-800 rounded-2xl h-32 outline-none resize-none" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-stone-400 ml-1">Banner Image URL (Optional)</span>
                      <input value={profile.banner_url || ''} onChange={e => updateProfile({banner_url: e.target.value})} className="w-full p-4 bg-stone-100 dark:bg-stone-800 rounded-2xl outline-none text-xs text-stone-500" />
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* 🖼️ NFT PICKER POPUP (Triggered from within Settings) */}
        {isNFT && (
          <NFTPicker 
            walletAddress={profile.custody_address} 
            currentSelection={profile.showcase_nfts} 
            onClose={() => setIsNFT(false)} 
            onUpdate={nfts => updateProfile({showcase_nfts: nfts})} 
          />
        )}
      </div>
    );
  }
  return null;
}