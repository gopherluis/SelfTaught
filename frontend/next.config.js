// next.config.js – resolve @ alias to src directory and add src to module resolution
const path = require('path');
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // any existing config can stay here
  webpack: (config, { isServer }) => {
    // Alias @ -> src
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    // Also add src to module resolution paths (helps with app router imports)
    if (!config.resolve.modules) config.resolve.modules = [];
    config.resolve.modules.push(path.resolve(__dirname, 'src'));
    return config;
  },
};
module.exports = nextConfig;

