import { NextRequest, NextResponse } from "next/server";

// Force this route to be dynamic so it doesn't cache old errors
export const dynamic = 'force-dynamic';

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY;

// Alchemy endpoints
const ALCHEMY_ENDPOINTS: Record<string, string> = {
  ethereum: `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`,
  base: `https://base-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`,
  zora: `https://zora-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`,
};

async function fetchChainNFTs(endpoint: string, wallet: string, chain: string) {
  try {
      // Fetch only 1 page (100 items) to keep it fast
      const url = `${endpoint}/getNFTsForOwner?owner=${wallet}&withMetadata=true&pageSize=100`;
      
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      
      if (!response.ok) {
          console.error(`Error on ${chain}: ${response.status}`);
          return [];
      }

      const data = await response.json();
      return data.ownedNfts || [];
  } catch (err) {
      console.error(`Failed to fetch ${chain}`, err);
      return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const wallet = searchParams.get("wallet");
    const fetchAll = searchParams.get("all") === "true";

    // 1. Debugging Checks (These will show up in the frontend error now)
    if (!wallet) {
        return NextResponse.json({ error: "Missing Wallet Address" }, { status: 400 });
    }
    if (!ALCHEMY_API_KEY) {
        // 🚨 This is likely the issue!
        return NextResponse.json({ error: "Configuration Error: ALCHEMY_API_KEY is missing on Vercel." }, { status: 500 });
    }

    const chains = ["base", "ethereum", "zora"];

    // 2. Fetch Data
    const results = await Promise.all(
       chains.map(chain => fetchChainNFTs(ALCHEMY_ENDPOINTS[chain], wallet, chain))
    );

    const allNfts = results.flat();
    
    // 3. Return Data
    return NextResponse.json({ 
        ownedNfts: fetchAll ? allNfts : allNfts.slice(0, 6), 
        total: allNfts.length 
    });

  } catch (error: any) {
    // Catch-all for code crashes
    return NextResponse.json({ 
        error: `Server Crash: ${error.message || "Unknown Error"}` 
    }, { status: 500 });
  }
}