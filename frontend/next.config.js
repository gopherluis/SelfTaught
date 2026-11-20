// next.config.js – resolve @ alias to src directory
const path = require('path');
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // any existing config can stay here
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};
module.exports = nextConfig;
