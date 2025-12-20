// src/lib/neynar.ts

// Make sure you have NEXT_PUBLIC_NEYNAR_API_KEY in your .env file!
const NEYNAR_KEY = process.env.NEXT_PUBLIC_NEYNAR_API_KEY; 

export async function fetchNeynarUser(fid: number) {
  if (!NEYNAR_KEY) {
    console.error("❌ No Neynar API Key found!");
    return null;
  }

  const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;

  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        api_key: NEYNAR_KEY,
      },
    });

    const data = await response.json();
    
    // Neynar returns an array of users. We want the first one.
    const user = data.users?.[0];
    
    if (!user) return null;

    // This is the specific path your friend was using!
    // We look for the PRIMARY verified address first, then fall back to the first in the list.
    const ethAddress = user.verified_addresses?.eth_addresses?.[0] || null;

    return {
      fid: user.fid,
      username: user.username,
      display_name: user.display_name,
      pfp_url: user.pfp_url,
      custody_address: ethAddress // We map this to our app's "custody_address" field
    };

  } catch (error) {
    console.error("Error fetching from Neynar:", error);
    return null;
  }
}