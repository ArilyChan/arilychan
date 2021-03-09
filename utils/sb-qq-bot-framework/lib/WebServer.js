var express = require('express')
var app = express()
var http = require('http').Server(app)

module.exports = { express: app, http }
