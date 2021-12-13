module.exports = {
  reactStrictMode: true,
  generateBuildId: async () => {
    // You can, for example, get the latest git commit hash here
    return 'init'
  },
  swcMinify: true,
  basePath: '/fortune',
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  serverRuntimeConfig: {
    fortunePath: '../osuercalendar-events.json'
  }
}
