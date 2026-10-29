const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  productionSourceMap: false,
  lintOnSave: false,
  devServer: {
    port: 8080,
    historyApiFallback: true
  },
  configureWebpack: {
    performance: { hints: false }
  },
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = '红乡智推 - 红色乡村助农 AI 智能推介平台'
      return args
    })
  }
})
