import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  env: {
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
    UPLOADTHING_REGIONS: process.env.UPLOADTHING_REGIONS,
  },
  images: {
    domains: ["c6ha9vzzh0.ufs.sh", "ufs.sh", "utfs.io"],
    unoptimized: process.env.NODE_ENV === "development",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
