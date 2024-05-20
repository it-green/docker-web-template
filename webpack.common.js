const path = require('path')
const { glob, globSync, globStream, globStreamSync, Glob } = require('glob')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const WebpackWatchedGlobEntries = require('webpack-watched-glob-entries-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { htmlWebpackPluginTemplateCustomizer } = require('template-ejs-loader')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { root } = require('postcss')

// 開発ファイルへのパス
const filePath = {
  ejs: './src/pages/',
  js: './src/js/entry/',
  scss: './src/scss/',
}

// EJSの読み込み
const entries = WebpackWatchedGlobEntries.getEntries(
  [path.resolve(__dirname, `${filePath.ejs}**/*.ejs`)],
  {
    ignore: path.resolve(__dirname, `${filePath.ejs}**/_*.ejs`),
  }
)()

const htmlGlobPlugins = (entries) => {
  return Object.keys(entries).map(
    (key) =>
      new HtmlWebpackPlugin({
        //出力ファイル名
        filename: `${key}.html`,
        //ejsファイルの読み込み
        template: htmlWebpackPluginTemplateCustomizer({
          htmlLoaderOption: {
            //ファイル自動読み込みと圧縮を無効化
            sources: false,
            minimize: false,
          },
          templatePath: `${filePath.ejs}${key}.ejs`,
        }),

        //JS・CSS自動出力と圧縮を無効化
        inject: false,
        minify: {
          removeComments: true,
          collapseWhitespace: false,
        },
      })
  )
}

// php の読み込み
const copyPHPFile = () => {
  return [
    new CopyWebpackPlugin({
      patterns: [
        {
          // pages 内のファイルはここでは吐き出さない
          filter: async (resourcePath) => {
            if (resourcePath.indexOf('/pages/') !== -1) {
              return false
            }

            return true
          },
          context: 'src',
          from: path.resolve(__dirname, 'src/**/*.php'),
          to: path.resolve(__dirname, 'dest'),
          noErrorOnMissing: true,
        },
        {
          context: 'src/pages',
          from: path.resolve(__dirname, 'src/pages/**/*.php'),
          to: path.resolve(__dirname, 'dest'),
          noErrorOnMissing: true,
        },
      ],
    }),
  ]
}

const optimizeImages = () => {
  return [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/assets/'),
          to: path.resolve(__dirname, 'dest/assets/'),
          noErrorOnMissing: true,
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
      {
        // 対象となるファイルの拡張子
        test: /\.(gif|svg|eot|wof|woff|ttf)$/,
        type: 'asset',
        generator: {
          filename: 'css/resources/[hash][ext][query]',
        },
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024, // 4kb
          },
        },
      },
      {
        // 対象となるファイルの拡張子
        test: /\.(webp|png|jpg|jpeg)$/,
        type: 'asset',
        generator: {
          filename: 'css/resources/[hash].webp[query]',
        },
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024, // 4kb
          },
        },
      },
    ],
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
    minimize: true,
  },

  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['dest/**/*'],
    }),

    ...htmlGlobPlugins(entries),

    ...copyPHPFile(),

    ...optimizeImages(),

    new FixStyleOnlyEntriesPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
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
      open: false,
      ghostMode: {
        clicks: false,
        forms: false,
        scroll: false,
      },
      logLevel: 'debug',
    }),
  ],
}
