'use strict';
/**
 * @file compression
 * @module compression-zlib
 * @subpackage main
 * @version 2.2.0
 * @author hex7c0 <hex7c0@gmail.com>
 * @copyright 2010 Sencha Inc.
 * @copyright 2011 TJ Holowaychuk
 * @copyright 2014 Jonathan Ong
 * @copyright 2014 Douglas Christopher Wilson
 * @copyright 2015 hex7c0
 * @license MIT
 */

var accepts = require('accepts');
var bytes = require('bytes');
var compressible = require('compressible');
var debug = require('debug')('compression-zlib');
var onHeaders = require('on-headers');
var vary = require('vary');
var zlib = require('zlib');

/**
 * Module variables.
 * 
 * @private
 */
var cacheControlNoTransformRegExp = /(?:^|,)\s*?no-transform\s*?(?:,|$)/;

/**
 * Add bufferred listeners to stream
 */
function addListeners(stream, on, listeners) {

  for (var i = 0; i < listeners.length; ++i) {
    on.apply(stream, listeners[i]);
  }
  return;
}

/**
 * Get the length of a given chunk
 */
function chunkLength(chunk, encoding) {

  if (!chunk) {
    return 0;
  }

  return !Buffer.isBuffer(chunk) ? Buffer.byteLength(chunk, encoding)
    : chunk.length;
}

/**
 * Compress response data with gzip / deflate
 * 
 * @param {Object} options
 * @return {Function} middleware
 */
function compression(options) {

  var opts = options || Object.create(null);
  var filter = opts.filter || shouldCompress;
  var available = opts.available || [ 'gzip', 'identity' ];
  var zlib_options = opts.zlib || {
    level: zlib.Z_BEST_SPEED,
    memLevel: zlib.Z_MAX_MEMLEVEL,
    strategy: zlib.Z_FILTERED
  };
  var threshold = typeof opts.threshold === 'string' ? bytes(opts.threshold)
    : opts.threshold;

  if (threshold == null) {
    threshold = 1024;
  }

  return function compression(req, res, next) {

    var ended = false;
    var length;
    var listeners = [];
    var write = res.write;
    var on = res.on;
    var end = res.end;
    var stream;

    // flush
    res.flush = function flush() {

      if (stream) {
        stream.flush();
      }
    };

    // proxy
    res.write = function(chunk, encoding) {

      if (ended === true) {
        return false;
      }
      if (!this._header) {
        this._implicitHeader();
      }
      return stream ? stream.write(new Buffer(chunk, encoding)) : write.call(
        res, chunk, encoding);
    };

    res.end = function(chunk, encoding) {

      if (ended === true) {
        return false;
      }
      if (!this._header) {
        // estimate the length
        if (!this.getHeader('Content-Length')) {
          length = chunkLength(chunk, encoding);
        }

        this._implicitHeader();
      }

      if (!stream) {
        return end.call(this, chunk, encoding);
      }

      // mark ended
      ended = true;

      // write Buffer for Node.js 0.8
      return chunk ? stream.end(new Buffer(chunk, encoding)) : stream.end();
    };

    res.on = function(type, listener) {

      if (!listeners || type !== 'drain') {
        return on.call(this, type, listener);
      }

      if (stream) {
        return stream.on(type, listener);
      }

      // buffer listeners for future stream
      listeners.push([ type, listener ]);
      return this;
    };

    function nocompress(msg) {

      debug('no compression: %s', msg);
      addListeners(res, on, listeners);
      listeners = null;
      return;
    }

    onHeaders(res, function() {

      // determine if request is filtered
      if (!filter(req, res)) {
        return nocompress('filtered');
      }

      // determine if the entity should be transformed
      if (!shouldTransform(req, res)) {
        nocompress('no transform');
        return;
      }

      // vary
      vary(res, 'Accept-Encoding');

      // content-length below threshold
      if (Number(res.getHeader('Content-Length')) < threshold
        || length < threshold) {
        nocompress('size below threshold');
        return;
      }

      var encoding = res.getHeader('Content-Encoding') || 'identity';

      if ('identity' !== encoding) { // already encoded
        return nocompress('already encoded');
      } else if ('HEAD' === req.method) { // head
        return nocompress('HEAD request');
      }

      // compression method
      var accept = accepts(req);
      var method = accept.encoding(available);

      // negotiation failed
      if (!method || method === 'identity') {
        return nocompress('not acceptable');
      }

      // compression stream
      if (method === 'gzip') {
        stream = zlib.createGzip(zlib_options);
      } else if (method === 'deflate') {
        stream = zlib.createDeflate(zlib_options);
      } else {
        return nocompress('not acceptable');
      }
      debug('%s compression', method);

      // add bufferred listeners to stream
      addListeners(stream, stream.on, listeners);

      // header fields
      res.setHeader('Content-Encoding', method);
      res.removeHeader('Content-Length');

      // compression
      stream.on('data', function(chunk) {

        if (write.call(res, chunk) === false) {
          stream.pause();
        }
        return;
      }).on('end', function() {

        return end.call(res);
      });
      on.call(res, 'drain', function() {

        return stream.resume();
      });
    });

    return next();
  };
}
module.exports = compression;

/**
 * Default filter function.
 */
function shouldCompress(req, res) {

  var type = res.getHeader('Content-Type');
  if (type === undefined || !compressible(type)) {
    debug('%s not compressible', type);
    return false;
  }
  return true;
}
module.exports.filter = shouldCompress;

/**
 * Determine if the entity should be transformed.
 * 
 * @private
 */
function shouldTransform(req, res) {

  var cacheControl = res.getHeader('Cache-Control');
  // Don't compress for Cache-Control: no-transform
  // https://tools.ietf.org/html/rfc7234#section-5.2.2.4
  return !cacheControl || !cacheControlNoTransformRegExp.test(cacheControl);
}
