const path = require('path');

module.exports = {
  resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      "extensions": ["", ".webpack.js", ".ts", ".tsx", ".js", ".less"]
  },
  module: {
    loaders: [
      {
          test: /\.tsx?$/,
          loaders: ["ts-loader"],
          include: path.resolve(__dirname, '../'),          
          exclude: [/node_modules/, /test/]
      },
      {
        test: /\.css?$/,
        loaders: [ 'style', 'raw' ],
        include: path.resolve(__dirname, '../'),
        exclude: /node_modules/ 
      },
      { 
        test: /\.less$/, 
        loader: 'style!css!less', 
        include: path.resolve(__dirname, '../'),
        exclude: /node_modules/ 
      }
    ]
  },
  devtool: "source-map"
}
