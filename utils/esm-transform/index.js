/* eslint-disable node/no-deprecated-api */
const fs = require('fs')
const map = {}
require('source-map-support').install({
  handleUncaughtExceptions: false,
  environment: 'node',
  retrieveSourceMap (file) {
    if (map[file]) {
      return {
        url: file,
        map: map[file]
      }
    }
    return null
  }
})
const esbuild = require('esbuild')
const major = +process.version.split('.')[0].split('v')[1]
const minor = +process.version.split('.')[1]

function transform (filename) {
  const code = fs.readFileSync(filename, 'utf-8')
  const result = esbuild.transformSync(code, {
    sourcefile: filename,
    sourcemap: 'both',
    format: 'cjs',
    loader: 'tsx',
    target: `node${major}.${minor}`,
    jsx: 'transform'
  })
  if (result.warnings.length) console.warn(result.warnings)
  map[filename] = result.map
  return result.code
}
// const ESM = ['p-queue', 'p-timeout']
const defaultJSLoader = require.extensions['.js']
require.extensions['.js'] = function loader (module, filename) {
  try {
    defaultJSLoader.apply(require, arguments)
  } catch (err) {
    if (!err.code === 'ERR_REQUIRE_ESM') throw err
    return module._compile(transform(filename), filename)
  }
}
// const defaultTSLoader = require.extensions['.js']
require.extensions['.ts'] = require.extensions['.tsx'] = function loader (module, filename) {
  return module._compile(transform(filename), filename)
}
