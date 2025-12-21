"use client";

import type { Profile } from '../types/types';

interface UserHeaderProps {
  profile: Profile;
  isOwner: boolean;
  onEditProfile: () => void;
}

export function UserHeader({ profile, isOwner, onEditProfile }: UserHeaderProps) {
  
  const handleShare = () => {
    const APP_ID = "PjEl94RhWAu7"; 
    
    const shareUrl = `https://warpcast.com/~/miniapps/${APP_ID}?fid=${profile.fid}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${profile.display_name}'s Gallery`,
        url: shareUrl
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Profile link copied!");
    }
  };

  return (
    <div className="relative mb-6">
      {/* Banner */}
      <div className="h-32 w-full overflow-hidden bg-stone-200 dark:bg-stone-800">
        {profile.banner_url && (
          <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-6 relative">
        {/* Avatar */}
        <div className="-mt-12 mb-4 flex justify-between items-end">
          <div className="relative rounded-full p-1 bg-white dark:bg-stone-950">
            <img 
              src={profile.pfp_url || "https://via.placeholder.com/100"} 
              alt={profile.username}
              className="w-24 h-24 rounded-full object-cover bg-stone-100"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 mb-1">
             <button 
                onClick={handleShare}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-full text-xs font-bold hover:bg-stone-200 transition"
             >
                Share
             </button>
             {isOwner && (
               <button 
                  onClick={onEditProfile}
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-full text-xs font-bold hover:bg-stone-200 transition"
               >
                  Edit Profile
               </button>
             )}
          </div>
        </div>

        {/* Text Details */}
        <div>
          <h1 className="text-xl font-bold">{profile.display_name}</h1>
          <p className="text-stone-500 text-sm">@{profile.username}</p>
          {profile.bio && (
             <p className="mt-3 text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-md">
               {profile.bio}
             </p>
          )}
        </div>
      </div>
    </div>
  );
}