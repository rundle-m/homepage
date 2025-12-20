// Replace this with your actual Alchemy Key
// Or better, use process.env.NEXT_PUBLIC_ALCHEMY_KEY if you set up env vars
const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY; "docs-demo";// ⚠️ REPLACE THIS WITH YOUR KEY! "docs-demo" has rate limits.
const CHAIN = "base-mainnet"; // We focus on Base for Farcaster users

export async function fetchRecentNFTs(address: string) {
  if (!address) return [];

  const url = `https://${CHAIN}.g.alchemy.com/nft/v3/${ALCHEMY_KEY}/getNFTsForOwner?owner=${address}&pageSize=6&withMetadata=true&excludeFilters[]=SPAM`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { accept: 'application/json' }
    });

    const data = await response.json();
    
    if (!data.ownedNfts) return [];

    // Map Alchemy format to our App format
    return data.ownedNfts.map((nft: any) => ({
      id: nft.tokenId,
      name: nft.name || "Unkown NFT",
      // We look for the first image URL available
      image_url: nft.image.cachedUrl || nft.image.originalUrl || "",
      collection: nft.contract.name || "Collection",
      contract_address: nft.contract.address
    })).filter((nft: any) => nft.image_url); // Only keep ones with images

  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return [];
  }
}