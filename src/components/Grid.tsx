import type { NFT } from '../types/types';

interface GridProps {
  nfts: NFT[];
  isOwner: boolean;
  onUpdate?: (nfts: NFT[]) => void;
  borderStyle?: string;
  walletAddress?: string;
}

export function Grid({ nfts, isOwner, onUpdate, borderStyle }: GridProps) {
  
  // If the list is empty (or null), show the "Empty State" placeholder
  if (!nfts || nfts.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <div className="p-6 bg-stone-100 dark:bg-stone-900 rounded-3xl border-2 border-dashed border-stone-200 dark:border-stone-800">
           <p className="text-stone-400 font-bold text-sm">No NFTs Selected</p>
           {isOwner && <p className="text-stone-300 text-xs mt-1">Click "Edit Showcase" to pick some!</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-10">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {nfts.map((nft) => {
          // 🛡️ SAFE CHECK: Handle both old (imageUrl) and new (image_url) formats
          // This creates a "validImage" variable that works no matter what the DB sends
          const validImage = nft.image_url || nft.image_url || "";
          
          return (
            <div 
              key={nft.id} 
              className={`relative aspect-square overflow-hidden bg-stone-200 dark:bg-stone-800 shadow-sm ${borderStyle || 'rounded-3xl'}`}
            >
              {validImage ? (
                <img 
                  src={validImage} 
                  alt={nft.name || "NFT"} 
                  className="w-full h-full object-cover transition hover:scale-105 duration-500"
                  loading="lazy"
                />
              ) : (
                 // Fallback for missing image
                 <div className="w-full h-full flex items-center justify-center bg-stone-100 dark:bg-stone-900">
                    <span className="text-stone-300 text-[10px] font-bold">NO IMAGE</span>
                 </div>
              )}

              {/* Gradient & Text Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <p className="text-white text-[10px] font-bold truncate tracking-wide">
                  {nft.name || "Untitled"}
                </p>
                <p className="text-stone-300 text-[9px] truncate opacity-80">
                  {nft.collection || "Unknown Collection"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}