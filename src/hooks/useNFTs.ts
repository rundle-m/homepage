"use client";

import { useState, useEffect } from 'react';
import type { NFT } from '../types/types';

interface AlchemyNFT {
  tokenId: string;
  name?: string;
  contract: {
    address: string;
    name?: string;
    openSeaMetadata?: { floorPrice?: number; };
  };
  image?: { cachedUrl?: string; thumbnailUrl?: string; originalUrl?: string; };
  collection?: { name?: string; };
}

interface AlchemyResponse {
  ownedNfts: AlchemyNFT[];
  total?: number;
  error?: string; // Add error type
}

function transformNFT(nft: AlchemyNFT): NFT {
  const floorPrice = nft.contract.openSeaMetadata?.floorPrice;
  const floorPriceStr = floorPrice ? `${floorPrice.toFixed(3)} ETH` : "N/A";
  const img = nft.image?.cachedUrl || nft.image?.thumbnailUrl || nft.image?.originalUrl || "";

  return {
    id: `${nft.contract.address}-${nft.tokenId}`,
    name: nft.name || `#${nft.tokenId}`,
    collection: nft.collection?.name || nft.contract.name || "Unknown",
    image_url: img,
  };
}

export function useNFTs(walletAddress: string | undefined, fetchAll: boolean = false) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no wallet is provided, don't even try.
    if (!walletAddress) {
        return;
    }

    const loadNFTs = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const url = fetchAll
           ? `/api/alchemy/nfts?wallet=${walletAddress}&all=true`
           : `/api/alchemy/nfts?wallet=${walletAddress}`;

        console.log(`🔍 Hook fetching: ${url}`); // Debug Log

        const res = await fetch(url);
        
        // If server fails (400/500), try to read the error text
        if (!res.ok) {
            const errorText = await res.text();
            try {
                // Try parsing as JSON first
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.error || `Server Error ${res.status}`);
            } catch {
                // If not JSON, use the raw text
                throw new Error(`API Error ${res.status}: ${errorText}`);
            }
        }
        
        const data: AlchemyResponse = await res.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        const cleanNFTs = (data.ownedNfts || []).map(transformNFT);
        setNfts(cleanNFTs);

      } catch (err: any) {
        console.error("Hook Error:", err);
        setError(err.message || "Unknown Error");
      } finally {
        setIsLoading(false);
      }
    };

    loadNFTs();
  }, [walletAddress, fetchAll]);

  return { nfts, isLoading, error };
}