"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; 
import sdk from "@farcaster/miniapp-sdk";
import type { Profile } from '../types/types';
import { supabase } from '../lib/supabaseClient';
import { fetchNeynarUser } from '../lib/neynar'; 

// 1. Define the V2 Interface (This matches the structure your friend used)
interface NeynarUserV2 {
    fid: number;
    username: string;
    pfp_url: string;
    custody_address: string;
    verified_addresses: {
      eth_addresses: string[];
      sol_addresses: string[];
      primary?: {
         eth_address?: string;
         sol_address?: null;
      }
    }
}

interface FarcasterUser {
    fid: number;
    username?: string;
    pfpUrl?: string;
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
          setDebugAddress("Fetching from Neynar V2...");
          
          // Cast response to our V2 interface
          const neynarUser = (await fetchNeynarUser(viewerFid)) as NeynarUserV2;
          
          if (neynarUser) {
              const va = neynarUser.verified_addresses;
              const custody = neynarUser.custody_address;

              // --- 🚨 UPDATED LOGIC HERE 🚨 ---
              // We check the 'primary' field directly, just like the SDK does.
              if (va?.primary?.eth_address) {
                  connectedAddress = va.primary.eth_address;
                  setDebugAddress(`Primary (V2): ${connectedAddress.slice(0,6)}...`); 
              } 
              // Fallback to the list if primary is missing for some reason
              else if (va?.eth_addresses && va.eth_addresses.length > 0) {
                   connectedAddress = va.eth_addresses[0];
                   setDebugAddress(`Verified List: ${connectedAddress.slice(0,6)}...`);
              }
              // Final fallback to custody (Vault)
              else if (custody) {
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
    
    // 1. Update Local State (Instant Feedback)
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);

    // 2. Prepare Safe Data for DB
    const dbPayload = {
        id: profile.fid,
        username: newProfile.username,
        display_name: newProfile.display_name,
        pfp_url: newProfile.pfp_url,
        custody_address: newProfile.custody_address,
        bio: newProfile.bio,
        banner_url: newProfile.banner_url,
        theme_color: newProfile.theme_color,
        border_style: newProfile.border_style,
        
        // Ensure we save the sanitized NFTs
        showcase_nfts: updates.showcase_nfts || profile.showcase_nfts,
        custom_links: updates.custom_links || profile.custom_links
    };

    // 3. Send to Supabase
    const { error } = await supabase.from('profiles').upsert(dbPayload);
    
    if (error) {
        console.error("❌ Supabase Save Failed:", error.message);
    } else {
        console.log("✅ Saved to DB!");
    }
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