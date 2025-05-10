const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  assetPrefix: isProd ? '/myBooks/' : '',
  basePath: isProd ? '/myBooks' : '',
};

module.exports = nextConfig;
