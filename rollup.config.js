// Rollup config to generate the d3-flextree.js bundle.
// This config file is roughly equivalent to this command line:
// rollup -f umd -n d3 -o build/d3-flexxtree.js -- index.js

import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/main.js',
  dest: 'build/d3-flextree.js',
  moduleName: 'd3',
  format: 'umd',
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    babel({
      exclude: 'node_modules/**'
    })
  ],
};
