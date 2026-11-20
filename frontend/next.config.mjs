/** @type {import('next').NextConfig} */
import path from 'path';

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Alias @ → src
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    // Add src to module resolution paths (helps with app router imports)
    if (!config.resolve.modules) config.resolve.modules = [];
    config.resolve.modules.push(path.resolve(__dirname, 'src'));
    // Ensure .ts/.tsx extensions are resolved
    config.resolve.extensions = Array.from(
      new Set([...(config.resolve.extensions || []), '.ts', '.tsx', '.js', '.jsx'])
    );
    return config;
  },
};

export default nextConfig;
