const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackWatchedGlobEntries = require('webpack-watched-glob-entries-plugin');
const { htmlWebpackPluginTemplateCustomizer } = require('template-ejs-loader');

// ejsのコンパイル
const filePath = {
  ejs: './www/src/pages/',
}

// EJSの読み込み
const ejsEntries = WebpackWatchedGlobEntries.getEntries([path.resolve(__dirname, `${filePath.ejs}**/*.ejs`)], {
  ignore: path.relative(__dirname, `${filePath.ejs}**/_*.ejs`),
})();
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
  );
};


const app = {
  entry: {},
  output: {
    filename: './js/[name].js',
    path: path.resolve(__dirname, 'www/src/dest'),
    // clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ejs$/i,
        use: ['html-loader', 'template-ejs-loader'],
      },
    ]
  },
  plugins: [
    ...htmlGlobPlugins(ejsEntries),
  ],
}

module.exports = app;