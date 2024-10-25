// Converts an ArrayBuffer directly to base64, without any intermediate 'convert to string then
// use window.btoa' step.

/*
MIT LICENSE

Copyright 2011 Jon Leighton

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

//export function arrayToBase64(bytes: Uint8Array): string {
//    const encodings = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
//    let base64 = ""
//
//    var byteRemainder = bytes.length % 3
//    var mainLength = bytes.length - byteRemainder
//
//    // Main loop deals with bytes in chunks of 3
//    for (var i = 0; i < mainLength; i = i + 3) {
//        // Combine the three bytes into a single integer
//        var chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
//
//        // Use bitmasks to extract 6-bit segments from the triplet
//        var a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
//        var b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
//        var c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
//        var d = chunk & 63               // 63       = 2^6 - 1
//
//        // Convert the raw binary segments to the appropriate ASCII encoding
//        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
//    }
//
//    // Deal with the remaining bytes and padding
//    if (byteRemainder === 1) {
//        chunk = bytes[mainLength]
//
//        const a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2
//
//        // Set the 4 least significant bits to zero
//        const b = (chunk & 3) << 4 // 3   = 2^2 - 1
//
//        base64 += encodings[a] + encodings[b] + '=='
//    } else if (byteRemainder === 2) {
//        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]
//
//        a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
//        b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4
//
//        // Set the 2 least significant bits to zero
//        c = (chunk & 15) << 2 // 15    = 2^4 - 1
//
//        base64 += encodings[a] + encodings[b] + encodings[c] + '='
//    }
//
//    return base64
//}


//export function base64encode(arr) {
//  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"; // base64 alphabet
//  const bin = n => n.toString(2).padStart(8,0); // convert num to 8-bit binary string
//  const l = arr.length
//  let result = '';
//
//  for(let i=0; i<=(l-1)/3; i++) {
//    let c1 = i*3+1>=l; // case when "=" is on end
//    let c2 = i*3+2>=l; // case when "=" is on end
//    let chunk = bin(arr[3*i]) + bin(c1? 0:arr[3*i+1]) + bin(c2? 0:arr[3*i+2]);
//    let r = chunk.match(/.{1,6}/g).map((x,j)=> j==3&&c2 ? '=' :(j==2&&c1 ? '=':abc[+('0b'+x)]));  
//    result += r.join('');
//  }
//
//  return result;
//}

function btoa(s) {
  if (arguments.length === 0) {
    throw new TypeError("1 argument required, but only 0 present.");
  }

  let i;
  // String conversion as required by Web IDL.
  s = `${s}`;
  // "The btoa() method must throw an "InvalidCharacterError" DOMException if
  // data contains any character whose code point is greater than U+00FF."
  for (i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) > 255) {
      return null;
    }
  }
  let out = "";
  for (i = 0; i < s.length; i += 3) {
    const groupsOfSix = [undefined, undefined, undefined, undefined];
    groupsOfSix[0] = s.charCodeAt(i) >> 2;
    groupsOfSix[1] = (s.charCodeAt(i) & 0x03) << 4;
    if (s.length > i + 1) {
      groupsOfSix[1] |= s.charCodeAt(i + 1) >> 4;
      groupsOfSix[2] = (s.charCodeAt(i + 1) & 0x0f) << 2;
    }
    if (s.length > i + 2) {
      groupsOfSix[2] |= s.charCodeAt(i + 2) >> 6;
      groupsOfSix[3] = s.charCodeAt(i + 2) & 0x3f;
    }
    for (let j = 0; j < groupsOfSix.length; j++) {
      if (typeof groupsOfSix[j] === "undefined") {
        out += "=";
      } else {
        out += btoaLookup(groupsOfSix[j]);
      }
    }
  }
  return out;
}

/**
 * Lookup table for btoa(), which converts a six-bit number into the
 * corresponding ASCII character.
 */
const keystr =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function btoaLookup(index) {
  if (index >= 0 && index < 64) {
    return keystr[index];
  }

  // Throw INVALID_CHARACTER_ERR exception here -- won't be hit in the tests.
  return undefined;
}


function Uint8ToString(u8a){
  var CHUNK_SZ = 0x8000;
  var c = [];
  for (var i=0; i < u8a.length; i+=CHUNK_SZ) {
    c.push(String.fromCharCode.apply(null, u8a.subarray(i, i+CHUNK_SZ)));
  }
  return c.join("");
}

export function base64encode(arr) {
  return btoa(Uint8ToString(arr))
}


// Usage
//var u8 = new Uint8Array([65, 66, 67, 68]);
//var b64encoded = btoa(Uint8ToString(u8));
//
