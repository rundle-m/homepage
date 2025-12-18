export interface Link {
  title: string;
  url: string;
}

export interface Profile {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  bio: string;
  custody_address: string;
  custom_links: Link[];
  showcase_nfts: any[];
  
  // Style fields
  dark_mode: boolean;
  theme_color: string;   
  border_style: string;  
}