import nodeResolve from '@rollup/plugin-node-resolve'
import common from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import copy from 'rollup-plugin-copy'
import json from '@rollup/plugin-json'

export default [
  {
    input: 'src/index.js',
    output: [
      {
        dir: 'lib',
        format: 'cjs'
      }
    ],
    preserveEntrySignatures: false,
    external: ['solid-js', 'solid-js/web', 'path', 'express'],
    plugins: [
      json(),
      // typescript(),
      nodeResolve({ preferBuiltins: true, exportConditions: ['solid', 'node'] }),
      babel({
        babelHelpers: 'bundled',
        presets: [['solid', { generate: 'ssr', hydratable: true }]]
      }),
      common()
    ]
  },
  {
    input: 'src/client.js',
    output: [
      {
        dir: 'dist/public/js',
        format: 'esm'
      }
    ],
    preserveEntrySignatures: false,
    plugins: [
      // typescript(),
      nodeResolve({ exportConditions: ['solid'] }),
      babel({
        babelHelpers: 'bundled',
        presets: [['solid', { generate: 'dom', hydratable: true }]]
      }),
      common(),
      copy({
        targets: [
          {
            src: ['static/*'],
            dest: 'dist/public/'
          }
        ]
      })
    ]
  }
]
