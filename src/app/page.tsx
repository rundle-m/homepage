"use client";

import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { LoginScreen } from '../components/LoginScreen';
import { ProjectList } from '../components/ProjectList';
import { ThemePicker } from '../components/ThemePicker'; // Ensure you created this file! 
import { Grid } from '../components/Grid';
import type { Link, ShowcaseNFT } from '../types/types';


// This map handles the color logic
const THEME_MAP: Record<string, string> = {
  violet: 'from-violet-600 to-indigo-600',
  blue: 'from-blue-500 to-cyan-500',
  emerald: 'from-emerald-500 to-teal-500',
  rose: 'from-rose-500 to-pink-500',
  amber: 'from-amber-500 to-orange-500',
  stone: 'from-stone-600 to-stone-800',
};

export default function Home() {
  const { profile, isLoading, isOwner, isLoggingIn, login, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-400">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-stone-200 rounded-full mb-4"></div>
        </div>
      </div>
    );
  }

  // 2. Login Screen (Fallback logic)
  if (!profile) {
    return <LoginScreen onLogin={login} isLoggingIn={isLoggingIn} />;
  }

  // 3. Determine Dynamic Styles
  // If theme is missing, default to 'violet'. If border is missing, default to 'rounded-3xl'
  const themeGradient = THEME_MAP[profile.theme_color || 'violet'];
  const borderStyle = profile.border_style || 'rounded-3xl';

  return (
    <div className={`min-h-screen pb-20 ${profile.dark_mode ? 'bg-stone-950 text-white' : 'bg-stone-50 text-stone-900'}`}>
       
       {/* HEADER - Uses dynamic gradient */}
       <div className={`h-40 bg-gradient-to-r ${themeGradient} relative transition-all duration-500`}>
          {isOwner && !isEditing && (
             <button 
               onClick={() => setIsEditing(true)} 
               className="absolute top-4 right-4 bg-black/20 text-white px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md hover:bg-black/30 transition"
             >
               Edit Theme
             </button>
          )}
       </div>

       {/* PROFILE CARD - Uses dynamic border */}
       <div className="px-6 relative -mt-16 text-center">
          <img 
            src={profile.pfp_url} 
            alt={profile.username}
            className={`w-32 h-32 mx-auto border-4 border-white shadow-xl bg-stone-200 object-cover ${borderStyle}`} 
          />
          <h1 className="text-2xl font-black mt-4">{profile.display_name}</h1>
          <p className="text-stone-500">@{profile.username}</p>
          <p className="mt-2 text-sm opacity-80 max-w-xs mx-auto">{profile.bio}</p>
       </div>

      {/* NEW: NFT GALLERY */}
       <Grid 
          nfts={profile.showcase_nfts || []}
          isOwner={isOwner}
          onUpdate={(newNFTs: ShowcaseNFT[]) => updateProfile({ showcase_nfts: newNFTs })}
          borderStyle={profile.border_style || 'rounded-3xl'}
       />

       {/* PROJECTS SECTION */}
       <ProjectList 
          links={profile.custom_links || []} 
          isOwner={isOwner} 
          onUpdate={(newLinks: Link[]) => updateProfile({ custom_links: newLinks })} 
       />

       {/* FOOTER */}
       <div className="mt-12 py-8 text-center border-t border-stone-200 dark:border-stone-800">
         <p className="text-stone-300 text-xs font-mono uppercase tracking-widest">
           Onchain Home v2.2
         </p>
       </div>

       {/* EDIT OVERLAY */}
       {isEditing && (
          <div className="fixed inset-0 bg-white dark:bg-stone-900 z-50 flex flex-col animate-in slide-in-from-bottom-10">
             
             {/* Edit Header */}
             <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
                <h2 className="text-xl font-bold">Customize Look</h2>
                <button onClick={() => setIsEditing(false)} className="text-stone-400 hover:text-stone-900 dark:hover:text-white">Done</button>
             </div>
             
             {/* Edit Body - Scrollable */}
             <div className="p-6 space-y-8 overflow-y-auto flex-1">
                
                {/* 1. THEME PICKER COMPONENT */}
                <ThemePicker 
                  currentTheme={profile.theme_color || 'violet'}
                  currentBorder={profile.border_style || 'rounded-3xl'}
                  onUpdate={updateProfile}
                />

                <hr className="border-stone-100 dark:border-stone-800" />

                {/* 2. TEXT FIELDS */}
                <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">Display Name</label>
                      <input 
                        value={profile.display_name} 
                        onChange={e => updateProfile({ display_name: e.target.value })} 
                        className="w-full p-3 bg-stone-100 dark:bg-stone-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">Bio</label>
                      <textarea 
                        value={profile.bio} 
                        onChange={e => updateProfile({ bio: e.target.value })} 
                        className="w-full p-3 bg-stone-100 dark:bg-stone-800 rounded-xl h-24 outline-none resize-none focus:ring-2 focus:ring-purple-500" 
                      />
                    </div>
                 </div>
             </div>
          </div>
       )}
    </div>
  );
}