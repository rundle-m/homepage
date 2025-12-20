import { NextRequest, NextResponse } from "next/server";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

// Alchemy endpoints per chain
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

interface AlchemyResponse {
  ownedNfts: AlchemyNFT[];
  pageKey?: string;
}

// Fetch all NFTs for a single chain with pagination
async function fetchAllNFTsForChain(
  endpoint: string,
  wallet: string,
  chain: string
): Promise<AlchemyNFT[]> {
  const allNfts: AlchemyNFT[] = [];
  let pageKey: string | undefined;
  const maxPages = 10; // Safety limit to prevent infinite loops
  let pageCount = 0;

  do {
    const url = new URL(`${endpoint}/getNFTsForOwner`);
    url.searchParams.set("owner", wallet);
    url.searchParams.set("withMetadata", "true");
    url.searchParams.set("pageSize", "100");
    if (pageKey) {
      url.searchParams.set("pageKey", pageKey);
    }

    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error(`Alchemy ${chain} error:`, await response.text());
      break;
    }

    const data: AlchemyResponse = await response.json();
    allNfts.push(...data.ownedNfts);
    pageKey = data.pageKey;
    pageCount++;
  } while (pageKey && pageCount < maxPages);

  return allNfts;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const wallet = searchParams.get("wallet");
  const fetchAll = searchParams.get("all") === "true";

  if (!wallet) {
    return NextResponse.json(
      { error: "Wallet address is required" },
      { status: 400 }
    );
  }

  if (!ALCHEMY_API_KEY) {
    return NextResponse.json(
      { error: "Alchemy API key not configured" },
      { status: 500 }
    );
  }

  try {
    const chains = ["base", "ethereum", "zora"];

    if (fetchAll) {
      // Fetch ALL NFTs with pagination for each chain
      const chainPromises = chains.map(async (chain) => {
        const endpoint = ALCHEMY_ENDPOINTS[chain];
        if (!endpoint) return [];
        return fetchAllNFTsForChain(endpoint, wallet, chain);
      });

      const results = await Promise.all(chainPromises);
      const allNfts = results.flat();

      return NextResponse.json({ ownedNfts: allNfts, total: allNfts.length });
    } else {
      // Just fetch first page for the main gallery preview
      const chainPromises = chains.map(async (chain) => {
        const endpoint = ALCHEMY_ENDPOINTS[chain];
        if (!endpoint) return { ownedNfts: [] };

        const url = `${endpoint}/getNFTsForOwner?owner=${wallet}&withMetadata=true&pageSize=50`;

        const response = await fetch(url, {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          console.error(`Alchemy ${chain} error:`, await response.text());
          return { ownedNfts: [] };
        }

        return response.json();
      });

      const results = await Promise.all(chainPromises);
      const allNfts = results.flatMap((result) => result.ownedNfts || []);
      const limitedNfts = allNfts.slice(0, 6);

      return NextResponse.json({ ownedNfts: limitedNfts, total: allNfts.length });
    }
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
