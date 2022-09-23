export default {
  swDest: 'build/sw.js',
  globPatterns: ['**/*.{html,css,js,svg}'],
  globDirectory: 'build/',
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: new RegExp('^(.*).(png|jpg|js|woff2|woff)$'),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'external-cache-image-font',
      },
    },
  ],
  runtimeCaching: [
    {
      urlPattern: new RegExp('^/?(data/)(.*)(.json)$'),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'data',
      },
    },
  ],
};
