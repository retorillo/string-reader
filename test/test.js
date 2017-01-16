const StringReader = require('..');
const StringStreamReader = require('../stream');
const should = require('should');
const fs = require('fs');

function makestr(start, length) {
  var str = [];
  for (var c = 0; c < length; c++)
    str.push(String.fromCharCode(start + c));
  return str.join('');
}

describe("stream", function() {
  before(function() {
    return new Promise(function(resolve, reject) {
      var s = fs.createWriteStream('dummy.txt');
      for (var c = 0; c < 0xffff; c++)
        s.write(String.fromCharCode(c));
      s.end(function() {
        s.close(resolve);
      });
    });
  });
  it ("can be read from file", function() {
    var s = new StringStreamReader('dummy.txt');
    var offset = 0;
    var readc = 2048;
    return s.read(readc).then(function(data){
      should(data).eql(makestr(offset, readc));
    });
  });
});

describe("read", function() {
  const delim = ',';
  const testSentence = 'The quick brown fox jumps over the lazy dog';
  const testWords = testSentence.split(' ');
  it ("read (forward)", function () {
    const reader = new StringReader(testSentence);
    for (var c = 1; c <= testSentence.length; c++) {
      var expectedList = [];
      reader.position = 0;
      for (var d = 0; d < testSentence.length; d += c) {
        var value = reader.read(c);
        var expected = testSentence.substr(d, c);
        expectedList.push(expected);
        should(value).equal(expected);
      }
      should(expectedList.join('')).equal(testSentence);
    }
  });
  it ("read (backward)", function() {
    const reader = new StringReader(testSentence);
    for (var c = 1; c <= testSentence.length; c++) {
      var expectedList = [];
      reader.position = testSentence.length;
      for (var d = 0; d < testSentence.length; d += c) {
        var value = reader.read(-c);
        var expected_index = -Math.min(testSentence.length, d+c);
        var expected_length = Math.min(testSentence.length - d, c);
        var expected = testSentence.substr(expected_index, expected_length);
        expectedList.splice(0, 0, expected);
        should(value).equal(expected);
      }
      should(expectedList.join('')).equal(testSentence);
    }
  });
  ['\r', '\n', '\r\n'].forEach((lineEnding) => {
    const reader = new StringReader();
    var itmsg = "readLine (" + lineEnding.replace('\r', 'CR').replace('\n', 'LF') + ")";
    it (itmsg, function() {
      const testLinesArray = [];

      for (var c = 0; c < 10; c ++)
        testLinesArray.push( c % 2 ? '' : `line ${c+1}` );

      const testLines = testLinesArray.join(lineEnding)
      reader.content = testLines;

      for (var c = 0; c < testLinesArray.length; c ++)
        should(reader.readLine()).equal(testLinesArray[c]);

      should(reader.end).equal(true, 'must be end of string (readLine)')
      reader.position = 0;
      should(reader.readToEnd()).equal(testLines);
      should(reader.end).equal(true, 'must be end of string (readToEnd)')
    });
  });
  it ("readTo (single line content)", function () {
    const reader = new StringReader(testWords.join(delim));
    var readCount = 0;
    var holdDelim = true;
    while (!reader.end) {
      var read = reader.readTo(delim, holdDelim = !holdDelim);
      should.equal(read, testWords[readCount++] + (holdDelim ? delim : ''));
    }
  });
  it("readTo (multiline content)", function() {
    const testScript = "else{\nreturn true;\n}"
    const reader = new StringReader(testScript);
    should(reader.readTo(/{/).toString()).equal('else');
    should(reader.readTo(/}/).toString()).equal('\nreturn true;\n');
    should(reader.end).equal(true, 'must be end of string');
  });
  it ("readTo (index of delimiter)", function() {
    const testScript = "else{\nreturn true;\n}"
    const reader = new StringReader(testScript);
    reader.position = 0;
    reader.readTo(/{/);
    var delimiterTest = reader.readTo(/}/);
    should(delimiterTest.delimiter.index).equal(testScript.indexOf('}'));
  });
});

describe("push, pop", function() {
  it("with index recovery", function () {
    var reader = new StringReader('The quick brown fox jumps over the lazy dog.');
    reader.readTo(/\s+/);
    should(reader.position).equal('The '.length);
    reader.push();
    reader.readTo(/\s+/);
    reader.readTo(/\s+/);
    reader.readTo(/\s+/);
    should(reader.pop()).equal("quick brown fox ");
    should(reader.position).equal('The '.length);
  });
  it("without index recovery", function () {
    var reader = new StringReader('The quick brown fox jumps over the lazy dog.');
    reader.readTo(/\s+/);
    should(reader.position).equal('The '.length);
    reader.push();
    reader.readTo(/\s+/);
    reader.readTo(/\s+/);
    reader.readTo(/\s+/);
    should(reader.pop(true)).equal("quick brown fox ");
    should(reader.position).equal("The quick brown fox ".length);
  });
});
