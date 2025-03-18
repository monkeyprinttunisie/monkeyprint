import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
    images: {
        domains: ['c6ha9vzzh0.ufs.sh'],
    },
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
