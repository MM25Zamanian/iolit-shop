export default {
  swDest: 'build/sw.js',
  globPatterns: ['**/*.{html,css,js}'],
  globDirectory: 'build/',
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: new RegExp('^(.*).(png|jpg|svg|js|woff2|woff)$'),
      handler: 'Stale-while-revalidate',
      options: {
        cacheName: 'cache',
      },
    },
  ],
  runtimeCaching: [
    {
      urlPattern: new RegExp('^/?(data/)(.*)(.json)$'),
      handler: 'Stale-while-revalidate',
      options: {
        cacheName: 'data',
      },
    },
  ],
};
