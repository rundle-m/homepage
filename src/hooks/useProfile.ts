"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; 
import sdk from "@farcaster/frame-sdk";
import type { Profile } from '../types/types';
import { supabase } from '../lib/supabaseClient';

interface FarcasterUser {
    fid: number;
    username?: string;
    pfpUrl?: string;
    verifiedAddresses?: string[]; 
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [remoteUser, setRemoteUser] = useState<{ 
    fid: number, 
    username: string, 
    pfp_url: string,
    custody_address: string 
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const searchParams = useSearchParams();
  const urlFid = searchParams.get('fid');

  useEffect(() => {
    const init = async () => {
      try { await sdk.actions.ready(); } catch (e) { console.error(e); }
      const context = await sdk.context;
      const user = context?.user as FarcasterUser | undefined;
      const viewerFid = user?.fid;
      
      // Get the first verified address
      const connectedAddress = user?.verifiedAddresses?.[0] || "";

      if (urlFid) {
        // --- VISITOR MODE ---
        const targetFid = parseInt(urlFid);
        await fetchProfileOnly(targetFid);
        
        setIsOwner(!!(viewerFid && viewerFid === targetFid));

        if (viewerFid && user) {
             setRemoteUser({ 
                fid: viewerFid, 
                username: user.username || 'unknown', 
                pfp_url: user.pfpUrl || '',
                custody_address: connectedAddress 
             });
        }

      } else if (viewerFid) {
        // --- OWNER MODE ---
        setIsOwner(true);
        await checkAccountStatus(
            viewerFid, 
            user?.username || 'unknown', 
            user?.pfpUrl || '',
            connectedAddress
        );
      } else {
        setIsOwner(true);
        setIsLoading(false);
      }
    };

    init();
  }, [urlFid]);

  async function checkAccountStatus(fid: number, username: string, pfpUrl: string, address: string) {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', fid).single();

      if (data) {
        // --- 🛠️ FORCE SYNC LOGIC 🛠️ ---
        // If we have a connected address from Farcaster...
        if (address) {
            // ...and it doesn't match what's in the DB (or DB is empty)
            if (data.custody_address !== address) {
                console.log(`🔄 Syncing Wallet: DB was '${data.custody_address}', updating to '${address}'`);
                
                // Update Supabase
                await supabase.from('profiles').update({ custody_address: address }).eq('id', fid);
                
                // Update Local Data immediately so UI reflects it
                data.custody_address = address;
            }
        }
        
        setProfile(mapDataToProfile(data, pfpUrl));
      } else {
        console.log("User not in DB. Ready to onboard.");
        setRemoteUser({ fid, username, pfp_url: pfpUrl, custody_address: address });
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
      else setProfile(null); 
    } catch (err) { console.error(err); } 
    finally { setIsLoading(false); }
  }

  function mapDataToProfile(data: any, freshPfp?: string): Profile {
      return { ...data, fid: data.id, pfp_url: freshPfp || data.pfp_url } as Profile;
  }

  const createAccount = async () => {
    if (!remoteUser) return;
    setIsLoggingIn(true);
    
    const newProfile: Profile = {
      fid: remoteUser.fid,
      username: remoteUser.username,
      display_name: remoteUser.username,
      pfp_url: remoteUser.pfp_url,
      custody_address: remoteUser.custody_address,
      banner_url: "",
      bio: 'Onchain Explorer',
      custom_links: [], showcase_nfts: [],
      dark_mode: false, theme_color: 'violet', border_style: 'rounded-3xl',
    };
    
    const { error } = await supabase.from('profiles').upsert({
        id: newProfile.fid,
        username: newProfile.username,
        display_name: newProfile.display_name,
        pfp_url: newProfile.pfp_url,
        custody_address: newProfile.custody_address,
        custom_links: [],
        showcase_nfts: []
    });

    if (error) {
        alert(`Creation Failed: ${error.message}`);
    } else {
        setProfile(newProfile);
        setIsOwner(true);
        window.history.replaceState({}, '', window.location.pathname);
    }
    
    setIsLoggingIn(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    setProfile({ ...profile, ...updates });
    await supabase.from('profiles').upsert({ 
        id: profile.fid, 
        ...profile,
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