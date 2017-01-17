'use strict';
var fs = require('fs');
var _stream =  new WeakMap();
var _lastread = new WeakMap();
var _relays = new WeakMap();
var _end = new WeakMap();

class StringStreamReader {
  constructor(stream) {
    if (typeof(stream) === 'string')
      stream = fs.createReadStream(stream, { encoding: 'ucs2' });
    _stream.set(this, stream);
    var relays = [];
    _relays.set(this, relays);
    _lastread.set(this, "");
    _end.set(this, false);
    stream.on('readable', function() {
      relays.forEach(r => {
        r.readable();
      });
    });
    stream.on('end', () => {
      _end.set(this, true);
      relays.forEach(r => {
        r.end();
      });
    });
  }
  read(count, errorThrown) {
    var mapkey = this;
    return new Promise((resolve, reject) => {
      var stream = _stream.get(mapkey);
      var lastread = _lastread.get(mapkey);
      var readBlocks = [];
      readBlocks.totalRead = 0;
      readBlocks.appendBlock = function(block) {
        this.push(block);
        this.totalRead += block.length;
        return this.totalRead;
      };
      if (lastread.length >= count) {
        _lastread.set(mapkey, lastread.substr(count));
        resolve(lastread.substr(0, count));
        return;
      }
      readBlocks.appendBlock(lastread);
      var unregister = function() {
        var relays = _relays.get(mapkey);
        var i = relays.indexOf(relay);
        if (i != -1)
          relays.splice(i, 1);
      }
      var tryresolve = function(force) {
        var result = readBlocks.join('');
        if (!force && readBlocks.totalRead < count)
          return;
        _lastread.set(mapkey, result.substr(count));
        unregister();
        var result = result.substr(0, count);
        resolve(count > 0 && result.length == 0 ? null : result);
      }
      var tryreject = function(error) {
        unregister();
        reject(error);
      }
      var tryread = function() {
        if (_end.get(mapkey)) {
          tryresolve(true);
          return;
        }
        var block = stream.read(count);
        if (block == null)
          return; // end of stream or unreadable state
        readBlocks.appendBlock(block);
        tryresolve(false);
      }
      var relay = {
        readable: function() {
          tryread();
        },
        end: function() {
          if (errorThrown)
            tryreject(errorThrown);
          else
            tryresolve(true);
        },
      }
      _relays.get(mapkey).push(relay);
      tryread();
    });
  }
}

module.exports = StringStreamReader;
