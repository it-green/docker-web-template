const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const WebpackWatchedGlobEntries = require('webpack-watched-glob-entries-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { htmlWebpackPluginTemplateCustomizer } = require('template-ejs-loader')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')

// 開発ファイルへのパス
const filePath = {
  ejs: './src/pages/',
  js: './src/assets/js/entry/',
  scss: './src/assets/scss/',
  images: './src/assets/images/',
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

module.exports = {
  entry: WebpackWatchedGlobEntries.getEntries([
    path.resolve(__dirname, `${filePath.js}**/*.js`),
    path.resolve(__dirname, `${filePath.scss}style.scss`),
  ]),
  output: {
    filename: './js/[name].js',
    path: path.resolve(__dirname, 'dest'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ejs$/i,
        use: ['html-loader', 'template-ejs-loader'],
      },
      {
        test: /\.css/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
          },
        ],
      },
      // sassのコンパイル設定
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              url: true,
              sourceMap: true,
              importLoaders: 2,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [['autoprefixer', { grid: true }]],
              },
            },
          },
          {
            loader: 'resolve-url-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      // 画像をbase64にエンコーディング
      {
        // 対象となるファイルの拡張子
        test: /\.(gif|webp|png|jpg|eot|wof|woff|ttf|svg)$/,
        // 画像をBase64として取り込む
        type: 'asset/inline',
      },
    ],
  },
  plugins: [
    ...htmlGlobPlugins(ejsEntries),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['css/**/*', 'js/**/*'],
    }),

    new FixStyleOnlyEntriesPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/assets/images'),
          to: path.resolve(__dirname, 'src/dest/assets/images'),
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

    new WebpackWatchedGlobEntries(),

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
  ],
}
