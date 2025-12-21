"use client";

import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { LandingPage } from './LandingPage';
import { Grid } from './Grid';
import { UserHeader } from './UserHeader'; // We just created this!
import { ThemePicker } from './ThemePicker';
import { NFTPicker } from './NFTPicker'; 
import type { Profile } from '../types/types'; 

// Simple Loading Spinner
function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-stone-950">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800 dark:border-white"></div>
    </div>
  );
}

export default function HomeClient() {
  return <AppContent />;
}

function AppContent() {
  const { 
    profile, remoteUser, isLoading, isOwner, 
    login, createAccount, updateProfile 
  } = useProfile();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isPickingNFTs, setIsPickingNFTs] = useState(false);

  // 1. Loading State
  if (isLoading) return <Loading />;

  // 2. Landing Page
  // Show if: No profile loaded AND user isn't logged in
  if (!profile && !remoteUser) {
     return <LandingPage onLogin={login} />;
  }

  // 3. Create Account
  // Show if: User logged in, but has no profile yet
  if (!profile && remoteUser) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
           <h2 className="text-2xl font-bold mb-2">Welcome, {remoteUser.username}!</h2>
           <p className="text-stone-500 mb-6">Let's set up your gallery.</p>
           <button 
             onClick={createAccount}
             className="bg-violet-600 text-white px-8 py-3 rounded-full font-bold shadow-lg"
           >
             Create Profile
           </button>
        </div>
     );
  }

  // 4. Main Profile View (If we have a profile)
  if (profile) {
    return (
      <div className={`min-h-screen pb-20 bg-white dark:bg-stone-950 text-stone-900 dark:text-white theme-${profile.theme_color || 'violet'}`}>
         
         {/* HEADER SECTION */}
         <UserHeader 
            profile={profile}
            isOwner={isOwner}
            onEditProfile={() => setIsEditingProfile(true)}
         />

         {/* SHOWCASE SECTION */}
         <div className="mt-8">
            <div className="px-6 flex justify-between items-end mb-4">
               <h3 className="font-bold text-lg">Showcase</h3>
               {isOwner && (
                 <button 
                   onClick={() => setIsPickingNFTs(true)}
                   className="text-xs font-bold text-violet-600 bg-violet-50 dark:bg-violet-900/30 px-3 py-1.5 rounded-lg"
                 >
                   + Edit
                 </button>
               )}
            </div>
            
            <Grid 
              nfts={profile.showcase_nfts || []}
              isOwner={isOwner}
              borderStyle={profile.border_style}
            />
         </div>

         {/* MODALS */}
         
         {/* 1. Theme/Bio Editor */}
         {isEditingProfile && (
            <div className="fixed inset-0 bg-white dark:bg-stone-900 z-50 flex flex-col animate-in slide-in-from-bottom-10">
               <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
                  <h2 className="text-xl font-bold">Edit Profile</h2>
                  <button onClick={() => setIsEditingProfile(false)} className="font-bold text-stone-500">Done</button>
               </div>
               <div className="p-6 space-y-6 overflow-y-auto flex-1">
                  {/* Theme Picker Component */}
                  <ThemePicker 
                    currentTheme={profile.theme_color || 'violet'}
                    currentBorder={profile.border_style || 'rounded-3xl'}
                    onUpdate={updateProfile}
                  />
                  
                  {/* Text Inputs */}
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

  // Fallback
  return <Loading />;
}