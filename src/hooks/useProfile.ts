"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; 
import sdk from "@farcaster/frame-sdk";
import type { Profile } from '../types/types';
import { supabase } from '../lib/supabaseClient';
import { fetchNeynarUser } from '../lib/neynar'; 

// Define the shape of the Neynar User so TS knows what to look for
interface NeynarUser {
    fid: number;
    username: string;
    pfp_url: string;
    custody_address: string;
    verifications?: string[]; 
}

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
  
  // Debug state
  const [debugAddress, setDebugAddress] = useState<string>("Initializing...");

  const searchParams = useSearchParams();
  const urlFid = searchParams.get('fid');

  useEffect(() => {
    const init = async () => {
      try { await sdk.actions.ready(); } catch (e) { console.error(e); }
      
      const context = await sdk.context;
      const user = context?.user as FarcasterUser | undefined;
      const viewerFid = user?.fid;
      
      // 1. DETERMINE WALLET ADDRESS
      let connectedAddress = "";
      
      if (viewerFid) {
          setDebugAddress("Fetching from Neynar...");
          
          const neynarUser = (await fetchNeynarUser(viewerFid)) as NeynarUser;
          
          if (neynarUser) {
              const verifications = neynarUser.verifications || [];
              const custody = neynarUser.custody_address;

              // --- 🚨 UPDATED LOGIC HERE 🚨 ---
              // If we have verified addresses, we grab the LAST one.
              // (verifications[0] is usually the oldest, verifications[length-1] is the newest)
              if (verifications.length > 0) {
                  // Get the most recent verification
                  const mostRecent = verifications[verifications.length - 1];
                  connectedAddress = mostRecent;
                  
                  // Debug: Show how many were found
                  setDebugAddress(`Found ${verifications.length} wallets. Using: ${connectedAddress.slice(0,6)}...`); 
              } else if (custody) {
                  connectedAddress = custody;
                  setDebugAddress(`Custody Only: ${connectedAddress.slice(0,6)}...`);
              } else {
                  setDebugAddress("No ETH address found.");
              }
          } 
      } else {
          setDebugAddress("No Viewer FID (Localhost?)");
      }

      // 2. LOGIC FLOW
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
        // Update DB if the address has changed to the new primary
        if (address && data.custody_address !== address) {
            console.log(`🔄 Syncing Primary Wallet: '${address}'`);
            await supabase.from('profiles').update({ custody_address: address }).eq('id', fid);
            data.custody_address = address;
        }
        setProfile(mapDataToProfile(data, pfpUrl));
      } else {
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
      profile, 
      remoteUser, 
      isLoading, 
      isOwner, 
      isLoggingIn, 
      login: checkAccountStatus, 
      createAccount, 
      updateProfile, 
      switchToMyProfile,
      debugAddress
  };
}