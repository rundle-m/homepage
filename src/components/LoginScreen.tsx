"use client"; 

import { useState } from 'react';

interface LoginScreenProps {
  onLogin: (fid: number) => void; // Expects a function that takes a number
  isLoggingIn: boolean;
}

export function LoginScreen({ onLogin, isLoggingIn }: LoginScreenProps) {
  // Default to FID 3 (dwr.eth) for quick testing
  const [fidInput, setFidInput] = useState('3'); 

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50 text-center">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl border border-stone-100">
        <div className="mb-6">
          <div className="w-16 h-16 bg-violet-600 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg shadow-violet-200">
            🏠
          </div>
        </div>
        
        <h1 className="text-2xl font-black text-stone-900 mb-2">Welcome Home</h1>
        <p className="text-stone-500 mb-8">Connect your Farcaster identity to view your profile.</p>

        {/* Test Input */}
        <div className="mb-4">
            <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">Enter FID</label>
            <input 
              type="number" 
              value={fidInput}
              onChange={(e) => setFidInput(e.target.value)}
              className="w-full p-3 bg-stone-100 rounded-xl text-center font-mono outline-none focus:ring-2 focus:ring-violet-500"
            />
        </div>

        <button 
          onClick={() => onLogin(Number(fidInput))} // Sends the number back to page.tsx
          disabled={isLoggingIn}
          className="w-full py-4 bg-violet-600 text-white rounded-xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50"
        >
          {isLoggingIn ? 'Connecting...' : 'Connect Identity'}
        </button>
      </div>
    </div>
  );
}