"use client";

import { useState, useEffect } from 'react';
import type { NFT } from '../types/types';

interface AlchemyNFT {
  tokenId: string;
  name?: string;
  contract: {
    address: string;
    name?: string;
    openSeaMetadata?: {
      floorPrice?: number;
    };
  };
  image?: {
    cachedUrl?: string;
    thumbnailUrl?: string;
    originalUrl?: string;
  };
  collection?: {
    name?: string;
  };
}

interface AlchemyResponse {
  ownedNfts: AlchemyNFT[];
  total?: number;
}

// Helper: Convert Alchemy data to our App's format
function transformNFT(nft: AlchemyNFT): NFT {
  const floorPrice = nft.contract.openSeaMetadata?.floorPrice;
  const floorPriceStr = floorPrice ? `${floorPrice.toFixed(3)} ETH` : "N/A";
  
  // Use a fallback image if none exists
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
    if (!walletAddress) return;

    const loadNFTs = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Decide which endpoint to hit based on 'fetchAll'
        const url = fetchAll
           ? `/api/alchemy/nfts?wallet=${walletAddress}&all=true`
           : `/api/alchemy/nfts?wallet=${walletAddress}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load NFTs");
        
        const data: AlchemyResponse = await res.json();
        
        // Transform the raw data into our clean NFT type
        const cleanNFTs = (data.ownedNfts || []).map(transformNFT);
        
        // Filter out NFTs with no broken images if you want (Optional)
        // const validNFTs = cleanNFTs.filter(n => n.imageUrl); 

        setNfts(cleanNFTs);
      } catch (err) {
        console.error(err);
        setError("Could not fetch NFTs");
      } finally {
        setIsLoading(false);
      }
    };

    loadNFTs();
  }, [walletAddress, fetchAll]);

  return { nfts, isLoading, error };
}