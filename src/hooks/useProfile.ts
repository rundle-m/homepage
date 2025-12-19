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
      
      // Check URL parameters for ?fid=123
      const params = new URLSearchParams(window.location.search);
      const urlFid = params.get('fid');

      if (urlFid) {
        // SCENARIO A: Viewing someone else via Link
        const targetFid = parseInt(urlFid);
        console.log(`🔗 Link detected. Viewing FID: ${targetFid} (Viewer: ${viewerFid})`);
        
        await fetchProfileOnly(targetFid);
        
        setIsOwner(viewerFid === targetFid);
        
        if (viewerFid && context?.user) {
             setRemoteUser({ 
                fid: viewerFid, 
                username: context.user.username || 'unknown', 
                pfp_url: context.user.pfpUrl || '' 
             });
        }

      } else if (viewerFid) {
        // SCENARIO B: Viewing Self
        console.log("📱 Phone detected. Viewing Self:", viewerFid);
        setIsOwner(true);
        await checkAccountStatus(
            viewerFid, 
            context.user.username || 'unknown', 
            context.user.pfpUrl || ''
        );
      } else {
        // SCENARIO C: Localhost
        console.log("💻 Localhost detected.");
        setIsOwner(true);
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // 1. Check if account exists, if not prepare for onboarding
  async function checkAccountStatus(fid: number, username: string, pfpUrl: string) {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', fid).single();

      if (data) {
        setProfile(mapDataToProfile(data, pfpUrl));
      } else {
        console.log("User not in DB. Ready to onboard.");
        setRemoteUser({ 
            fid, 
            username, 
            pfp_url: pfpUrl || `https://placehold.co/400x400/purple/white?text=${fid}` 
        });
        setProfile(null);
      }
    } catch (err) { console.error(err); } 
    finally { setIsLoading(false); }
  }

  // 2. Just fetch data (used for viewing others)
  async function fetchProfileOnly(fid: number) {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', fid).single();
      if (data) {
        setProfile(mapDataToProfile(data));
      }
    } catch (err) { console.error(err); } 
    finally { setIsLoading(false); }
  }

  // Helper to format DB data
  function mapDataToProfile(data: any, freshPfp?: string): Profile {
      return {
          ...data,
          fid: data.id,
          pfp_url: freshPfp || data.pfp_url
      } as Profile;
  }

  // 3. Create Account (Onboarding)
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
        bio: newProfile.bio,
        custody_address: newProfile.custody_address,
        theme_color: newProfile.theme_color,
        border_style: newProfile.border_style,
        banner_url: "", showcase_nfts: []
    });

    if (!error) setProfile(newProfile);
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

  // 4. Helper to switch from Visitor -> Owner
  const switchToMyProfile = () => {
      // Clear URL params and reload
      window.history.replaceState({}, '', window.location.pathname);
      window.location.reload();
  };

  return { 
      profile, 
      remoteUser, 
      isLoading, 
      isOwner, 
      isLoggingIn, 
      // Aliasing checkAccountStatus as 'login' to match page.tsx expectations
      login: checkAccountStatus, 
      createAccount, 
      updateProfile,
      switchToMyProfile 
  };
}