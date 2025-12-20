export async function fetchNeynarUser(fid: number) {
    // 1. Get the key, but fallback to an empty string ("") if it's missing to satisfy TypeScript
    const API_KEY = process.env.NEXT_PUBLIC_NEYNAR_API_KEY || ""; 
    
    if (!API_KEY) {
        console.error("❌ Missing NEXT_PUBLIC_NEYNAR_API_KEY in .env file");
        return null;
    }

    const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;
  
    try {
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          "x-api-key": API_KEY, // Now this is guaranteed to be a string
        },
      });
      
      if (!response.ok) {
          console.error("Neynar API failed with status:", response.status);
          return null;
      }
  
      const data = await response.json();
      return data.users ? data.users[0] : null;
    } catch (error) {
      console.error("Error fetching Neynar user:", error);
      return null;
    }
}