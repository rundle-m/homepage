import { useState } from 'react';
import type { ShowcaseNFT } from '../types/types';

interface NFTGridProps {
  nfts: ShowcaseNFT[];
  isOwner: boolean;
  onUpdate: (nfts: ShowcaseNFT[]) => void;
  borderStyle: string; // We pass this down so the images match the profile theme!
}

export function NFTGrid({ nfts, isOwner, onUpdate, borderStyle }: NFTGridProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const handleAdd = () => {
    if (!title || !imageUrl) return;
    
    const newNFT: ShowcaseNFT = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      image_url: imageUrl,
      link_url: linkUrl
    };

    onUpdate([...nfts, newNFT]);
    setTitle("");
    setImageUrl("");
    setLinkUrl("");
    setIsAdding(false);
  };

  const removeNFT = (id: string) => {
    onUpdate(nfts.filter(n => n.id !== id));
  };

  return (
    <section className="px-6 mt-8 mb-8">
      <div className="flex justify-between items-end mb-4">
        <h3 className="font-bold text-xs uppercase tracking-widest text-stone-400">Art Collection</h3>
      </div>

      {/* The Grid */}
      {nfts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {nfts.map((nft) => (
            <div key={nft.id} className="relative group">
              {/* The Image Card */}
              <div className={`overflow-hidden aspect-square bg-stone-200 dark:bg-stone-800 relative ${borderStyle}`}>
                 <img 
                   src={nft.image_url} 
                   alt={nft.title}
                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                 />
                 
                 {/* Gradient Overlay on Hover */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                   <p className="text-white text-xs font-bold truncate">{nft.title}</p>
                 </div>
              </div>

              {/* Delete Button (Owner Only) */}
              {isOwner && (
                <button 
                  onClick={() => removeNFT(nft.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full shadow-md text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        !isAdding && (
            <div className="text-center p-8 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl">
            <p className="text-sm text-stone-400 mb-2">Your gallery is empty.</p>
            </div>
        )
      )}

      {/* Add Button */}
      {isOwner && !isAdding && (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 text-stone-400 font-bold hover:bg-stone-50 dark:hover:bg-stone-800 hover:border-stone-400 transition"
        >
          + Add Art
        </button>
      )}

      {/* Add Form */}
      {isAdding && (
        <div className="mt-4 p-4 bg-stone-100 dark:bg-stone-800 rounded-xl space-y-3 animate-in slide-in-from-top-2">
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g. Farcaster OG)"
            className="w-full p-3 rounded-lg border-none outline-none focus:ring-2 focus:ring-violet-500 bg-white dark:bg-stone-900"
            autoFocus
          />
          <input 
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL (Right click image -> Copy Link)"
            className="w-full p-3 rounded-lg border-none outline-none focus:ring-2 focus:ring-violet-500 bg-white dark:bg-stone-900"
          />
          <div className="flex gap-2 pt-2">
            <button onClick={handleAdd} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-2 rounded-lg font-bold shadow-lg">Add to Gallery</button>
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-stone-500 font-bold hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg">Cancel</button>
          </div>
        </div>
      )}
    </section>
  );
}