import type { Metadata, Viewport } from "next";
import "./globals.css";

// Basic SEO Constants
const APP_URL = "https://homepage-beta-henna-99.vercel.app";
const APP_NAME = "Onchain Home";
const APP_DESC = "My personal onchain corner of the internet.";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESC,
  openGraph: {
    title: APP_NAME,
    description: APP_DESC,
    url: APP_URL,
    siteName: APP_NAME,
    images: [
      {
        url: `${APP_URL}/opengraph-image.png`, 
        width: 1200, 
        height: 630,
        alt: "App Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  // ⚠️ CRITICAL: We removed the 'other' field with 'fc:frame/miniapp' from here.
  // It is now handled dynamically in page.tsx!
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // These settings prevent the app from zooming in when you tap an input field
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