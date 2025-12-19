import type { Metadata, ResolvingMetadata } from 'next';
import HomeClient from '../components/HomeClient'; // Import our new Client Component

// 1. SERVER-SIDE METADATA GENERATION
// This runs on the server to fix the "Post-it note" link issue
type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const fid = searchParams.fid;
  
  // ⚠️ REPLACE WITH YOUR PRODUCTION URL
  const appUrl = "https://homepage-beta-henna-99.vercel.app"; 
  
  const targetUrl = fid ? `${appUrl}?fid=${fid}` : appUrl;

  const miniappMetadata = {
    version: "1",
    imageUrl: `${appUrl}/opengraph-image.png`, 
    button: {
      title: "Launch App",
      action: {
        type: "launch_miniapp",
        name: "Showcase V2",
        url: targetUrl, 
        splashImageUrl: `${appUrl}/icon.png`,
        splashBackgroundColor: "#f7f7f7",
      },
    },
  };

  return {
    title: "Onchain Home",
    other: {
      "fc:miniapp": JSON.stringify(miniappMetadata),
    },
  };
}

// 2. RENDER THE CLIENT COMPONENT
// This hands off control to the browser immediately
export default function Page() {
  return <HomeClient />;
}