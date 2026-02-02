const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { join } = require('path');
const path = require("path")

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/kafka-service'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMap: true,
    }),
    new CopyPlugin({
      patterns: [
        { from: 'generated/prisma', to: 'generated/prisma' }
      ]
    })
  ],
  externals: {
    '@prisma/client': 'commonjs @prisma/client',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@kafka-service': path.resolve(__dirname, '../../apps/kafka-service'),
      '@packages': path.resolve(__dirname, '../../packages'),
      '@': path.resolve(__dirname, '../../')
    }
  }
};
