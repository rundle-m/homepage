import type { Metadata, Viewport } from "next"; // Add Viewport to imports
import "./globals.css";

export const metadata: Metadata = {
  title: "My Onchain Home",
  description: "A showcase of my projects and assets.",
  other: {
    "fc:frame": "vNext", 
  },
};

// NEW: This fixes mobile scaling
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-stone-50 min-h-screen">{children}</body>
    </html>
  );
}