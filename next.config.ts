import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingExcludes: {
    "*": [
      "node_modules/browser-whisper/**",
      "node_modules/@huggingface/**",
      "node_modules/onnxruntime-*/**",
      "node_modules/@img/**",
      "node_modules/sharp/**",
      "transcript.db*",
    ],
  },
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
