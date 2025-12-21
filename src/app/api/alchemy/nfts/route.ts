import { NextRequest, NextResponse } from "next/server";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

// Alchemy endpoints
const ALCHEMY_ENDPOINTS: Record<string, string> = {
  ethereum: `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`,
  base: `https://base-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`,
  zora: `https://zora-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`,
};

// Helper: Timeout after 8 seconds (gave it more breathing room)
async function fetchWithTimeout(url: string, timeout = 8000) {
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
      // Log that we are starting
      console.log(`🔹 Fetching ${chain}...`);
      
      const url = `${endpoint}/getNFTsForOwner?owner=${wallet}&withMetadata=true&pageSize=100`;
      
      const response = await fetchWithTimeout(url);
      
      if (!response.ok) {
          console.error(`❌ ${chain} Error: ${response.status}`);
          return [];
      }

      const data = await response.json();
      console.log(`✅ ${chain} found: ${data.ownedNfts?.length || 0} NFTs`);
      return data.ownedNfts || [];
  } catch (err) {
      console.error(`⚠️ ${chain} Timed Out or Failed:`, err);
      return []; // Return empty list instead of crashing
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const wallet = searchParams.get("wallet");
  const fetchAll = searchParams.get("all") === "true";

  // 1. Validate Inputs
  if (!wallet) {
      console.error("❌ No wallet provided");
      return NextResponse.json({ error: "No wallet" }, { status: 400 });
  }
  if (!ALCHEMY_API_KEY) {
      console.error("❌ No Alchemy Key in .env");
      return NextResponse.json({ error: "No API Key" }, { status: 500 });
  }

  try {
    const chains = ["base", "ethereum", "zora"];
    console.log(`🚀 Starting fetch for ${wallet.slice(0,6)}...`);

    // Run all 3 fetches at the same time
    const results = await Promise.all(
       chains.map(chain => fetchChainNFTs(ALCHEMY_ENDPOINTS[chain], wallet, chain))
    );

    // Combine them all into one big list
    const allNfts = results.flat();
    console.log(`🏁 Total NFTs found: ${allNfts.length}`);
    
    // Always return 200 OK, even if list is empty
    return NextResponse.json({ ownedNfts: allNfts, total: allNfts.length });

  } catch (error) {
    console.error("🔥 CRITICAL API ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}