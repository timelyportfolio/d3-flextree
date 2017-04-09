//import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
//import eslint from 'rollup-plugin-eslint';
//import babel from 'rollup-plugin-babel';

// Rollup config to generate the d3-flextree.js bundle, that does not include
// the d3-hierarchy dependency.


// This config file is roughly equivalent to this command line:
// rollup -f umd -n d3 -o build/d3-flexxtree.js --globals d3-hierarchy:d3 -- index.js

export default {
  entry: 'src/main.js',
  dest: 'build/d3-flextree.js',
  moduleName: 'd3',
  format: 'umd',
  //globals: {
  //  'd3-hierarchy': 'd3'
  //},
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    //commonjs()
     /*,
    eslint(),
    babel({
      exclude: 'node_modules/**',
    }),
  */],
};
