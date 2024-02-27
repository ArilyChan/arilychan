const path = require('node:path')

let rootPath = `${path.relative(process.cwd(), __dirname)}`
if (!rootPath)
  rootPath = '.'
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ].map((path) => {
    if (path.startsWith('./'))
      path = path.substring(1)
    return rootPath + path
  }),
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
}
