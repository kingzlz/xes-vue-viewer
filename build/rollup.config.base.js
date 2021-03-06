import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import image from '@rollup/plugin-image';
import babel from '@rollup/plugin-babel'
import vue from "rollup-plugin-vue"
import font from "rollup-plugin-font"

import { name, main, module } from '../package.json'

const config =  {
  input: 'src/index.js',
  external: ['vue'],
  output: [
    { file: main, format: 'umd', name, globals: {vue: 'Vue'} },
    { file: module, format: 'es', name, exports: 'default', globals: {vue: 'Vue'} }
  ],
  plugins: [
    json(),
    resolve(),
    vue({
      css: false,
      compileTemplate: true
    }),
    babel({
      exclude: "**/node_modules/**",
      babelHelpers: "bundled",
      presets: ["@vue/babel-preset-jsx"]
    }),
    font({
			"include": [
				"./src/assets/fonts/**"
      ],
      "svg":"./src/assets/fonts/iconfont.svg",
			"outDir":"./dist/fonts"
		}),
    image(),
    commonjs()
  ]
}

export default config