import { useState, useEffect } from 'react';
import sdk from "@farcaster/frame-sdk";
import type { Profile } from '../types/types';
import { supabase } from '../lib/supabaseClient';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      try { await sdk.actions.ready(); } catch (e) { console.error(e); }

      const context = await sdk.context;
      
      if (context?.user?.fid) {
        console.log("📱 Phone detected. FID:", context.user.fid);
        await fetchProfile(context.user.fid, context.user.username, context.user.pfpUrl);
      } else {
        console.log("💻 Localhost detected.");
        await fetchProfile(1, "developer");
      }
    };

    init();
  }, []);

  function createMockProfile(fid: number, username?: string, pfpUrl?: string): Profile {
    return {
      fid: fid,
      username: username || `user-${fid}`,
      display_name: username || `User #${fid}`,
      pfp_url: pfpUrl || `https://placehold.co/400x400/purple/white?text=${fid}`,
      banner_url: "",
      bio: 'Onchain Explorer',
      custody_address: "", 
      custom_links: [],
      dark_mode: false,
      theme_color: 'violet',
      border_style: 'rounded-3xl',
      showcase_nfts: [], 
    };
  }

  async function fetchProfile(fid: number, username?: string, pfpUrl?: string) {
    setIsLoading(true);
    try {
      // FIX 1: Query 'id' instead of 'fid'
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', fid) 
        .single();

      if (data) {
        // Map Database 'id' back to Frontend 'fid'
        const mappedProfile = {
            ...data,
            fid: data.id, // IMPORTANT: The DB calls it 'id', app calls it 'fid'
            // Ensure we prioritize fresh PFP from Farcaster if available
            pfp_url: pfpUrl || data.pfp_url 
        } as Profile;
        
        setProfile(mappedProfile);
      } else {
        console.log("User not in DB. Creating fresh profile.");
        setProfile(createMockProfile(fid, username, pfpUrl));
      }
    } catch (err) {
      console.error('Login error:', err);
      setProfile(createMockProfile(fid, username, pfpUrl));
    } finally {
      setIsLoading(false);
    }
  }

  const login = async (fid: number) => {
    setIsLoggingIn(true);
    await fetchProfile(fid);
    setIsLoggingIn(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    setProfile({ ...profile, ...updates });

    // FIX 2: Use 'id' for the upsert
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: profile.fid, // <--- MAP FID TO ID HERE
        username: profile.username,
        display_name: profile.display_name,
        pfp_url: profile.pfp_url,
        bio: profile.bio,
        custody_address: profile.custody_address,
        theme_color: profile.theme_color,
        border_style: profile.border_style,
        banner_url: profile.banner_url,
        showcase_nfts: profile.showcase_nfts,
        // Map updates as well
        ...updates 
      })
      .select();

    if (error) console.error("Error saving profile:", error);
  };

  return { profile, isLoading, isOwner: true, isLoggingIn, login, updateProfile };
}