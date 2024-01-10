const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

// 開発ファイルへのパス
const filePath = {
  scss: './www/src/assets/scss/',
  js: './www/src/assets/js/'
}

module.exports = () => ({

});