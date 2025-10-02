import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // appDir est maintenant par défaut dans Next.js 15, plus besoin de l'experimental
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com'
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com'
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com'
      }
    ]
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