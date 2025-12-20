"use client";

import { useState, useEffect } from 'react';
import { fetchRecentNFTs } from '../lib/alchemy';

interface GridProps {
  nfts: any[]; 
  isOwner: boolean;
  onUpdate: (nfts: any[]) => void;
  borderStyle: string;
  walletAddress?: string;
}

export function Grid({ nfts: manualNfts, isOwner, onUpdate, borderStyle, walletAddress }: GridProps) {
  const [displayNfts, setDisplayNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadNFTs = async () => {
        // LOGGING TO HELP DEBUG
        console.log("Grid Rendered. Wallet Address:", walletAddress);

        if (walletAddress) {
            setLoading(true);
            console.log("Fetching NFTs for:", walletAddress);
            const autoNfts = await fetchRecentNFTs(walletAddress);
            console.log("NFTs found:", autoNfts.length);
            setDisplayNfts(autoNfts);
            setLoading(false);
        } else {
            console.log("No wallet address. Using manual fallback.");
            setDisplayNfts(manualNfts || []);
        }
    };

    loadNFTs();
  }, [walletAddress, manualNfts]);

  if (loading) {
      return (
        <div className="p-6 text-center">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Scanning Blockchain...</p>
        </div>
      );
  }

  if (displayNfts.length === 0) {
      return (
        <div className="px-6 py-8 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl mx-6 mt-6">
            <p className="text-stone-400 text-sm">No NFTs found on Base.</p>
            {/* Show the wallet we TRIED to scan, if any */}
            {isOwner && (
                <p className="text-[10px] text-stone-300 mt-2 font-mono">
                    {walletAddress ? `Scanning: ${walletAddress.slice(0,6)}...` : "No Wallet Linked"}
                </p>
            )}
        </div>
      );
  }

  return (
    <div className="px-6 mt-8">
      <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
        Recent Collectibles (Base)
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {displayNfts.map((nft, i) => (
          <div key={`${nft.contract_address}-${i}`} className={`relative aspect-square bg-stone-100 dark:bg-stone-800 overflow-hidden shadow-sm ${borderStyle}`}>
             <img 
               src={nft.image_url} 
               alt={nft.name} 
               className="w-full h-full object-cover"
             />
             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-6">
                <p className="text-white text-xs font-bold truncate">{nft.name}</p>
                <p className="text-white/60 text-[10px] truncate">{nft.collection}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}