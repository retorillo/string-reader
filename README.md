# StringReader

[![Build Status](https://travis-ci.org/retorillo/string-reader.svg?branch=master)](https://travis-ci.org/retorillo/string-reader)
[![NPM](https://img.shields.io/npm/v/string-reader.svg)](https://www.npmjs.com/package/string-reader)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Reads string based on regular expression that represents delimiter.

```
const StringReader = require('string-reader')
var reader = new StringReader('The quick brown fox jumps over the lazy dog.');
var words = [];
while(!reader.end){
   words.push(reader.readTo(/\s+|\./));
}
console.log(words);
// [ "The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog" ]
```

## Install

```
npm install --save string-reader
```

## Constructor

```
const StringReader = require('string-reader');
var reader = new StringReader(originalString);
```

Specify `originalString` to read.

This arguments is passed to `string` property.
See `string` property to learn details. ([string](#string))


## Methods

### readTo(delim, holdDelim, errorThrown)

Reads from the current position to the specified delimiter.

- `delim`: Specify delimiter as RegExp. When String is specified, it is treated
  as pattern of RegExp. For example, `readTo(';')` is equivalent to `readTo(/;/)`.
- `holdDelim`: Set `true` to include matched delimiter into returned string. By
  default, delimiter does not be included. For example,
  `new StringReader('a:b').readTo(/:/)` only returnes 'a', but 
  `new StringReader('a:b').readTo(/:/, true)` returns 'a:' including delimiter.
- `errorThrown`: Specify error that will be thrown if there are no delimiter
  matched. By default, no error be thrown if delimiter is unmatched, just only
  reads to end.

Returned value can be treated as String object, but has some additional properties:

- `position`: Position of the first character of its returned string.
- `delim`: Returned value of `RegExp.exec` method. Can use this property to
  detect which delimiter is matchd.
- `reader`: Instance of StringReader

**Note:** 

- Returned value is extended class that is inherited from String object.
  Therefore `new StringReader('something').readTo(/$/) == 'something'` is true,
  but `new StringReader('something').readTo(/$/) === 'something'` is `false`.
  Can call `toString` method to get primitive String object to prevent such a
  harmful side effect.
- **delimiter never be a pattern that matches empty string.** For example,
  `/$/m` does not match `CR` and `LF`, therefore `position` will be set before
  `CR` and `LF` and cannot advance to next line. So the following code will be
  loop: `while (reader.empty()) reader.readTo(/$/m)`. **For that reason, throws
  error if empty match is appeared.** Use alternatively `readTo(/\r?\n|\r/)` or
  `readLine()` to read to end of the line.


### readLine(errorThrown)

Reads from the current position to end of the current line.
The next three newline formats are supported:
`CRLF`(Windows),`LF`(Linux/Mac X and later) and `CR`(Mac 9 and ealier)

- `errorThrown`: Specify error that be thrown if the current position is end of
  string. By default, no error be thrown, just only returns empty string.

### readToEnd(errorThrown)

Reads from the current position to the end of string.

- `errorThrown`: Specify error that be thrown if the current position is end of
  string. By default, no error be thrown, just only returns empty string.

### read(count, errorThrown)

Reads specified-count characters from the current position.

- `count`: Count to read. **Can specify negative value to read backwards.**
- `errorThrown`: Specify error that be thrown when the current position reached out
  of the string. By default, no error be thrown, just only return empty or
  partial string.

### peekTo(errorThrown), peekLine(errorThrown), peekToEnd(errorThrown), and peek(count, errorThrown)

- `peekTo` is equivalent to `readTo` but does not change current position.
- `peekLine` is equivalent to `readLine` but does not change current position.
- `peekToEnd` is equivalent to `readToEnd` but does not change current position.
- `peek` is equivalent to `read` but does not change current position.

## Properties

### string

Get or set the original string.

**NOTE:**

- If set some value, `position` is always reset to zero.
- If set `null` or `undefined`, empty string is alternatively set.
- If set non-string object, return-value of its `toString` is alternatively set.

### position

Set or get current position.

**NOTE:**

- If set value that is smaller than zero, zero is alternatively set.
- If set value that is greather than its length, value of `length` is
  alternatively set.

### length (Readonly)

Returns total length of original string.

### end (Readonly)

Returns whether its position is end of string.

# License

Distributed under the MIT license.

Copyright (C) 2016 Retorillo
