import bundleAnalyzer from '@next/bundle-analyzer'
import MDX from '@next/mdx'
import recmaDisplayname from 'recma-mdx-displayname'
import recmaNextjsStaticProps from 'recma-nextjs-static-props'
import rehypeHighlight from 'rehype-highlight'
import emoji from 'remark-emoji'

const withMDX = MDX({
  extension: /\.(md|mdx)$/,
  options: {
    recmaPlugins: [recmaDisplayname, recmaNextjsStaticProps],
    rehypePlugins: [rehypeHighlight],
    remarkPlugins: [emoji],
  },
})

const advancedHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
]

const apiHeaders = [
  { key: 'Access-Control-Allow-Credentials', value: 'true' },
  {
    key: 'Access-Control-Allow-Origin',
    value: '*',
  },
  {
    key: 'Access-Control-Allow-Methods',
    value: 'GET, POST, DELETE, PUT, OPTIONS',
  },
  {
    key: 'Access-Control-Allow-Headers',
    value:
      'Origin, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, api_token',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  pageExtensions: ['md', 'mdx', 'ts', 'tsx'],

  transpilePackages: ['@mui/system', '@mui/material'],
  modularizeImports: {
    '@mui/material/!(styles)/?*': {
      transform: '@mui/material/{{path}}/{{member}}',
      skipDefaultConversion: true,
    },
  },
  headers: async () => [
    {
      // Apply these headers to all routes in your application.
      source: '/:path*',
      headers: advancedHeaders,
    },
    {
      source: '/api/:path*',
      headers: apiHeaders,
    },
    {
      source: '/green-analytics.js',
      locale: false,
      headers: [
        {
          // Cache green-analytics for 24 hours to prevent redownloading constantly
          key: 'Cache-Control',
          value: 'public, max-age=86400',
        },
      ],
    },
  ],

  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
  images: {
    minimumCacheTTL: 3600,
    remotePatterns: [
      {
        hostname: 'flagcdn.com',
      },
      { hostname: 'play.google.com' },
      { hostname: 'lh3.googleusercontent.com' },
    ],
  },
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})
const config = withBundleAnalyzer(nextConfig)

export default withMDX(config)
