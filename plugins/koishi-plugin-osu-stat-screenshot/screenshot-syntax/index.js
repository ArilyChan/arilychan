const fs = require('fs')
const path = require('path')
const peggy = require('peggy')

const grammar = fs.readFileSync(path.join(__dirname, 'language.pegjs')).toString()
const parser = peggy.generate(grammar)

module.exports = parser
