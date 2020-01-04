module.exports = {
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === 'production'
    ? '/ams-bookings-planner/'
    : '/',

  pages: {
    index: {
      entry: 'src/main.ts',
      template: 'public/index.html',
    },

    map: {
      entry: 'src/map/main.js',
      template: 'public/index.html',
    }
  }
}