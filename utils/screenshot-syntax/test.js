const fs = require('fs')
const path = require('path')
const peggy = require('peggy')

const grammar = fs.readFileSync(path.join(__dirname, 'language.pegjs')).toString()
const parser = peggy.generate(grammar)

const tester = fs.readFileSync(path.join(__dirname, 'test.txt')).toString()
try {
  const result = parser.parse(tester)
  process.exit(0)
} catch (error) {
  process.exit(1)
}
