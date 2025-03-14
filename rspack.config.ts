import { defineConfig } from '@rspack/cli';
import path from 'path';
import rspack from '@rspack/core';
import { TsCheckerRspackPlugin } from 'ts-checker-rspack-plugin';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  entry: {
    src: path.resolve(process.cwd(), 'src/main.tsx'),
  },
  output: {
    path: path.resolve(process.cwd(), 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
    },
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  experiments: {
    css: true,
  },
  module: {
    parser: {
      'css/auto': {
        namedExports: false,
      },
    },
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: true,
            },
            transform: {
              react: {
                runtime: 'automatic',
              },
            },
          },
        },
        type: 'javascript/auto',
      },
      {
        test: /\.css$/,
        type: 'css/auto',
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: path.resolve(process.cwd(), 'src/index.html'),
      filename: 'index.html',
      inject: true,
    }),
    process.env.SKIP_TYPE_CHECK
      ? undefined
      : new TsCheckerRspackPlugin({
          typescript: { configFile: './tsconfig.json' },
        }),
  ],
  devServer: {
    static: {
      directory: path.join(process.cwd(), 'public'),
    },
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws',
    },
    host: '0.0.0.0',
    compress: true,
    port: 3000,
    hot: true,
    historyApiFallback: true,
    watchFiles: ['src/**/*.css'],
  },
});
