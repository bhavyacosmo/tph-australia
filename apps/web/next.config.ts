import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /*
      Next 16 requires an explicit quality allowlist — an unrestricted
      optimiser lets anyone generate arbitrary variants. 72 is what the two
      large photographic scenes on the landing page request (they are wide,
      heavily scrimmed, and the extra compression is invisible under the
      overlay); 75 is the framework default used everywhere else.
      node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md
    */
    qualities: [72, 75],
  },
};

export default nextConfig;
