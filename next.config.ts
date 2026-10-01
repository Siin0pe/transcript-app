import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // browser-whisper needs cross-origin isolation for threaded WASM
  headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ]
  },
}

export default nextConfig
