import { useState } from 'react';
import { useNFTs } from '../hooks/useNFTs'; // Import our new hook
import type { NFT } from '../types/types';

interface NFTPickerProps {
  walletAddress: string;
  currentSelection: NFT[];
  onUpdate: (newSelection: NFT[]) => void;
  onClose: () => void;
}

export function NFTPicker({ walletAddress, currentSelection, onUpdate, onClose }: NFTPickerProps) {
  // 1. Fetch ALL NFTs using the hook
  const { nfts: allNfts, isLoading } = useNFTs(walletAddress, true); // true = fetch all
  
  // 2. Local state to manage selection before saving
  const [selectedIds, setSelectedIds] = useState<string[]>(
    currentSelection.map(n => n.id)
  );

  const handleToggle = (nft: NFT) => {
    if (selectedIds.includes(nft.id)) {
      // Remove it
      setSelectedIds(prev => prev.filter(id => id !== nft.id));
    } else {
      // Add it (if under limit)
      if (selectedIds.length >= 6) return alert("You can only select up to 6 NFTs");
      setSelectedIds(prev => [...prev, nft.id]);
    }
  };

  const handleSave = () => {
    // Find the full NFT objects for the selected IDs
    const newSelection = allNfts.filter(nft => selectedIds.includes(nft.id));
    onUpdate(newSelection);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-stone-950 flex flex-col animate-in slide-in-from-bottom-10">
      
      {/* HEADER */}
      <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0">
        <div>
          <h2 className="text-lg font-bold">Select NFTs</h2>
          <p className="text-xs text-stone-500">{selectedIds.length} / 6 selected</p>
        </div>
        <div className="flex gap-2">
           <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-stone-500 hover:text-stone-800">Cancel</button>
           <button 
             onClick={handleSave} 
             className="px-6 py-2 bg-violet-600 text-white rounded-full text-sm font-bold hover:bg-violet-700 transition"
           >
             Save Changes
           </button>
        </div>
      </div>

      {/* GRID */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
           <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-stone-400 font-mono">LOADING WALLET...</p>
           </div>
        ) : (
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-20">
             {allNfts.map(nft => {
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
                   {/* Image */}
                   {nft.image_url ? (
                     <img src={nft.image_url} alt={nft.name} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-stone-300 text-xs">No Image</div>
                   )}
                   
                   {/* Selection Indicator */}
                   <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center border ${isSelected ? 'bg-violet-600 border-violet-600 text-white' : 'bg-black/40 border-white/50'}`}>
                      {isSelected && <span className="text-xs font-bold">✓</span>}
                   </div>

                   {/* Label */}
                   <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white text-[10px] font-bold truncate">{nft.name}</p>
                   </div>
                 </div>
               );
             })}
           </div>
        )}
      </div>
    </div>
  );
}