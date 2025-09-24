/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration webpack pour éviter les avertissements SWC
  webpack: (config, { isServer }) => {
    // Ignorer les avertissements SWC pour les plateformes non utilisées
    config.ignoreWarnings = [
      /Managed item.*isn't a directory or doesn't contain a package\.json/,
    ];
    
    return config;
  },
  
  // Variables d'environnement publiques
  env: {
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
};

module.exports = nextConfig;