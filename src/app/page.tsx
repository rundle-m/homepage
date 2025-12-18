"use client";

import { useState } from 'react';
// We go UP one level (..) to leave 'app', then into 'hooks'
import { useProfile } from '@/hooks/useProfile';
import { LoginScreen } from '@/components/LoginScreen';
import { ProjectList } from '@/components/ProjectList';
// FIX: Using your specific file path 'types/types'
import type { Link } from '@/types/types'; 

export default function Home() {
  const { profile, isLoading, isOwner, isLoggingIn, login, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-400">
        Loading...
      </div>
    );
  }

  // 2. Login Screen (if no profile found)
  if (!profile) {
    return <LoginScreen onLogin={login} isLoggingIn={isLoggingIn} />;
  }

  // 3. Main Profile UI
  return (
    <div className={`min-h-screen pb-20 ${profile.dark_mode ? 'bg-stone-900 text-white' : 'bg-stone-50 text-stone-900'}`}>
       
       {/* HEADER */}
       <div className="h-40 bg-gradient-to-r from-violet-600 to-indigo-600 relative">
          {isOwner && !isEditing && (
             <button 
               onClick={() => setIsEditing(true)} 
               className="absolute top-4 right-4 bg-black/20 text-white px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md hover:bg-black/30 transition"
             >
               Edit Page
             </button>
          )}
       </div>

       {/* PROFILE CARD */}
       <div className="px-6 relative -mt-16 text-center">
          <img 
            src={profile.pfp_url} 
            alt={profile.username}
            className="w-32 h-32 mx-auto rounded-3xl border-4 border-white shadow-xl bg-stone-200 object-cover" 
          />
          <h1 className="text-2xl font-black mt-4">{profile.display_name}</h1>
          <p className="text-stone-500">@{profile.username}</p>
          <p className="mt-2 text-sm opacity-80 max-w-xs mx-auto">{profile.bio}</p>
       </div>

       {/* PROJECTS SECTION */}
       <ProjectList 
          links={profile.custom_links || []} 
          isOwner={isOwner} 
          onUpdate={(newLinks: Link[]) => updateProfile({ custom_links: newLinks })} 
       />

       {/* NEW FOOTER: Kicks Vercel & Shows Version */}
       <div className="mt-12 py-8 text-center border-t border-stone-200 dark:border-stone-800">
         <p className="text-stone-300 text-xs font-mono uppercase tracking-widest">
           Onchain Home v2.1
         </p>
       </div>

       

       {/* EDIT OVERLAY */}
       {isEditing && (
          <div className="fixed inset-0 bg-white dark:bg-stone-900 z-50 p-6 flex flex-col">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Edit Profile</h2>
                <button onClick={() => setIsEditing(false)} className="text-2xl p-2">✕</button>
             </div>
             
             <div className="space-y-4 flex-1">
                <div>
                  <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">Display Name</label>
                  <input 
                    value={profile.display_name} 
                    onChange={e => updateProfile({ display_name: e.target.value })} 
                    className="w-full p-3 bg-stone-100 dark:bg-stone-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition" 
                    placeholder="Name" 
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">Bio</label>
                  <textarea 
                    value={profile.bio} 
                    onChange={e => updateProfile({ bio: e.target.value })} 
                    className="w-full p-3 bg-stone-100 dark:bg-stone-800 rounded-xl h-24 outline-none focus:ring-2 focus:ring-purple-500 transition resize-none" 
                    placeholder="Tell us about yourself..." 
                  />
                </div>
             </div>

             <button 
               onClick={() => setIsEditing(false)} 
               className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform"
             >
               Done
             </button>
          </div>
       )}
    </div>
  );
}