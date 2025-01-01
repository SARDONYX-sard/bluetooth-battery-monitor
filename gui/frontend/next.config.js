/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: './out',
  output: 'export',
  reactStrictMode: true,
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
