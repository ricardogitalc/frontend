/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Adicione estas configurações
  webpack: (config) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
  // Aumenta o timeout do página
  pageExtensions: ["tsx", "ts", "jsx", "js"],
  staticPageGenerationTimeout: 1000,
};

module.exports = nextConfig;
