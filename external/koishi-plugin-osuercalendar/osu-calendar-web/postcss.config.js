const path = require('node:path')

let rootPath = `${path.relative(process.cwd(), __dirname)}`
if (!rootPath)
  rootPath = '.'
module.exports = {
  plugins: {
    tailwindcss: {
      config: `${rootPath}/tailwind.config.js`,
    },
    autoprefixer: {},
  },
}
