// Rollup config to generate the d3-flextree.js bundle.

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
