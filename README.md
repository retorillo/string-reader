# StringReader

[![Build Status](https://travis-ci.org/retorillo/string-reader.svg?branch=master)](https://travis-ci.org/retorillo/string-reader)
[![Coverage Status](https://coveralls.io/repos/github/retorillo/string-reader/badge.svg?branch=master)](https://coveralls.io/github/retorillo/string-reader?branch=master)
[![Dependency Status](https://gemnasium.com/badges/github.com/retorillo/string-reader.svg)](https://gemnasium.com/github.com/retorillo/string-reader)
[![NPM](https://img.shields.io/npm/v/string-reader.svg)](https://www.npmjs.com/package/string-reader)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Reads string based on regular expression that represents delimiter.

```javascript
const StringReader = require('string-reader');
var reader = new StringReader('The quick brown fox jumps over the lazy dog.');
var words = [];
while(!reader.end){
   words.push(reader.readTo(/\s+|\./));
}
console.log(words);
// [ "The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog" ]
```

Also supports promise-based asynchronous read with Readable Stream.

```javascript
const StringStreamReader = require('string-reader/stream');
var readable = fs.createReadStream('the_quick_brown_fox.txt');
var steam = new StringStreamReader(readable);
var words = [];
var readAllWords = callback => {
  stream.readTo(/\s+|\./).then(w => {
    words.push(w);
    if (!steam.end)
      readAllWords();
  }).then(callback || () => {});
}
readAllWords(() => {
  console.log(words);
});
// [ "The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog" ]
```

## API Reference

- [StringReader](doc/string.md)
- [StreamStringReader](doc/stream.md);

## Install

```bash
npm install --save string-reader
```

## License

Distributed under the MIT license.

Copyright (C) 2016 Retorillo
