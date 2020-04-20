module.exports = {
  entry: './client/index.js',
  module: {
    rules: [
      {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/react']
        }
      }
    ]
  }
};
