import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      allowedDevOrigins: [
        'https://6000-firebase-studio-1761557399848.cluster-f73ibkkuije66wssuontdtbx6q.cloudworkstations.dev',
      ],
    },
  }),
};

export default nextConfig;
