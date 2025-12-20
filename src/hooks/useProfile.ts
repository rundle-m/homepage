"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; 
import sdk from "@farcaster/frame-sdk";
import type { Profile } from '../types/types';
import { supabase } from '../lib/supabaseClient';
import { fetchNeynarUser } from '../lib/neynar'; // 👈 Import the new tool

// (Keep the FarcasterUser interface if you want, though we rely less on it now)
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
      
      // 1. 🛑 STOP! Don't rely on context for address.
      // If we have a Viewer FID, let's ask Neynar for the real details.
      let connectedAddress = "";
      
      if (viewerFid) {
          setDebugAddress("Asking Neynar...");
          const neynarUser = await fetchNeynarUser(viewerFid);
          
          if (neynarUser && neynarUser.custody_address) {
              connectedAddress = neynarUser.custody_address;
              setDebugAddress(connectedAddress); // Show success in debug box
          } else {
              setDebugAddress("Neynar found user, but no ETH address linked.");
          }
      } else {
          setDebugAddress("No Viewer FID found (Localhost?)");
      }

      // 2. Logic Flow (Same as before, but using the Neynar-sourced address)
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
                custody_address: connectedAddress // 👈 Using Neynar's data
             });
        }

      } else if (viewerFid) {
        // --- OWNER MODE ---
        setIsOwner(true);
        await checkAccountStatus(
            viewerFid, 
            user?.username || 'unknown', 
            user?.pfpUrl || '',
            connectedAddress // 👈 Using Neynar's data
        );
      } else {
        // Localhost fallback
        setIsOwner(true);
        setIsLoading(false);
      }
    };

    init();
  }, [urlFid]);

  // ... (The rest of the file: checkAccountStatus, fetchProfileOnly, etc. stays EXACTLY the same)
  // ... Just make sure to keep the imports and the rest of the functions intact.
  
  // Quick helper to ensure checkAccountStatus uses the new address logic
  async function checkAccountStatus(fid: number, username: string, pfpUrl: string, address: string) {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', fid).single();

      if (data) {
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
  
  // ... (Paste the rest of the file from previous steps: fetchProfileOnly, mapDataToProfile, createAccount, updateProfile, switchToMyProfile, return)
  
  // Don't forget to close the function
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