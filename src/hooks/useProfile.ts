"use client";

import { useState, useEffect, useMemo } from 'react';
import sdk from "@farcaster/miniapp-sdk"; 
import { supabase } from '../lib/supabaseClient'; // Verify this path matches your file structure
import type { Profile } from '../types/types';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [remoteUser, setRemoteUser] = useState<{ fid: number; username?: string; pfpUrl?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper: Fetch a profile from Supabase
  const fetchProfile = async (fid: number) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', fid)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setProfile(data);
      } else {
        setProfile(null); // Profile doesn't exist in our DB yet
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      // 1. Get the "Viewer" (The person holding the phone)
      const context = await sdk.context;
      const viewerFid = context?.user?.fid;
      
      // 2. Check the URL for a "Target" (The profile we want to see)
      const params = new URLSearchParams(window.location.search);
      const urlFid = params.get('fid');

      // 3. Decide who to load (URL > Logged In User)
      const targetFid = urlFid ? parseInt(urlFid) : viewerFid;

      if (targetFid) {
        await fetchProfile(targetFid);
      }
      
      // 4. Set "Viewer" details
      if (viewerFid) {
        setRemoteUser({
          fid: viewerFid,
          username: context?.user?.username,
          pfpUrl: context?.user?.pfpUrl,
        });
      }
      
      // 5. Hide Splash Screen
      sdk.actions.ready();
      setIsLoading(false);
    };

    init();
  }, []);

  // 6. Robust Update Function
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    
    // Optimistic Update
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);

    // Database Update
    const dbPayload = {
        id: profile.fid, // Ensure we use FID as the ID
        username: newProfile.username,
        display_name: newProfile.display_name,
        pfp_url: newProfile.pfp_url,
        custody_address: newProfile.custody_address,
        bio: newProfile.bio,
        banner_url: newProfile.banner_url,
        theme_color: newProfile.theme_color,
        border_style: newProfile.border_style,
        showcase_nfts: updates.showcase_nfts || profile.showcase_nfts,
        custom_links: updates.custom_links || profile.custom_links
    };

    const { error } = await supabase.from('profiles').upsert(dbPayload);
    
    if (error) {
        console.error("❌ Supabase Save Failed:", error.message);
    } else {
        console.log("✅ Saved to DB!");
    }
  };

  // Login Helper
  const login = async () => {
    const context = await sdk.context;
    if (context?.user?.fid) {
       // If logging in, we want to see OUR profile, not the shared URL one
       window.history.replaceState(null, '', window.location.pathname); 
       await fetchProfile(context.user.fid);
    }
  };

  // Create Account Helper (Fixed Duplicate Issue)
  const createAccount = async () => {
    const context = await sdk.context;
    if (!context?.user?.fid) return;

    // 1. Create the Local Profile object
    const newProfile: Profile = {
        fid: context.user.fid,
        username: context.user.username || 'user',
        display_name: context.user.displayName || 'User',
        pfp_url: context.user.pfpUrl || '',
        custody_address: (context.user as any).verifications?.[0] || '', 
        bio: 'Just joined!',
        theme_color: 'violet',
        border_style: 'rounded-3xl',
        showcase_nfts: [],
        custom_links: [],  
        dark_mode: false 
    };

    // 2. Insert into Supabase
    const { error } = await supabase.from('profiles').insert({
        ...newProfile,
        id: newProfile.fid, // Map FID to DB ID
    });

    if (!error) {
        setProfile(newProfile);
    } else {
        console.error("Create account error:", error);
    }
  };

  const isOwner = useMemo(() => {
     if (!profile || !remoteUser) return false;
     return String(profile.fid) === String(remoteUser.fid);
  }, [profile, remoteUser]);

  return { 
    profile, 
    remoteUser, 
    isLoading, 
    isOwner, 
    updateProfile,
    login,
    createAccount 
  };
}