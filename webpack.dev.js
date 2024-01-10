const { merge } = require('webpack-merge')
const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackWatchedGlobEntries = require('webpack-watched-glob-entries-plugin')
const { htmlWebpackPluginTemplateCustomizer } = require('template-ejs-loader')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')

const common = require('./webpack.common')

// 開発ファイルへのパス
const filePath = {
  ejs: './www/src/pages/',
  images: './www/src/assets/images/',
}

// EJSの読み込み
const ejsEntries = WebpackWatchedGlobEntries.getEntries(
  [path.resolve(__dirname, `${filePath.ejs}**/*.ejs`)],
  {
    ignore: path.relative(__dirname, `${filePath.ejs}**/_*.ejs`),
  }
)()
const htmlGlobPlugins = (entries) => {
  return Object.keys(entries).map(
    (key) =>
      new HtmlWebpackPlugin({
        // 出力ファイル名
        filename: `${key}.html`,
        // ejsファイルの読み込み
        template: htmlWebpackPluginTemplateCustomizer({
          htmlLoaderOption: {
            sources: false,
            minimize: false,
          },
          templatePath: `${filePath.ejs}${key}.ejs`,
        }),
        // js自動出力と圧縮を無効化
        inject: false,
        minify: {
          collapseWhitespace: true,
          preserveLineBreaks: true,
        },
      })
  )
}

// webpに変換
const imgWebpPlugin = () => {
  return [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'www/src/assets/images'),
          to: path.resolve(__dirname, 'www/src/dest/assets/images'),
        },
      ],
    }),
    new ImageMinimizerPlugin({
      test: /\.(jpe?g|png)$/i,
      generator: [
        {
          type: 'asset',
          implementation: ImageMinimizerPlugin.imageminGenerate,
          options: {
            plugins: [['webp', { quality: 80 }]],
          },
        },
      ],
    }),
    // svgの最適化
    new ImageMinimizerPlugin({
      test: /\.svg$/i,
      minimizer: {
        implementation: ImageMinimizerPlugin.svgoMinify,
        options: {
          encodeOptions: {
            multipass: true,
            plugins: ['preset-default'],
          },
        },
      },
    }),
    // gifの最適化
    new ImageMinimizerPlugin({
      test: /\.gif$/i,
      minimizer: {
        implementation: ImageMinimizerPlugin.imageminMinify,
        options: {
          plugins: [['gifsicle', { interlaced: true }]],
        },
      },
    }),
  ]
}

const browserSync = () => {
  return [
    new BrowserSyncPlugin({
      host: 'localhost',
      files: ['./**/*'],
      port: 3000,
      proxy: {
        target: 'http://localhost:8080',
      },
      watchOptions: {
        ignored: [
          'webpack.config.js',
          'node_modules',
          'package.json',
          'package-lock.json',
          'readme.md',
        ],
      },
      open: true,
      ghostMode: {
        clicks: false,
        forms: false,
        scroll: false,
      },
      logLevel: 'debug',
    }),
  ]
}

const app = {
  mode: 'development',
  entry: {},
  output: {
    filename: './js/[name].js',
    path: path.resolve(__dirname, 'www/src/dest'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ejs$/i,
        use: ['html-loader', 'template-ejs-loader'],
      },
    ],
  },
  plugins: [
    ...htmlGlobPlugins(ejsEntries),
    ...imgWebpPlugin(),
    ...browserSync(),
  ],
}

module.exports = merge(common, app)
