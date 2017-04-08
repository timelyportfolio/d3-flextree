import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
//import eslint from 'rollup-plugin-eslint';
//import babel from 'rollup-plugin-babel';

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
    commonjs() /*,
    eslint(),
    babel({
      exclude: 'node_modules/**',
    }),
  */],
};
