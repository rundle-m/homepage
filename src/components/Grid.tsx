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
  const [debugStatus, setDebugStatus] = useState("Initializing...");

  useEffect(() => {
    const loadNFTs = async () => {
        // 1. Report what we see
        if (!walletAddress) {
            setDebugStatus("🔴 No Wallet Address passed to Grid.");
            setDisplayNfts(manualNfts || []);
            return;
        }

        setDebugStatus(`🟡 Found Address: ${walletAddress.slice(0, 6)}... Fetching...`);
        setLoading(true);

        // 2. Try to Fetch
        const autoNfts = await fetchRecentNFTs(walletAddress);
        
        // 3. Report results
        if (autoNfts.length > 0) {
            setDebugStatus(`🟢 Success! Found ${autoNfts.length} NFTs.`);
            setDisplayNfts(autoNfts);
        } else {
            setDebugStatus(`🟠 Alchemy returned 0 NFTs (or API failed).`);
            setDisplayNfts(manualNfts || []); // Fallback
        }
        setLoading(false);
    };

    loadNFTs();
  }, [walletAddress, manualNfts]);

  return (
    <div className="px-6 mt-8">
      {/* 🛠️ VISIBLE DEBUGGER (Remove later) */}
      <div className="bg-stone-900 text-stone-400 text-[10px] font-mono p-2 rounded mb-4 break-all">
        DEBUG: {debugStatus} <br/>
        PROP: {walletAddress || "Undefined"}
      </div>

      <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
        Recent Collectibles
      </h3>
      
      {loading && (
         <div className="p-6 text-center">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Scanning...</p>
        </div>
      )}

      {!loading && displayNfts.length > 0 && (
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
                </div>
            </div>
            ))}
        </div>
      )}
      
      {!loading && displayNfts.length === 0 && (
         <p className="text-center text-sm text-stone-400">No images found.</p>
      )}
    </div>
  );
}