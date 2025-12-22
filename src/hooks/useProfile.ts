"use client";

import { useState, useEffect, useMemo } from 'react';
import sdk from "@farcaster/miniapp-sdk";
import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/types';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [remoteUser, setRemoteUser] = useState<{ fid: number; username?: string; pfpUrl?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasClickedConnect, setHasClickedConnect] = useState(false);

  const fetchProfile = async (fid: number) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('fid', fid).single();
      if (data) {
        setProfile({ ...data, fid: data.id });
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const init = async () => {
    setIsLoading(true);
    try {
      const context = await sdk.context;
      const viewerFid = context?.user?.fid;

      if (viewerFid) {
        setRemoteUser({
          fid: viewerFid,
          username: context.user?.username,
          pfpUrl: context.user?.pfpUrl,
        });
        await fetchProfile(viewerFid);
      }
    } catch (err) {
      console.error("SDK Init Error:", err);
    } finally {
      sdk.actions.ready();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const login = async () => {
    try {
      // Step 1: Tell the app the user officially wants to enter
      setHasClickedConnect(true);
      
      // Step 2: Trigger Farcaster Sign In
      await sdk.actions.signIn({ nonce: "onchain-home-login" });
      
      // Step 3: Refresh user data
      await init();
    } catch (error) {
      console.error("Login failed:", error);
      // Fallback if SDK fails
      setHasClickedConnect(true);
    }
  };

  const createAccount = async () => {
    try {
      const context = await sdk.context;
      const fid = context?.user?.fid;
      
      if (!fid) return;

      const newProfile: Profile = {
          fid: fid,
          username: context.user?.username || 'user',
          display_name: context.user?.displayName || 'User',
          pfp_url: context.user?.pfpUrl || '',
          custody_address: (context.user as any).verifications?.[0] || '0x0000000000000000000000000000000000000000', 
          bio: 'My new gallery',
          theme_color: 'violet',
          border_style: 'rounded-3xl',
          showcase_nfts: [],
          custom_links: [],
          banner_url: '',
          dark_mode: false 
      };

      const { error } = await supabase.from('profiles').insert([newProfile]);
      
      if (!error) {
        setProfile(newProfile);
      } else {
        console.error("Create error:", error);
        alert("Error creating profile: " + error.message);
      }
    } catch (err) {
      console.error("Create catch block:", err);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    await supabase.from('profiles').upsert({ ...newProfile, id: profile.fid });
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
    login, 
    createAccount, 
    updateProfile,
    hasClickedConnect 
  };
}