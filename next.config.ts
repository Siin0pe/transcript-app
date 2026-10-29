import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingExcludes: {
    "*": [
      "node_modules/@huggingface/**",
      "node_modules/onnxruntime-*/**",
      "node_modules/@img/**",
      "node_modules/sharp/**",
      "transcript.db*",
    ],
  },
}

export default nextConfig
