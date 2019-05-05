const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const fs = require('fs')

fs.readdir(__dirname, function(err, items) {
  console.log(items);

  for (let i=0; i<items.length; i++) {
      console.log(items[i]);
  }
});

const sassLoader = {
  loader: 'sass-loader',
};

const cssLoader = (isHashed = true) => ({
  loader: 'css-loader',
  options: {
    // minimize: true,
    modules: true,
    camelCase: false,
    importLoaders: 3,
    localIdentName: isHashed ? 'duik-[folder]__[local]__[hash:4]' : '[local]',
  },
});

const postCssLoader = {
  loader: 'postcss-loader',
  options: {
    ident: 'postcss',
    plugins: () => [
      autoprefixer({
        browsers: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9'],
      }),
    ],
  },
};


const modules = [
  'DynamicFields',
  'kit',
  'Button',
  'LoaderDots',
  'createSimpleComponent',
  'WidgetTable',
]

const entry = modules.reduce((res, m) => {
  return {
    ...res,
    [m]: path.resolve(__dirname, m)
  }
}, {})



module.exports = {
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  entry: entry,
  output: {
    libraryTarget: 'umd',
    filename: '[name]/dist/index.js',
    path: path.resolve(__dirname)
  },
  mode: process.env.NODE_ENV,
  node: {
    fs: 'empty',
  },
  externals: [nodeExternals()],
  optimization: {
    // We no not want to minimize npm code.
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            declaration: true,
            isolatedModules: false,
            allowJs: false,
            outDir: './dist',
            noEmit: false,
            jsx: 'react'
          },
        },
      },

      {
        test: /^((?!module).)*(scss|css)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [cssLoader(false), postCssLoader, sassLoader],
        }),
      },
      {
        test: /module.(scss|css)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [cssLoader(true), postCssLoader, sassLoader],
        }),
      },
      // {
      //   test: /^((?!module).)*(scss|css)$/,
      //   use: [
      //     {
      //       loader: MiniCssExtractPlugin.loader,
      //       options: {
      //         hmr: process.env.NODE_ENV === 'development',
      //       },
      //     },
      //     cssLoader(false),
      //     postCssLoader,
      //     sassLoader
      //   ],
      // },
      // {
      //   test: /module.(scss|css)$/,
      //   use: [
      //     {
      //       loader: MiniCssExtractPlugin.loader,
      //       options: {
      //         hmr: process.env.NODE_ENV === 'development',
      //       },
      //     },
      //     cssLoader(true),
      //     postCssLoader,
      //     sassLoader
      //   ],
      // },
    ]
  },
  plugins: [
    // new MiniCssExtractPlugin({
    //   // Options similar to the same options in webpackOptions.output
    //   // both options are optional
    //   filename: './[name]/dist/styles.css',
    //   chunkFilename: '[id].css',
    // }),

    new ExtractTextPlugin('./[name]/dist/styles.css'),
    // new OptimizeCssAssetsPlugin({
    //   assetNameRegExp: /\.css$/g,
    //   cssProcessor: require('cssnano'), // eslint-disable-line
    //   cssProcessorOptions: { discardComments: { removeAll: true } },
    //   canPrint: true,
    // }),
    new CopyPlugin([
      {
        from: './**/*.d.ts',
        to: './dist/index.d.ts',
        ignore: ['**/node_modules/**', '**/docs/**'],
        transformPath(targetPath, absolutePath) {
          // copy d.ts from package-name/ to package-name/dist/
          console.log('------', targetPath, absolutePath)
          const z = absolutePath.split('/')
          const lastTwo = z.splice(z.length - 2, 2)
          lastTwo.splice(1, 0, 'dist')
          return lastTwo.join('/');
        }
      },
    ]),
  ],
};