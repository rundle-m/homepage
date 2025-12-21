import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY;

// Alchemy endpoints
const ALCHEMY_ENDPOINTS: Record<string, string> = {
  ethereum: `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`,
  base: `https://base-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`,
  zora: `https://zora-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`,
};

async function fetchChainNFTs(endpoint: string, wallet: string, chain: string) {
  let allChainNfts: any[] = [];
  let pageKey = "";
  let keepFetching = true;
  
  // Safety Limit: Stop after 5 pages (500 NFTs per chain) to prevent freezing
  let loopCount = 0;
  const MAX_LOOPS = 5; 

  try {
      while (keepFetching && loopCount < MAX_LOOPS) {
          // Construct URL with pageKey if it exists
          let url = `${endpoint}/getNFTsForOwner?owner=${wallet}&withMetadata=true&pageSize=100`;
          if (pageKey) {
              url += `&pageKey=${pageKey}`;
          }

          const response = await fetch(url, { headers: { Accept: "application/json" } });
          
          if (!response.ok) {
              console.error(`Error on ${chain}: ${response.status}`);
              keepFetching = false;
              break;
          }

          const data = await response.json();
          const nfts = data.ownedNfts || [];
          
          // Add this page's NFTs to our master list
          allChainNfts = [...allChainNfts, ...nfts];

          // Check if there is another page
          if (data.pageKey) {
              pageKey = data.pageKey;
              loopCount++;
          } else {
              keepFetching = false; // No more pages, we are done!
          }
      }
      
      return allChainNfts;
  } catch (err) {
      console.error(`Failed to fetch ${chain}`, err);
      return allChainNfts; // Return whatever we managed to find
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const wallet = searchParams.get("wallet");
    const fetchAll = searchParams.get("all") === "true";

    if (!wallet) return NextResponse.json({ error: "Missing Wallet" }, { status: 400 });
    if (!ALCHEMY_API_KEY) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

    const chains = ["base", "ethereum", "zora"];

    // Fetch all chains in parallel
    const results = await Promise.all(
       chains.map(chain => fetchChainNFTs(ALCHEMY_ENDPOINTS[chain], wallet, chain))
    );

    const allNfts = results.flat();
    
    return NextResponse.json({ 
        ownedNfts: fetchAll ? allNfts : allNfts.slice(0, 6), 
        total: allNfts.length 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}