import type { Metadata, Viewport } from "next";
import "./globals.css";

// Your exact Vercel URL (I added https://)
const APP_URL = "https://homepage-beta-henna-99.vercel.app";

export const metadata: Metadata = {
  title: "My Onchain Home",
  description: "Check out my onchain profile, projects, and assets.",
  openGraph: {
    title: "My Onchain Home",
    description: "My personal Mini-app showcase.",
    url: APP_URL, // Points to the homepage
    siteName: "Showcase V2",
    images: [
      {
        url: `${APP_URL}/opengraph-image.png`, // Points to public/opengraph-image.png
        width: 1200, 
        height: 630,
        alt: "App Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  other: {
    // The "Launch Button" configuration
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: `${APP_URL}/opengraph-image.png`, // The image shown in the feed
      button: {
        title: "Launch App",
        action: {
          type: "launch_frame",
          name: "Showcase V2",
          url: APP_URL, // Where the app actually opens
          splashImageUrl: `${APP_URL}/icon.png`, // Splash screen icon
          splashBackgroundColor: "#f7f7f7",
        },
      },
    }),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-stone-50 min-h-screen text-stone-900 antialiased">
        {children}
      </body>
    </html>
  );
}