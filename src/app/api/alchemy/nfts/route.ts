import { NextRequest, NextResponse } from "next/server";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

// Alchemy endpoints
const ALCHEMY_ENDPOINTS: Record<string, string> = {
  ethereum: `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`,
  base: `https://base-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`,
  zora: `https://zora-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`,
};

interface AlchemyNFT {
  tokenId: string;
  name?: string;
  contract: { address: string };
  [key: string]: unknown;
}

// Timeout helper (3 seconds is plenty for a single page)
async function fetchWithTimeout(url: string, timeout = 3000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const res = await fetch(url, { headers: { Accept: "application/json" }, signal: controller.signal });
        clearTimeout(id);
        return res;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

async function fetchChainNFTs(endpoint: string, wallet: string, chain: string) {
  try {
      // 1. We only ask for ONE page (pageSize=100)
      // This makes the request fast and prevents timeouts.
      const url = `${endpoint}/getNFTsForOwner?owner=${wallet}&withMetadata=true&pageSize=100`;
      
      const response = await fetchWithTimeout(url);
      if (!response.ok) return [];

      const data = await response.json();
      return data.ownedNfts || [];
  } catch (err) {
      console.error(`Skipping ${chain}:`, err);
      return [];
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const wallet = searchParams.get("wallet");
  const fetchAll = searchParams.get("all") === "true";

  if (!wallet) return NextResponse.json({ error: "No wallet" }, { status: 400 });
  if (!ALCHEMY_API_KEY) return NextResponse.json({ error: "No API Key" }, { status: 500 });

  try {
    const chains = ["base", "ethereum", "zora"];

    // Run all 3 fetches at the same time
    const results = await Promise.all(
       chains.map(chain => fetchChainNFTs(ALCHEMY_ENDPOINTS[chain], wallet, chain))
    );

    // Combine them all into one big list
    const allNfts = results.flat();
    
    // If "fetchAll", return everything we found (up to 300 items)
    if (fetchAll) {
        return NextResponse.json({ ownedNfts: allNfts, total: allNfts.length });
    } 
    
    // If generic fetch (for the home page), just return top 6
    const limitedNfts = allNfts.slice(0, 6);
    return NextResponse.json({ ownedNfts: limitedNfts, total: allNfts.length });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}