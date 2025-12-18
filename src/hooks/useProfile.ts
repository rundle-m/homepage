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
      // 1. Tell Farcaster we are ready
      try { await sdk.actions.ready(); } catch (e) { console.error(e); }

      // 2. Check Context
      const context = await sdk.context;
      
      if (context?.user?.fid) {
        console.log("📱 Phone detected. FID:", context.user.fid);
        await fetchProfile(context.user.fid, context.user.username);
      } else {
        console.log("💻 Localhost detected.");
        // Dev Mode: Use FID 1
        await fetchProfile(1, "developer");
      }
    };

    init();
  }, []);

  function createMockProfile(fid: number, username: string | undefined): Profile {
    return {
      fid: fid,
      username: username || `user-${fid}`,
      display_name: username || `User #${fid}`,
      pfp_url: `https://placehold.co/400x400/purple/white?text=${fid}`,
      bio: 'Onchain Explorer',
      custody_address: "", 
      custom_links: [],
      dark_mode: false,
      theme_color: 'violet', // Default theme
      border_style: 'rounded-3xl', // Default border
      showcase_nfts: [],
    };
  }

  async function fetchProfile(fid: number, username?: string) {
    setIsLoading(true);
    try {
      // Try Supabase
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('fid', fid) // Ensure this column name matches your DB (fid)
        .single();

      if (data) {
        setProfile(data as Profile);
      } else {
        // Not in DB? Create fresh
        console.log("User not in DB. Creating fresh profile.");
        setProfile(createMockProfile(fid, username));
      }
    } catch (err) {
      console.error('Login error:', err);
      setProfile(createMockProfile(fid, username));
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
    
    // Update local state immediately
    setProfile({ ...profile, ...updates });

    // Try to save to Supabase
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        fid: profile.fid,
        username: profile.username,
        display_name: profile.display_name,
        pfp_url: profile.pfp_url,
        bio: profile.bio,
        custody_address: profile.custody_address,
        theme_color: profile.theme_color,
        border_style: profile.border_style,
        ...updates 
      })
      .select();

    if (error) console.error("Error saving profile:", error);
  };

  return { profile, isLoading, isOwner: true, isLoggingIn, login, updateProfile };
}