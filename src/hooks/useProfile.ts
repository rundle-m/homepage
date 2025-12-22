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
    const { data } = await supabase.from('profiles').select('*').eq('id', fid).single();
    if (data) {
      setProfile({ ...data, fid: data.id }); // Ensure fid matches DB id
    }
  };

  useEffect(() => {
    const init = async () => {
      const context = await sdk.context;
      const viewerFid = context?.user?.fid;
      
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
      
      sdk.actions.ready(); // 👈 This wakes up the app
      setIsLoading(false);
    };
    init();
  }, []);

  const createAccount = async () => {
    const context = await sdk.context;
    if (!context?.user?.fid) return alert("Not logged into Farcaster");

    const newProfile: Profile = {
        fid: context.user.fid,
        username: context.user.username || 'user',
        display_name: context.user.displayName || 'User',
        pfp_url: context.user.pfpUrl || '',
        custody_address: (context.user as any).verifications?.[0] || '', 
        bio: 'New Gallery',
        theme_color: 'violet',
        border_style: 'rounded-3xl',
        showcase_nfts: [],
        custom_links: [],
        dark_mode: false 
    };

    const { error } = await supabase.from('profiles').insert([{ ...newProfile, id: newProfile.fid }]);
    if (!error) setProfile(newProfile);
    else console.error(error);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    await supabase.from('profiles').upsert({ ...newProfile, id: profile.fid });
  };

  const isOwner = useMemo(() => {
     return String(profile?.fid) === String(remoteUser?.fid);
  }, [profile, remoteUser]);

  return { profile, remoteUser, isLoading, isOwner, login: () => window.location.reload(), createAccount, updateProfile };
}