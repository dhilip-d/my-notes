/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true // remove loaderFile, this is enough for static hosting
  }
};

module.exports = nextConfig;
