"use strict";

const _content = new WeakMap();
const _position = new WeakMap();
const _stack = new WeakMap();

class StringReader {
   constructor(content) {

      this.content = content;
      _stack[this] = [];
   }
   set content (value) {
      _content[this] = value ? (typeof(value) === 'string' ? value : value.toString()) : '';
      _position[this] = 0;
      return _content;
   }
   get content () { return _content[this]; }

   set position (value) { return _position[this] = Math.max(0, Math.min(this.length, value)); }
   get position () { return _position[this]; }
   get length () { return this.content.length }
   get end () { return this.position == this.length }

   push() {
      _stack[this].push(this.position);
   }
   pop(holdPosition) {
      var from = _stack[this].pop();
      var to = this.position;
      if (!holdPosition)
         this.position = from;
      return this.content.substring(Math.min(from, to), Math.max(from, to))
   }
   peek(count, errorThrown) {
      if (count < 0) {
         if (errorThrown && this.position + count < 0)
            throw errorThrown;
         var i = Math.max(0, this.position + count);
         var c = Math.min(this.position, -count);
         return this.content.substr(i, c);
      }
      else {
         var left = this.length - this.position;
         if (errorThrown && left < count)
            throw errorThrown;
         return this.content.substr(this.position, Math.min(left, count));
      }
   }
   read(count, errorThrown) {
      var peek = this.peek(count, errorThrown);
      this.position = count < 0 ? Math.max(0, this.position + count)
         : Math.min(this.content.length, this.position + count)
      return peek;
   }
   peekTo(delimiter, holdDelimiter, errorThrown) {
      var r = (delimiter instanceof RegExp
         ? (delimiter.global
            ? delimiter
            : new RegExp(delimiter.source, ['g',
                 delimiter.multiline ? 'm' : '',
                 delimiter.ignoreCase ? 'i' : ''
              ].join(''))
           )
         : new RegExp(delimiter, 'g'));
      r.lastIndex = this.position;
      var m = r.exec(this.content);
      if (m && m[0].length == 0)
         throw `delimiter never be a pattern that matches empty string: ${delimiter}`;
      if (!m && errorThrown)
         throw errorThrown;
      return new TaggedString(
         this.content.substring(this.position, m
            ? ( holdDelimiter
               ? m.index + m[0].length
               : m.index
              )
            : this.content.length
            ), {
               reader: this,
               position: this.position,
               delimiter: m
            });
   }
   readTo(delimiter, holdDelimiter, errorThrown) {
      var peek = this.peekTo(delimiter, holdDelimiter, errorThrown);
      this.position += (holdDelimiter ? peek.length
         : ( peek.delimiter
            ? peek.length + peek.delimiter[0].length
            : peek.length
         )
      );
      return peek;
   }
   peekLine(errorThrown) {
      return this.peekTo(/\r?\n|\r/, false, errorThrown).toString();
   }
   readLine(errorThrown) {
      return this.readTo(/\r?\n|\r/, false, errorThrown).toString();
   }
   peakToEnd(errorThrown) {
      if (errorThrown && this.end) throw errorThrown;
      return this.content.slice(this.position);
   }
   readToEnd(errorThrown) {
      var peak = this.peakToEnd(errorThrown);
      this.position = this.length;
      return peak;
   }
}

class TaggedString extends String {
   constructor(thing, tag) {
      super(thing);
      Object.defineProperty(this, 'tag', { value: tag, writable: false });
      for (var p in tag)
         if (!Object.getOwnPropertyDescriptor(this, p))
            Object.defineProperty(this, p, { value: tag[p], writable: false });
   }
}

module.exports = StringReader;
