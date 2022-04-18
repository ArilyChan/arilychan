const fs = require('fs')
const path = require('path')
const parser = require('./')

const tester = fs.readFileSync(path.join(__dirname, 'test.txt')).toString()
try {
  const result = parser.parse(tester)
  process.exit(0)
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
