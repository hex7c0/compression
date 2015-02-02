'use strict';

var file = require('fs').readFileSync('s.cc') // 46Kb
var zlib = require('zlib')
var app = require('express')()
var compression = require('..')

// without compression
app.get('/no_compression', function(req, res) {

  res.setHeader('Content-Type', 'text/plain')
  res.send(file)
})

// without zlib tune
app.get('/with_compression', compression({
  zlib: {}
}), function(req, res) {

  res.setHeader('Content-Type', 'text/plain')
  res.send(file)
})

// with zlib tune
app.get('/with_level_compression', compression(), function(req, res) {

  res.setHeader('Content-Type', 'text/plain')
  res.send(file)
})

app.listen(3000)
