const StringReader = require('..');
const assert = require('assert');
const delim = ',';
const testSentence = 'The quick brown fox jumps over the lazy dog';
const testWords = testSentence.split(' ');
const reader = new StringReader(testWords.join(delim));

// readTo test
var readCount = 0;
var holdDelim = true;
while (!reader.end) {
   var read = reader.readTo(delim, holdDelim = !holdDelim);
   console.log(read.toString());
   assert.equal(read, testWords[readCount++] + (holdDelim ? delim : ''));
}

console.log(new Array(91).join('='))

// read Test
reader.string = testSentence;
for (var c = 1; c <= testSentence.length; c++) {
   if (c > 2)
      console.log(new Array(91).join('-'))
   var expectedList = [];
   reader.position = 0;
   for (var d = 0; d < testSentence.length; d += c) {
      var value = reader.read(c);
      var expected = testSentence.substr(d, c);
      expectedList.push(expected);
      console.log(value.replace(/\s/g,'_')); 
      assert.equal(value, expected);
   }
   assert.equal(expectedList.join(''), testSentence);
}

console.log(new Array(91).join('='))


// read Test (backwords)
for (var c = 1; c <= testSentence.length; c++) {
   if (c > 2)
      console.log(new Array(91).join('-'))
   var expectedList = [];
   reader.position = testSentence.length;
   for (var d = 0; d < testSentence.length; d += c) {
      var value = reader.read(-c);
      var expected_index = -Math.min(testSentence.length, d+c); 
      var expected_length = Math.min(testSentence.length - d, c);
      var expected = testSentence.substr(expected_index, expected_length);
      expectedList.splice(0, 0, expected);
      console.log(value.replace(/\s/g,'_')); 
      assert.equal(value, expected);
   }
   assert.equal(expectedList.join(''), testSentence);
}

// Read Line Test 
// \r for ancient Mac
// \n for Linux and modern Mac
// \r\n for Windows
['\r', '\n', '\r\n'].forEach((lineEnding) => {
   console.log(new Array(91).join('='))

   const testLinesArray = [];
   for (var c = 0; c < 10; c ++)
      testLinesArray.push( c % 2 ? '' : `line ${c+1}` );
   const testLines = testLinesArray.join(lineEnding)
   reader.string = testLines;

   for (var c = 0; c < testLinesArray.length; c ++) {
      console.log(testLinesArray[c] ? testLinesArray[c] : '(empty line)');
      assert.equal(reader.readLine(), testLinesArray[c]);
   }
   assert(reader.end, 'must be end of string (readLine)')
   reader.position = 0;
   assert.equal(reader.readToEnd(), testLines);
   assert(reader.end, 'must be end of string (readToEnd)')
});

