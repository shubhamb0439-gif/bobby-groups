import type { NextConfig } from "next";

const YEAR = 60 * 60 * 24 * 365;
const WEEK = 60 * 60 * 24 * 7;

const nextConfig: NextConfig = {
  // Lets a phone on the same Wi-Fi open the dev server (http://<your-PC-IP>:3000).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],

  async headers() {
    return [
      {
        // Frame URLs carry ?v=<build version> from sequence.json, so they can be cached forever.
        source: "/frames/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${YEAR}, immutable` }],
      },
      {
        source: "/:dir(textures|cursors|brand)/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${WEEK}, stale-while-revalidate=${YEAR}` }],
      },
    ];
  },
};

export default nextConfig;
