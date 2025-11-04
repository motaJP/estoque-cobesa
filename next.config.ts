import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Otimizações para Vercel
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  
  // Configurações de imagem
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Apenas para desenvolvimento local
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      allowedDevOrigins: [
        'https://6000-firebase-studio-1761557399848.cluster-f73ibkkuije66wssuontdtbx6q.cloudworkstations.dev',
      ],
    },
  }),
};

export default nextConfig;
