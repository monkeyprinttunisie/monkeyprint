/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
        UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
        UPLOADTHING_REGIONS: process.env.UPLOADTHING_REGIONS,    },
  };
  
  export default nextConfig;
  