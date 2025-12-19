import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; 
import sdk from "@farcaster/frame-sdk";
import type { Profile } from '../types/types';
import { supabase } from '../lib/supabaseClient';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [remoteUser, setRemoteUser] = useState<{ fid: number, username: string, pfp_url: string } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Debug State
  const [debugLog, setDebugLog] = useState("Initializing...");

  const searchParams = useSearchParams();
  const urlFid = searchParams.get('fid');

  useEffect(() => {
    const init = async () => {
      try { await sdk.actions.ready(); } catch (e) { console.error(e); }
      const context = await sdk.context;
      const viewerFid = context?.user?.fid;

      setDebugLog(`URL: ${urlFid || 'none'} | Viewer: ${viewerFid || 'none'}`);

      if (urlFid) {
        // --- VISITOR MODE ---
        const targetFid = parseInt(urlFid);
        await fetchProfileOnly(targetFid);
        
        if (viewerFid && viewerFid === targetFid) {
           setIsOwner(true);
        } else {
           setIsOwner(false); 
        }

        if (viewerFid && context?.user) {
             setRemoteUser({ 
                fid: viewerFid, 
                username: context.user.username || 'unknown', 
                pfp_url: context.user.pfpUrl || '' 
             });
        }

      } else if (viewerFid) {
        // --- OWNER MODE ---
        setIsOwner(true);
        await checkAccountStatus(
            viewerFid, 
            context.user.username || 'unknown', 
            context.user.pfpUrl || ''
        );
      } else {
        setIsOwner(true);
        setIsLoading(false);
      }
    };

    init();
  }, [urlFid]);

  async function checkAccountStatus(fid: number, username: string, pfpUrl: string) {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', fid).single();

      if (data) {
        setProfile(mapDataToProfile(data, pfpUrl));
      } else {
        setRemoteUser({ fid, username, pfp_url: pfpUrl });
        setProfile(null);
      }
    } catch (err) { console.error(err); } 
    finally { setIsLoading(false); }
  }

  async function fetchProfileOnly(fid: number) {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', fid).single();
      if (data) {
        setProfile(mapDataToProfile(data));
      } else {
        setProfile(null); 
      }
    } catch (err) { console.error(err); } 
    finally { setIsLoading(false); }
  }

  function mapDataToProfile(data: any, freshPfp?: string): Profile {
      return { ...data, fid: data.id, pfp_url: freshPfp || data.pfp_url } as Profile;
  }

  // --- FIXED CREATE FUNCTION (No Reload) ---
  const createAccount = async () => {
    if (!remoteUser) return;
    setIsLoggingIn(true);
    
    const newProfile: Profile = {
      fid: remoteUser.fid,
      username: remoteUser.username,
      display_name: remoteUser.username,
      pfp_url: remoteUser.pfp_url,
      banner_url: "",
      bio: 'Onchain Explorer',
      custody_address: "", custom_links: [], showcase_nfts: [],
      dark_mode: false, theme_color: 'violet', border_style: 'rounded-3xl',
    };
    
    const { error } = await supabase.from('profiles').upsert({
        id: newProfile.fid,
        username: newProfile.username,
        display_name: newProfile.display_name,
        pfp_url: newProfile.pfp_url,
        custom_links: [],
        showcase_nfts: []
    });

    if (error) {
        alert(`Creation Failed: ${error.message}`);
    } else {
        // SUCCESS: Update State Immediately (Don't Reload)
        setProfile(newProfile);
        setIsOwner(true);
        // Clean URL just in case
        window.history.replaceState({}, '', window.location.pathname);
    }
    
    setIsLoggingIn(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    setProfile({ ...profile, ...updates });
    await supabase.from('profiles').upsert({ 
        id: profile.fid, 
        username: profile.username,
        display_name: profile.display_name,
        pfp_url: profile.pfp_url,
        bio: profile.bio,
        custody_address: profile.custody_address,
        theme_color: profile.theme_color,
        border_style: profile.border_style,
        banner_url: profile.banner_url,
        showcase_nfts: profile.showcase_nfts,
        ...updates 
    });
  };

  const switchToMyProfile = () => {
      window.history.replaceState({}, '', window.location.pathname);
      window.location.reload();
  };

  return { 
      profile, remoteUser, isLoading, isOwner, isLoggingIn, 
      login: checkAccountStatus, createAccount, updateProfile, switchToMyProfile,
      debugLog // 👈 Export Debug Info
  };
}