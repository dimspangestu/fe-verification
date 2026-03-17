/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,

  devIndicators: false,
  output: "standalone",

  // ✅ Fix warning multiple lockfiles / wrong workspace root
  outputFileTracingRoot: path.join(__dirname),

  // ✅ Next 16: gunakan ini (bukan experimental.serverComponentsExternalPackages)
  serverExternalPackages: ["@react-pdf/renderer"],

  transpilePackages: ["react-quill", "quill"],
};

module.exports = nextConfig;
