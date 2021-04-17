const path = require("path");
const APP_DIR = path.resolve(__dirname, "./src");

module.exports = {
  entry: "./src/index.js",
  module: {
    rules: [
      {
        loader: "babel-loader",
        test: /\.js$/,
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        include: APP_DIR,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              modules: true,
              namedExport: true,
            },
          },
        ],
      }
    ],
  },
  devtool: "inline-source-map",
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "public"),
  },
  devServer: {
    contentBase: path.join(__dirname, "public"),
    historyApiFallback: true,
    port: 3000,
    proxy: {
      "/api": "http://localhost:8080",
    },
  },  
};
