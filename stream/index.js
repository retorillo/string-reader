'use strict';
var fs = require('fs');
var _stream =  new WeakMap();
var _lastread = new WeakMap();

class StringStreamReader {
  constructor(stream) {
    if (typeof(stream) === 'string')
      _stream.set(this, fs.createReadStream(stream, { encoding: 'utf-8' }));
    else
      _stream.set(this, stream);
    _lastread.set(this, "");
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
      var callback = () => {
        var block = stream.read(count);
        if (block == null && errorThrown) {
          reject(errorThrown);
          return;
        }
        if (block == null) {
          _lastread.set(mapkey, "");
          resolve(readBlocks.join(''));
        }
        var totalRead = readBlocks.appendBlock(block);
        if (totalRead >= count) {
          var result = readBlocks.join('');
          _lastread.set(mapkey, result.substr(count));
          resolve(result.substr(0, count));
        }
        else
          stream.once('readable', callback);
      };
      stream.once('readable', callback);
    });
  }
}

module.exports = StringStreamReader;
