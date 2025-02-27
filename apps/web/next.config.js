/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
    UPLOADTHING_REGIONS: process.env.UPLOADTHING_REGIONS,
  },
  images: {
    domains: ["c6ha9vzzh0.ufs.sh", "ufs.sh"],
  },
};

export default nextConfig;
