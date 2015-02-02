'use strict';
/**
 * @file compression example
 * @module compression-zlib
 * @subpackage examples
 * @version 0.0.1
 * @author hex7c0 <hex7c0@gmail.com>
 * @license GPLv3
 */

/**
 * initialize module
 */
// import
var compression = require('..'); // use require('compression-zlib') instead
var app = require('express')();
var file = require('fs').readFileSync('../benchmark/s.cc');

// using middleware
app.use(compression());

// express routing
app.get('/', function(req, res) {

  res.setHeader('Content-Type', 'text/plain')
  res.send(file)
});

// server starting
app.listen(3000);
console.log('starting server on port 3000');
