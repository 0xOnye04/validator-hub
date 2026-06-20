/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@kiichain/kiijs-proto'],
};

module.exports = nextConfig;
