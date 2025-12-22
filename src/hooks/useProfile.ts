"use client";

import { useState, useEffect, useMemo } from 'react';
import sdk from "@farcaster/miniapp-sdk";
import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/types';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [remoteUser, setRemoteUser] = useState<{ fid: number; username?: string; pfpUrl?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (fid: number) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', fid).single();
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
    const context = await sdk.context;
    const viewerFid = context?.user?.fid;
    
    // Check URL for ?fid=
    const params = new URLSearchParams(window.location.search);
    const urlFid = params.get('fid');
    const targetFid = urlFid ? parseInt(urlFid) : viewerFid;

    if (targetFid) await fetchProfile(targetFid);
    
    if (viewerFid) {
      setRemoteUser({
        fid: viewerFid,
        username: context?.user?.username,
        pfpUrl: context?.user?.pfpUrl,
      });
    }
    
    sdk.actions.ready();
    setIsLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  // 🔐 THE PROPER LOGIN FUNCTION
  const login = async () => {
    try {
      // This triggers the native Warpcast sign-in flow
      await sdk.actions.signIn({ nonce: "arbitrary-nonce" });
      // After sign in, re-run init to catch the new context
      await init(); 
    } catch (error) {
      console.error("Login failed:", error);
      // Fallback: if SDK fails, try a reload
      window.location.reload();
    }
  };

  const createAccount = async () => {
    const context = await sdk.context;
    const fid = context?.user?.fid;
    
    if (!fid) return alert("Please sign in to Farcaster first.");

    const newProfile: Profile = {
        fid: fid,
        username: context.user?.username || 'user',
        display_name: context.user?.displayName || 'User',
        pfp_url: context.user?.pfpUrl || '',
        custody_address: (context.user as any).verifications?.[0] || '', 
        bio: 'New Gallery',
        theme_color: 'violet',
        border_style: 'rounded-3xl',
        showcase_nfts: [],
        custom_links: [],
        dark_mode: false 
    };

    const { error } = await supabase.from('profiles').insert([{ ...newProfile, id: fid }]);
    if (!error) {
      setProfile(newProfile);
    } else {
      console.error("Create error:", error);
      alert("Could not create profile. You might already have one!");
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
    login, // Now returns the real function above
    createAccount, 
    updateProfile 
  };
}