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
    value: process.env.SITE_URL ?? 'https://green-analytics.com',
  }, // replace this your actual origin
  { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
  {
    key: 'Access-Control-Allow-Headers',
    value:
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  pageExtensions: ['md', 'mdx', 'ts', 'tsx'],

  transpilePackages: ['@mui/system', '@mui/material', '@mui/icons-material'],
  modularizeImports: {
    '@mui/material/!(styles)/?*': {
      transform: '@mui/material/{{path}}/{{member}}',
      skipDefaultConversion: true,
    },
    '@mui/icons-material/?(((\\w*)?/?)*)': {
      transform: '@mui/icons-material/{{ matches.[1] }}/{{member}}',
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
  ],

  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})
const config = withBundleAnalyzer(nextConfig)

export default withMDX(config)
