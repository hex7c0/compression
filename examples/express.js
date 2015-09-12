'use strict';
/**
 * @file express example
 * @module compression-zlib
 * @subpackage examples
 * @version 0.0.1
 * @author hex7c0 <hex7c0@gmail.com>
 * @license GPLv3
 */

/**
 * initialize module
 */
var compression = require('..'); // use require('compression-zlib') instead
var app = require('express')();
var file = require('fs').readFileSync('../benchmark/s.cc');

// using middleware
app.use(compression()).get('/', function(req, res) {

  res.setHeader('Content-Type', 'text/plain');
  res.send(file);
}).listen(3000);
console.log('starting server on port 3000');
