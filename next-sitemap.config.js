/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL ?? 'https://green-analytics.com',
  generateRobotsTxt: true, // (optional)
  exclude: ['/dashboard*', '/settings'],
}
