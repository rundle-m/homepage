export interface Link {
  title: string;
  url: string;
}

// NEW: Define the NFT structure
export interface ShowcaseNFT {
  id: string; // We'll use a random string for ID
  title: string;
  image_url: string;
  link_url?: string; // Optional: Link to Opensea/Zora
}

export interface Profile {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  bio: string;
  custody_address: string;
  custom_links: Link[];
  
  // UPDATE: Use the specific type instead of any[]
  showcase_nfts: ShowcaseNFT[];
  
  // Style fields
  dark_mode: boolean;
  theme_color: string;   
  border_style: string;  
  
  // Legacy fields (optional to keep TS happy if you want)
  theme?: string;
  font?: string;
}