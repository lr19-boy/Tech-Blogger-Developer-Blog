const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: './dist',
    setupMiddlewares: (middlewares, devServer) => {
      // You can add custom middlewares here
      return middlewares;
    },
    setupDevServer: (app, server) => {
      // You can add custom setup for the dev server here
      app.get('/api/data', (req, res) => {
        res.json({ message: 'Hello from the API!' });
      });
    },
  },
  mode: 'development',
};
