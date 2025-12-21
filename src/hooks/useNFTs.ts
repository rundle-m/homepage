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
        collectionName?: string; // 👈 We need this field!
    };
  };
  image?: { cachedUrl?: string; thumbnailUrl?: string; originalUrl?: string; };
  collection?: { name?: string; };
}

interface AlchemyResponse {
  ownedNfts: AlchemyNFT[];
  total?: number;
  error?: string;
}

function transformNFT(nft: AlchemyNFT): NFT {
  const floorPrice = nft.contract.openSeaMetadata?.floorPrice;
  const floorPriceStr = floorPrice ? `${floorPrice.toFixed(3)} ETH` : "N/A";
  const img = nft.image?.cachedUrl || nft.image?.thumbnailUrl || nft.image?.originalUrl || "";

  // 🧠 SMARTER NAMING LOGIC
  // 1. Try to find the Collection Name from OpenSea data first (most accurate)
  // 2. Fallback to Alchemy's collection name
  // 3. Fallback to Contract name
  const collectionName = 
      nft.contract.openSeaMetadata?.collectionName || 
      nft.collection?.name || 
      nft.contract.name || 
      "Unknown Collection";

  // If the NFT has no name (common), call it "Collection #ID"
  let name = nft.name;
  if (!name) {
      name = `${collectionName} #${nft.tokenId}`;
  }

  return {
    id: `${nft.contract.address}-${nft.tokenId}`,
    name: name,
    collection: collectionName,
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
        const url = fetchAll
           ? `/api/alchemy/nfts?wallet=${walletAddress}&all=true`
           : `/api/alchemy/nfts?wallet=${walletAddress}`;

        const res = await fetch(url);
        
        if (!res.ok) {
            const errorText = await res.text();
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.error || `Server Error ${res.status}`);
            } catch {
                throw new Error(`API Error ${res.status}: ${errorText}`);
            }
        }
        
        const data: AlchemyResponse = await res.json();
        
        if (data.error) throw new Error(data.error);

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