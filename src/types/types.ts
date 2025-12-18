export interface Link {
  title: string;
  url: string;
}

export interface ShowcaseNFT {
  id: string;
  title: string;
  image_url: string;
  link_url?: string;
}

export interface Profile {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  bio: string;
  custody_address: string;
  custom_links: Link[];
  showcase_nfts: ShowcaseNFT[];
  
  // NEW: Banner Field
  banner_url?: string;
  
  // Style fields
  dark_mode: boolean;
  theme_color: string;   
  border_style: string;  
}