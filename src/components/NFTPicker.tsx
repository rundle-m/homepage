"use client";

import { useState, useMemo } from 'react';
import { useNFTs } from '../hooks/useNFTs'; 
import type { NFT } from '../types/types';

interface NFTPickerProps {
  walletAddress: string;
  currentSelection: NFT[];
  onUpdate: (newSelection: NFT[]) => void;
  onClose: () => void;
}

export function NFTPicker({ walletAddress, currentSelection, onUpdate, onClose }: NFTPickerProps) {
  // 1. Fetch NFTs
  const { nfts: allNfts, isLoading, error } = useNFTs(walletAddress, true);
  
  const [selectedIds, setSelectedIds] = useState<string[]>(
    currentSelection.map(n => n.id)
  );
  
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);

  // Filter Logic
  const filteredNfts = useMemo(() => {
    if (!searchQuery) return allNfts;
    const lowerQuery = searchQuery.toLowerCase();
    return allNfts.filter(nft => 
      (nft.name && nft.name.toLowerCase().includes(lowerQuery)) ||
      (nft.collection && nft.collection.toLowerCase().includes(lowerQuery))
    );
  }, [allNfts, searchQuery]);

  const visibleNfts = filteredNfts.slice(0, visibleCount);

  const handleToggle = (nft: NFT) => {
    if (selectedIds.includes(nft.id)) {
      setSelectedIds(prev => prev.filter(id => id !== nft.id));
    } else {
      if (selectedIds.length >= 6) return alert("You can only select up to 6 NFTs");
      setSelectedIds(prev => [...prev, nft.id]);
    }
  };

  const handleSave = () => {
    const newSelection = allNfts.filter(nft => selectedIds.includes(nft.id));
    onUpdate(newSelection);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-stone-950 flex flex-col animate-in slide-in-from-bottom-10">
      
      {/* HEADER */}
      <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
             <h2 className="text-lg font-bold">Select NFTs</h2>
             {/* 🔍 DEBUG INFO: Shows exactly what wallet we are scanning */}
             <p className="text-[10px] font-mono text-stone-400 break-all">
                Scanning: {walletAddress || "UNDEFINED"}
             </p>
          </div>
          <div className="flex gap-2">
             <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-stone-500 hover:text-stone-800">Cancel</button>
             <button onClick={handleSave} className="px-6 py-2 bg-violet-600 text-white rounded-full text-sm font-bold shadow-lg">Save</button>
          </div>
        </div>
        
        <input 
            type="text" placeholder="Search..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 bg-stone-100 dark:bg-stone-800 rounded-xl outline-none text-sm font-medium"
        />
      </div>

      {/* ERROR MESSAGE DISPLAY */}
      {error && (
        <div className="p-4 m-4 bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-mono break-all">
           <strong>DEBUG ERROR:</strong> {error}
        </div>
      )}

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
           <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-stone-400 font-mono">SCANNING...</p>
           </div>
        ) : (
           <>
             {visibleNfts.length === 0 && !error && (
                <div className="text-center py-20 text-stone-400">
                   <p>No NFTs found.</p>
                   <p className="text-xs mt-2 opacity-50">Is this the right wallet?</p>
                </div>
             )}

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-10">
               {visibleNfts.map(nft => {
                 const isSelected = selectedIds.includes(nft.id);
                 return (
                   <div key={nft.id} onClick={() => handleToggle(nft)} className={`relative cursor-pointer aspect-square rounded-xl overflow-hidden border-2 ${isSelected ? 'border-violet-500' : 'border-transparent'}`}>
                     {nft.image_url ? <img src={nft.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-stone-800" />}
                     {isSelected && <div className="absolute top-2 right-2 bg-violet-600 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">✓</div>}
                   </div>
                 );
               })}
             </div>
             
             {visibleCount < filteredNfts.length && (
                 <button onClick={() => setVisibleCount(p => p + 12)} className="w-full py-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs font-bold">Load More</button>
             )}
           </>
        )}
      </div>
    </div>
  );
}