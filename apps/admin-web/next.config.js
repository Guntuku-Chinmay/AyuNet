/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@ayunet/ui", "@ayunet/utils", "@ayunet/types"]
};

module.exports = nextConfig;
