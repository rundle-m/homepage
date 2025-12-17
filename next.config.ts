/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/.well-known/farcaster.json',
        destination: 'https://api.farcaster.xyz/miniapps/hosted-manifest/019b2bd5-f590-31a4-0a6d-237e9a361e93', // <--- PASTE YOUR LINK HERE
        permanent: false,
      },
    ];
  },
};

export default nextConfig;