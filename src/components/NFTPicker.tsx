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
  // 1. Fetch NFTs (Returns ~300 items quickly)
  const { nfts: allNfts, isLoading, error } = useNFTs(walletAddress, true);
  
  const [selectedIds, setSelectedIds] = useState<string[]>(
    currentSelection.map(n => n.id)
  );
  
  // 2. Search & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(12); // Start with 12 items

  // 3. 🧠 SMARTER SEARCH LOGIC
  const filteredNfts = useMemo(() => {
    if (!searchQuery) return allNfts;
    const lowerQuery = searchQuery.toLowerCase();
    
    return allNfts.filter(nft => {
      // Check Name (e.g. "Punk #44")
      const matchName = nft.name && nft.name.toLowerCase().includes(lowerQuery);
      // Check Collection (e.g. "FIDPunks")
      const matchCollection = nft.collection && nft.collection.toLowerCase().includes(lowerQuery);
      // Check ID (e.g. "44")
      const matchId = nft.id.toLowerCase().includes(lowerQuery);
      
      return matchName || matchCollection || matchId;
    });
  }, [allNfts, searchQuery]);

  // 4. Get only the visible chunk
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
    // 1. Get the raw selected objects from the big list
    const rawSelection = allNfts.filter(nft => selectedIds.includes(nft.id));
    
    // 2. 🛡️ SANITIZE & STANDARDIZE
    // We strictly map to 'image_url' to match your DB and Type definition.
    // We removed floorPrice as requested.
    const cleanSelection: NFT[] = rawSelection.map(nft => ({
        id: nft.id,
        name: nft.name || "Untitled NFT",
        collection: nft.collection || "Unknown Collection",
        // 👇 CRITICAL: Ensures this matches the 'image_url' expected by the Grid and DB
        image_url: nft.image_url || "", 
    }));

    // 3. Update parent
    onUpdate(cleanSelection);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-stone-950 flex flex-col animate-in slide-in-from-bottom-10">
      
      {/* HEADER */}
      <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
             <h2 className="text-lg font-bold">Select NFTs</h2>
             {/* DEBUG: Shows scanning status */}
             <p className="text-[10px] font-mono text-stone-400 break-all">
                Scanning: {walletAddress || "UNDEFINED"}
             </p>
          </div>
          <div className="flex gap-2">
             <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-stone-500 hover:text-stone-800">Cancel</button>
             <button 
               onClick={handleSave} 
               className="px-6 py-2 bg-violet-600 text-white rounded-full text-sm font-bold hover:bg-violet-700 transition shadow-lg shadow-violet-500/30"
             >
               Save
             </button>
          </div>
        </div>
        
        {/* SEARCH BAR */}
        <input 
            type="text" 
            placeholder="Search by Name, Collection, or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 bg-stone-100 dark:bg-stone-800 rounded-xl outline-none text-sm font-medium focus:ring-2 focus:ring-violet-500 transition"
        />
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="p-4 m-4 bg-red-50 text-red-500 rounded-xl text-center text-xs font-mono border border-red-100">
           <strong>DEBUG ERROR:</strong> {error}
        </div>
      )}

      {/* GRID */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
           <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-stone-400 font-mono">SCANNING WALLET...</p>
           </div>
        ) : (
           <>
             {visibleNfts.length === 0 && !error && (
                <div className="text-center py-20 text-stone-400">
                   <p>No NFTs found matching "{searchQuery}".</p>
                </div>
             )}

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-10">
               {visibleNfts.map(nft => {
                 const isSelected = selectedIds.includes(nft.id);
                 return (
                   <div 
                     key={nft.id}
                     onClick={() => handleToggle(nft)}
                     className={`
                       relative group cursor-pointer aspect-square rounded-xl overflow-hidden border-2 transition-all
                       ${isSelected ? 'border-violet-500 shadow-xl shadow-violet-500/20 scale-95' : 'border-transparent hover:border-stone-300 dark:hover:border-stone-700'}
                     `}
                   >
                     {/* Image Display - Using image_url */}
                     {nft.image_url ? (
                       <img src={nft.image_url} alt={nft.name} loading="lazy" className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-stone-300 text-xs">No Image</div>
                     )}
                     
                     {/* Checkmark */}
                     <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${isSelected ? 'bg-violet-600 border-violet-600 text-white' : 'bg-black/40 border-white/50'}`}>
                        {isSelected && <span className="text-xs font-bold">✓</span>}
                     </div>

                     {/* Label: Name & Collection */}
                     <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-6">
                        <p className="text-white text-[10px] font-bold truncate">
                          {nft.name}
                        </p>
                        <p className="text-stone-300 text-[9px] truncate opacity-80">
                          {nft.collection}
                        </p>
                     </div>
                   </div>
                 );
               })}
             </div>

             {/* LOAD MORE BUTTON */}
             {visibleCount < filteredNfts.length && (
                 <div className="flex justify-center pb-10">
                     <button 
                        onClick={() => setVisibleCount(prev => prev + 12)}
                        className="px-6 py-3 bg-stone-100 dark:bg-stone-800 text-stone-500 rounded-full text-xs font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition"
                     >
                        Load More ({filteredNfts.length - visibleCount} remaining)
                     </button>
                 </div>
             )}
           </>
        )}
      </div>
    </div>
  );
}