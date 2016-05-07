"use strict";

const _str = new WeakMap();
const _pos = new WeakMap();

class StringReader {
   constructor(str) {
      this.string = str;
   }
   set string (value) {
      _str[this] = value ? (typeof(value) === 'string' ? value : value.toString()) : '';
      _pos[this] = 0; 
   }
   get string () { return _str[this]; }
   set position (value) { return _pos[this] = Math.max(0, Math.min(this.length, value)); }
   get position () { return _pos[this]; }
   get length () { return this.string.length }
   get end () { return this.position == this.length }
   peek(count, errorThrown) {
      if (count < 0) {
         if (errorThrown && this.position + count < 0)
            throw errorThrown;
         var i = Math.max(0, this.position + count);
         var c = Math.min(this.position, -count);
         return this.string.substr(i, c);
      }
      else {
         var left = this.length - this.position;
         if (errorThrown && left < count)
            throw errorThrown;
         return this.string.substr(this.position, Math.min(left, count));
      }
   }
   read(count, errorThrown) {
      var peek = this.peek(count, errorThrown);
      this.position = count < 0 ? Math.max(0, this.position + count)
         : Math.min(this.string.length, this.position + count)
      return peek;
   }
   peekTo(delim, holdDelim, errorThrown) {
      var head = this.string.slice(this.position);
      var m = (delim instanceof RegExp ? delim : new RegExp(delim)).exec(head);
      if (m && m[0].length == 0)
         throw `delimiter never be a pattern that matches empty string: ${delim}`;
      if (!m && errorThrown)
         throw errorThrown;
      return new TaggedString(
         head.substring(0, m
            ? ( holdDelim
               ? m.index + m[0].length
               : m.index
              ) 
            : head.length
            ), { 
               reader: this,
               position: this.position, 
               delim: m
            });
   }
   readTo(delim, holdDelim, errorThrown) {
      var peek = this.peekTo(delim, holdDelim, errorThrown);
      this.position += (holdDelim ? peek.length
         : ( peek.delim
            ? peek.length + peek.delim[0].length
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
      return this.string.slice(this.position);
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
