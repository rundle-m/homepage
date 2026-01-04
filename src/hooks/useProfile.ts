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

  const login = async () => {
    setHasClickedConnect(true);
    await sdk.actions.signIn({ nonce: "login" });
    const context = await sdk.context;
    if (context?.user) {
      setRemoteUser(context.user);
      await fetchProfile(context.user.fid);
    }
  };

  const isOwner = useMemo(() => {
    if (!profile?.fid || !remoteUser?.fid) return false;
    return Number(profile.fid) === Number(remoteUser.fid);
  }, [profile, remoteUser]);

  return { 
    profile, remoteUser, isLoading, isOwner, login, hasClickedConnect,
    updateProfile: async (u: any) => {
      const np = { ...profile, ...u };
      setProfile(np as Profile);
      await supabase.from('profiles').upsert({ ...np, id: profile?.fid }); // Use id: fid for the upsert logic
    },
    createAccount: async () => {
      const context = await sdk.context;
      const fid = context?.user?.fid;
      if (!fid) return;
      const newP: any = { fid, username: context.user?.username, display_name: context.user?.displayName, pfp_url: context.user?.pfpUrl, bio: 'New Home', theme_color: 'violet', border_style: 'rounded-3xl', showcase_nfts: [], custom_links: [] };
      await supabase.from('profiles').insert([{ ...newP, id: fid }]);
      setProfile(newP);
    }
  };
}