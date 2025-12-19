"use client";

import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { LoginScreen } from '../components/LoginScreen';
import { ProjectList } from '../components/ProjectList';
import { ThemePicker } from '../components/ThemePicker';
import { Grid } from '../components/Grid'; 
import { LandingPage } from '../components/LandingPage';
import type { Link, ShowcaseNFT } from '../types/types';

const THEME_MAP: Record<string, string> = {
  violet: 'from-violet-600 to-indigo-600',
  blue: 'from-blue-500 to-cyan-500',
  emerald: 'from-emerald-500 to-teal-500',
  rose: 'from-rose-500 to-pink-500',
  amber: 'from-amber-500 to-orange-500',
  stone: 'from-stone-600 to-stone-800',
};

export default function Home() {
  const { 
    profile, remoteUser, isLoading, isOwner, isLoggingIn, 
    login, createAccount, updateProfile, switchToMyProfile 
  } = useProfile();
  
  const [isEditing, setIsEditing] = useState(false);

  // NEW: Helper to Share
  const handleShare = () => {
    if (!profile) return;
    // Construct the Deep Link
    const shareUrl = `${window.location.origin}?fid=${profile.fid}`;
    const text = `Check out my Onchain Home! 🏠`;
    // Open Warpcast Intent
    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(shareUrl)}`;
    window.open(warpcastUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-400">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-stone-200 rounded-full mb-4"></div>
          <p className="text-xs font-bold tracking-widest opacity-50">LOADING HOME</p>
        </div>
      </div>
    );
  }

  if (!profile && remoteUser && isOwner) {
    return (
      <LandingPage 
        username={remoteUser.username}
        pfpUrl={remoteUser.pfp_url}
        onCreate={createAccount}
        isCreating={isLoggingIn}
      />
    );
  }

  if (!profile) {
    return <LoginScreen onLogin={(fid) => login(fid, 'user', '')} isLoggingIn={isLoggingIn} />;
  }

  const themeGradient = THEME_MAP[profile.theme_color || 'violet'];
  const borderStyle = profile.border_style || 'rounded-3xl';

  return (
    <div className={`min-h-screen pb-20 ${profile.dark_mode ? 'bg-stone-950 text-white' : 'bg-stone-50 text-stone-900'}`}>
       
       {/* HEADER */}
       <div className={`h-40 relative group overflow-hidden`}>
          <div className={`absolute inset-0 bg-gradient-to-r ${themeGradient} transition-all duration-500`} />
          {profile.banner_url && (
            <img src={profile.banner_url} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-90"/>
          )}
          {isOwner && !isEditing && (
             <button 
               onClick={() => setIsEditing(true)} 
               className="absolute top-4 right-4 bg-black/40 text-white px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md hover:bg-black/60 transition border border-white/10"
             >
               Edit Profile
             </button>
          )}
       </div>

       {/* PROFILE CARD */}
       <div className="px-6 relative -mt-16 text-center">
          <img 
            src={profile.pfp_url} 
            alt={profile.username}
            className={`w-32 h-32 mx-auto border-4 border-white dark:border-stone-900 shadow-xl bg-stone-200 object-cover ${borderStyle}`} 
          />
          <h1 className="text-2xl font-black mt-4">{profile.display_name}</h1>
          <p className="text-stone-500">@{profile.username}</p>
          <p className="mt-2 text-sm opacity-80 max-w-xs mx-auto">{profile.bio}</p>
       </div>

       {/* CONTENT */}
       <Grid 
         nfts={profile.showcase_nfts || []}
         isOwner={isOwner}
         onUpdate={(newNFTs: ShowcaseNFT[]) => updateProfile({ showcase_nfts: newNFTs })}
         borderStyle={borderStyle}
       />
       <ProjectList 
          links={profile.custom_links || []} 
          isOwner={isOwner}
          onUpdate={(newLinks: Link[]) => updateProfile({ custom_links: newLinks })} 
       />

       {/* CTA BUTTONS (Floating at Bottom) */}
       <div className="fixed bottom-6 left-0 right-0 px-6 z-40 pointer-events-none">
          <div className="pointer-events-auto">
            
            {/* 1. VISITOR: Create Your Own */}
            {!isOwner && (
               <button 
                 onClick={switchToMyProfile}
                 className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-violet-200/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                 ✨ Create Your Own Space
               </button>
            )}

            {/* 2. OWNER: Share Button */}
            {isOwner && (
               <button 
                 onClick={handleShare}
                 className="w-full py-4 bg-white dark:bg-stone-800 text-stone-900 dark:text-white border border-stone-200 dark:border-stone-700 rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                 📤 Share Profile
               </button>
            )}

          </div>
       </div>

       {/* FOOTER PADDING */}
       <div className="mt-12 py-8 text-center border-t border-stone-200 dark:border-stone-800 pb-32">
         <p className="text-stone-300 text-xs font-mono uppercase tracking-widest">
           Onchain Home v2.5
         </p>
       </div>

       {/* EDIT OVERLAY */}
       {isEditing && (
          <div className="fixed inset-0 bg-white dark:bg-stone-900 z-50 flex flex-col animate-in slide-in-from-bottom-10">
             <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
                <h2 className="text-xl font-bold">Customize Look</h2>
                <button onClick={() => setIsEditing(false)} className="text-stone-400 hover:text-stone-900 dark:hover:text-white font-bold">Done</button>
             </div>
             <div className="p-6 space-y-8 overflow-y-auto flex-1">
                <ThemePicker 
                  currentTheme={profile.theme_color || 'violet'}
                  currentBorder={profile.border_style || 'rounded-3xl'}
                  onUpdate={updateProfile}
                />
                <hr className="border-stone-100 dark:border-stone-800" />
                <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">Banner Image URL</label>
                      <input 
                        value={profile.banner_url || ""} 
                        onChange={e => updateProfile({ banner_url: e.target.value })} 
                        placeholder="https://..."
                        className="w-full p-3 bg-stone-100 dark:bg-stone-800 rounded-xl outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">Display Name</label>
                      <input 
                        value={profile.display_name} 
                        onChange={e => updateProfile({ display_name: e.target.value })} 
                        className="w-full p-3 bg-stone-100 dark:bg-stone-800 rounded-xl outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">Bio</label>
                      <textarea 
                        value={profile.bio} 
                        onChange={e => updateProfile({ bio: e.target.value })} 
                        className="w-full p-3 bg-stone-100 dark:bg-stone-800 rounded-xl h-24 outline-none resize-none" 
                      />
                    </div>
                 </div>
             </div>
          </div>
       )}
    </div>
  );
}