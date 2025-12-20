"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; 
import sdk from "@farcaster/frame-sdk";
import type { Profile } from '../types/types';
import { supabase } from '../lib/supabaseClient';
import { fetchNeynarUser } from '../lib/neynar'; 

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
          setDebugAddress("Asking Neynar...");
          // We fetch the full user data from Neynar to get the wallet addresses
          const neynarUser = await fetchNeynarUser(viewerFid);
          
          if (neynarUser) {
              // --- 🚨 UPDATED LOGIC HERE 🚨 ---
              // Priority 1: Check for Verified Addresses (Your "Primary" wallet)
              // Priority 2: Fallback to Custody Address (The "Vault")
              
              const verifications = (neynarUser as any).verifications || [];
              const custody = neynarUser.custody_address;

              if (verifications.length > 0) {
                  // Use the first verified wallet (usually the most recently connected/primary)
                  connectedAddress = verifications[0];
                  setDebugAddress(`Primary: ${connectedAddress.slice(0,6)}...`); 
              } else if (custody) {
                  // Fallback to custody if no verified wallets exist
                  connectedAddress = custody;
                  setDebugAddress(`Custody: ${connectedAddress.slice(0,6)}...`);
              } else {
                  setDebugAddress("Neynar found user, but no ETH address linked.");
              }
          } 
      } else {
          setDebugAddress("No Viewer FID found (Localhost?)");
      }

      // 2. LOGIC FLOW
      if (urlFid) {
        // --- VISITOR MODE ---
        const targetFid = parseInt(urlFid);
        await fetchProfileOnly(targetFid);
        
        // You are the owner if your Viewer FID matches the Page FID
        setIsOwner(!!(viewerFid && viewerFid === targetFid));

        if (viewerFid && user) {
             setRemoteUser({ 
                fid: viewerFid, 
                username: user.username || 'unknown', 
                pfp_url: user.pfpUrl || '',
                custody_address: connectedAddress // Stores your Primary wallet now
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
        // Localhost fallback
        setIsOwner(true);
        setIsLoading(false);
      }
    };

    init();
  }, [urlFid]);

  // Check DB and sync wallet if it changed
  async function checkAccountStatus(fid: number, username: string, pfpUrl: string, address: string) {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', fid).single();

      if (data) {
        // If the DB has a different address than what we just found (e.g. old custody vs new primary)
        // We update the DB to match the new Primary address.
        if (address && data.custody_address !== address) {
            console.log(`🔄 Syncing Wallet via Neynar: '${address}'`);
            await supabase.from('profiles').update({ custody_address: address }).eq('id', fid);
            data.custody_address = address;
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