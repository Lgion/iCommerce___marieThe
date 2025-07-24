import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    // Ajoutez le support pour les fichiers SCSS
    config.module.rules.push({
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      include: path.resolve(__dirname, 'assets/scss')
    });

    // Configuration des alias
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
      '@/assets': path.resolve(__dirname, './assets')
    };
    return config;
  },
};

export default nextConfig;