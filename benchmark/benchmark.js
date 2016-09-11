'use strict';

var util = require('util');
var zlib = require('zlib');
var benchmark = require('async-benchmark');
var bytes = require('bytes');
var chalk = require('chalk');
var input = require('fs').readFileSync('s.cc');

var round = function(number) {

  return Math.round(number * 100) / 100
};

var noOptionsGzip = function(data, callback) {

  var buffers = [], size = 0, gzip = new zlib.Gzip()

  gzip.on('data', function(buffer) {

    buffers.push(buffer)
    size += buffer.length
  }).on('end', function() {

    callback(null, Buffer.concat(buffers, size))
  })

  gzip.write(data)
  gzip.end()
};
var defaultGzip = function(data, callback) {

  var buffers = [], size = 0, gzip = new zlib.Gzip({
    level: zlib.Z_BEST_SPEED,
    memLevel: zlib.Z_MAX_MEMLEVEL,
    strategy: zlib.Z_DEFAULT_STRATEGY
  })

  gzip.on('data', function(buffer) {

    buffers.push(buffer)
    size += buffer.length
  }).on('end', function() {

    callback(null, Buffer.concat(buffers, size))
  })

  gzip.write(data)
  gzip.end()
};
var filteredGzip = function(data, callback) {

  var buffers = [], size = 0, gzip = new zlib.Gzip({
    level: zlib.Z_BEST_SPEED,
    memLevel: zlib.Z_MAX_MEMLEVEL,
    strategy: zlib.Z_FILTERED
  })

  gzip.on('data', function(buffer) {

    buffers.push(buffer)
    size += buffer.length
  }).on('end', function() {

    callback(null, Buffer.concat(buffers, size))
  })

  gzip.write(data)
  gzip.end()
};
var huffmanGzip = function(data, callback) {

  var buffers = [], size = 0, gzip = new zlib.Gzip({
    level: zlib.Z_BEST_SPEED,
    memLevel: zlib.Z_MAX_MEMLEVEL,
    strategy: zlib.Z_HUFFMAN_ONLY
  })

  gzip.on('data', function(buffer) {

    buffers.push(buffer)
    size += buffer.length
  }).on('end', function() {

    callback(null, Buffer.concat(buffers, size))
  })

  gzip.write(data)
  gzip.end()
};
var rleGzip = function(data, callback) {

  var buffers = [], size = 0, gzip = new zlib.Gzip({
    level: zlib.Z_BEST_SPEED,
    memLevel: zlib.Z_MAX_MEMLEVEL,
    strategy: zlib.Z_RLE
  })

  gzip.on('data', function(buffer) {

    buffers.push(buffer)
    size += buffer.length
  }).on('end', function() {

    callback(null, Buffer.concat(buffers, size))
  })

  gzip.write(data)
  gzip.end()
};
var fixedGzip = function(data, callback) {

  var buffers = [], size = 0, gzip = new zlib.Gzip({
    level: zlib.Z_BEST_SPEED,
    memLevel: zlib.Z_MAX_MEMLEVEL,
    strategy: zlib.Z_FIXED
  })

  gzip.on('data', function(buffer) {

    buffers.push(buffer)
    size += buffer.length
  }).on('end', function() {

    callback(null, Buffer.concat(buffers, size))
  })

  gzip.write(data)
  gzip.end()
};

console.log(chalk.underline(util.format('input size %s', bytes(input.length))));
console.log();

require('run-series')(
  [
    function(done) {

      benchmark('noOptionsGzip', noOptionsGzip.bind(zlib, input),
        function(err, event) {

          console.log(chalk.gray(event.target.toString()))
          noOptionsGzip(input, function(err, compressed) {

            var str = util.format('compressed size %s (%s%)',
              bytes(compressed.length), round(compressed.length / input.length
                * 100))
            console.log(chalk.gray(str))
            done()
          })
        })
    },
    function(done) {

      benchmark('defaultGzip', defaultGzip.bind(zlib, input), function(err,
                                                                       event) {

        console.log(chalk.white(event.target.toString()))
        defaultGzip(input, function(err, compressed) {

          var str = util.format('compressed size %s (%s%)',
            bytes(compressed.length), round(compressed.length / input.length
              * 100))
          console.log(chalk.white(str))
          done()
        })
      })
    },
    function(done) {

      benchmark('filteredGzip', filteredGzip.bind(zlib, input),
        function(err, event) {

          console.log(chalk.magenta(event.target.toString()))
          filteredGzip(input, function(err, compressed) {

            var str = util.format('compressed size %s (%s%)',
              bytes(compressed.length), round(compressed.length / input.length
                * 100))
            console.log(chalk.magenta(str))
            done()
          })
        })
    },
    function(done) {

      benchmark('huffmanGzip', huffmanGzip.bind(zlib, input), function(err,
                                                                       event) {

        console.log(chalk.cyan(event.target.toString()))
        huffmanGzip(input, function(err, compressed) {

          var str = util.format('compressed size %s (%s%)',
            bytes(compressed.length), round(compressed.length / input.length
              * 100))
          console.log(chalk.cyan(str))
          done()
        })
      })
    },
    function(done) {

      benchmark('rleGzip', rleGzip.bind(zlib, input), function(err, event) {

        console.log(chalk.yellow(event.target.toString()))
        rleGzip(input, function(err, compressed) {

          var str = util.format('compressed size %s (%s%)',
            bytes(compressed.length), round(compressed.length / input.length
              * 100))
          console.log(chalk.yellow(str))
          done()
        })
      })
    },
    function(done) {

      benchmark('fixedGzip', fixedGzip.bind(zlib, input), function(err, event) {

        console.log(chalk.green(event.target.toString()))
        fixedGzip(input, function(err, compressed) {

          var str = util.format('compressed size %s (%s%)',
            bytes(compressed.length), round(compressed.length / input.length
              * 100))
          console.log(chalk.green(str))
          done()
        })
      })
    } ])
