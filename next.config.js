// eslint-disable-next-line @typescript-eslint/no-var-requires
const bundleAnalyzer = require('@next/bundle-analyzer')
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },

  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
  webpack: {
    externals: ['geoip-lite'],
    node: {
      __dirname: true,
    },
  },
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
