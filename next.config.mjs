/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configuración para desarrollo y acceso externo
  experimental: {
    allowedDevOrigins: [
      'bioanalisis.com',
      'www.bioanalisis.com',
      'bioanalisisadmin.com',
      'www.bioanalisisadmin.com',
      '192.168.1.4',
      'localhost',
      '127.0.0.1',
    ],
  },
  // Configuración de CORS y permisos
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'http://bioanalisisadmin.com',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ]
  },
  // Configuración de redirecciones
  async redirects() {
    return [
      {
        source: '/http/:path*',
        destination: '/https/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
