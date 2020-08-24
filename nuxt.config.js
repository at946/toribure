
module.exports = {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_display_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' },
      { hid: 'og:site_name', property: 'og:site_name', content: process.env.npm_package_display_name || '' },
      { hid: 'og:title', property: 'og:title', content: process.env.npm_package_display_name || '' },
      { hid: 'og:type', property: 'og:type', content: 'website' },
      { hid: 'og:url', property: 'og:url', content: 'https://toribure.herokuapp.com' },
      { hid: 'og:description', property: 'og:description', content: process.env.npm_package_description || '' },
      { hid: 'og:image', property: 'og:image', content: 'https://toribure.herokuapp.com/ogp.png' },
      { hid: 'twitter:card', property: 'twitter:card', content: 'summary_large_image' },
      { hid: 'twitter:creator', property: 'twitter:creator', content: '@at_946' },
      { hid: 'twitter:text:title', property: 'twitter:text:title', content: process.env.npm_package_display_name || '' },
      { hid: 'google-site-verification', name: 'google-site-verification', content: "V9WZccOAwvnBmRzeEdzhq9jto4S65oKS2gACDRpRbhA" },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
    { src: '@/assets/css/main.scss', lang: 'scss' }
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    ['@nuxtjs/google-analytics', { id: process.env.GA_ID } ]
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    'nuxt-material-design-icons',
  ],
  /*
  ** Build configuration
  */
  build: {
    postcss: {
      preset: {
        features: {
          customProperties: false
        }
      }
    },
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  }
}
