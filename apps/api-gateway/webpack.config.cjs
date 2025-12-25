const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');
const path = require("path")

// import { NxAppWebpackPlugin } from "@nx/webpack/app-plugin.js";
// import path, {join} from "path"
module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/api-gateway'),
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
  ],
  resolve: {
    alias: {
    '@api-gateway/*': path.resolve(__dirname, 'apps/api-gateway/*'),
    '@packages/*': path.resolve(__dirname, 'packages/*'),
    '@/*': path.resolve(__dirname, "./*")
    }
  }
};
