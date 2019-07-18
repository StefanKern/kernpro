
    // Work around for https://github.com/angular/angular-cli/issues/7200
    
    const path = require('path');
    const webpack = require('webpack');

    // change the regex to include the packages you want to exclude
    const regex = /firebase\/(app|firestore)/;
    
    module.exports = {
      entry: {
        server: './server.ts',
      },
      target: 'node',
      resolve: { extensions: ['.ts', '.js'] },
      // this makes sure we include node_modules and other 3rd party libraries
      externals: [/node_modules/, function(context, request, callback) {

        // exclude firebase products from being bundled, so they will be loaded using require() at runtime.
        if(regex.test(request)) {
          return callback(null, 'commonjs ' + request);
        }
        callback();
      }],
      output: {
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
      },
      module: {
        rules: [
          { test: /\.ts$/, loader: 'ts-loader' }
        ]
      },
      optimization: {
        minimize: false
      },
      plugins: [
        new webpack.ContextReplacementPlugin(
          // fixes WARNING Critical dependency: the request of a dependency is an expression
          /(.+)?angular(\\|\/)core(.+)?/,
          path.join(__dirname, 'src'), // location of your src
          {} // a map of your routes
        ),
        new webpack.ContextReplacementPlugin(
          // fixes WARNING Critical dependency: the request of a dependency is an expression
          /(.+)?express(\\|\/)(.+)?/,
          path.join(__dirname, 'src'),
          {}
        )
      ]
    }
