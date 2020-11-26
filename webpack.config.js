// const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: {
    main: ['@babel/polyfill', './src/app/frontend/index.js'],
    lineapp: ['@babel/polyfill', './src/app/lineapp/main/index.js'],
    linesetup: ['@babel/polyfill', './src/app/lineapp/setup/index.js'],
  },
  output: {
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.css/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { url: false },
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
  },
  devServer: {
    contentBase: `${__dirname}/tools`,
    publicPath: '/__/public/',
    historyApiFallback: {
      rewrites: [{ from: '/', to: '/dev_index.html' }],
    },
  },
};
