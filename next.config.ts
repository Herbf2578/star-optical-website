import type { NextConfig } from 'next';
const productionIndex = process.env.SITE_INDEXABLE === 'true';
const config: NextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  images: { formats: ['image/avif', 'image/webp'] },
  async redirects() {
    return ['/', '/children-eye-care/', '/adult-eyewear/', '/school-vision-screening/', '/frames/', '/contact/'].map(path => ({
      source: `${path}index.html`, destination: path, permanent: true,
    }));
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ...(!productionIndex ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] : [])
    ] }];
  }
};
export default config;
