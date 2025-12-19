import { useState, useEffect } from 'react';
import sdk from "@farcaster/frame-sdk";
import type { Profile } from '../types/types';
import { supabase } from '../lib/supabaseClient';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [remoteUser, setRemoteUser] = useState<{ fid: number, username: string, pfp_url: string } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const init = async () => {
      try { await sdk.actions.ready(); } catch (e) { console.error(e); }

      const context = await sdk.context;
      const viewerFid = context?.user?.fid;
      
      const params = new URLSearchParams(window.location.search);
      const urlFid = params.get('fid');

      if (urlFid) {
        // VIEWING SOMEONE ELSE
        const targetFid = parseInt(urlFid);
        console.log(`🔗 Viewing Target FID: ${targetFid}`);
        await fetchProfileOnly(targetFid);
        setIsOwner(viewerFid === targetFid);
        
        // Save viewer info for onboarding
        if (viewerFid && context?.user) {
             setRemoteUser({ 
                fid: viewerFid, 
                username: context.user.username || 'unknown', 
                pfp_url: context.user.pfpUrl || '' 
             });
        }
      } else if (viewerFid) {
        // VIEWING SELF
        console.log("📱 Viewing Self FID:", viewerFid);
        setIsOwner(true);
        await checkAccountStatus(
            viewerFid, 
            context.user.username || 'unknown', 
            context.user.pfpUrl || ''
        );
      } else {
        // LOCALHOST
        console.log("💻 Localhost.");
        setIsOwner(true);
        setIsLoading(false);
      }
    };

    init();
  }, []);

  async function checkAccountStatus(fid: number, username: string, pfpUrl: string) {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', fid).single();

      if (data) {
        setProfile(mapDataToProfile(data, pfpUrl));
      } else {
        console.log("User not in DB.");
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
      if (data) setProfile(mapDataToProfile(data));
    } catch (err) { console.error(err); } 
    finally { setIsLoading(false); }
  }

  function mapDataToProfile(data: any, freshPfp?: string): Profile {
      return { ...data, fid: data.id, pfp_url: freshPfp || data.pfp_url } as Profile;
  }

  // --- UPDATED CREATE FUNCTION ---
  const createAccount = async () => {
    if (!remoteUser) return;
    setIsLoggingIn(true);
    
    // 1. Create the Object
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

    // 2. Try minimal insert first (Safer)
    console.log("Attempting to create user:", newProfile.fid);
    
    const { error } = await supabase.from('profiles').upsert({
        id: newProfile.fid,
        username: newProfile.username,
        display_name: newProfile.display_name,
        pfp_url: newProfile.pfp_url,
        // We include these defaults to prevent null errors
        custom_links: [],
        showcase_nfts: []
    });

    if (error) {
        // 🚨 ALERT THE USER ON FAILURE
        console.error("Supabase Error:", error);
        alert(`Creation Failed: ${error.message}\nCode: ${error.code}`);
    } else {
        // Success
        console.log("User created!");
        setProfile(newProfile);
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
      login: checkAccountStatus, createAccount, updateProfile, switchToMyProfile 
  };
}