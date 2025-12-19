"use client"; 

import { useState } from 'react';
import type { Link } from '../types/types';

interface ProjectListProps {
  links: Link[];
  isOwner: boolean;
  onUpdate: (links: Link[]) => void;
}

export function ProjectList({ links, isOwner, onUpdate }: ProjectListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const handleAddLink = () => {
    if (!newTitle || !newUrl) return;
    
    // Auto-fix URL if missing https
    const finalUrl = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
    
    // Add new link (No ID needed, just title and url)
    const updated = [...links, { title: newTitle, url: finalUrl }];
    onUpdate(updated);
    
    setNewTitle("");
    setNewUrl("");
    setIsAdding(false);
  };

  // Remove by INDEX (Position) instead of ID
  const removeLink = (indexToRemove: number) => {
    const updated = links.filter((_, i) => i !== indexToRemove);
    onUpdate(updated);
  };

  return (
    <section className="px-6 mt-8 mb-8">
      <div className="flex justify-between items-end mb-4">
        <h3 className="font-bold text-xs uppercase tracking-widest text-stone-400">My Projects</h3>
      </div>
      
      {/* Empty State */}
      {links.length === 0 && (
        <div className="text-center p-6 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-xl mb-4">
          <p className="text-sm text-stone-400">No links added yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {links.map((link, index) => (
          <div key={index} className="p-4 bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 flex justify-between items-center group transition-colors">
             <div className="flex items-center gap-3 overflow-hidden">
               <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-lg shrink-0">
                 🔗
               </div>
               <a href={link.url} target="_blank" rel="noreferrer" className="font-bold text-stone-800 dark:text-stone-200 hover:text-violet-500 truncate">
                 {link.title}
               </a>
             </div>
             
             {isOwner && (
               <button 
                 onClick={() => removeLink(index)} 
                 className="text-stone-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all"
                 title="Remove link"
               >
                 ✕
               </button>
             )}
          </div>
        ))}
      </div>

      {isOwner && !isAdding && (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full mt-3 py-3 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 text-stone-400 font-bold hover:bg-stone-50 dark:hover:bg-stone-800 hover:border-stone-400 transition"
        >
          + Add Link
        </button>
      )}

      {isAdding && (
        <div className="mt-4 p-4 bg-stone-100 dark:bg-stone-800 rounded-xl space-y-3 animate-in slide-in-from-top-2">
          <input 
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Link Title (e.g. Portfolio)"
            className="w-full p-3 rounded-lg border-none outline-none focus:ring-2 focus:ring-violet-500 bg-white dark:bg-stone-900"
            autoFocus
          />
          <input 
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="URL (e.g. google.com)"
            className="w-full p-3 rounded-lg border-none outline-none focus:ring-2 focus:ring-violet-500 bg-white dark:bg-stone-900"
          />
          <div className="flex gap-2 pt-2">
            <button onClick={handleAddLink} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-2 rounded-lg font-bold shadow-lg">Save Link</button>
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-stone-500 font-bold hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg">Cancel</button>
          </div>
        </div>
      )}
    </section>
  );
}