"use client";
import { useState, useEffect, useMemo } from 'react';
import sdk from "@farcaster/miniapp-sdk";
import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/types';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [remoteUser, setRemoteUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasClickedConnect, setHasClickedConnect] = useState(false);

  const fetchProfile = async (fid: number) => {
    const { data } = await supabase.from('profiles').select('*').eq('fid', fid).single();
    if (data) setProfile(data);
  };

  useEffect(() => {
    const init = async () => {
      const context = await sdk.context;
      if (context?.user) {
        setRemoteUser(context.user);
        await fetchProfile(context.user.fid);
      }
      sdk.actions.ready();
      setIsLoading(false);
    };
    init();
  }, []);

  const isOwner = useMemo(() => {
    if (!profile?.fid || !remoteUser?.fid) return false;
    // Force both to numbers to avoid desktop string vs number mismatches
    return Number(profile.fid) === Number(remoteUser.fid);
  }, [profile?.fid, remoteUser?.fid]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    // Upsert using fid as the primary identifier
    await supabase.from('profiles').upsert({ ...newProfile, id: profile.fid });
  };

  const createAccount = async () => {
    const context = await sdk.context;
    const fid = context?.user?.fid;
    if (!fid) return;
    const newP: Profile = {
      fid,
      username: context.user?.username || 'user',
      display_name: context.user?.displayName || 'User',
      pfp_url: context.user?.pfpUrl || '',
      bio: 'Welcome to my new home!',
      theme_color: 'violet',
      border_style: 'rounded-3xl',
      showcase_nfts: [],
      custom_links: [],
      dark_mode: false,
      custody_address: (context.user as any).verifications?.[0] || ''
    };
    await supabase.from('profiles').insert([{ ...newP, id: fid }]);
    setProfile(newP);
  };

  return { 
    profile, remoteUser, isLoading, isOwner, 
    login: async () => { setHasClickedConnect(true); await sdk.actions.signIn({ nonce: "login" }); }, 
    hasClickedConnect, updateProfile, createAccount 
  };
}