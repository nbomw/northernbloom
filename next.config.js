const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");

/** @type {import('next').NextConfig} */
const nextConfig = {};

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev(nextConfig);
}

module.exports = nextConfig;
