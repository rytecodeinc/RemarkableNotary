import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // Cloud agent browser preview is served from a different origin than localhost.
  allowedDevOrigins: [
    "*.agent.cvm.dev",
    "p-3000-pod-atha7hcvbbfg3cd4fewsb2dgdu-ae20ba75309faa24813e-us4.agent.cvm.dev",
  ],
};

export default nextConfig;
