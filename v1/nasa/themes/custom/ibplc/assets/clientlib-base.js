(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var customInspectSymbol =
  (typeof Symbol === 'function' && typeof Symbol.for === 'function')
    ? Symbol.for('nodejs.util.inspect.custom')
    : null

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    var proto = { foo: function () { return 42 } }
    Object.setPrototypeOf(proto, Uint8Array.prototype)
    Object.setPrototypeOf(arr, proto)
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  Object.setPrototypeOf(buf, Buffer.prototype)
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
Object.setPrototypeOf(Buffer, Uint8Array)

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(buf, Buffer.prototype)

  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}
if (customInspectSymbol) {
  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]]
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(newBuf, Buffer.prototype)

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  } else if (typeof val === 'boolean') {
    val = Number(val)
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
var hexSliceLookupTable = (function () {
  var alphabet = '0123456789abcdef'
  var table = new Array(256)
  for (var i = 0; i < 16; ++i) {
    var i16 = i * 16
    for (var j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j]
    }
  }
  return table
})()

}).call(this,require("buffer").Buffer)
},{"base64-js":1,"buffer":3,"ieee754":7}],4:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":require("../../is-buffer/index.js")})
},{"../../is-buffer/index.js":9}],5:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],6:[function(require,module,exports){
'use strict';

var Buffer = require('safe-buffer').Buffer;

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return -1;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// UTF-8 replacement characters ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd'.repeat(p);
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd'.repeat(p + 1);
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd'.repeat(p + 2);
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character for each buffered byte of a (partial)
// character needs to be added to the output.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd'.repeat(this.lastTotal - this.lastNeed);
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":28}],7:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],8:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],9:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],10:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],11:[function(require,module,exports){
(function (process){
'use strict';

if (typeof process === 'undefined' ||
    !process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = { nextTick: nextTick };
} else {
  module.exports = process
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}


}).call(this,require('_process'))
},{"_process":12}],12:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],13:[function(require,module,exports){
module.exports = require('./lib/_stream_duplex.js');

},{"./lib/_stream_duplex.js":14}],14:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

{
  // avoid scope creep, the keys array can then be collected
  var keys = objectKeys(Writable.prototype);
  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  pna.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

Duplex.prototype._destroy = function (err, cb) {
  this.push(null);
  this.end();

  pna.nextTick(cb, err);
};
},{"./_stream_readable":16,"./_stream_writable":18,"core-util-is":4,"inherits":8,"process-nextick-args":11}],15:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":17,"core-util-is":4,"inherits":8}],16:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = require('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/BufferList');
var destroyImpl = require('./internal/streams/destroy');
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

  // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var readableHwm = options.readableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});

Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  this.push(null);
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        stream.emit('error', new Error('stream.push() after EOF'));
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
    }
  }

  return needMoreData(state);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    stream.emit('data', chunk);
    stream.read(0);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) pna.nextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    pna.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) pna.nextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = { hasUnpiped: false };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, unpipeInfo);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this, unpipeInfo);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        pna.nextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    pna.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;

  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  this._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._readableState.highWaterMark;
  }
});

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    pna.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_stream_duplex":14,"./internal/streams/BufferList":19,"./internal/streams/destroy":20,"./internal/streams/stream":21,"_process":12,"core-util-is":4,"events":5,"inherits":8,"isarray":10,"process-nextick-args":11,"safe-buffer":22,"string_decoder/":23,"util":2}],17:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) {
    return this.emit('error', new Error('write callback called multiple times'));
  }

  ts.writechunk = null;
  ts.writecb = null;

  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);

  cb(er);

  var rs = this._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function') {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  var _this2 = this;

  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
    _this2.emit('close');
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0');

  if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
},{"./_stream_duplex":14,"core-util-is":4,"inherits":8}],18:[function(require,module,exports){
(function (process,global,setImmediate){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

var destroyImpl = require('./internal/streams/destroy');

util.inherits(Writable, Stream);

function nop() {}

function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var writableHwm = options.writableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;

    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  pna.nextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    pna.nextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    pna.nextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    pna.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      stream.emit('error', err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function') {
      state.pendingcb++;
      state.finalCalled = true;
      pna.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) pna.nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }
  if (state.corkedRequestsFree) {
    state.corkedRequestsFree.next = corkReq;
  } else {
    state.corkedRequestsFree = corkReq;
  }
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  get: function () {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});

Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  this.end();
  cb(err);
};
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)
},{"./_stream_duplex":14,"./internal/streams/destroy":20,"./internal/streams/stream":21,"_process":12,"core-util-is":4,"inherits":8,"process-nextick-args":11,"safe-buffer":22,"timers":31,"util-deprecate":32}],19:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = require('safe-buffer').Buffer;
var util = require('util');

function copyBuffer(src, target, offset) {
  src.copy(target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function push(v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function unshift(v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function shift() {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function clear() {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function join(s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function concat(n) {
    if (this.length === 0) return Buffer.alloc(0);
    if (this.length === 1) return this.head.data;
    var ret = Buffer.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      copyBuffer(p.data, ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  return BufferList;
}();

if (util && util.inspect && util.inspect.custom) {
  module.exports.prototype[util.inspect.custom] = function () {
    var obj = util.inspect({ length: this.length });
    return this.constructor.name + ' ' + obj;
  };
}
},{"safe-buffer":22,"util":2}],20:[function(require,module,exports){
'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
      pna.nextTick(emitErrorNT, this, err);
    }
    return this;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      pna.nextTick(emitErrorNT, _this, err);
      if (_this._writableState) {
        _this._writableState.errorEmitted = true;
      }
    } else if (cb) {
      cb(err);
    }
  });

  return this;
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy
};
},{"process-nextick-args":11}],21:[function(require,module,exports){
module.exports = require('events').EventEmitter;

},{"events":5}],22:[function(require,module,exports){
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":3}],23:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":22}],24:[function(require,module,exports){
module.exports = require('./readable').PassThrough

},{"./readable":25}],25:[function(require,module,exports){
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":14,"./lib/_stream_passthrough.js":15,"./lib/_stream_readable.js":16,"./lib/_stream_transform.js":17,"./lib/_stream_writable.js":18}],26:[function(require,module,exports){
module.exports = require('./readable').Transform

},{"./readable":25}],27:[function(require,module,exports){
module.exports = require('./lib/_stream_writable.js');

},{"./lib/_stream_writable.js":18}],28:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"buffer":3,"dup":22}],29:[function(require,module,exports){
(function (Buffer){
;(function (sax) { // wrapper for non-node envs
  sax.parser = function (strict, opt) { return new SAXParser(strict, opt) }
  sax.SAXParser = SAXParser
  sax.SAXStream = SAXStream
  sax.createStream = createStream

  // When we pass the MAX_BUFFER_LENGTH position, start checking for buffer overruns.
  // When we check, schedule the next check for MAX_BUFFER_LENGTH - (max(buffer lengths)),
  // since that's the earliest that a buffer overrun could occur.  This way, checks are
  // as rare as required, but as often as necessary to ensure never crossing this bound.
  // Furthermore, buffers are only tested at most once per write(), so passing a very
  // large string into write() might have undesirable effects, but this is manageable by
  // the caller, so it is assumed to be safe.  Thus, a call to write() may, in the extreme
  // edge case, result in creating at most one complete copy of the string passed in.
  // Set to Infinity to have unlimited buffers.
  sax.MAX_BUFFER_LENGTH = 64 * 1024

  var buffers = [
    'comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype',
    'procInstName', 'procInstBody', 'entity', 'attribName',
    'attribValue', 'cdata', 'script'
  ]

  sax.EVENTS = [
    'text',
    'processinginstruction',
    'sgmldeclaration',
    'doctype',
    'comment',
    'opentagstart',
    'attribute',
    'opentag',
    'closetag',
    'opencdata',
    'cdata',
    'closecdata',
    'error',
    'end',
    'ready',
    'script',
    'opennamespace',
    'closenamespace'
  ]

  function SAXParser (strict, opt) {
    if (!(this instanceof SAXParser)) {
      return new SAXParser(strict, opt)
    }

    var parser = this
    clearBuffers(parser)
    parser.q = parser.c = ''
    parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH
    parser.opt = opt || {}
    parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags
    parser.looseCase = parser.opt.lowercase ? 'toLowerCase' : 'toUpperCase'
    parser.tags = []
    parser.closed = parser.closedRoot = parser.sawRoot = false
    parser.tag = parser.error = null
    parser.strict = !!strict
    parser.noscript = !!(strict || parser.opt.noscript)
    parser.state = S.BEGIN
    parser.strictEntities = parser.opt.strictEntities
    parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES)
    parser.attribList = []

    // namespaces form a prototype chain.
    // it always points at the current tag,
    // which protos to its parent tag.
    if (parser.opt.xmlns) {
      parser.ns = Object.create(rootNS)
    }

    // mostly just for error reporting
    parser.trackPosition = parser.opt.position !== false
    if (parser.trackPosition) {
      parser.position = parser.line = parser.column = 0
    }
    emit(parser, 'onready')
  }

  if (!Object.create) {
    Object.create = function (o) {
      function F () {}
      F.prototype = o
      var newf = new F()
      return newf
    }
  }

  if (!Object.keys) {
    Object.keys = function (o) {
      var a = []
      for (var i in o) if (o.hasOwnProperty(i)) a.push(i)
      return a
    }
  }

  function checkBufferLength (parser) {
    var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10)
    var maxActual = 0
    for (var i = 0, l = buffers.length; i < l; i++) {
      var len = parser[buffers[i]].length
      if (len > maxAllowed) {
        // Text/cdata nodes can get big, and since they're buffered,
        // we can get here under normal conditions.
        // Avoid issues by emitting the text node now,
        // so at least it won't get any bigger.
        switch (buffers[i]) {
          case 'textNode':
            closeText(parser)
            break

          case 'cdata':
            emitNode(parser, 'oncdata', parser.cdata)
            parser.cdata = ''
            break

          case 'script':
            emitNode(parser, 'onscript', parser.script)
            parser.script = ''
            break

          default:
            error(parser, 'Max buffer length exceeded: ' + buffers[i])
        }
      }
      maxActual = Math.max(maxActual, len)
    }
    // schedule the next check for the earliest possible buffer overrun.
    var m = sax.MAX_BUFFER_LENGTH - maxActual
    parser.bufferCheckPosition = m + parser.position
  }

  function clearBuffers (parser) {
    for (var i = 0, l = buffers.length; i < l; i++) {
      parser[buffers[i]] = ''
    }
  }

  function flushBuffers (parser) {
    closeText(parser)
    if (parser.cdata !== '') {
      emitNode(parser, 'oncdata', parser.cdata)
      parser.cdata = ''
    }
    if (parser.script !== '') {
      emitNode(parser, 'onscript', parser.script)
      parser.script = ''
    }
  }

  SAXParser.prototype = {
    end: function () { end(this) },
    write: write,
    resume: function () { this.error = null; return this },
    close: function () { return this.write(null) },
    flush: function () { flushBuffers(this) }
  }

  var Stream
  try {
    Stream = require('stream').Stream
  } catch (ex) {
    Stream = function () {}
  }

  var streamWraps = sax.EVENTS.filter(function (ev) {
    return ev !== 'error' && ev !== 'end'
  })

  function createStream (strict, opt) {
    return new SAXStream(strict, opt)
  }

  function SAXStream (strict, opt) {
    if (!(this instanceof SAXStream)) {
      return new SAXStream(strict, opt)
    }

    Stream.apply(this)

    this._parser = new SAXParser(strict, opt)
    this.writable = true
    this.readable = true

    var me = this

    this._parser.onend = function () {
      me.emit('end')
    }

    this._parser.onerror = function (er) {
      me.emit('error', er)

      // if didn't throw, then means error was handled.
      // go ahead and clear error, so we can write again.
      me._parser.error = null
    }

    this._decoder = null

    streamWraps.forEach(function (ev) {
      Object.defineProperty(me, 'on' + ev, {
        get: function () {
          return me._parser['on' + ev]
        },
        set: function (h) {
          if (!h) {
            me.removeAllListeners(ev)
            me._parser['on' + ev] = h
            return h
          }
          me.on(ev, h)
        },
        enumerable: true,
        configurable: false
      })
    })
  }

  SAXStream.prototype = Object.create(Stream.prototype, {
    constructor: {
      value: SAXStream
    }
  })

  SAXStream.prototype.write = function (data) {
    if (typeof Buffer === 'function' &&
      typeof Buffer.isBuffer === 'function' &&
      Buffer.isBuffer(data)) {
      if (!this._decoder) {
        var SD = require('string_decoder').StringDecoder
        this._decoder = new SD('utf8')
      }
      data = this._decoder.write(data)
    }

    this._parser.write(data.toString())
    this.emit('data', data)
    return true
  }

  SAXStream.prototype.end = function (chunk) {
    if (chunk && chunk.length) {
      this.write(chunk)
    }
    this._parser.end()
    return true
  }

  SAXStream.prototype.on = function (ev, handler) {
    var me = this
    if (!me._parser['on' + ev] && streamWraps.indexOf(ev) !== -1) {
      me._parser['on' + ev] = function () {
        var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments)
        args.splice(0, 0, ev)
        me.emit.apply(me, args)
      }
    }

    return Stream.prototype.on.call(me, ev, handler)
  }

  // this really needs to be replaced with character classes.
  // XML allows all manner of ridiculous numbers and digits.
  var CDATA = '[CDATA['
  var DOCTYPE = 'DOCTYPE'
  var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace'
  var XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/'
  var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE }

  // http://www.w3.org/TR/REC-xml/#NT-NameStartChar
  // This implementation works on strings, a single character at a time
  // as such, it cannot ever support astral-plane characters (10000-EFFFF)
  // without a significant breaking change to either this  parser, or the
  // JavaScript language.  Implementation of an emoji-capable xml parser
  // is left as an exercise for the reader.
  var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/

  var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/

  var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/
  var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/

  function isWhitespace (c) {
    return c === ' ' || c === '\n' || c === '\r' || c === '\t'
  }

  function isQuote (c) {
    return c === '"' || c === '\''
  }

  function isAttribEnd (c) {
    return c === '>' || isWhitespace(c)
  }

  function isMatch (regex, c) {
    return regex.test(c)
  }

  function notMatch (regex, c) {
    return !isMatch(regex, c)
  }

  var S = 0
  sax.STATE = {
    BEGIN: S++, // leading byte order mark or whitespace
    BEGIN_WHITESPACE: S++, // leading whitespace
    TEXT: S++, // general stuff
    TEXT_ENTITY: S++, // &amp and such.
    OPEN_WAKA: S++, // <
    SGML_DECL: S++, // <!BLARG
    SGML_DECL_QUOTED: S++, // <!BLARG foo "bar
    DOCTYPE: S++, // <!DOCTYPE
    DOCTYPE_QUOTED: S++, // <!DOCTYPE "//blah
    DOCTYPE_DTD: S++, // <!DOCTYPE "//blah" [ ...
    DOCTYPE_DTD_QUOTED: S++, // <!DOCTYPE "//blah" [ "foo
    COMMENT_STARTING: S++, // <!-
    COMMENT: S++, // <!--
    COMMENT_ENDING: S++, // <!-- blah -
    COMMENT_ENDED: S++, // <!-- blah --
    CDATA: S++, // <![CDATA[ something
    CDATA_ENDING: S++, // ]
    CDATA_ENDING_2: S++, // ]]
    PROC_INST: S++, // <?hi
    PROC_INST_BODY: S++, // <?hi there
    PROC_INST_ENDING: S++, // <?hi "there" ?
    OPEN_TAG: S++, // <strong
    OPEN_TAG_SLASH: S++, // <strong /
    ATTRIB: S++, // <a
    ATTRIB_NAME: S++, // <a foo
    ATTRIB_NAME_SAW_WHITE: S++, // <a foo _
    ATTRIB_VALUE: S++, // <a foo=
    ATTRIB_VALUE_QUOTED: S++, // <a foo="bar
    ATTRIB_VALUE_CLOSED: S++, // <a foo="bar"
    ATTRIB_VALUE_UNQUOTED: S++, // <a foo=bar
    ATTRIB_VALUE_ENTITY_Q: S++, // <foo bar="&quot;"
    ATTRIB_VALUE_ENTITY_U: S++, // <foo bar=&quot
    CLOSE_TAG: S++, // </a
    CLOSE_TAG_SAW_WHITE: S++, // </a   >
    SCRIPT: S++, // <script> ...
    SCRIPT_ENDING: S++ // <script> ... <
  }

  sax.XML_ENTITIES = {
    'amp': '&',
    'gt': '>',
    'lt': '<',
    'quot': '"',
    'apos': "'"
  }

  sax.ENTITIES = {
    'amp': '&',
    'gt': '>',
    'lt': '<',
    'quot': '"',
    'apos': "'",
    'AElig': 198,
    'Aacute': 193,
    'Acirc': 194,
    'Agrave': 192,
    'Aring': 197,
    'Atilde': 195,
    'Auml': 196,
    'Ccedil': 199,
    'ETH': 208,
    'Eacute': 201,
    'Ecirc': 202,
    'Egrave': 200,
    'Euml': 203,
    'Iacute': 205,
    'Icirc': 206,
    'Igrave': 204,
    'Iuml': 207,
    'Ntilde': 209,
    'Oacute': 211,
    'Ocirc': 212,
    'Ograve': 210,
    'Oslash': 216,
    'Otilde': 213,
    'Ouml': 214,
    'THORN': 222,
    'Uacute': 218,
    'Ucirc': 219,
    'Ugrave': 217,
    'Uuml': 220,
    'Yacute': 221,
    'aacute': 225,
    'acirc': 226,
    'aelig': 230,
    'agrave': 224,
    'aring': 229,
    'atilde': 227,
    'auml': 228,
    'ccedil': 231,
    'eacute': 233,
    'ecirc': 234,
    'egrave': 232,
    'eth': 240,
    'euml': 235,
    'iacute': 237,
    'icirc': 238,
    'igrave': 236,
    'iuml': 239,
    'ntilde': 241,
    'oacute': 243,
    'ocirc': 244,
    'ograve': 242,
    'oslash': 248,
    'otilde': 245,
    'ouml': 246,
    'szlig': 223,
    'thorn': 254,
    'uacute': 250,
    'ucirc': 251,
    'ugrave': 249,
    'uuml': 252,
    'yacute': 253,
    'yuml': 255,
    'copy': 169,
    'reg': 174,
    'nbsp': 160,
    'iexcl': 161,
    'cent': 162,
    'pound': 163,
    'curren': 164,
    'yen': 165,
    'brvbar': 166,
    'sect': 167,
    'uml': 168,
    'ordf': 170,
    'laquo': 171,
    'not': 172,
    'shy': 173,
    'macr': 175,
    'deg': 176,
    'plusmn': 177,
    'sup1': 185,
    'sup2': 178,
    'sup3': 179,
    'acute': 180,
    'micro': 181,
    'para': 182,
    'middot': 183,
    'cedil': 184,
    'ordm': 186,
    'raquo': 187,
    'frac14': 188,
    'frac12': 189,
    'frac34': 190,
    'iquest': 191,
    'times': 215,
    'divide': 247,
    'OElig': 338,
    'oelig': 339,
    'Scaron': 352,
    'scaron': 353,
    'Yuml': 376,
    'fnof': 402,
    'circ': 710,
    'tilde': 732,
    'Alpha': 913,
    'Beta': 914,
    'Gamma': 915,
    'Delta': 916,
    'Epsilon': 917,
    'Zeta': 918,
    'Eta': 919,
    'Theta': 920,
    'Iota': 921,
    'Kappa': 922,
    'Lambda': 923,
    'Mu': 924,
    'Nu': 925,
    'Xi': 926,
    'Omicron': 927,
    'Pi': 928,
    'Rho': 929,
    'Sigma': 931,
    'Tau': 932,
    'Upsilon': 933,
    'Phi': 934,
    'Chi': 935,
    'Psi': 936,
    'Omega': 937,
    'alpha': 945,
    'beta': 946,
    'gamma': 947,
    'delta': 948,
    'epsilon': 949,
    'zeta': 950,
    'eta': 951,
    'theta': 952,
    'iota': 953,
    'kappa': 954,
    'lambda': 955,
    'mu': 956,
    'nu': 957,
    'xi': 958,
    'omicron': 959,
    'pi': 960,
    'rho': 961,
    'sigmaf': 962,
    'sigma': 963,
    'tau': 964,
    'upsilon': 965,
    'phi': 966,
    'chi': 967,
    'psi': 968,
    'omega': 969,
    'thetasym': 977,
    'upsih': 978,
    'piv': 982,
    'ensp': 8194,
    'emsp': 8195,
    'thinsp': 8201,
    'zwnj': 8204,
    'zwj': 8205,
    'lrm': 8206,
    'rlm': 8207,
    'ndash': 8211,
    'mdash': 8212,
    'lsquo': 8216,
    'rsquo': 8217,
    'sbquo': 8218,
    'ldquo': 8220,
    'rdquo': 8221,
    'bdquo': 8222,
    'dagger': 8224,
    'Dagger': 8225,
    'bull': 8226,
    'hellip': 8230,
    'permil': 8240,
    'prime': 8242,
    'Prime': 8243,
    'lsaquo': 8249,
    'rsaquo': 8250,
    'oline': 8254,
    'frasl': 8260,
    'euro': 8364,
    'image': 8465,
    'weierp': 8472,
    'real': 8476,
    'trade': 8482,
    'alefsym': 8501,
    'larr': 8592,
    'uarr': 8593,
    'rarr': 8594,
    'darr': 8595,
    'harr': 8596,
    'crarr': 8629,
    'lArr': 8656,
    'uArr': 8657,
    'rArr': 8658,
    'dArr': 8659,
    'hArr': 8660,
    'forall': 8704,
    'part': 8706,
    'exist': 8707,
    'empty': 8709,
    'nabla': 8711,
    'isin': 8712,
    'notin': 8713,
    'ni': 8715,
    'prod': 8719,
    'sum': 8721,
    'minus': 8722,
    'lowast': 8727,
    'radic': 8730,
    'prop': 8733,
    'infin': 8734,
    'ang': 8736,
    'and': 8743,
    'or': 8744,
    'cap': 8745,
    'cup': 8746,
    'int': 8747,
    'there4': 8756,
    'sim': 8764,
    'cong': 8773,
    'asymp': 8776,
    'ne': 8800,
    'equiv': 8801,
    'le': 8804,
    'ge': 8805,
    'sub': 8834,
    'sup': 8835,
    'nsub': 8836,
    'sube': 8838,
    'supe': 8839,
    'oplus': 8853,
    'otimes': 8855,
    'perp': 8869,
    'sdot': 8901,
    'lceil': 8968,
    'rceil': 8969,
    'lfloor': 8970,
    'rfloor': 8971,
    'lang': 9001,
    'rang': 9002,
    'loz': 9674,
    'spades': 9824,
    'clubs': 9827,
    'hearts': 9829,
    'diams': 9830
  }

  Object.keys(sax.ENTITIES).forEach(function (key) {
    var e = sax.ENTITIES[key]
    var s = typeof e === 'number' ? String.fromCharCode(e) : e
    sax.ENTITIES[key] = s
  })

  for (var s in sax.STATE) {
    sax.STATE[sax.STATE[s]] = s
  }

  // shorthand
  S = sax.STATE

  function emit (parser, event, data) {
    parser[event] && parser[event](data)
  }

  function emitNode (parser, nodeType, data) {
    if (parser.textNode) closeText(parser)
    emit(parser, nodeType, data)
  }

  function closeText (parser) {
    parser.textNode = textopts(parser.opt, parser.textNode)
    if (parser.textNode) emit(parser, 'ontext', parser.textNode)
    parser.textNode = ''
  }

  function textopts (opt, text) {
    if (opt.trim) text = text.trim()
    if (opt.normalize) text = text.replace(/\s+/g, ' ')
    return text
  }

  function error (parser, er) {
    closeText(parser)
    if (parser.trackPosition) {
      er += '\nLine: ' + parser.line +
        '\nColumn: ' + parser.column +
        '\nChar: ' + parser.c
    }
    er = new Error(er)
    parser.error = er
    emit(parser, 'onerror', er)
    return parser
  }

  function end (parser) {
    if (parser.sawRoot && !parser.closedRoot) strictFail(parser, 'Unclosed root tag')
    if ((parser.state !== S.BEGIN) &&
      (parser.state !== S.BEGIN_WHITESPACE) &&
      (parser.state !== S.TEXT)) {
      error(parser, 'Unexpected end')
    }
    closeText(parser)
    parser.c = ''
    parser.closed = true
    emit(parser, 'onend')
    SAXParser.call(parser, parser.strict, parser.opt)
    return parser
  }

  function strictFail (parser, message) {
    if (typeof parser !== 'object' || !(parser instanceof SAXParser)) {
      throw new Error('bad call to strictFail')
    }
    if (parser.strict) {
      error(parser, message)
    }
  }

  function newTag (parser) {
    if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]()
    var parent = parser.tags[parser.tags.length - 1] || parser
    var tag = parser.tag = { name: parser.tagName, attributes: {} }

    // will be overridden if tag contails an xmlns="foo" or xmlns:foo="bar"
    if (parser.opt.xmlns) {
      tag.ns = parent.ns
    }
    parser.attribList.length = 0
    emitNode(parser, 'onopentagstart', tag)
  }

  function qname (name, attribute) {
    var i = name.indexOf(':')
    var qualName = i < 0 ? [ '', name ] : name.split(':')
    var prefix = qualName[0]
    var local = qualName[1]

    // <x "xmlns"="http://foo">
    if (attribute && name === 'xmlns') {
      prefix = 'xmlns'
      local = ''
    }

    return { prefix: prefix, local: local }
  }

  function attrib (parser) {
    if (!parser.strict) {
      parser.attribName = parser.attribName[parser.looseCase]()
    }

    if (parser.attribList.indexOf(parser.attribName) !== -1 ||
      parser.tag.attributes.hasOwnProperty(parser.attribName)) {
      parser.attribName = parser.attribValue = ''
      return
    }

    if (parser.opt.xmlns) {
      var qn = qname(parser.attribName, true)
      var prefix = qn.prefix
      var local = qn.local

      if (prefix === 'xmlns') {
        // namespace binding attribute. push the binding into scope
        if (local === 'xml' && parser.attribValue !== XML_NAMESPACE) {
          strictFail(parser,
            'xml: prefix must be bound to ' + XML_NAMESPACE + '\n' +
            'Actual: ' + parser.attribValue)
        } else if (local === 'xmlns' && parser.attribValue !== XMLNS_NAMESPACE) {
          strictFail(parser,
            'xmlns: prefix must be bound to ' + XMLNS_NAMESPACE + '\n' +
            'Actual: ' + parser.attribValue)
        } else {
          var tag = parser.tag
          var parent = parser.tags[parser.tags.length - 1] || parser
          if (tag.ns === parent.ns) {
            tag.ns = Object.create(parent.ns)
          }
          tag.ns[local] = parser.attribValue
        }
      }

      // defer onattribute events until all attributes have been seen
      // so any new bindings can take effect. preserve attribute order
      // so deferred events can be emitted in document order
      parser.attribList.push([parser.attribName, parser.attribValue])
    } else {
      // in non-xmlns mode, we can emit the event right away
      parser.tag.attributes[parser.attribName] = parser.attribValue
      emitNode(parser, 'onattribute', {
        name: parser.attribName,
        value: parser.attribValue
      })
    }

    parser.attribName = parser.attribValue = ''
  }

  function openTag (parser, selfClosing) {
    if (parser.opt.xmlns) {
      // emit namespace binding events
      var tag = parser.tag

      // add namespace info to tag
      var qn = qname(parser.tagName)
      tag.prefix = qn.prefix
      tag.local = qn.local
      tag.uri = tag.ns[qn.prefix] || ''

      if (tag.prefix && !tag.uri) {
        strictFail(parser, 'Unbound namespace prefix: ' +
          JSON.stringify(parser.tagName))
        tag.uri = qn.prefix
      }

      var parent = parser.tags[parser.tags.length - 1] || parser
      if (tag.ns && parent.ns !== tag.ns) {
        Object.keys(tag.ns).forEach(function (p) {
          emitNode(parser, 'onopennamespace', {
            prefix: p,
            uri: tag.ns[p]
          })
        })
      }

      // handle deferred onattribute events
      // Note: do not apply default ns to attributes:
      //   http://www.w3.org/TR/REC-xml-names/#defaulting
      for (var i = 0, l = parser.attribList.length; i < l; i++) {
        var nv = parser.attribList[i]
        var name = nv[0]
        var value = nv[1]
        var qualName = qname(name, true)
        var prefix = qualName.prefix
        var local = qualName.local
        var uri = prefix === '' ? '' : (tag.ns[prefix] || '')
        var a = {
          name: name,
          value: value,
          prefix: prefix,
          local: local,
          uri: uri
        }

        // if there's any attributes with an undefined namespace,
        // then fail on them now.
        if (prefix && prefix !== 'xmlns' && !uri) {
          strictFail(parser, 'Unbound namespace prefix: ' +
            JSON.stringify(prefix))
          a.uri = prefix
        }
        parser.tag.attributes[name] = a
        emitNode(parser, 'onattribute', a)
      }
      parser.attribList.length = 0
    }

    parser.tag.isSelfClosing = !!selfClosing

    // process the tag
    parser.sawRoot = true
    parser.tags.push(parser.tag)
    emitNode(parser, 'onopentag', parser.tag)
    if (!selfClosing) {
      // special case for <script> in non-strict mode.
      if (!parser.noscript && parser.tagName.toLowerCase() === 'script') {
        parser.state = S.SCRIPT
      } else {
        parser.state = S.TEXT
      }
      parser.tag = null
      parser.tagName = ''
    }
    parser.attribName = parser.attribValue = ''
    parser.attribList.length = 0
  }

  function closeTag (parser) {
    if (!parser.tagName) {
      strictFail(parser, 'Weird empty close tag.')
      parser.textNode += '</>'
      parser.state = S.TEXT
      return
    }

    if (parser.script) {
      if (parser.tagName !== 'script') {
        parser.script += '</' + parser.tagName + '>'
        parser.tagName = ''
        parser.state = S.SCRIPT
        return
      }
      emitNode(parser, 'onscript', parser.script)
      parser.script = ''
    }

    // first make sure that the closing tag actually exists.
    // <a><b></c></b></a> will close everything, otherwise.
    var t = parser.tags.length
    var tagName = parser.tagName
    if (!parser.strict) {
      tagName = tagName[parser.looseCase]()
    }
    var closeTo = tagName
    while (t--) {
      var close = parser.tags[t]
      if (close.name !== closeTo) {
        // fail the first time in strict mode
        strictFail(parser, 'Unexpected close tag')
      } else {
        break
      }
    }

    // didn't find it.  we already failed for strict, so just abort.
    if (t < 0) {
      strictFail(parser, 'Unmatched closing tag: ' + parser.tagName)
      parser.textNode += '</' + parser.tagName + '>'
      parser.state = S.TEXT
      return
    }
    parser.tagName = tagName
    var s = parser.tags.length
    while (s-- > t) {
      var tag = parser.tag = parser.tags.pop()
      parser.tagName = parser.tag.name
      emitNode(parser, 'onclosetag', parser.tagName)

      var x = {}
      for (var i in tag.ns) {
        x[i] = tag.ns[i]
      }

      var parent = parser.tags[parser.tags.length - 1] || parser
      if (parser.opt.xmlns && tag.ns !== parent.ns) {
        // remove namespace bindings introduced by tag
        Object.keys(tag.ns).forEach(function (p) {
          var n = tag.ns[p]
          emitNode(parser, 'onclosenamespace', { prefix: p, uri: n })
        })
      }
    }
    if (t === 0) parser.closedRoot = true
    parser.tagName = parser.attribValue = parser.attribName = ''
    parser.attribList.length = 0
    parser.state = S.TEXT
  }

  function parseEntity (parser) {
    var entity = parser.entity
    var entityLC = entity.toLowerCase()
    var num
    var numStr = ''

    if (parser.ENTITIES[entity]) {
      return parser.ENTITIES[entity]
    }
    if (parser.ENTITIES[entityLC]) {
      return parser.ENTITIES[entityLC]
    }
    entity = entityLC
    if (entity.charAt(0) === '#') {
      if (entity.charAt(1) === 'x') {
        entity = entity.slice(2)
        num = parseInt(entity, 16)
        numStr = num.toString(16)
      } else {
        entity = entity.slice(1)
        num = parseInt(entity, 10)
        numStr = num.toString(10)
      }
    }
    entity = entity.replace(/^0+/, '')
    if (isNaN(num) || numStr.toLowerCase() !== entity) {
      strictFail(parser, 'Invalid character entity')
      return '&' + parser.entity + ';'
    }

    return String.fromCodePoint(num)
  }

  function beginWhiteSpace (parser, c) {
    if (c === '<') {
      parser.state = S.OPEN_WAKA
      parser.startTagPosition = parser.position
    } else if (!isWhitespace(c)) {
      // have to process this as a text node.
      // weird, but happens.
      strictFail(parser, 'Non-whitespace before first tag.')
      parser.textNode = c
      parser.state = S.TEXT
    }
  }

  function charAt (chunk, i) {
    var result = ''
    if (i < chunk.length) {
      result = chunk.charAt(i)
    }
    return result
  }

  function write (chunk) {
    var parser = this
    if (this.error) {
      throw this.error
    }
    if (parser.closed) {
      return error(parser,
        'Cannot write after close. Assign an onready handler.')
    }
    if (chunk === null) {
      return end(parser)
    }
    if (typeof chunk === 'object') {
      chunk = chunk.toString()
    }
    var i = 0
    var c = ''
    while (true) {
      c = charAt(chunk, i++)
      parser.c = c

      if (!c) {
        break
      }

      if (parser.trackPosition) {
        parser.position++
        if (c === '\n') {
          parser.line++
          parser.column = 0
        } else {
          parser.column++
        }
      }

      switch (parser.state) {
        case S.BEGIN:
          parser.state = S.BEGIN_WHITESPACE
          if (c === '\uFEFF') {
            continue
          }
          beginWhiteSpace(parser, c)
          continue

        case S.BEGIN_WHITESPACE:
          beginWhiteSpace(parser, c)
          continue

        case S.TEXT:
          if (parser.sawRoot && !parser.closedRoot) {
            var starti = i - 1
            while (c && c !== '<' && c !== '&') {
              c = charAt(chunk, i++)
              if (c && parser.trackPosition) {
                parser.position++
                if (c === '\n') {
                  parser.line++
                  parser.column = 0
                } else {
                  parser.column++
                }
              }
            }
            parser.textNode += chunk.substring(starti, i - 1)
          }
          if (c === '<' && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
            parser.state = S.OPEN_WAKA
            parser.startTagPosition = parser.position
          } else {
            if (!isWhitespace(c) && (!parser.sawRoot || parser.closedRoot)) {
              strictFail(parser, 'Text data outside of root node.')
            }
            if (c === '&') {
              parser.state = S.TEXT_ENTITY
            } else {
              parser.textNode += c
            }
          }
          continue

        case S.SCRIPT:
          // only non-strict
          if (c === '<') {
            parser.state = S.SCRIPT_ENDING
          } else {
            parser.script += c
          }
          continue

        case S.SCRIPT_ENDING:
          if (c === '/') {
            parser.state = S.CLOSE_TAG
          } else {
            parser.script += '<' + c
            parser.state = S.SCRIPT
          }
          continue

        case S.OPEN_WAKA:
          // either a /, ?, !, or text is coming next.
          if (c === '!') {
            parser.state = S.SGML_DECL
            parser.sgmlDecl = ''
          } else if (isWhitespace(c)) {
            // wait for it...
          } else if (isMatch(nameStart, c)) {
            parser.state = S.OPEN_TAG
            parser.tagName = c
          } else if (c === '/') {
            parser.state = S.CLOSE_TAG
            parser.tagName = ''
          } else if (c === '?') {
            parser.state = S.PROC_INST
            parser.procInstName = parser.procInstBody = ''
          } else {
            strictFail(parser, 'Unencoded <')
            // if there was some whitespace, then add that in.
            if (parser.startTagPosition + 1 < parser.position) {
              var pad = parser.position - parser.startTagPosition
              c = new Array(pad).join(' ') + c
            }
            parser.textNode += '<' + c
            parser.state = S.TEXT
          }
          continue

        case S.SGML_DECL:
          if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
            emitNode(parser, 'onopencdata')
            parser.state = S.CDATA
            parser.sgmlDecl = ''
            parser.cdata = ''
          } else if (parser.sgmlDecl + c === '--') {
            parser.state = S.COMMENT
            parser.comment = ''
            parser.sgmlDecl = ''
          } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
            parser.state = S.DOCTYPE
            if (parser.doctype || parser.sawRoot) {
              strictFail(parser,
                'Inappropriately located doctype declaration')
            }
            parser.doctype = ''
            parser.sgmlDecl = ''
          } else if (c === '>') {
            emitNode(parser, 'onsgmldeclaration', parser.sgmlDecl)
            parser.sgmlDecl = ''
            parser.state = S.TEXT
          } else if (isQuote(c)) {
            parser.state = S.SGML_DECL_QUOTED
            parser.sgmlDecl += c
          } else {
            parser.sgmlDecl += c
          }
          continue

        case S.SGML_DECL_QUOTED:
          if (c === parser.q) {
            parser.state = S.SGML_DECL
            parser.q = ''
          }
          parser.sgmlDecl += c
          continue

        case S.DOCTYPE:
          if (c === '>') {
            parser.state = S.TEXT
            emitNode(parser, 'ondoctype', parser.doctype)
            parser.doctype = true // just remember that we saw it.
          } else {
            parser.doctype += c
            if (c === '[') {
              parser.state = S.DOCTYPE_DTD
            } else if (isQuote(c)) {
              parser.state = S.DOCTYPE_QUOTED
              parser.q = c
            }
          }
          continue

        case S.DOCTYPE_QUOTED:
          parser.doctype += c
          if (c === parser.q) {
            parser.q = ''
            parser.state = S.DOCTYPE
          }
          continue

        case S.DOCTYPE_DTD:
          parser.doctype += c
          if (c === ']') {
            parser.state = S.DOCTYPE
          } else if (isQuote(c)) {
            parser.state = S.DOCTYPE_DTD_QUOTED
            parser.q = c
          }
          continue

        case S.DOCTYPE_DTD_QUOTED:
          parser.doctype += c
          if (c === parser.q) {
            parser.state = S.DOCTYPE_DTD
            parser.q = ''
          }
          continue

        case S.COMMENT:
          if (c === '-') {
            parser.state = S.COMMENT_ENDING
          } else {
            parser.comment += c
          }
          continue

        case S.COMMENT_ENDING:
          if (c === '-') {
            parser.state = S.COMMENT_ENDED
            parser.comment = textopts(parser.opt, parser.comment)
            if (parser.comment) {
              emitNode(parser, 'oncomment', parser.comment)
            }
            parser.comment = ''
          } else {
            parser.comment += '-' + c
            parser.state = S.COMMENT
          }
          continue

        case S.COMMENT_ENDED:
          if (c !== '>') {
            strictFail(parser, 'Malformed comment')
            // allow <!-- blah -- bloo --> in non-strict mode,
            // which is a comment of " blah -- bloo "
            parser.comment += '--' + c
            parser.state = S.COMMENT
          } else {
            parser.state = S.TEXT
          }
          continue

        case S.CDATA:
          if (c === ']') {
            parser.state = S.CDATA_ENDING
          } else {
            parser.cdata += c
          }
          continue

        case S.CDATA_ENDING:
          if (c === ']') {
            parser.state = S.CDATA_ENDING_2
          } else {
            parser.cdata += ']' + c
            parser.state = S.CDATA
          }
          continue

        case S.CDATA_ENDING_2:
          if (c === '>') {
            if (parser.cdata) {
              emitNode(parser, 'oncdata', parser.cdata)
            }
            emitNode(parser, 'onclosecdata')
            parser.cdata = ''
            parser.state = S.TEXT
          } else if (c === ']') {
            parser.cdata += ']'
          } else {
            parser.cdata += ']]' + c
            parser.state = S.CDATA
          }
          continue

        case S.PROC_INST:
          if (c === '?') {
            parser.state = S.PROC_INST_ENDING
          } else if (isWhitespace(c)) {
            parser.state = S.PROC_INST_BODY
          } else {
            parser.procInstName += c
          }
          continue

        case S.PROC_INST_BODY:
          if (!parser.procInstBody && isWhitespace(c)) {
            continue
          } else if (c === '?') {
            parser.state = S.PROC_INST_ENDING
          } else {
            parser.procInstBody += c
          }
          continue

        case S.PROC_INST_ENDING:
          if (c === '>') {
            emitNode(parser, 'onprocessinginstruction', {
              name: parser.procInstName,
              body: parser.procInstBody
            })
            parser.procInstName = parser.procInstBody = ''
            parser.state = S.TEXT
          } else {
            parser.procInstBody += '?' + c
            parser.state = S.PROC_INST_BODY
          }
          continue

        case S.OPEN_TAG:
          if (isMatch(nameBody, c)) {
            parser.tagName += c
          } else {
            newTag(parser)
            if (c === '>') {
              openTag(parser)
            } else if (c === '/') {
              parser.state = S.OPEN_TAG_SLASH
            } else {
              if (!isWhitespace(c)) {
                strictFail(parser, 'Invalid character in tag name')
              }
              parser.state = S.ATTRIB
            }
          }
          continue

        case S.OPEN_TAG_SLASH:
          if (c === '>') {
            openTag(parser, true)
            closeTag(parser)
          } else {
            strictFail(parser, 'Forward-slash in opening tag not followed by >')
            parser.state = S.ATTRIB
          }
          continue

        case S.ATTRIB:
          // haven't read the attribute name yet.
          if (isWhitespace(c)) {
            continue
          } else if (c === '>') {
            openTag(parser)
          } else if (c === '/') {
            parser.state = S.OPEN_TAG_SLASH
          } else if (isMatch(nameStart, c)) {
            parser.attribName = c
            parser.attribValue = ''
            parser.state = S.ATTRIB_NAME
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_NAME:
          if (c === '=') {
            parser.state = S.ATTRIB_VALUE
          } else if (c === '>') {
            strictFail(parser, 'Attribute without value')
            parser.attribValue = parser.attribName
            attrib(parser)
            openTag(parser)
          } else if (isWhitespace(c)) {
            parser.state = S.ATTRIB_NAME_SAW_WHITE
          } else if (isMatch(nameBody, c)) {
            parser.attribName += c
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_NAME_SAW_WHITE:
          if (c === '=') {
            parser.state = S.ATTRIB_VALUE
          } else if (isWhitespace(c)) {
            continue
          } else {
            strictFail(parser, 'Attribute without value')
            parser.tag.attributes[parser.attribName] = ''
            parser.attribValue = ''
            emitNode(parser, 'onattribute', {
              name: parser.attribName,
              value: ''
            })
            parser.attribName = ''
            if (c === '>') {
              openTag(parser)
            } else if (isMatch(nameStart, c)) {
              parser.attribName = c
              parser.state = S.ATTRIB_NAME
            } else {
              strictFail(parser, 'Invalid attribute name')
              parser.state = S.ATTRIB
            }
          }
          continue

        case S.ATTRIB_VALUE:
          if (isWhitespace(c)) {
            continue
          } else if (isQuote(c)) {
            parser.q = c
            parser.state = S.ATTRIB_VALUE_QUOTED
          } else {
            strictFail(parser, 'Unquoted attribute value')
            parser.state = S.ATTRIB_VALUE_UNQUOTED
            parser.attribValue = c
          }
          continue

        case S.ATTRIB_VALUE_QUOTED:
          if (c !== parser.q) {
            if (c === '&') {
              parser.state = S.ATTRIB_VALUE_ENTITY_Q
            } else {
              parser.attribValue += c
            }
            continue
          }
          attrib(parser)
          parser.q = ''
          parser.state = S.ATTRIB_VALUE_CLOSED
          continue

        case S.ATTRIB_VALUE_CLOSED:
          if (isWhitespace(c)) {
            parser.state = S.ATTRIB
          } else if (c === '>') {
            openTag(parser)
          } else if (c === '/') {
            parser.state = S.OPEN_TAG_SLASH
          } else if (isMatch(nameStart, c)) {
            strictFail(parser, 'No whitespace between attributes')
            parser.attribName = c
            parser.attribValue = ''
            parser.state = S.ATTRIB_NAME
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_VALUE_UNQUOTED:
          if (!isAttribEnd(c)) {
            if (c === '&') {
              parser.state = S.ATTRIB_VALUE_ENTITY_U
            } else {
              parser.attribValue += c
            }
            continue
          }
          attrib(parser)
          if (c === '>') {
            openTag(parser)
          } else {
            parser.state = S.ATTRIB
          }
          continue

        case S.CLOSE_TAG:
          if (!parser.tagName) {
            if (isWhitespace(c)) {
              continue
            } else if (notMatch(nameStart, c)) {
              if (parser.script) {
                parser.script += '</' + c
                parser.state = S.SCRIPT
              } else {
                strictFail(parser, 'Invalid tagname in closing tag.')
              }
            } else {
              parser.tagName = c
            }
          } else if (c === '>') {
            closeTag(parser)
          } else if (isMatch(nameBody, c)) {
            parser.tagName += c
          } else if (parser.script) {
            parser.script += '</' + parser.tagName
            parser.tagName = ''
            parser.state = S.SCRIPT
          } else {
            if (!isWhitespace(c)) {
              strictFail(parser, 'Invalid tagname in closing tag')
            }
            parser.state = S.CLOSE_TAG_SAW_WHITE
          }
          continue

        case S.CLOSE_TAG_SAW_WHITE:
          if (isWhitespace(c)) {
            continue
          }
          if (c === '>') {
            closeTag(parser)
          } else {
            strictFail(parser, 'Invalid characters in closing tag')
          }
          continue

        case S.TEXT_ENTITY:
        case S.ATTRIB_VALUE_ENTITY_Q:
        case S.ATTRIB_VALUE_ENTITY_U:
          var returnState
          var buffer
          switch (parser.state) {
            case S.TEXT_ENTITY:
              returnState = S.TEXT
              buffer = 'textNode'
              break

            case S.ATTRIB_VALUE_ENTITY_Q:
              returnState = S.ATTRIB_VALUE_QUOTED
              buffer = 'attribValue'
              break

            case S.ATTRIB_VALUE_ENTITY_U:
              returnState = S.ATTRIB_VALUE_UNQUOTED
              buffer = 'attribValue'
              break
          }

          if (c === ';') {
            parser[buffer] += parseEntity(parser)
            parser.entity = ''
            parser.state = returnState
          } else if (isMatch(parser.entity.length ? entityBody : entityStart, c)) {
            parser.entity += c
          } else {
            strictFail(parser, 'Invalid character in entity name')
            parser[buffer] += '&' + parser.entity + c
            parser.entity = ''
            parser.state = returnState
          }

          continue

        default:
          throw new Error(parser, 'Unknown state: ' + parser.state)
      }
    } // while

    if (parser.position >= parser.bufferCheckPosition) {
      checkBufferLength(parser)
    }
    return parser
  }

  /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
  /* istanbul ignore next */
  if (!String.fromCodePoint) {
    (function () {
      var stringFromCharCode = String.fromCharCode
      var floor = Math.floor
      var fromCodePoint = function () {
        var MAX_SIZE = 0x4000
        var codeUnits = []
        var highSurrogate
        var lowSurrogate
        var index = -1
        var length = arguments.length
        if (!length) {
          return ''
        }
        var result = ''
        while (++index < length) {
          var codePoint = Number(arguments[index])
          if (
            !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
            codePoint < 0 || // not a valid Unicode code point
            codePoint > 0x10FFFF || // not a valid Unicode code point
            floor(codePoint) !== codePoint // not an integer
          ) {
            throw RangeError('Invalid code point: ' + codePoint)
          }
          if (codePoint <= 0xFFFF) { // BMP code point
            codeUnits.push(codePoint)
          } else { // Astral code point; split in surrogate halves
            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            codePoint -= 0x10000
            highSurrogate = (codePoint >> 10) + 0xD800
            lowSurrogate = (codePoint % 0x400) + 0xDC00
            codeUnits.push(highSurrogate, lowSurrogate)
          }
          if (index + 1 === length || codeUnits.length > MAX_SIZE) {
            result += stringFromCharCode.apply(null, codeUnits)
            codeUnits.length = 0
          }
        }
        return result
      }
      /* istanbul ignore next */
      if (Object.defineProperty) {
        Object.defineProperty(String, 'fromCodePoint', {
          value: fromCodePoint,
          configurable: true,
          writable: true
        })
      } else {
        String.fromCodePoint = fromCodePoint
      }
    }())
  }
})(typeof exports === 'undefined' ? this.sax = {} : exports)

}).call(this,require("buffer").Buffer)
},{"buffer":3,"stream":30,"string_decoder":6}],30:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/readable.js');
Stream.Writable = require('readable-stream/writable.js');
Stream.Duplex = require('readable-stream/duplex.js');
Stream.Transform = require('readable-stream/transform.js');
Stream.PassThrough = require('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":5,"inherits":8,"readable-stream/duplex.js":13,"readable-stream/passthrough.js":24,"readable-stream/readable.js":25,"readable-stream/transform.js":26,"readable-stream/writable.js":27}],31:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":12,"timers":31}],32:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],33:[function(require,module,exports){
module.exports = {

  isArray: function(value) {
    if (Array.isArray) {
      return Array.isArray(value);
    }
    // fallback for older browsers like  IE 8
    return Object.prototype.toString.call( value ) === '[object Array]';
  }

};

},{}],34:[function(require,module,exports){
/*jslint node:true */

var xml2js = require('./xml2js');
var xml2json = require('./xml2json');
var js2xml = require('./js2xml');
var json2xml = require('./json2xml');

module.exports = {
  xml2js: xml2js,
  xml2json: xml2json,
  js2xml: js2xml,
  json2xml: json2xml
};

},{"./js2xml":35,"./json2xml":36,"./xml2js":38,"./xml2json":39}],35:[function(require,module,exports){
var helper = require('./options-helper');
var isArray = require('./array-helper').isArray;

var currentElement, currentElementName;

function validateOptions(userOptions) {
  var options = helper.copyOptions(userOptions);
  helper.ensureFlagExists('ignoreDeclaration', options);
  helper.ensureFlagExists('ignoreInstruction', options);
  helper.ensureFlagExists('ignoreAttributes', options);
  helper.ensureFlagExists('ignoreText', options);
  helper.ensureFlagExists('ignoreComment', options);
  helper.ensureFlagExists('ignoreCdata', options);
  helper.ensureFlagExists('ignoreDoctype', options);
  helper.ensureFlagExists('compact', options);
  helper.ensureFlagExists('indentText', options);
  helper.ensureFlagExists('indentCdata', options);
  helper.ensureFlagExists('indentAttributes', options);
  helper.ensureFlagExists('indentInstruction', options);
  helper.ensureFlagExists('fullTagEmptyElement', options);
  helper.ensureFlagExists('noQuotesForNativeAttributes', options);
  helper.ensureSpacesExists(options);
  if (typeof options.spaces === 'number') {
    options.spaces = Array(options.spaces + 1).join(' ');
  }
  helper.ensureKeyExists('declaration', options);
  helper.ensureKeyExists('instruction', options);
  helper.ensureKeyExists('attributes', options);
  helper.ensureKeyExists('text', options);
  helper.ensureKeyExists('comment', options);
  helper.ensureKeyExists('cdata', options);
  helper.ensureKeyExists('doctype', options);
  helper.ensureKeyExists('type', options);
  helper.ensureKeyExists('name', options);
  helper.ensureKeyExists('elements', options);
  helper.checkFnExists('doctype', options);
  helper.checkFnExists('instruction', options);
  helper.checkFnExists('cdata', options);
  helper.checkFnExists('comment', options);
  helper.checkFnExists('text', options);
  helper.checkFnExists('instructionName', options);
  helper.checkFnExists('elementName', options);
  helper.checkFnExists('attributeName', options);
  helper.checkFnExists('attributeValue', options);
  helper.checkFnExists('attributes', options);
  helper.checkFnExists('fullTagEmptyElement', options);
  return options;
}

function writeIndentation(options, depth, firstLine) {
  return (!firstLine && options.spaces ? '\n' : '') + Array(depth + 1).join(options.spaces);
}

function writeAttributes(attributes, options, depth) {
  if (options.ignoreAttributes) {
    return '';
  }
  if ('attributesFn' in options) {
    attributes = options.attributesFn(attributes, currentElementName, currentElement);
  }
  var key, attr, attrName, quote, result = [];
  for (key in attributes) {
    if (attributes.hasOwnProperty(key) && attributes[key] !== null && attributes[key] !== undefined) {
      quote = options.noQuotesForNativeAttributes && typeof attributes[key] !== 'string' ? '' : '"';
      attr = '' + attributes[key]; // ensure number and boolean are converted to String
      attr = attr.replace(/"/g, '&quot;');
      attrName = 'attributeNameFn' in options ? options.attributeNameFn(key, attr, currentElementName, currentElement) : key;
      result.push((options.spaces && options.indentAttributes? writeIndentation(options, depth+1, false) : ' '));
      result.push(attrName + '=' + quote + ('attributeValueFn' in options ? options.attributeValueFn(attr, key, currentElementName, currentElement) : attr) + quote);
    }
  }
  if (attributes && Object.keys(attributes).length && options.spaces && options.indentAttributes) {
    result.push(writeIndentation(options, depth, false));
  }
  return result.join('');
}

function writeDeclaration(declaration, options, depth) {
  currentElement = declaration;
  currentElementName = 'xml';
  return options.ignoreDeclaration ? '' :  '<?' + 'xml' + writeAttributes(declaration[options.attributesKey], options, depth) + '?>';
}

function writeInstruction(instruction, options, depth) {
  if (options.ignoreInstruction) {
    return '';
  }
  var key;
  for (key in instruction) {
    if (instruction.hasOwnProperty(key)) {
      break;
    }
  }
  var instructionName = 'instructionNameFn' in options ? options.instructionNameFn(key, instruction[key], currentElementName, currentElement) : key;
  if (typeof instruction[key] === 'object') {
    currentElement = instruction;
    currentElementName = instructionName;
    return '<?' + instructionName + writeAttributes(instruction[key][options.attributesKey], options, depth) + '?>';
  } else {
    var instructionValue = instruction[key] ? instruction[key] : '';
    if ('instructionFn' in options) instructionValue = options.instructionFn(instructionValue, key, currentElementName, currentElement);
    return '<?' + instructionName + (instructionValue ? ' ' + instructionValue : '') + '?>';
  }
}

function writeComment(comment, options) {
  return options.ignoreComment ? '' : '<!--' + ('commentFn' in options ? options.commentFn(comment, currentElementName, currentElement) : comment) + '-->';
}

function writeCdata(cdata, options) {
  return options.ignoreCdata ? '' : '<![CDATA[' + ('cdataFn' in options ? options.cdataFn(cdata, currentElementName, currentElement) : cdata.replace(']]>', ']]]]><![CDATA[>')) + ']]>';
}

function writeDoctype(doctype, options) {
  return options.ignoreDoctype ? '' : '<!DOCTYPE ' + ('doctypeFn' in options ? options.doctypeFn(doctype, currentElementName, currentElement) : doctype) + '>';
}

function writeText(text, options) {
  if (options.ignoreText) return '';
  text = '' + text; // ensure Number and Boolean are converted to String
  text = text.replace(/&amp;/g, '&'); // desanitize to avoid double sanitization
  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return 'textFn' in options ? options.textFn(text, currentElementName, currentElement) : text;
}

function hasContent(element, options) {
  var i;
  if (element.elements && element.elements.length) {
    for (i = 0; i < element.elements.length; ++i) {
      switch (element.elements[i][options.typeKey]) {
      case 'text':
        if (options.indentText) {
          return true;
        }
        break; // skip to next key
      case 'cdata':
        if (options.indentCdata) {
          return true;
        }
        break; // skip to next key
      case 'instruction':
        if (options.indentInstruction) {
          return true;
        }
        break; // skip to next key
      case 'doctype':
      case 'comment':
      case 'element':
        return true;
      default:
        return true;
      }
    }
  }
  return false;
}

function writeElement(element, options, depth) {
  currentElement = element;
  currentElementName = element.name;
  var xml = [], elementName = 'elementNameFn' in options ? options.elementNameFn(element.name, element) : element.name;
  xml.push('<' + elementName);
  if (element[options.attributesKey]) {
    xml.push(writeAttributes(element[options.attributesKey], options, depth));
  }
  var withClosingTag = element[options.elementsKey] && element[options.elementsKey].length || element[options.attributesKey] && element[options.attributesKey]['xml:space'] === 'preserve';
  if (!withClosingTag) {
    if ('fullTagEmptyElementFn' in options) {
      withClosingTag = options.fullTagEmptyElementFn(element.name, element);
    } else {
      withClosingTag = options.fullTagEmptyElement;
    }
  }
  if (withClosingTag) {
    xml.push('>');
    if (element[options.elementsKey] && element[options.elementsKey].length) {
      xml.push(writeElements(element[options.elementsKey], options, depth + 1));
      currentElement = element;
      currentElementName = element.name;
    }
    xml.push(options.spaces && hasContent(element, options) ? '\n' + Array(depth + 1).join(options.spaces) : '');
    xml.push('</' + elementName + '>');
  } else {
    xml.push('/>');
  }
  return xml.join('');
}

function writeElements(elements, options, depth, firstLine) {
  return elements.reduce(function (xml, element) {
    var indent = writeIndentation(options, depth, firstLine && !xml);
    switch (element.type) {
    case 'element': return xml + indent + writeElement(element, options, depth);
    case 'comment': return xml + indent + writeComment(element[options.commentKey], options);
    case 'doctype': return xml + indent + writeDoctype(element[options.doctypeKey], options);
    case 'cdata': return xml + (options.indentCdata ? indent : '') + writeCdata(element[options.cdataKey], options);
    case 'text': return xml + (options.indentText ? indent : '') + writeText(element[options.textKey], options);
    case 'instruction':
      var instruction = {};
      instruction[element[options.nameKey]] = element[options.attributesKey] ? element : element[options.instructionKey];
      return xml + (options.indentInstruction ? indent : '') + writeInstruction(instruction, options, depth);
    }
  }, '');
}

function hasContentCompact(element, options, anyContent) {
  var key;
  for (key in element) {
    if (element.hasOwnProperty(key)) {
      switch (key) {
      case options.parentKey:
      case options.attributesKey:
        break; // skip to next key
      case options.textKey:
        if (options.indentText || anyContent) {
          return true;
        }
        break; // skip to next key
      case options.cdataKey:
        if (options.indentCdata || anyContent) {
          return true;
        }
        break; // skip to next key
      case options.instructionKey:
        if (options.indentInstruction || anyContent) {
          return true;
        }
        break; // skip to next key
      case options.doctypeKey:
      case options.commentKey:
        return true;
      default:
        return true;
      }
    }
  }
  return false;
}

function writeElementCompact(element, name, options, depth, indent) {
  currentElement = element;
  currentElementName = name;
  var elementName = 'elementNameFn' in options ? options.elementNameFn(name, element) : name;
  if (typeof element === 'undefined' || element === null || element === '') {
    return 'fullTagEmptyElementFn' in options && options.fullTagEmptyElementFn(name, element) || options.fullTagEmptyElement ? '<' + elementName + '></' + elementName + '>' : '<' + elementName + '/>';
  }
  var xml = [];
  if (name) {
    xml.push('<' + elementName);
    if (typeof element !== 'object') {
      xml.push('>' + writeText(element,options) + '</' + elementName + '>');
      return xml.join('');
    }
    if (element[options.attributesKey]) {
      xml.push(writeAttributes(element[options.attributesKey], options, depth));
    }
    var withClosingTag = hasContentCompact(element, options, true) || element[options.attributesKey] && element[options.attributesKey]['xml:space'] === 'preserve';
    if (!withClosingTag) {
      if ('fullTagEmptyElementFn' in options) {
        withClosingTag = options.fullTagEmptyElementFn(name, element);
      } else {
        withClosingTag = options.fullTagEmptyElement;
      }
    }
    if (withClosingTag) {
      xml.push('>');
    } else {
      xml.push('/>');
      return xml.join('');
    }
  }
  xml.push(writeElementsCompact(element, options, depth + 1, false));
  currentElement = element;
  currentElementName = name;
  if (name) {
    xml.push((indent ? writeIndentation(options, depth, false) : '') + '</' + elementName + '>');
  }
  return xml.join('');
}

function writeElementsCompact(element, options, depth, firstLine) {
  var i, key, nodes, xml = [];
  for (key in element) {
    if (element.hasOwnProperty(key)) {
      nodes = isArray(element[key]) ? element[key] : [element[key]];
      for (i = 0; i < nodes.length; ++i) {
        switch (key) {
        case options.declarationKey: xml.push(writeDeclaration(nodes[i], options, depth)); break;
        case options.instructionKey: xml.push((options.indentInstruction ? writeIndentation(options, depth, firstLine) : '') + writeInstruction(nodes[i], options, depth)); break;
        case options.attributesKey: case options.parentKey: break; // skip
        case options.textKey: xml.push((options.indentText ? writeIndentation(options, depth, firstLine) : '') + writeText(nodes[i], options)); break;
        case options.cdataKey: xml.push((options.indentCdata ? writeIndentation(options, depth, firstLine) : '') + writeCdata(nodes[i], options)); break;
        case options.doctypeKey: xml.push(writeIndentation(options, depth, firstLine) + writeDoctype(nodes[i], options)); break;
        case options.commentKey: xml.push(writeIndentation(options, depth, firstLine) + writeComment(nodes[i], options)); break;
        default: xml.push(writeIndentation(options, depth, firstLine) + writeElementCompact(nodes[i], key, options, depth, hasContentCompact(nodes[i], options)));
        }
        firstLine = firstLine && !xml.length;
      }
    }
  }
  return xml.join('');
}

module.exports = function (js, options) {
  options = validateOptions(options);
  var xml = [];
  currentElement = js;
  currentElementName = '_root_';
  if (options.compact) {
    xml.push(writeElementsCompact(js, options, 0, true));
  } else {
    if (js[options.declarationKey]) {
      xml.push(writeDeclaration(js[options.declarationKey], options, 0));
    }
    if (js[options.elementsKey] && js[options.elementsKey].length) {
      xml.push(writeElements(js[options.elementsKey], options, 0, !xml.length));
    }
  }
  return xml.join('');
};

},{"./array-helper":33,"./options-helper":37}],36:[function(require,module,exports){
(function (Buffer){
var js2xml = require('./js2xml.js');

module.exports = function (json, options) {
  if (json instanceof Buffer) {
    json = json.toString();
  }
  var js = null;
  if (typeof (json) === 'string') {
    try {
      js = JSON.parse(json);
    } catch (e) {
      throw new Error('The JSON structure is invalid');
    }
  } else {
    js = json;
  }
  return js2xml(js, options);
};

}).call(this,require("buffer").Buffer)
},{"./js2xml.js":35,"buffer":3}],37:[function(require,module,exports){
var isArray = require('./array-helper').isArray;

module.exports = {

  copyOptions: function (options) {
    var key, copy = {};
    for (key in options) {
      if (options.hasOwnProperty(key)) {
        copy[key] = options[key];
      }
    }
    return copy;
  },

  ensureFlagExists: function (item, options) {
    if (!(item in options) || typeof options[item] !== 'boolean') {
      options[item] = false;
    }
  },

  ensureSpacesExists: function (options) {
    if (!('spaces' in options) || (typeof options.spaces !== 'number' && typeof options.spaces !== 'string')) {
      options.spaces = 0;
    }
  },

  ensureAlwaysArrayExists: function (options) {
    if (!('alwaysArray' in options) || (typeof options.alwaysArray !== 'boolean' && !isArray(options.alwaysArray))) {
      options.alwaysArray = false;
    }
  },

  ensureKeyExists: function (key, options) {
    if (!(key + 'Key' in options) || typeof options[key + 'Key'] !== 'string') {
      options[key + 'Key'] = options.compact ? '_' + key : key;
    }
  },

  checkFnExists: function (key, options) {
    return key + 'Fn' in options;
  }

};

},{"./array-helper":33}],38:[function(require,module,exports){
var sax = require('sax');
var expat /*= require('node-expat');*/ = { on: function () { }, parse: function () { } };
var helper = require('./options-helper');
var isArray = require('./array-helper').isArray;

var options;
var pureJsParser = true;
var currentElement;

function validateOptions(userOptions) {
  options = helper.copyOptions(userOptions);
  helper.ensureFlagExists('ignoreDeclaration', options);
  helper.ensureFlagExists('ignoreInstruction', options);
  helper.ensureFlagExists('ignoreAttributes', options);
  helper.ensureFlagExists('ignoreText', options);
  helper.ensureFlagExists('ignoreComment', options);
  helper.ensureFlagExists('ignoreCdata', options);
  helper.ensureFlagExists('ignoreDoctype', options);
  helper.ensureFlagExists('compact', options);
  helper.ensureFlagExists('alwaysChildren', options);
  helper.ensureFlagExists('addParent', options);
  helper.ensureFlagExists('trim', options);
  helper.ensureFlagExists('nativeType', options);
  helper.ensureFlagExists('nativeTypeAttributes', options);
  helper.ensureFlagExists('sanitize', options);
  helper.ensureFlagExists('instructionHasAttributes', options);
  helper.ensureFlagExists('captureSpacesBetweenElements', options);
  helper.ensureAlwaysArrayExists(options);
  helper.ensureKeyExists('declaration', options);
  helper.ensureKeyExists('instruction', options);
  helper.ensureKeyExists('attributes', options);
  helper.ensureKeyExists('text', options);
  helper.ensureKeyExists('comment', options);
  helper.ensureKeyExists('cdata', options);
  helper.ensureKeyExists('doctype', options);
  helper.ensureKeyExists('type', options);
  helper.ensureKeyExists('name', options);
  helper.ensureKeyExists('elements', options);
  helper.ensureKeyExists('parent', options);
  helper.checkFnExists('doctype', options);
  helper.checkFnExists('instruction', options);
  helper.checkFnExists('cdata', options);
  helper.checkFnExists('comment', options);
  helper.checkFnExists('text', options);
  helper.checkFnExists('instructionName', options);
  helper.checkFnExists('elementName', options);
  helper.checkFnExists('attributeName', options);
  helper.checkFnExists('attributeValue', options);
  helper.checkFnExists('attributes', options);
  return options;
}

function nativeType(value) {
  var nValue = Number(value);
  if (!isNaN(nValue)) {
    return nValue;
  }
  var bValue = value.toLowerCase();
  if (bValue === 'true') {
    return true;
  } else if (bValue === 'false') {
    return false;
  }
  return value;
}

function addField(type, value) {
  var key;
  if (options.compact) {
    if (
      !currentElement[options[type + 'Key']] &&
      (isArray(options.alwaysArray) ? options.alwaysArray.indexOf(options[type + 'Key']) !== -1 : options.alwaysArray)
    ) {
      currentElement[options[type + 'Key']] = [];
    }
    if (currentElement[options[type + 'Key']] && !isArray(currentElement[options[type + 'Key']])) {
      currentElement[options[type + 'Key']] = [currentElement[options[type + 'Key']]];
    }
    if (type + 'Fn' in options && typeof value === 'string') {
      value = options[type + 'Fn'](value, currentElement);
    }
    if (type === 'instruction' && ('instructionFn' in options || 'instructionNameFn' in options)) {
      for (key in value) {
        if (value.hasOwnProperty(key)) {
          if ('instructionFn' in options) {
            value[key] = options.instructionFn(value[key], key, currentElement);
          } else {
            var temp = value[key];
            delete value[key];
            value[options.instructionNameFn(key, temp, currentElement)] = temp;
          }
        }
      }
    }
    if (isArray(currentElement[options[type + 'Key']])) {
      currentElement[options[type + 'Key']].push(value);
    } else {
      currentElement[options[type + 'Key']] = value;
    }
  } else {
    if (!currentElement[options.elementsKey]) {
      currentElement[options.elementsKey] = [];
    }
    var element = {};
    element[options.typeKey] = type;
    if (type === 'instruction') {
      for (key in value) {
        if (value.hasOwnProperty(key)) {
          break;
        }
      }
      element[options.nameKey] = 'instructionNameFn' in options ? options.instructionNameFn(key, value, currentElement) : key;
      if (options.instructionHasAttributes) {
        element[options.attributesKey] = value[key][options.attributesKey];
        if ('instructionFn' in options) {
          element[options.attributesKey] = options.instructionFn(element[options.attributesKey], key, currentElement);
        }
      } else {
        if ('instructionFn' in options) {
          value[key] = options.instructionFn(value[key], key, currentElement);
        }
        element[options.instructionKey] = value[key];
      }
    } else {
      if (type + 'Fn' in options) {
        value = options[type + 'Fn'](value, currentElement);
      }
      element[options[type + 'Key']] = value;
    }
    if (options.addParent) {
      element[options.parentKey] = currentElement;
    }
    currentElement[options.elementsKey].push(element);
  }
}

function manipulateAttributes(attributes) {
  if ('attributesFn' in options && attributes) {
    attributes = options.attributesFn(attributes, currentElement);
  }
  if ((options.trim || 'attributeValueFn' in options || 'attributeNameFn' in options || options.nativeTypeAttributes) && attributes) {
    var key;
    for (key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        if (options.trim) attributes[key] = attributes[key].trim();
        if (options.nativeTypeAttributes) {
          attributes[key] = nativeType(attributes[key]);
        }
        if ('attributeValueFn' in options) attributes[key] = options.attributeValueFn(attributes[key], key, currentElement);
        if ('attributeNameFn' in options) {
          var temp = attributes[key];
          delete attributes[key];
          attributes[options.attributeNameFn(key, attributes[key], currentElement)] = temp;
        }
      }
    }
  }
  return attributes;
}

function onInstruction(instruction) {
  var attributes = {};
  if (instruction.body && (instruction.name.toLowerCase() === 'xml' || options.instructionHasAttributes)) {
    var attrsRegExp = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\w+))\s*/g;
    var match;
    while ((match = attrsRegExp.exec(instruction.body)) !== null) {
      attributes[match[1]] = match[2] || match[3] || match[4];
    }
    attributes = manipulateAttributes(attributes);
  }
  if (instruction.name.toLowerCase() === 'xml') {
    if (options.ignoreDeclaration) {
      return;
    }
    currentElement[options.declarationKey] = {};
    if (Object.keys(attributes).length) {
      currentElement[options.declarationKey][options.attributesKey] = attributes;
    }
    if (options.addParent) {
      currentElement[options.declarationKey][options.parentKey] = currentElement;
    }
  } else {
    if (options.ignoreInstruction) {
      return;
    }
    if (options.trim) {
      instruction.body = instruction.body.trim();
    }
    var value = {};
    if (options.instructionHasAttributes && Object.keys(attributes).length) {
      value[instruction.name] = {};
      value[instruction.name][options.attributesKey] = attributes;
    } else {
      value[instruction.name] = instruction.body;
    }
    addField('instruction', value);
  }
}

function onStartElement(name, attributes) {
  var element;
  if (typeof name === 'object') {
    attributes = name.attributes;
    name = name.name;
  }
  attributes = manipulateAttributes(attributes);
  if ('elementNameFn' in options) {
    name = options.elementNameFn(name, currentElement);
  }
  if (options.compact) {
    element = {};
    if (!options.ignoreAttributes && attributes && Object.keys(attributes).length) {
      element[options.attributesKey] = {};
      var key;
      for (key in attributes) {
        if (attributes.hasOwnProperty(key)) {
          element[options.attributesKey][key] = attributes[key];
        }
      }
    }
    if (
      !(name in currentElement) &&
      (isArray(options.alwaysArray) ? options.alwaysArray.indexOf(name) !== -1 : options.alwaysArray)
    ) {
      currentElement[name] = [];
    }
    if (currentElement[name] && !isArray(currentElement[name])) {
      currentElement[name] = [currentElement[name]];
    }
    if (isArray(currentElement[name])) {
      currentElement[name].push(element);
    } else {
      currentElement[name] = element;
    }
  } else {
    if (!currentElement[options.elementsKey]) {
      currentElement[options.elementsKey] = [];
    }
    element = {};
    element[options.typeKey] = 'element';
    element[options.nameKey] = name;
    if (!options.ignoreAttributes && attributes && Object.keys(attributes).length) {
      element[options.attributesKey] = attributes;
    }
    if (options.alwaysChildren) {
      element[options.elementsKey] = [];
    }
    currentElement[options.elementsKey].push(element);
  }
  element[options.parentKey] = currentElement; // will be deleted in onEndElement() if !options.addParent
  currentElement = element;
}

function onText(text) {
  if (options.ignoreText) {
    return;
  }
  if (!text.trim() && !options.captureSpacesBetweenElements) {
    return;
  }
  if (options.trim) {
    text = text.trim();
  }
  if (options.nativeType) {
    text = nativeType(text);
  }
  if (options.sanitize) {
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  addField('text', text);
}

function onComment(comment) {
  if (options.ignoreComment) {
    return;
  }
  if (options.trim) {
    comment = comment.trim();
  }
  addField('comment', comment);
}

function onEndElement(name) {
  var parentElement = currentElement[options.parentKey];
  if (!options.addParent) {
    delete currentElement[options.parentKey];
  }
  currentElement = parentElement;
}

function onCdata(cdata) {
  if (options.ignoreCdata) {
    return;
  }
  if (options.trim) {
    cdata = cdata.trim();
  }
  addField('cdata', cdata);
}

function onDoctype(doctype) {
  if (options.ignoreDoctype) {
    return;
  }
  doctype = doctype.replace(/^ /, '');
  if (options.trim) {
    doctype = doctype.trim();
  }
  addField('doctype', doctype);
}

function onError(error) {
  error.note = error; //console.error(error);
}

module.exports = function (xml, userOptions) {

  var parser = pureJsParser ? sax.parser(true, {}) : parser = new expat.Parser('UTF-8');
  var result = {};
  currentElement = result;

  options = validateOptions(userOptions);

  if (pureJsParser) {
    parser.opt = {strictEntities: true};
    parser.onopentag = onStartElement;
    parser.ontext = onText;
    parser.oncomment = onComment;
    parser.onclosetag = onEndElement;
    parser.onerror = onError;
    parser.oncdata = onCdata;
    parser.ondoctype = onDoctype;
    parser.onprocessinginstruction = onInstruction;
  } else {
    parser.on('startElement', onStartElement);
    parser.on('text', onText);
    parser.on('comment', onComment);
    parser.on('endElement', onEndElement);
    parser.on('error', onError);
    //parser.on('startCdata', onStartCdata);
    //parser.on('endCdata', onEndCdata);
    //parser.on('entityDecl', onEntityDecl);
  }

  if (pureJsParser) {
    parser.write(xml).close();
  } else {
    if (!parser.parse(xml)) {
      throw new Error('XML parsing error: ' + parser.getError());
    }
  }

  if (result[options.elementsKey]) {
    var temp = result[options.elementsKey];
    delete result[options.elementsKey];
    result[options.elementsKey] = temp;
    delete result.text;
  }

  return result;

};

},{"./array-helper":33,"./options-helper":37,"sax":29}],39:[function(require,module,exports){
var helper = require('./options-helper');
var xml2js = require('./xml2js');

function validateOptions (userOptions) {
  var options = helper.copyOptions(userOptions);
  helper.ensureSpacesExists(options);
  return options;
}

module.exports = function(xml, userOptions) {
  var options, js, json, parentKey;
  options = validateOptions(userOptions);
  js = xml2js(xml, options);
  parentKey = 'compact' in options && options.compact ? '_parent' : 'parent';
  // parentKey = ptions.compact ? '_parent' : 'parent'; // consider this
  if ('addParent' in options && options.addParent) {
    json = JSON.stringify(js, function (k, v) { return k === parentKey? '_' : v; }, options.spaces);
  } else {
    json = JSON.stringify(js, null, options.spaces);
  }
  return json.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
};

},{"./options-helper":37,"./xml2js":38}],40:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
// import initResponsiveImages from './util/initResponsiveImages';

// import initDocumentSearch from './components/documentSearch/initDocumentSearch';

// import initEvents from './components/event/initEvents';
// import initVideoPlayer from './components/videoPlayer/initVideoPlayer'


var _initIeHelpers = require('./util/initIeHelpers');

var _initIeHelpers2 = _interopRequireDefault(_initIeHelpers);

var _setImageDataSrcSet = require('./global/setImageDataSrcSet/setImageDataSrcSet');

var _setImageDataSrcSet2 = _interopRequireDefault(_setImageDataSrcSet);

var _initSmoothScrollers = require('./util/initSmoothScrollers');

var _initSmoothScrollers2 = _interopRequireDefault(_initSmoothScrollers);

var _initGAEvents = require('./global/ga-event/initGAEvents');

var _initGAEvents2 = _interopRequireDefault(_initGAEvents);

var _HeadNav = require('./global/nav/HeadNav');

var _HeadNav2 = _interopRequireDefault(_HeadNav);

var _initCookiePolicy = require('./global/cookie-policy/initCookiePolicy');

var _initCookiePolicy2 = _interopRequireDefault(_initCookiePolicy);

var _initSliders = require('./global/slider/initSliders');

var _initSliders2 = _interopRequireDefault(_initSliders);

var _initAccordion = require('./global/accordion/initAccordion');

var _initAccordion2 = _interopRequireDefault(_initAccordion);

var _initBrandExplorer = require('./components/brandExplorer/initBrandExplorer');

var _initBrandExplorer2 = _interopRequireDefault(_initBrandExplorer);

var _initTwitterCards = require('./components/twitterCard/initTwitterCards');

var _initTwitterCards2 = _interopRequireDefault(_initTwitterCards);

var _initHero = require('./components/hero/initHero');

var _initHero2 = _interopRequireDefault(_initHero);

var _initSemiSticky = require('./global/semiSticky/initSemiSticky');

var _initSemiSticky2 = _interopRequireDefault(_initSemiSticky);

var _initFilterGrid = require('./components/filterGrid/initFilterGrid');

var _initFilterGrid2 = _interopRequireDefault(_initFilterGrid);

var _initBeerCardExpanded = require('./components/beerCardExpanded/initBeerCardExpanded');

var _initBeerCardExpanded2 = _interopRequireDefault(_initBeerCardExpanded);

var _initCards = require('./components/card/initCards');

var _initCards2 = _interopRequireDefault(_initCards);

var _initOurLocations = require('./components/ourLocations/initOurLocations');

var _initOurLocations2 = _interopRequireDefault(_initOurLocations);

var _initAgeGate = require('./components/ageGate/initAgeGate');

var _initAgeGate2 = _interopRequireDefault(_initAgeGate);

var _initSearch = require('./components/search/initSearch');

var _initSearch2 = _interopRequireDefault(_initSearch);

var _initGatedContent = require('./components/gatedContent/initGatedContent');

var _initGatedContent2 = _interopRequireDefault(_initGatedContent);

var _initSlotTextRotator = require('./components/slotTextRotator/initSlotTextRotator');

var _initSlotTextRotator2 = _interopRequireDefault(_initSlotTextRotator);

var _initJobSearch = require('./components/jobSearch/initJobSearch');

var _initJobSearch2 = _interopRequireDefault(_initJobSearch);

var _initAdvancedFilters = require('./components/advancedFilters/initAdvancedFilters');

var _initAdvancedFilters2 = _interopRequireDefault(_initAdvancedFilters);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var App = function () {
	function App() {
		_classCallCheck(this, App);

		// Making this a global function due to a hack we are using to load paginated results
		window.abInitFilterGrid = _initFilterGrid2.default;
	}

	_createClass(App, [{
		key: 'start',
		value: function start() {
			var headNav = new _HeadNav2.default({
				el: document.querySelector('#head-nav')
			});

			(0, _setImageDataSrcSet2.default)();
			(0, _initGAEvents2.default)();
			(0, _initCookiePolicy2.default)();
			(0, _initAgeGate2.default)();
			(0, _initHero2.default)();
			(0, _initSmoothScrollers2.default)(headNav);
			(0, _initSliders2.default)('.ab-slider');
			(0, _initAccordion2.default)();
			(0, _initBrandExplorer2.default)();
			(0, _initTwitterCards2.default)('.home-twitter-card');
			(0, _initSemiSticky2.default)();
			(0, _initFilterGrid2.default)();
			(0, _initBeerCardExpanded2.default)();
			(0, _initCards2.default)();
			(0, _initSlotTextRotator2.default)();
			// initDocumentSearch();
			(0, _initSearch2.default)();
			(0, _initOurLocations2.default)();
			(0, _initGatedContent2.default)();
			// initEvents();
			// initVideoPlayer() // requirements changed, refactored
			(0, _initJobSearch2.default)();
			(0, _initAdvancedFilters2.default)();
		}
	}]);

	return App;
}();

exports.default = App;

},{"./components/advancedFilters/initAdvancedFilters":42,"./components/ageGate/initAgeGate":44,"./components/beerCardExpanded/initBeerCardExpanded":48,"./components/brandExplorer/initBrandExplorer":55,"./components/card/initCards":59,"./components/filterGrid/initFilterGrid":65,"./components/gatedContent/initGatedContent":67,"./components/hero/initHero":69,"./components/jobSearch/initJobSearch":71,"./components/ourLocations/initOurLocations":73,"./components/search/initSearch":77,"./components/slotTextRotator/initSlotTextRotator":79,"./components/twitterCard/initTwitterCards":83,"./global/accordion/initAccordion":86,"./global/cookie-policy/initCookiePolicy":88,"./global/ga-event/initGAEvents":89,"./global/nav/HeadNav":94,"./global/semiSticky/initSemiSticky":97,"./global/setImageDataSrcSet/setImageDataSrcSet":99,"./global/slider/initSliders":107,"./util/initIeHelpers":121,"./util/initSmoothScrollers":122}],41:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AdvancedFilters = function (_BaseClass) {
	_inherits(AdvancedFilters, _BaseClass);

	function AdvancedFilters(opts) {
		_classCallCheck(this, AdvancedFilters);

		return _possibleConstructorReturn(this, (AdvancedFilters.__proto__ || Object.getPrototypeOf(AdvancedFilters)).call(this, {
			el: opts.el,
			inner: null,
			headingContainer: null,
			form: null
		}));
	}

	_createClass(AdvancedFilters, [{
		key: '_init',
		value: function _init() {
			this._getInner();
			this._getHeadingContainer();
			this._getForm();
			this._setupEventHandlers();
			this._taleo();
		}
	}, {
		key: '_getInner',
		value: function _getInner() {
			if (this.el) {
				this.inner = this.el.querySelector('.advanced-filters__inner');
			}
		}
	}, {
		key: '_getHeadingContainer',
		value: function _getHeadingContainer() {
			if (this.el) {
				this.headingContainer = this.el.querySelector('.advanced-filters__heading-container');
			}
		}
	}, {
		key: '_getForm',
		value: function _getForm() {
			var _this = this;

			if (_this.el) {
				_this.form = _this.el.querySelector('.advanced-filters__form');

				window.addEventListener('resize', function (e) {
					_this._setAutoHeight(_this.form);
				}, false);
			}
		}
	}, {
		key: '_setupEventHandlers',
		value: function _setupEventHandlers() {
			var toggleFormEvent = new CustomEvent('toggleFormEvent');

			var _this = this;
			_this.el.classList.add('collapsed'); // change initial state

			if (_this.headingContainer && _this.form) {
				_this.headingContainer.addEventListener('click', function () {
					_this.el.dispatchEvent(toggleFormEvent);
				});

				_this.el.addEventListener('toggleFormEvent', function () {
					_this._toggleFormMethod();
				});
			}

			_this.el.addEventListener('enableFiltersEvent', function () {
				_this._enableFiltersMethod();
			});
		}
	}, {
		key: '_setAutoHeight',
		value: function _setAutoHeight(container) {
			container.style.display = 'block';

			container.style.height = 'auto';

			var height = container.offsetHeight + 'px';

			container.style.height = height;

			container.style.display = '';
		}
	}, {
		key: '_enableFiltersMethod',
		value: function _enableFiltersMethod() {
			var _this = this;

			_this.inner.style.display = 'block';

			_this._setAutoHeight(_this.form);

			var headerHeight = document.getElementById('head-nav').offsetHeight;

			window.setTimeout(function () {
				_this.inner.classList.add('active');
			}, 300);

			var innerOffsetTop = 0;

			var element = _this.inner;

			while (element) {
				innerOffsetTop += element.offsetTop;
				element = element.offsetParent;
			}

			var innerYPos = innerOffsetTop - headerHeight;

			$('html, body').animate({ scrollTop: innerYPos }, 300);
		}
	}, {
		key: '_toggleFormMethod',
		value: function _toggleFormMethod() {
			if (this.el.classList.contains('collapsed')) {
				this._unfold();
			} else {
				this._fold();
			}
		}
	}, {
		key: '_unfold',
		value: function _unfold() {
			var _this = this;

			_this.el.classList.remove('collapsed');
			_this.form.style.height = 'auto';

			var height = _this.form.offsetHeight + 'px';

			_this.form.style.height = '0px';

			setTimeout(function () {
				_this.form.style.height = height;
			}, 0);
		}
	}, {
		key: '_fold',
		value: function _fold() {
			var _this = this;

			_this.form.style.height = '0px';

			window.setTimeout(function () {
				_this.el.classList.add('collapsed');
			}, 300);
		}

		// function moved as-is from template

	}, {
		key: '_taleo',
		value: function _taleo() {
			// DEFINE the filters
			var searchF = document.getElementById('taleo-search'),
			    categoryF = document.getElementById('categoryFilter'),
			    typeF = document.getElementById('typeFilter'),
			    countryF = document.getElementById('countryFilter'),
			    cityF = document.getElementById('cityFilter'),
			    filters = [categoryF, typeF, countryF, cityF];

			var countryData = [],
			    cityData = [],
			    categoryData = [],
			    typeData = [];

			var cityRow = document.getElementById('taleo-city-row');

			// FETCH the data
			$.ajax({
				url: '/bin/services/taleoSearchResults',
				method: 'GET',
				data: {},
				success: function success(data) {
					var results = data.results;

					// BUILD the filters
					for (var i = 0; i < Object.keys(results).length; i++) {
						var job = results[i]; // define 1 job

						// FUNCTION to clean job data and push values to filters
						var getFilterData = function getFilterData(prop, arr) {
							var exclusions = ['Bolivia', 'Brazil', 'Russia', 'Ukraine', 'FINANCE_old'];
							// Internet Explorer can't do 'includes' on an array
							// apparently so converting to string.
							if (!String(exclusions).includes(job[prop])) {
								!String(arr).includes(job[prop]) ? arr.push(job[prop]) : '';
							}
						};

						var getCityData = function getCityData() {
							if (!String(Object.keys(cityData)).includes(job['country'])) {
								cityData[job['country']] = {
									cities: []
								};
							}
							if (job['city'] && !String(cityData[job['country']].cities).includes(job['city'])) {
								cityData[job['country']].cities.push(job['city']);
							}
						};

						// RUN functions to BUILD the filters
						getFilterData('country', countryData);
						getFilterData('eJobFieldeJobFieldeName', categoryData);
						getFilterData('eJobTypeeDescription', typeData);
						getCityData();
					}

					// FUNCTION to inject filter options into template
					var injectOptions = function injectOptions(el, list) {
						var options = "<option value=''>Select</option>";
						list = list.sort();
						list.forEach(function (option) {
							options += '<option value="' + option + '">' + option + '</option>';
						});

						el.innerHTML = options;
					};

					var injectCities = function injectCities() {
						if (countryF.value.length > 0 && cityData[countryF.value].cities.length > 0) {
							cityRow.style.display = 'flex';
							injectOptions(cityF, cityData[countryF.value].cities);
						} else {
							cityRow.style.display = 'none';
						}
					};

					// RUN functions to inject filter options
					injectOptions(categoryF, categoryData);
					// Disabled so values can be authored
					// injectOptions(typeF, typeData)
					injectOptions(countryF, countryData);

					// FUNCTION to show/hide/preset taleo component
					var jobSearchButton = document.getElementById('find-jobs');
					var taleoComponent = document.getElementById('taleo');
					var lowercaseCountryData = [];

					countryData.forEach(function (country) {
						lowercaseCountryData.push(country.toLowerCase());
					});

					var showOrHideTaleo = function showOrHideTaleo() {
						var preselectedType = document.getElementById('exp').value,
						    preselectedCountry = document.getElementById('loc').value;

						String(lowercaseCountryData).includes(preselectedCountry.toLowerCase()) ? taleoComponent.style.display = 'block' : taleoComponent.style.display = 'none';

						var toTitleCase = function toTitleCase(str) {
							return str.replace(/(?:^|\s)\w/g, function (match) {
								return match.toUpperCase();
							});
						};

						typeF.value = preselectedType;
						countryF.value = toTitleCase(preselectedCountry);
						injectCities();
					};

					showOrHideTaleo();

					jobSearchButton.addEventListener('click', showOrHideTaleo);

					// FUNCTION to filter and display the results
					var pageIndex = 0;
					var currentPage = 0;
					var maxPages = 0;
					var pageCountTemplate = document.getElementById('taleo-pages').innerHTML;

					var filterResults = function filterResults(pageIndex) {
						var selected = [];
						var filtered = [];
						var search = searchF.value.length > 0 ? searchF.value.toLowerCase() : null;
						var jobTypeKey = {
							job: 'permanent temporary work apprenticeship internship / co-op no data seasonal/summer job contract',
							grad: 'graduate job'

							// GET selected filter values
						};filters.forEach(function (filter) {
							filter.value.length > 0 ? selected.push(filter.value) : selected.push(null);
						});

						var jobMatch = function jobMatch(query, data) {
							if (window.document.documentMode) {
								// Handle lack of 'normalize' polyfill for IE11
								return JSON.stringify(data).toLowerCase().includes(query) ? true : false;
							} else {
								return JSON.stringify(data).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')) ? true : false;
							}
						};

						// FILTER the results
						results.forEach(function (job) {
							if (
							// Job category matches
							(selected[0] === job['eJobFieldeJobFieldeName'] || selected[0] === null) && (
							// Job type matches key
							selected[1] !== null && jobTypeKey[selected[1]].includes(job['eJobTypeeDescription'].toLowerCase()) || selected[1] === null) && (
							// Job country matches
							selected[2] === job['country'] || selected[2] === null) && (
							// Job city matches
							selected[3] === job['city'] || selected[3] === null) && (
							// Job title includes search input
							search === null || jobMatch(search, job.titles))) {
								var createdDate = new Date(job['eJobInformationeCreationDate']);
								job.createdDate = createdDate.getTime();

								filtered.push(job);
							}
						});

						var compareValues = function compareValues(key) {
							var order = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'asc';

							return function innerSort(a, b) {
								if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
									// property doesn't exist on either object
									return 0;
								}

								var varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
								var varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];

								var comparison = 0;
								if (varA > varB) {
									comparison = 1;
								} else if (varA < varB) {
									comparison = -1;
								}
								return order === 'desc' ? comparison * -1 : comparison;
							};
						};

						filtered.sort(compareValues('createdDate', 'desc'));

						// BUILD results HTML
						var start = pageIndex;
						var end = start + 10;
						var resultsMarkup = '';
						filtered.slice(start, end).forEach(function (job) {
							var titles = Object.keys(job.titles);
							var title = 'en' in job.titles ? job.titles.en : job.titles[titles[0]];

							resultsMarkup += '\n\t\t\t\t\t\t\t<li class="advanced-filters__results__list__li">\n\t\t\t\t\t\t\t\t<a\n\t\t\t\t\t\t\t\t\thref="\n\t\t\t\t\t\t\t\t\t\thttps://abinbev.taleo.net/careersection/jobdetail.ftl?job=\n\t\t\t\t\t\t\t\t\t\t\t' + job.eContestNumber + '\n\t\t\t\t\t\t\t\t\t"\n\t\t\t\t\t\t\t\t\ttarget="_blank"\n\t\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t\t<h6 class="advanced-filters__job-title">\n\t\t\t\t\t\t\t\t\t\t' + title + '\n\t\t\t\t\t\t\t\t\t</h6>\n\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t<div class="advanced-filters__job-description">\n\t\t\t\t\t\t\t\t\t<p>\n\t\t\t\t\t\t\t\t\t\tJob #: ' + job.eContestNumber + '\n\t\t\t\t\t\t\t\t\t\t<span style="margin: 0 .5em;">|</span>\n\t\t\t\t\t\t\t\t\t\tAdded ' + job.eJobInformationeCreationDate + '\n\t\t\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t';
						});

						// INJECT results HTML
						document.getElementById('taleo-results').innerHTML = resultsMarkup;

						// SHOW/HIDE controls
						var controls = document.querySelectorAll('.hide-if-none');

						controls.forEach(function (el) {
							if (filtered.length > 0) {
								el.style.display = 'block';
								controls[controls.length - 1].style.display = 'flex';
							} else {
								el.style.display = 'none';
							}
						});

						// SET curent range
						var pageRange = pageIndex + 1 + ' - ' + (pageIndex + 10);
						var pageRangeEls = [document.getElementById('taleo-page-range'), document.getElementById('taleo-page-range-bottom')];

						pageRangeEls.forEach(function (el) {
							el.innerHTML = pageRange;
						});

						// SET results count
						document.getElementById('taleo-job-count').innerHTML = filtered.length;

						// SET page count
						maxPages = Math.ceil(filtered.length / 10);
						currentPage = (pageIndex + 10) / 10;

						// SET current page number
						var pageCountStep1 = pageCountTemplate.replace('#', currentPage);
						var pageCountStep2 = pageCountStep1.replace('#', maxPages);

						var pageCountEls = [document.getElementById('taleo-pages'), document.getElementById('taleo-pages-bottom')];

						pageCountEls.forEach(function (el) {
							el.innerHTML = pageCountStep2;
						});
					};

					// RUN function to filter & display results
					filterResults(pageIndex);

					// WATCH for user input
					var applyFiltersButton = document.getElementById('apply-filters'),
					    resetFiltersButton = document.getElementById('reset-filters'),
					    prevButtons = [document.getElementById('taleo-prev'), document.getElementById('taleo-prev-bottom')],
					    nextButtons = [document.getElementById('taleo-next'), document.getElementById('taleo-next-bottom')];

					searchF.addEventListener('keypress', function (e) {
						if (e.keyCode === 13) e.preventDefault();
					});

					applyFiltersButton.addEventListener('click', function () {
						pageIndex = 0;
						filterResults(pageIndex);
					});

					jobSearchButton.addEventListener('click', function () {
						pageIndex = 0;
						filterResults(pageIndex);
					});

					resetFiltersButton.addEventListener('click', function () {
						pageIndex = 0;
						searchF.value = '';
						filters.forEach(function (filter) {
							filter.value = '';
						});
						filterResults(pageIndex);
					});

					prevButtons.forEach(function (el) {
						el.addEventListener('click', function () {
							if (currentPage > 1) {
								pageIndex -= 10;
								filterResults(pageIndex);
							}
						});
					});

					nextButtons.forEach(function (el) {
						el.addEventListener('click', function () {
							if (currentPage < maxPages) {
								pageIndex += 10;
								filterResults(pageIndex);
							}
						});
					});

					countryF.addEventListener('change', function () {
						injectCities();
					});
				},
				error: function error(xhr) {
					console.error('error', xhr);
				}
			});
		}
	}]);

	return AdvancedFilters;
}(_BaseClass3.default);

exports.default = AdvancedFilters;

},{"../../util/BaseClass":109}],42:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initAdvancedFilters;

var _AdvancedFilters = require('./AdvancedFilters');

var _AdvancedFilters2 = _interopRequireDefault(_AdvancedFilters);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initAdvancedFilters() {
  var advancedFilterEls = document.querySelectorAll('.advanced-filters');
  advancedFilterEls.forEach(function (el) {
    new _AdvancedFilters2.default({ el: el });
  });
}

},{"./AdvancedFilters":41}],43:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _CookieHelper = require("../../util/CookieHelper");

var _CookieHelper2 = _interopRequireDefault(_CookieHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var convert = require("xml-js");

var AGE_GATE_VALIDATION_URL = "https://webshop.anheuser-busch.com/lda/AgeCheck.aspx";
//http://webshop.anheuser-busch.com/lda/AgeCheck.aspx?T=2CECF070-1B17-4514-BE3B-2E6EE9E2ADF9&D=1&M=1&Y=1981&C=AF
// Index 0 is the default "Month" label
var MONTH_MAP = [31, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var ERROR_TEMPLATE = "\n  <div class=\"age-gate--error\">\n    <p class=\"age-gate--error-message\"></p>\n    <div class=\"age-gate--error-button-container\">\n     <!-- <a href=\"/\" class=\"button primary\">Go Home</a>-->\n    </div>\n  </div>\n";

var COUNTRY_OPTION_TEMPLATE = "\n  <option value=\"\"></option>\n";

var AgeGate = function () {
  function AgeGate(opts) {
    _classCallCheck(this, AgeGate);

    this.el = opts.el;
    this.overlay = document.querySelector('.age-gate--overlay');
    this.body = document.querySelector('body');
    this.contentContainer = this.el.querySelector('.age-gate--content-container');
    this.title = this.el.querySelector('.age-gate--content');
    this.form = this.el.querySelector('.age-gate--form');
    this.regionPicker = null;
    this.monthPicker = null;
    this.dayPicker = null;
    this.dayPickerOptions = [];
    this.yearPicker = null;

    this._init();
  }

  _createClass(AgeGate, [{
    key: "_init",
    value: function _init() {
      if (_CookieHelper2.default.readCookie('ldageab-inbev') !== 'valid') {
        this._getPickers();
        this._setupEl();
        this._setupEventHandlers();
      }
      this.overlay.classList.add('disable');
    }
  }, {
    key: "_setupEl",
    value: function _setupEl() {
      var _this = this;

      abCountryData.countries.forEach(function (country) {
        var el = document.createElement('option');
        el.setAttribute('value', country.code);
        el.innerText = country.label;
        _this.regionPicker.appendChild(el);
      });
      this.el.classList.add('active');
      this.body.classList.add('age-gate-active');
    }
  }, {
    key: "_getPickers",
    value: function _getPickers() {
      var _this2 = this;

      this.regionPicker = this.el.querySelector('#ag-region');
      this.monthPicker = this.el.querySelector('#ag-month');
      this.dayPicker = this.el.querySelector('#ag-day');
      [].slice.call(this.dayPicker.children).forEach(function (day) {
        _this2.dayPickerOptions.push(day.cloneNode(true));
      });
      this.yearPicker = this.el.querySelector('#ag-year');
    }
  }, {
    key: "_setupEventHandlers",
    value: function _setupEventHandlers() {
      if (this.monthPicker) {
        this._onMonthChanged = this._onMonthChanged.bind(this);
        this.monthPicker.addEventListener('change', this._onMonthChanged);
      }

      if (this.form) {
        this._onSubmit = this._onSubmit.bind(this);
        this.form.addEventListener('submit', this._onSubmit);
      }
    }
  }, {
    key: "_onMonthChanged",
    value: function _onMonthChanged(e) {
      var val = this.monthPicker.value;
      var numDays = MONTH_MAP[val];
      var currentDay = this.dayPicker.value;

      this.dayPicker.innerHTML = '';
      for (var i = 0; i <= numDays; i++) {
        var newNode = this.dayPickerOptions[i].cloneNode(true);
        this.dayPicker.appendChild(newNode);
      }

      if (currentDay < numDays) {
        return this.dayPicker.children[parseInt(currentDay)].selected = true;
      }

      return this.dayPicker.firstElementChild.selected = true;
    }
  }, {
    key: "_onSubmit",
    value: function _onSubmit(e) {
      e.preventDefault();
      var data = this._getFormData();
      var oReq = new XMLHttpRequest();
      oReq.addEventListener("load", this._handleSubmitResponse.bind(this));
      // oReq.open("GET", `${AGE_GATE_VALIDATION_URL}?day=${data.day}&month=${data.month}&year=${data.year}&countryCode=${data.countryCode}&date=mm%2Fdd%2Fyyyy`);
      oReq.open("GET", AGE_GATE_VALIDATION_URL + "?T=2CECF070-1B17-4514-BE3B-2E6EE9E2ADF9&D=" + data.day + "&M=" + data.month + "&Y=" + data.year + "&C=" + data.countryCode);
      oReq.send();
    }
  }, {
    key: "_handleSubmitResponse",
    value: function _handleSubmitResponse(e) {
      var res = JSON.parse(convert.xml2json(e.target.response, { compact: true, spaces: 4 }));
      if (res.AgeCheckResponse.IsOfLegalDrinkingAge._text === "True" && res.AgeCheckResponse.IsCountryRestricted._text === "False") {
        _CookieHelper2.default.createCookie('ldageab-inbev', 'valid');
        this.el.classList.remove('active');
        this.body.classList.remove('age-gate-active');
      } else {
        this._addErrorText("Sorry, you must be " + res.AgeCheckResponse.CountryDrinkingAge._text + " or older to view this site");
      }
    }
  }, {
    key: "_addErrorText",
    value: function _addErrorText(error) {
      this.title.innerHTML = ERROR_TEMPLATE;
      this.form.reset();
      var errorMessageEl = this.contentContainer.querySelector('.age-gate--error-message');
      errorMessageEl.innerText = error;
    }
  }, {
    key: "_getFormData",
    value: function _getFormData() {
      var countryCode = this.regionPicker.value;
      var day = this.dayPicker.value;
      var month = this.monthPicker.value;
      var year = this.yearPicker.value;

      return {
        countryCode: countryCode,
        day: day,
        month: month,
        year: year
      };
    }
  }]);

  return AgeGate;
}();

exports.default = AgeGate;

},{"../../util/CookieHelper":110,"xml-js":34}],44:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initAgeGate;

var _AgeGate = require('./AgeGate');

var _AgeGate2 = _interopRequireDefault(_AgeGate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initAgeGate() {
  var ageGateEls = document.querySelectorAll('.age-gate');
  ageGateEls.forEach(function (el) {
    new _AgeGate2.default({ el: el });
  });
}

},{"./AgeGate":43}],45:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

var _BeerCardExpandedGallery = require('./BeerCardExpandedGallery');

var _BeerCardExpandedGallery2 = _interopRequireDefault(_BeerCardExpandedGallery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BeerCardExpanded = function (_BaseClass) {
  _inherits(BeerCardExpanded, _BaseClass);

  function BeerCardExpanded(opts) {
    _classCallCheck(this, BeerCardExpanded);

    return _possibleConstructorReturn(this, (BeerCardExpanded.__proto__ || Object.getPrototypeOf(BeerCardExpanded)).call(this, {
      el: opts.el
    }));
  }

  _createClass(BeerCardExpanded, [{
    key: '_init',
    value: function _init() {
      this._setupGallery();
    }
  }, {
    key: '_setupGallery',
    value: function _setupGallery() {
      var galleryEl = this.el.querySelector('.beer-card-expanded--gallery-container');
      if (galleryEl) {
        this.gallery = new _BeerCardExpandedGallery2.default({
          el: galleryEl
        });
      }
    }
  }]);

  return BeerCardExpanded;
}(_BaseClass3.default);

exports.default = BeerCardExpanded;

},{"../../util/BaseClass":109,"./BeerCardExpandedGallery":46}],46:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

var _Slider = require('../../global/slider/Slider');

var _Slider2 = _interopRequireDefault(_Slider);

var _BeerCardExpandedGalleryChild = require('./BeerCardExpandedGalleryChild');

var _BeerCardExpandedGalleryChild2 = _interopRequireDefault(_BeerCardExpandedGalleryChild);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BeerCardExpandedGallery = function (_BaseClass) {
  _inherits(BeerCardExpandedGallery, _BaseClass);

  function BeerCardExpandedGallery(opts) {
    _classCallCheck(this, BeerCardExpandedGallery);

    return _possibleConstructorReturn(this, (BeerCardExpandedGallery.__proto__ || Object.getPrototypeOf(BeerCardExpandedGallery)).call(this, {
      el: opts.el,
      activeItem: null,
      children: []
    }));
  }

  _createClass(BeerCardExpandedGallery, [{
    key: '_init',
    value: function _init() {
      this._setupEl();
    }
  }, {
    key: '_setupEl',
    value: function _setupEl() {
      this._getActiveItem();
      this._initializeSlider();
      this._getChildren();
    }
  }, {
    key: '_getActiveItem',
    value: function _getActiveItem() {
      this.activeItem = this.el.querySelector('.beer-card-expanded--active-gallery-item img');
    }
  }, {
    key: '_initializeSlider',
    value: function _initializeSlider() {
      var sliderEl = this.el.querySelector('.beer-card-expanded--gallery-items');
      if (!sliderEl) {
        return;
      }
      this.gallerySlider = new _Slider2.default({
        el: sliderEl,
        options: {
          slidesToShow: 3,
          responsive: [{
            breakpoint: this.breakpoints.desktop,
            settings: {
              slidesToShow: 1
            }
          }]
        }
      });
    }
  }, {
    key: '_getChildren',
    value: function _getChildren() {
      var _this2 = this;

      var childrenEls = this.el.querySelectorAll('.beer-card-expanded--gallery-item img');
      childrenEls.forEach(function (el) {
        _this2.children.push(new _BeerCardExpandedGalleryChild2.default({
          el: el,
          parent: _this2
        }));
      });
    }
  }, {
    key: 'activateGalleryItem',
    value: function activateGalleryItem(galleryItem) {
      this.children.forEach(function (galleryItem) {
        galleryItem.deactivate();
      });
      if (!this.activeItem) {
        return;
      }
      this.activeItem.src = galleryItem.getSrc();
      galleryItem.activate();
    }
  }]);

  return BeerCardExpandedGallery;
}(_BaseClass3.default);

exports.default = BeerCardExpandedGallery;

},{"../../global/slider/Slider":100,"../../util/BaseClass":109,"./BeerCardExpandedGalleryChild":47}],47:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BeerCardExpandedGalleryChild = function (_BaseClass) {
  _inherits(BeerCardExpandedGalleryChild, _BaseClass);

  function BeerCardExpandedGalleryChild(opts) {
    _classCallCheck(this, BeerCardExpandedGalleryChild);

    return _possibleConstructorReturn(this, (BeerCardExpandedGalleryChild.__proto__ || Object.getPrototypeOf(BeerCardExpandedGalleryChild)).call(this, {
      el: opts.el,
      parentEl: null,
      imageSrc: null,
      parent: opts.parent
    }));
  }

  _createClass(BeerCardExpandedGalleryChild, [{
    key: '_init',
    value: function _init() {
      this._getParentEl();
      this._getSrc();
      this._setupEventHandlers();
    }
  }, {
    key: '_getSrc',
    value: function _getSrc() {
      this.imageSrc = this.el.src;
    }
  }, {
    key: '_getParentEl',
    value: function _getParentEl() {
      this.parentEl = this.el.parentElement;
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      if (this.el) {
        this._onClick = this._onClick.bind(this);
        this.el.addEventListener('click', this._onClick);
      }
    }
  }, {
    key: '_onClick',
    value: function _onClick() {
      this.parent.activateGalleryItem(this);
    }
  }, {
    key: 'activate',
    value: function activate() {
      this.parentEl.classList.add('active');
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      this.parentEl.classList.remove('active');
    }
  }, {
    key: 'getSrc',
    value: function getSrc() {
      return this.imageSrc;
    }
  }]);

  return BeerCardExpandedGalleryChild;
}(_BaseClass3.default);

exports.default = BeerCardExpandedGalleryChild;

},{"../../util/BaseClass":109}],48:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initBeerCardExpanded;

var _BeerCardExpanded = require('./BeerCardExpanded');

var _BeerCardExpanded2 = _interopRequireDefault(_BeerCardExpanded);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initBeerCardExpanded() {
  var beerCardExpandedEls = document.querySelectorAll('.beer-card-expanded');
  beerCardExpandedEls.forEach(function (el) {
    new _BeerCardExpanded2.default({
      el: el
    });
  });
}

},{"./BeerCardExpanded":45}],49:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Slider2 = require('../../global/slider/Slider');

var _Slider3 = _interopRequireDefault(_Slider2);

var _BrandExplorerOptions = require('./BrandExplorerOptions');

var _BrandExplorerOptions2 = _interopRequireDefault(_BrandExplorerOptions);

var _BrandExplorerControls = require('./BrandExplorerControls');

var _BrandExplorerControls2 = _interopRequireDefault(_BrandExplorerControls);

var _BrandExplorerChild = require('./BrandExplorerChild');

var _BrandExplorerChild2 = _interopRequireDefault(_BrandExplorerChild);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BrandExplorer = function (_Slider) {
  _inherits(BrandExplorer, _Slider);

  function BrandExplorer(opts) {
    _classCallCheck(this, BrandExplorer);

    return _possibleConstructorReturn(this, (BrandExplorer.__proto__ || Object.getPrototypeOf(BrandExplorer)).call(this, opts));
  }

  _createClass(BrandExplorer, [{
    key: '_setOptions',
    value: function _setOptions() {
      var options = this.el.dataset.sliderOptions ? JSON.parse(this.el.dataset.sliderOptions) : {};
      this.options = new _BrandExplorerOptions2.default({ options: options });
    }
  }, {
    key: '_createControls',
    value: function _createControls() {
      this.controls = new _BrandExplorerControls2.default({
        parent: this
      });
      this.el.appendChild(this.controls.el);
    }
  }, {
    key: '_getChildren',
    value: function _getChildren() {
      var _this2 = this;

      var childEls = [].slice.call(this.el.children);
      childEls.forEach(function (el, i) {
        _this2.children.push(new _BrandExplorerChild2.default({
          el: el,
          index: i,
          parent: _this2
        }));
      });
    }
  }, {
    key: 'closeChildrenDesc',
    value: function closeChildrenDesc() {
      this.children.forEach(function (child) {
        child.closeDesc();
      });
    }
  }]);

  return BrandExplorer;
}(_Slider3.default);

exports.default = BrandExplorer;

},{"../../global/slider/Slider":100,"./BrandExplorerChild":50,"./BrandExplorerControls":51,"./BrandExplorerOptions":54}],50:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _SliderChild2 = require('../../global/slider/SliderChild');

var _SliderChild3 = _interopRequireDefault(_SliderChild2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BrandExplorerChild = function (_SliderChild) {
  _inherits(BrandExplorerChild, _SliderChild);

  function BrandExplorerChild(opts) {
    _classCallCheck(this, BrandExplorerChild);

    return _possibleConstructorReturn(this, (BrandExplorerChild.__proto__ || Object.getPrototypeOf(BrandExplorerChild)).call(this, {
      el: opts.el,
      index: opts.index,
      state: {
        active: false,
        descOpened: false
      },
      desc: null,
      descClose: null,
      parent: opts.parent,
      width: 0,
      name: null
    }));
  }

  _createClass(BrandExplorerChild, [{
    key: '_init',
    value: function _init() {
      this._getDesc();
      _get(BrandExplorerChild.prototype.__proto__ || Object.getPrototypeOf(BrandExplorerChild.prototype), '_init', this).call(this);
      var titleEl = this.el.querySelector('.brand-explorer-brand-item--desc---title');
      this.name = titleEl.textContent;
    }
  }, {
    key: '_getDesc',
    value: function _getDesc() {
      this.desc = this.el.querySelector('.brand-explorer-brand-item--desc');
      this.descClose = this.desc.querySelector('.brand-explorer-brand-item--desc---close-button');
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      _get(BrandExplorerChild.prototype.__proto__ || Object.getPrototypeOf(BrandExplorerChild.prototype), '_setupEventHandlers', this).call(this);
      if (this.el) {
        this._onClick = this._onClick.bind(this);
        this.el.addEventListener('click', this._onClick);
      }

      if (this.descClose) {
        this._onClickClose = this._onClickClose.bind(this);
        this.descClose.addEventListener('click', this._onClickClose);
      }
    }
  }, {
    key: '_onClick',
    value: function _onClick(e) {
      if (window.innerWidth > this.breakpoints.desktop) {
        return;
      }
      this.openDesc();
    }
  }, {
    key: '_onClickClose',
    value: function _onClickClose(e) {
      e.stopPropagation();
      this.closeDesc();
    }
  }, {
    key: 'openDesc',
    value: function openDesc() {
      if (!this.state.active) {
        return;
      }
      this.parent.closeChildrenDesc();
      this.desc.style.left = this.parent.indexTransforms[this.index] + 'px';
      this.desc.classList.add('active');
      this.state.descOpened = true;
    }
  }, {
    key: 'closeDesc',
    value: function closeDesc() {
      if (this.state.descOpened) {
        this.desc.classList.remove('active');
        this.state.descOpened = false;
      }
    }
  }, {
    key: 'getName',
    value: function getName() {
      return this.name;
    }
  }]);

  return BrandExplorerChild;
}(_SliderChild3.default);

exports.default = BrandExplorerChild;

},{"../../global/slider/SliderChild":102}],51:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SliderControls2 = require('../../global/slider/SliderControls');

var _SliderControls3 = _interopRequireDefault(_SliderControls2);

var _BrandExplorerNavButton = require('./BrandExplorerNavButton');

var _BrandExplorerNavButton2 = _interopRequireDefault(_BrandExplorerNavButton);

var _BrandExplorerNavDragDrop = require('./BrandExplorerNavDragDrop');

var _BrandExplorerNavDragDrop2 = _interopRequireDefault(_BrandExplorerNavDragDrop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BrandExplorerControls = function (_SliderControls) {
  _inherits(BrandExplorerControls, _SliderControls);

  function BrandExplorerControls(opts) {
    _classCallCheck(this, BrandExplorerControls);

    return _possibleConstructorReturn(this, (BrandExplorerControls.__proto__ || Object.getPrototypeOf(BrandExplorerControls)).call(this, opts));
  }

  _createClass(BrandExplorerControls, [{
    key: '_init',
    value: function _init() {
      this._getEl();
      this._getDimensions();
      this._getNavDragDrop();
      this._setupEventHandlers();
    }
  }, {
    key: '_getDimensions',
    value: function _getDimensions() {
      var _this2 = this;

      requestAnimationFrame(function () {
        _this2.dotContainerDimensions = _this2.dotContainer.getBoundingClientRect();
      });
    }
  }, {
    key: '_setupNavDots',
    value: function _setupNavDots() {
      var _this3 = this;

      this.dotContainer = this.el.querySelector('.ab-slider--nav-container---dot-container');

      this.parent.children.forEach(function (child, i) {
        var navButton = new _BrandExplorerNavButton2.default({
          index: i,
          parent: _this3.parent,
          brand: child
        });
        _this3.childrenNavDots.push(navButton);
        _this3.dotContainer.appendChild(navButton.el);
      });
    }
  }, {
    key: '_getNavDragDrop',
    value: function _getNavDragDrop() {
      this.navDragDrop = this._createNavDragDrop();
      this.dotContainer.appendChild(this.navDragDrop.el);
    }
  }, {
    key: '_createNavDragDrop',
    value: function _createNavDragDrop() {
      return new _BrandExplorerNavDragDrop2.default({
        parent: this
      });
    }
  }, {
    key: 'setActiveChild',
    value: function setActiveChild(index) {
      this.childrenNavDots.forEach(function (child) {
        child.setInactive();
      });
      this.childrenNavDots[index].setActive();

      this._setNavDots();
      this._setNavNumber();
      this.navDragDrop.setActiveChild(index);
    }
  }]);

  return BrandExplorerControls;
}(_SliderControls3.default);

exports.default = BrandExplorerControls;

},{"../../global/slider/SliderControls":103,"./BrandExplorerNavButton":52,"./BrandExplorerNavDragDrop":53}],52:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _SliderNavButton2 = require('../../global/slider/SliderNavButton');

var _SliderNavButton3 = _interopRequireDefault(_SliderNavButton2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TEMPLATE_SLIDER_CONTROLS__NAV_BUTTON = '\n  <a href="javascript:void(0);" class="ab-slider--nav-container---nav-button">\n    <div class="ab-slider--nav-container---nav-button-label"></div>\n  </a>\n';

var BrandExplorerNavButton = function (_SliderNavButton) {
  _inherits(BrandExplorerNavButton, _SliderNavButton);

  function BrandExplorerNavButton(opts) {
    _classCallCheck(this, BrandExplorerNavButton);

    return _possibleConstructorReturn(this, (BrandExplorerNavButton.__proto__ || Object.getPrototypeOf(BrandExplorerNavButton)).call(this, {
      index: opts.index,
      parent: opts.parent,
      el: null,
      label: null,
      active: false,
      brand: opts.brand
    }));
  }

  _createClass(BrandExplorerNavButton, [{
    key: '_getEl',
    value: function _getEl() {
      var tempElNavButton = document.createElement('div');
      tempElNavButton.innerHTML = TEMPLATE_SLIDER_CONTROLS__NAV_BUTTON.trim();
      this.el = tempElNavButton.firstChild;
      this.label = this.el.querySelector('.ab-slider--nav-container---nav-button-label');
      this.label.innerText = this.brand.getName();
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      _get(BrandExplorerNavButton.prototype.__proto__ || Object.getPrototypeOf(BrandExplorerNavButton.prototype), '_setupEventHandlers', this).call(this);
      this._onMouseEnter = this._onMouseEnter.bind(this);
      this._onMouseLeave = this._onMouseLeave.bind(this);
      this.el.addEventListener('mouseenter', this._onMouseEnter);
      this.el.addEventListener('mouseleave', this._onMouseLeave);
    }
  }, {
    key: '_onMouseEnter',
    value: function _onMouseEnter() {
      this.el.classList.add('show-label');
    }
  }, {
    key: '_onMouseLeave',
    value: function _onMouseLeave() {
      this.el.classList.remove('show-label');
    }
  }]);

  return BrandExplorerNavButton;
}(_SliderNavButton3.default);

exports.default = BrandExplorerNavButton;

},{"../../global/slider/SliderNavButton":104}],53:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BrandExplorerNavDragDrop = function (_BaseClass) {
  _inherits(BrandExplorerNavDragDrop, _BaseClass);

  function BrandExplorerNavDragDrop(opts) {
    _classCallCheck(this, BrandExplorerNavDragDrop);

    return _possibleConstructorReturn(this, (BrandExplorerNavDragDrop.__proto__ || Object.getPrototypeOf(BrandExplorerNavDragDrop)).call(this, {
      parent: opts.parent,
      el: null,
      dotPositions: [],
      state: {
        dragging: false
      },
      mouseData: {},
      transform: 0
    }));
  }

  _createClass(BrandExplorerNavDragDrop, [{
    key: '_init',
    value: function _init() {
      this._createEl();
      this._getDimensions();
      this._setupEventHandlers();
    }
  }, {
    key: '_createEl',
    value: function _createEl() {
      var el = document.createElement('div');
      var elInner = document.createElement('div');
      el.appendChild(elInner);
      el.classList.add('brand-explorer--nav-drag-drop');
      elInner.classList.add('brand-explorer--nav-drag-drop-inner');

      this.el = el;
    }
  }, {
    key: '_getDimensions',
    value: function _getDimensions() {
      var _this2 = this;

      this.dotPositions = [];
      requestAnimationFrame(function () {
        _this2.parent.childrenNavDots.forEach(function (navDot) {
          var rect = navDot.el.getBoundingClientRect();
          _this2.dotPositions.push(rect.left + rect.width / 2 - _this2.parent.dotContainerDimensions.left);
        });
      });
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._onMousedown = this._onMousedown.bind(this);
      this._onMousemove = this._onMousemove.bind(this);
      this._onMouseup = this._onMouseup.bind(this);

      this.el.addEventListener('mousedown', this._onMousedown);
    }
  }, {
    key: '_onMousedown',
    value: function _onMousedown(e) {
      if (this.state.dragging || e.which !== 1) {
        return;
      }
      this._activateDragDrop();

      window.addEventListener('mousemove', this._onMousemove);
      window.addEventListener('mouseup', this._onMouseup);
      this.mouseData.startX = this.mouseData.initX = e.clientX;
    }
  }, {
    key: '_onMousemove',
    value: function _onMousemove(e) {
      var _this3 = this;

      if (!this.state.dragging || this.state.ticking) {
        return;
      }
      this.state.ticking = true;
      requestAnimationFrame(function () {
        _this3.state.ticking = false;
        var md = _this3.mouseData;
        md.newX = e.clientX;
        md.deltaX = md.newX - md.initX;
        md.initX += md.deltaX;
        _this3.transform += md.deltaX;
        _this3._transform(_this3.transform);
      });
    }
  }, {
    key: '_onMouseup',
    value: function _onMouseup(e) {
      if (!this.state.dragging) {
        return;
      }
      this._deactivateDragDrop();

      for (var i = 0; i < this.dotPositions.length; i++) {
        var dotPosition = this.dotPositions[i];
        if (this.transform <= dotPosition) {
          if (i === 0) {
            return this._setActiveChildInternal(i);
          }
          var prevDotPosition = this.dotPositions[i - 1];

          if (Math.abs(prevDotPosition - this.transform) >= Math.abs(dotPosition - this.transform)) {
            return this._setActiveChildInternal(i);
          } else {
            return this._setActiveChildInternal(i - 1);
          }
        }
      }
      return this._setActiveChildInternal(this.dotPositions.length - 1);
    }
  }, {
    key: '_activateDragDrop',
    value: function _activateDragDrop() {
      this.state.dragging = true;
      this.el.classList.add('no-animate');
      this.el.classList.add('active');
    }
  }, {
    key: '_deactivateDragDrop',
    value: function _deactivateDragDrop() {
      this.state.dragging = false;
      this.el.classList.remove('no-animate');
      this.el.classList.remove('active');
    }
  }, {
    key: '_transform',
    value: function _transform(transform) {
      var clippedTransform = Math.max(0, Math.min(transform, this.parent.dotContainerDimensions.width));
      this.el.style.transform = 'translateX(' + clippedTransform + 'px)';
      this.transform = clippedTransform;
    }
  }, {
    key: '_setActiveChildInternal',
    value: function _setActiveChildInternal(index) {
      this._transform(this.dotPositions[index]);
      this.parent.parent.setActiveChild(index);
    }
  }, {
    key: 'setActiveChild',
    value: function setActiveChild(index) {
      this._transform(this.dotPositions[index]);
    }
  }]);

  return BrandExplorerNavDragDrop;
}(_BaseClass3.default);

exports.default = BrandExplorerNavDragDrop;

},{"../../util/BaseClass":109}],54:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _SliderOptions2 = require('../../global/slider/SliderOptions');

var _SliderOptions3 = _interopRequireDefault(_SliderOptions2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BrandExplorerOptions = function (_SliderOptions) {
  _inherits(BrandExplorerOptions, _SliderOptions);

  function BrandExplorerOptions(opts) {
    _classCallCheck(this, BrandExplorerOptions);

    return _possibleConstructorReturn(this, (BrandExplorerOptions.__proto__ || Object.getPrototypeOf(BrandExplorerOptions)).call(this, opts));
  }

  return BrandExplorerOptions;
}(_SliderOptions3.default);

exports.default = BrandExplorerOptions;

},{"../../global/slider/SliderOptions":105}],55:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initBrandExplorer;

var _BrandExplorer = require('./BrandExplorer');

var _BrandExplorer2 = _interopRequireDefault(_BrandExplorer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initBrandExplorer(selector) {
  var brandExplorerEls = document.querySelectorAll('.brand-explorer');
  brandExplorerEls.forEach(function (el) {
    var sliderListEl = el.querySelector('.brand-explorer-brand-list');
    new _BrandExplorer2.default({
      el: sliderListEl
    });
  });
}

},{"./BrandExplorer":49}],56:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

var _CardSocial = require('./CardSocial');

var _CardSocial2 = _interopRequireDefault(_CardSocial);

var _CardFeaturedFour = require('./CardFeaturedFour');

var _CardFeaturedFour2 = _interopRequireDefault(_CardFeaturedFour);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Card = function (_BaseClass) {
  _inherits(Card, _BaseClass);

  function Card(opts) {
    _classCallCheck(this, Card);

    return _possibleConstructorReturn(this, (Card.__proto__ || Object.getPrototypeOf(Card)).call(this, {
      el: opts.el,
      social: null,
      featureFour: null
    }));
  }

  _createClass(Card, [{
    key: '_init',
    value: function _init() {
      this._setupSocial();
      this._setupFeaturedFour();
    }
  }, {
    key: '_setupSocial',
    value: function _setupSocial() {
      var socialEl = this.el.querySelector('.card-social');
      if (socialEl) {
        this.social = new _CardSocial2.default({
          el: socialEl
        });
      }
    }
  }, {
    key: '_setupFeaturedFour',
    value: function _setupFeaturedFour() {
      var featured4El = this.el.querySelector('.card-inner--card-opt4');
      if (featured4El) {
        this.featureFour = new _CardFeaturedFour2.default({
          el: featured4El
        });
      }
    }
  }]);

  return Card;
}(_BaseClass3.default);

exports.default = Card;

},{"../../util/BaseClass":109,"./CardFeaturedFour":57,"./CardSocial":58}],57:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CardFeaturedFour = function (_BaseClass) {
  _inherits(CardFeaturedFour, _BaseClass);

  function CardFeaturedFour(opts) {
    _classCallCheck(this, CardFeaturedFour);

    return _possibleConstructorReturn(this, (CardFeaturedFour.__proto__ || Object.getPrototypeOf(CardFeaturedFour)).call(this, {
      //.el: opts.el
    }));
  }

  _createClass(CardFeaturedFour, [{
    key: '_init',
    value: function _init() {
      this._setupEl();
    }
  }, {
    key: '_setupEl',
    value: function _setupEl() {
      console.log(this);
    }
  }]);

  return CardFeaturedFour;
}(_BaseClass3.default);

exports.default = CardFeaturedFour;

},{"../../util/BaseClass":109}],58:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CardSocial = function (_BaseClass) {
  _inherits(CardSocial, _BaseClass);

  function CardSocial(opts) {
    _classCallCheck(this, CardSocial);

    return _possibleConstructorReturn(this, (CardSocial.__proto__ || Object.getPrototypeOf(CardSocial)).call(this, {
      el: opts.el,
      buttons: {
        open: null,
        close: null
      },
      state: {
        opened: false
      }
    }));
  }

  _createClass(CardSocial, [{
    key: '_init',
    value: function _init() {
      this._setupEl();
      this._setupEventHandlers();
    }
  }, {
    key: '_setupEl',
    value: function _setupEl() {
      this.buttons.open = this.el.querySelector('.card-social--button---open');
      this.buttons.close = this.el.querySelector('.card-social--button---close');
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._openSocial = this._openSocial.bind(this);
      this.buttons.open.addEventListener('click', this._openSocial);

      this._closeSocial = this._closeSocial.bind(this);
      this.buttons.close.addEventListener('click', this._closeSocial);
    }
  }, {
    key: '_openSocial',
    value: function _openSocial() {
      if (this.state.opened) {
        return;
      }
      this.state.opened = true;
      this.el.classList.add('active');
    }
  }, {
    key: '_closeSocial',
    value: function _closeSocial() {
      if (!this.state.opened) {
        return;
      }
      this.state.opened = false;
      this.el.classList.remove('active');
    }
  }]);

  return CardSocial;
}(_BaseClass3.default);

exports.default = CardSocial;

},{"../../util/BaseClass":109}],59:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initCards;

var _Card = require('./Card');

var _Card2 = _interopRequireDefault(_Card);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initCards() {
  var cardEls = document.querySelectorAll('.card');
  cardEls.forEach(function (el) {
    new _Card2.default({
      el: el
    });
  });
}

},{"./Card":56}],60:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

var _Slider = require('../../global/slider/Slider');

var _Slider2 = _interopRequireDefault(_Slider);

var _FilterGridChild = require('./FilterGridChild');

var _FilterGridChild2 = _interopRequireDefault(_FilterGridChild);

var _FilterGridSliderChild = require('./FilterGridSliderChild');

var _FilterGridSliderChild2 = _interopRequireDefault(_FilterGridSliderChild);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FilterGrid = function (_BaseClass) {
  _inherits(FilterGrid, _BaseClass);

  function FilterGrid(opts) {
    _classCallCheck(this, FilterGrid);

    return _possibleConstructorReturn(this, (FilterGrid.__proto__ || Object.getPrototypeOf(FilterGrid)).call(this, {
      el: opts.el,
      sliderContainer: null,
      slider: null,
      sliderActive: null,
      sliderScrollbarWidth: null,
      gridChildren: [],
      sliderChildren: []
    }));
  }

  _createClass(FilterGrid, [{
    key: '_init',
    value: function _init() {
      this._initSlider();
      this._getScrollbarWidth();
      this._getGridChildren();
      this._getGridSliderChildren();
      this._setupEventHandlers();
    }
  }, {
    key: '_initSlider',
    value: function _initSlider() {
      this.sliderContainer = this.el.querySelector('.filter-grid-slider');
      var sliderEl = this.sliderContainer.querySelector('.filter-grid-slider-items');
      if (!sliderEl) {
        return;
      }
      this.slider = new _Slider2.default({
        el: sliderEl,
        options: {
          slidesToShow: 1
        }
      });
    }

    /* Source: https://davidwalsh.name/detect-scrollbar-width */

  }, {
    key: '_getScrollbarWidth',
    value: function _getScrollbarWidth() {
      // Create the measurement node
      var scrollDiv = document.createElement("div");
      scrollDiv.className = "leadership-scrollbar-measure";
      document.body.appendChild(scrollDiv);

      // Get the scrollbar width
      this.sliderScrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;

      // Delete the DIV 
      document.body.removeChild(scrollDiv);
    }
  }, {
    key: '_getGridChildren',
    value: function _getGridChildren() {
      var _this2 = this;

      var gridChildrenEls = this.el.querySelectorAll('.filter-grid-card');
      gridChildrenEls.forEach(function (el, i) {
        _this2.gridChildren.push(new _FilterGridChild2.default({
          el: el,
          index: i,
          parent: _this2
        }));
      });
    }
  }, {
    key: '_getGridSliderChildren',
    value: function _getGridSliderChildren() {
      var _this3 = this;

      var sliderChildrenEls = this.el.querySelectorAll('.filter-grid-slider-item');
      sliderChildrenEls.forEach(function (el, i) {
        _this3.gridChildren.push(new _FilterGridSliderChild2.default({
          el: el,
          parent: _this3
        }));
      });
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      var _this4 = this;

      this.sliderContainer.addEventListener('click', function (e) {
        if (!_this4.sliderActive) {
          return;
        }
        var sliderElems = document.querySelectorAll('.filter-grid-slider-item.active .slider-card, .ab-slider--control, .ab-slider--nav-container---number-container');
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = sliderElems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var sliderElem = _step.value;

            if (e.target === sliderElem || sliderElem.contains(e.target)) {
              return;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        _this4.deactivateSlider();
      });
    }
  }, {
    key: 'activateSlider',
    value: function activateSlider() {
      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      document.body.style.overflowY = 'hidden';
      document.body.style.paddingRight = this.sliderScrollbarWidth + 'px';
      document.querySelector('#head-nav .head-nav-container').style.paddingRight = this.sliderScrollbarWidth + 'px';
      this.sliderContainer.classList.add('active');
      this.slider.setActiveChild(index, false);
      this.sliderActive = true;
    }
  }, {
    key: 'deactivateSlider',
    value: function deactivateSlider() {
      document.body.style.overflowY = '';
      document.body.style.paddingRight = '';
      document.querySelector('#head-nav .head-nav-container').style.paddingRight = '';
      this.sliderContainer.classList.remove('active');
      this.sliderActive = false;
    }
  }]);

  return FilterGrid;
}(_BaseClass3.default);

exports.default = FilterGrid;

},{"../../global/slider/Slider":100,"../../util/BaseClass":109,"./FilterGridChild":61,"./FilterGridSliderChild":62}],61:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FilterGridChild = function (_BaseClass) {
  _inherits(FilterGridChild, _BaseClass);

  function FilterGridChild(opts) {
    _classCallCheck(this, FilterGridChild);

    return _possibleConstructorReturn(this, (FilterGridChild.__proto__ || Object.getPrototypeOf(FilterGridChild)).call(this, {
      el: opts.el,
      index: opts.index,
      parent: opts.parent
    }));
  }

  _createClass(FilterGridChild, [{
    key: '_init',
    value: function _init() {
      this._setupEventHandlers();
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._onClick = this._onClick.bind(this);
      this.el.addEventListener('click', this._onClick);
    }
  }, {
    key: '_onClick',
    value: function _onClick(e) {
      e.preventDefault();
      this.parent.activateSlider(this.index);
    }
  }]);

  return FilterGridChild;
}(_BaseClass3.default);

exports.default = FilterGridChild;

},{"../../util/BaseClass":109}],62:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

var _FilterGridSliderChildGallery = require('./FilterGridSliderChildGallery');

var _FilterGridSliderChildGallery2 = _interopRequireDefault(_FilterGridSliderChildGallery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FilterGridSliderChild = function (_BaseClass) {
  _inherits(FilterGridSliderChild, _BaseClass);

  function FilterGridSliderChild(opts) {
    _classCallCheck(this, FilterGridSliderChild);

    return _possibleConstructorReturn(this, (FilterGridSliderChild.__proto__ || Object.getPrototypeOf(FilterGridSliderChild)).call(this, {
      el: opts.el,
      parent: opts.parent,
      closeButton: null
    }));
  }

  _createClass(FilterGridSliderChild, [{
    key: '_init',
    value: function _init() {
      this._setupEl();
      this._setupEventHandlers();
    }
  }, {
    key: '_setupEl',
    value: function _setupEl() {
      this.closeButton = this.el.querySelector('.slider-card--close-button');
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._onCloseClick = this._onCloseClick.bind(this);
      this.closeButton.addEventListener('click', this._onCloseClick);
    }
  }, {
    key: '_onCloseClick',
    value: function _onCloseClick() {
      this.parent.deactivateSlider();
    }
  }]);

  return FilterGridSliderChild;
}(_BaseClass3.default);

exports.default = FilterGridSliderChild;

},{"../../util/BaseClass":109,"./FilterGridSliderChildGallery":63}],63:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

var _Slider = require('../../global/slider/Slider');

var _Slider2 = _interopRequireDefault(_Slider);

var _FilterGridSliderChildGalleryChild = require('./FilterGridSliderChildGalleryChild');

var _FilterGridSliderChildGalleryChild2 = _interopRequireDefault(_FilterGridSliderChildGalleryChild);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FilterGridSliderChildGallery = function (_BaseClass) {
  _inherits(FilterGridSliderChildGallery, _BaseClass);

  function FilterGridSliderChildGallery(opts) {
    _classCallCheck(this, FilterGridSliderChildGallery);

    return _possibleConstructorReturn(this, (FilterGridSliderChildGallery.__proto__ || Object.getPrototypeOf(FilterGridSliderChildGallery)).call(this, {
      el: opts.el,
      activeItem: null,
      children: []
    }));
  }

  _createClass(FilterGridSliderChildGallery, [{
    key: '_init',
    value: function _init() {
      this._setupEl();
    }
  }, {
    key: '_setupEl',
    value: function _setupEl() {
      this._getActiveItem();
      this._initializeSlider();
      this._getChildren();
    }
  }, {
    key: '_getActiveItem',
    value: function _getActiveItem() {
      this.activeItem = this.el.querySelector('.slider-card--active-gallery-item img');
    }
  }, {
    key: '_initializeSlider',
    value: function _initializeSlider() {
      var sliderEl = this.el.querySelector('.slider-card--gallery-items');
      this.gallerySlider = new _Slider2.default({
        el: sliderEl,
        options: {
          slidesToShow: 3,
          responsive: [{
            breakpoint: this.breakpoints.desktop,
            settings: {
              slidesToShow: 1
            }
          }]
        }
      });
    }
  }, {
    key: '_getChildren',
    value: function _getChildren() {
      var _this2 = this;

      var childrenEls = this.el.querySelectorAll('.slider-card--gallery-item img');
      childrenEls.forEach(function (el) {
        _this2.children.push(new _FilterGridSliderChildGalleryChild2.default({
          el: el,
          parent: _this2
        }));
      });
    }
  }, {
    key: 'activateGalleryItem',
    value: function activateGalleryItem(galleryItem) {
      this.children.forEach(function (galleryItem) {
        galleryItem.deactivate();
      });
      this.activeItem.src = galleryItem.getSrc();
      galleryItem.activate();
    }
  }]);

  return FilterGridSliderChildGallery;
}(_BaseClass3.default);

exports.default = FilterGridSliderChildGallery;

},{"../../global/slider/Slider":100,"../../util/BaseClass":109,"./FilterGridSliderChildGalleryChild":64}],64:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FilterGridSliderChildGalleryChild = function (_BaseClass) {
  _inherits(FilterGridSliderChildGalleryChild, _BaseClass);

  function FilterGridSliderChildGalleryChild(opts) {
    _classCallCheck(this, FilterGridSliderChildGalleryChild);

    return _possibleConstructorReturn(this, (FilterGridSliderChildGalleryChild.__proto__ || Object.getPrototypeOf(FilterGridSliderChildGalleryChild)).call(this, {
      el: opts.el,
      parentEl: null,
      imageSrc: null,
      parent: opts.parent
    }));
  }

  _createClass(FilterGridSliderChildGalleryChild, [{
    key: '_init',
    value: function _init() {
      this._getParentEl();
      this._getSrc();
      this._setupEventHandlers();
    }
  }, {
    key: '_getSrc',
    value: function _getSrc() {
      this.imageSrc = this.el.src;
    }
  }, {
    key: '_getParentEl',
    value: function _getParentEl() {
      this.parentEl = this.el.parentElement;
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._onClick = this._onClick.bind(this);
      this.el.addEventListener('click', this._onClick);
    }
  }, {
    key: '_onClick',
    value: function _onClick() {
      this.parent.activateGalleryItem(this);
    }
  }, {
    key: 'activate',
    value: function activate() {
      this.parentEl.classList.add('active');
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      this.parentEl.classList.remove('active');
    }
  }, {
    key: 'getSrc',
    value: function getSrc() {
      return this.imageSrc;
    }
  }]);

  return FilterGridSliderChildGalleryChild;
}(_BaseClass3.default);

exports.default = FilterGridSliderChildGalleryChild;

},{"../../util/BaseClass":109}],65:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initFilterGrid;

var _FilterGrid = require('./FilterGrid');

var _FilterGrid2 = _interopRequireDefault(_FilterGrid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initFilterGrid() {
  var filterGridEls = document.querySelectorAll('.filter-grid');
  filterGridEls.forEach(function (el) {
    new _FilterGrid2.default({ el: el });
  });
}

},{"./FilterGrid":60}],66:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GatedContent = function (_BaseClass) {
  _inherits(GatedContent, _BaseClass);

  function GatedContent(opts) {
    _classCallCheck(this, GatedContent);

    return _possibleConstructorReturn(this, (GatedContent.__proto__ || Object.getPrototypeOf(GatedContent)).call(this, {
      el: opts.el,
      acceptContainer: null,
      checkbox: null,
      button: null,
      gatedEl: null
    }));
  }

  _createClass(GatedContent, [{
    key: '_init',
    value: function _init() {
      this._setupEl();
      this._setupEventHandlers();
    }
  }, {
    key: '_setupEl',
    value: function _setupEl() {
      this.acceptContainer = this.el.querySelector('.gated-content--accept-container');
      this.checkbox = this.el.querySelector('.gated-content--accept-terms');
      this.button = this.el.querySelector('.gated-content--accept-terms-button');
      this.showGatedButton = this.el.querySelector('.gated-content-show-button');
      this.gatedEl = this.el.querySelector('.gated-content--restricted-container');
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._onCheckboxClicked = this._onCheckboxClicked.bind(this);
      this.checkbox.addEventListener('click', this._onCheckboxClicked);

      if (this.showGatedButton) {
        this._onShowGatedButtonClicked = this._onShowGatedButtonClicked.bind(this);
        this.showGatedButton.addEventListener('click', this._onShowGatedButtonClicked);
      }
    }
  }, {
    key: '_onCheckboxClicked',
    value: function _onCheckboxClicked() {
      if (this.checkbox.checked) {
        this._enableButton();
      } else {
        this._disableButton();
      }
    }
  }, {
    key: '_enableButton',
    value: function _enableButton() {
      this.button.removeAttribute('disabled');
    }
  }, {
    key: '_disableButton',
    value: function _disableButton() {
      this.button.setAttribute('disabled', true);
    }
  }, {
    key: '_onShowGatedButtonClicked',
    value: function _onShowGatedButtonClicked(e) {
      e.preventDefault();
      this._showGatedEl();
    }
  }, {
    key: '_showGatedEl',
    value: function _showGatedEl() {
      this.gatedEl.style.display = 'block';
      this.acceptContainer.style.display = 'none';
    }
  }]);

  return GatedContent;
}(_BaseClass3.default);

exports.default = GatedContent;

},{"../../util/BaseClass":109}],67:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initGatedContent;

var _GatedContent = require('./GatedContent');

var _GatedContent2 = _interopRequireDefault(_GatedContent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initGatedContent() {
  var gatedContentEls = document.querySelectorAll('.gated-content');

  gatedContentEls.forEach(function (el) {
    new _GatedContent2.default({
      el: el
    });
  });
}

},{"./GatedContent":66}],68:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Hero = function (_BaseClass) {
  _inherits(Hero, _BaseClass);

  function Hero(opts) {
    _classCallCheck(this, Hero);

    return _possibleConstructorReturn(this, (Hero.__proto__ || Object.getPrototypeOf(Hero)).call(this, {
      el: opts.el,
      headerEl: null,
      downLink: null,
      dimensions: {}
    }));
  }

  _createClass(Hero, [{
    key: '_init',
    value: function _init() {
      this._getHeader();
      this._getDownLink();
      this._setupEventHandlers();
      this._getDimensions();
    }
  }, {
    key: '_getHeader',
    value: function _getHeader() {
      this.headerEl = this.el.querySelector('.hero-header');
    }
  }, {
    key: '_getDimensions',
    value: function _getDimensions() {
      var rect = this.headerEl.getBoundingClientRect();
      this.dimensions = {
        height: rect.height,
        top: rect.top + window.getScrollY()
      };
    }
  }, {
    key: '_getDownLink',
    value: function _getDownLink() {
      this.downLink = this.el.querySelector('.hero-header-content--down-link');
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      if (this.downLink) {
        this._onDownLinkClick = this._onDownLinkClick.bind(this);
        this.downLink.addEventListener('click', this._onDownLinkClick);
      }
    }
  }, {
    key: '_onDownLinkClick',
    value: function _onDownLinkClick() {
      this._getDimensions();

      window.scrollTo({
        top: this.dimensions.height + this.dimensions.top,
        behavior: 'smooth'
      });
    }
  }]);

  return Hero;
}(_BaseClass3.default);

exports.default = Hero;

},{"../../util/BaseClass":109}],69:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initHero;

var _Hero = require('./Hero');

var _Hero2 = _interopRequireDefault(_Hero);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initHero() {
  var heroEls = document.querySelectorAll('.hero');
  heroEls.forEach(function (el) {
    new _Hero2.default({ el: el });
  });
}

},{"./Hero":68}],70:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var JobSearch = function (_BaseClass) {
	_inherits(JobSearch, _BaseClass);

	function JobSearch(opts) {
		_classCallCheck(this, JobSearch);

		return _possibleConstructorReturn(this, (JobSearch.__proto__ || Object.getPrototypeOf(JobSearch)).call(this, {
			fragContainer: document.getElementById('career-fragment'),
			test: 'test'
		}));
	}

	_createClass(JobSearch, [{
		key: '_init',
		value: function _init() {
			this.getDefaults();
			this.fetchAndRenderFragments();
		}

		// GET & SET default values

	}, {
		key: 'getDefaults',
		value: function getDefaults() {
			var query = decodeURI(window.location.search).replace('?', '').split('&');

			for (var i = 0; i < query.length; i++) {
				var param = query[i].split('=');
				var el = document.getElementById(param[0]);
				el ? el.value = param[1].replace('-', ' ') : '';
			}

			document.getElementById('find-jobs').addEventListener('click', this.fetchAndRenderFragments);
		}

		// GET content fragment data

	}, {
		key: 'fetchAndRenderFragments',
		value: function fetchAndRenderFragments() {
			$.ajax({
				url: '/api/assets/universaltemplate/ab-inbev/Careers/redesign/content-fragment.json?limit=500',
				method: 'GET',
				data: {},
				success: function success(data) {
					var selectedFrags = document.getElementById('loc').value.replace(' ', '-');
					var frags = data.entities;
					var fragHTML = '';

					if (selectedFrags.length > 0) {
						for (var i = 0; i < Object.keys(frags).length; i++) {
							var fragment = frags[i];
							var fragTag = String(fragment.properties.metadata['cq:tags']);

							if (fragTag.includes(selectedFrags)) {
								var props = {};
								var fragProps = fragment.properties.elements;

								for (var _i = 0; _i < Object.keys(fragProps).length; _i++) {
									var prop = Object.keys(fragProps)[_i];
									var propValue = fragProps[prop].value;
									props[prop] = propValue;
								}

								var fragTemplate = '\n\t\t\t\t\t\t\t\t<div class="job-search__fragment">\n\t\t\t\t\t\t\t\t\t<img\n\t\t\t\t\t\t\t\t\t\tclass="job-search__fragment__image--mobile"\n\t\t\t\t\t\t\t\t\t\tsrc="' + props.imagePath + '"\n\t\t\t\t\t\t\t\t\t\tstyle="display: ' + (props.imagePath ? 'auto' : 'none') + ';"\n\t\t\t\t\t\t\t\t\t/>\n\t\t\t\t\t\t\t\t\t<div class="job-search__fragment__text">\n\t\t\t\t\t\t\t\t\t\t<h4 style="display: ' + (props.heading ? 'auto' : 'none') + ';">\n\t\t\t\t\t\t\t\t\t\t\t' + props.heading + '\n\t\t\t\t\t\t\t\t\t\t</h4>\n\t\t\t\t\t\t\t\t\t\t<div style="display:' + (props.description ? 'auto' : 'none') + ';">\n\t\t\t\t\t\t\t\t\t\t\t' + props.description + '\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t<div class="job-search__fragment__buttons">\n\t\t\t\t\t\t\t\t\t\t\t<div\n\t\t\t\t\t\t\t\t\t\t\t\tstyle="display:' + (props.cta1Link ? 'auto' : 'none') + ';"\n\t\t\t\t\t\t\t\t\t\t\t\tclass="button"\n\t\t\t\t\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t\t\t\t\t<div class="component link-button btn-03">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<a\n\t\t\t\t\t\t\t\t\t\t\t\t\t\thref="' + props.cta1Link + '"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tclass="btn btn-generic"\n\t\t\t\t\t\t\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t' + props.cta1Lbl + '\n\t\t\t\t\t\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t<div\n\t\t\t\t\t\t\t\t\t\t\t\tstyle="display:' + (props.cta2Link ? 'auto' : 'none') + ';"\n\t\t\t\t\t\t\t\t\t\t\t\tclass="button"\n\t\t\t\t\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t\t\t\t\t<div class="component link-button btn-01">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<a\n\t\t\t\t\t\t\t\t\t\t\t\t\t\thref="' + props.cta2Link + '"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tclass="btn btn-generic"\n\t\t\t\t\t\t\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t' + props.cta2Lbl + '\n\t\t\t\t\t\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div\n\t\t\t\t\t\t\t\t\t\tclass="job-search__fragment__image--desktop"\n\t\t\t\t\t\t\t\t\t\tstyle="background-image: url(\'' + props.imagePath + '\')"\n\t\t\t\t\t\t\t\t\t></div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t';

								fragHTML += fragTemplate;
							}

							document.getElementById('career-fragment').innerHTML = fragHTML;
						}
					} else {
						document.getElementById('career-fragment').innerHTML = '';
					}
				},
				error: function error(xhr) {
					console.error('error', xhr);
				}
			});
		}
	}]);

	return JobSearch;
}(_BaseClass3.default);

exports.default = JobSearch;

},{"../../util/BaseClass":109}],71:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = initJobSearch;

var _JobSearch = require('./JobSearch');

var _JobSearch2 = _interopRequireDefault(_JobSearch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initJobSearch() {
	var jobSearchEls = document.querySelectorAll('.job-search');

	jobSearchEls.forEach(function (el) {
		new _JobSearch2.default({
			el: el
		});
	});
}

},{"./JobSearch":70}],72:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

var _Map = require('../../global/map/Map');

var _Map2 = _interopRequireDefault(_Map);

var _Accordion = require('../../global/accordion/Accordion');

var _Accordion2 = _interopRequireDefault(_Accordion);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OurLocations = function (_BaseClass) {
  _inherits(OurLocations, _BaseClass);

  function OurLocations(opts) {
    _classCallCheck(this, OurLocations);

    return _possibleConstructorReturn(this, (OurLocations.__proto__ || Object.getPrototypeOf(OurLocations)).call(this, {
      el: opts.el,
      map: null,
      accordion: null
    }));
  }

  _createClass(OurLocations, [{
    key: '_init',
    value: function _init() {
      var _this2 = this;

      this._setupMap().then(function () {
        _this2._setupAccordion();
        _this2._setupEventHandlers();
      });
    }
  }, {
    key: '_setupMap',
    value: function _setupMap() {
      var _this3 = this;

      var mapEl = this.el.querySelector('#our-locations--map');
      if (!mapEl) {
        return;
      }
      this.map = new _Map2.default({
        el: mapEl
      });

      return new Promise(function (resolve, reject) {
        _this3.map.initPromise().then(function () {
          resolve();
        });
      });
    }
  }, {
    key: '_setupAccordion',
    value: function _setupAccordion() {
      var accordionEl = this.el.querySelector('.accordion-container');
      if (!accordionEl) {
        return;
      }
      this.accordion = new _Accordion2.default({
        el: accordionEl
      });
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      var _this4 = this;

      this._onMarkerClick = this._onMarkerClick.bind(this);
      this.map.markerGroups.forEach(function (markerGroup) {
        markerGroup.masterMarker.marker.addListener('click', function () {
          _this4._onMarkerClick(markerGroup.masterMarker);
        });
        markerGroup.childMarkers.forEach(function (marker) {
          marker.marker.addListener('click', function () {
            _this4._onMarkerClick(marker);
          });
        });
      });
    }
  }, {
    key: '_onMarkerClick',
    value: function _onMarkerClick(marker) {
      var accordionSection = this.accordion.getSectionById(marker.masterId);
      accordionSection.open(false);

      requestAnimationFrame(function () {
        if (marker.id) {
          var accordionSectionItem = accordionSection.el.querySelector('#' + marker.id);
          return window.scrollTo({
            top: accordionSectionItem.getBoundingClientRect().top + window.getScrollY(),
            behavior: 'smooth'
          });
        }

        return window.scrollTo({
          top: accordionSection.el.getBoundingClientRect().top + window.getScrollY(),
          behavior: 'smooth'
        });
      });
    }
  }]);

  return OurLocations;
}(_BaseClass3.default);

exports.default = OurLocations;

},{"../../global/accordion/Accordion":84,"../../global/map/Map":90,"../../util/BaseClass":109}],73:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initOurLoacations;

var _OurLocations = require('./OurLocations');

var _OurLocations2 = _interopRequireDefault(_OurLocations);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initOurLoacations() {
  var ourLocationsEls = document.querySelectorAll('.our-locations');
  ourLocationsEls.forEach(function (el) {
    new _OurLocations2.default({
      el: el
    });
  });
}

},{"./OurLocations":72}],74:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DocumentSearchTabs = function (_BaseClass) {
  _inherits(DocumentSearchTabs, _BaseClass);

  function DocumentSearchTabs(opts) {
    _classCallCheck(this, DocumentSearchTabs);

    return _possibleConstructorReturn(this, (DocumentSearchTabs.__proto__ || Object.getPrototypeOf(DocumentSearchTabs)).call(this, {
      el: opts.el,
      activeTab: null,
      documentTypeContainer: null,
      documentTypeInner: null,
      dropdownTrigger: null,
      state: {
        dropdownOpen: false
      }
    }));
  }

  _createClass(DocumentSearchTabs, [{
    key: '_init',
    value: function _init() {
      this._setupEl();
      this._setupEventHandlers();
    }
  }, {
    key: '_setupEl',
    value: function _setupEl() {
      this.documentTypeContainer = this.el.querySelector('.document-search-tabs--document-types-container');

      this.documentTypeInner = this.el.querySelector('.document-search-tabs--document-types');

      this.dropdownTrigger = this.el.querySelector('.document-search-tabs--dropdown-trigger');
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._onDropdownTriggerClick = this._onDropdownTriggerClick.bind(this);
      this.dropdownTrigger.addEventListener('click', this._onDropdownTriggerClick);
    }
  }, {
    key: '_onDropdownTriggerClick',
    value: function _onDropdownTriggerClick(e) {
      if (this.state.dropdownOpen) {
        return this._closeDropdown();
      }

      return this._openDropdown();
    }
  }, {
    key: '_openDropdown',
    value: function _openDropdown() {
      this.documentTypeContainer.classList.add('active');
      var height = this._getDropdownHeight();
      this.documentTypeContainer.style.height = height + 'px';
      this.state.dropdownOpen = true;
    }
  }, {
    key: '_closeDropdown',
    value: function _closeDropdown() {
      this.documentTypeContainer.classList.remove('active');
      this.documentTypeContainer.style.height = '0';
      this.state.dropdownOpen = false;
    }
  }, {
    key: '_getDropdownHeight',
    value: function _getDropdownHeight() {
      return this.documentTypeInner.getBoundingClientRect().height;
    }
  }]);

  return DocumentSearchTabs;
}(_BaseClass3.default);

exports.default = DocumentSearchTabs;

},{"../../util/BaseClass":109}],75:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

var _DocumentSearchTabs = require('./DocumentSearchTabs');

var _DocumentSearchTabs2 = _interopRequireDefault(_DocumentSearchTabs);

var _SearchFilter = require('./SearchFilter');

var _SearchFilter2 = _interopRequireDefault(_SearchFilter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Search = function (_BaseClass) {
  _inherits(Search, _BaseClass);

  function Search(opts) {
    _classCallCheck(this, Search);

    return _possibleConstructorReturn(this, (Search.__proto__ || Object.getPrototypeOf(Search)).call(this, {
      el: opts.el,
      tabs: null,
      filter: null
    }));
  }

  _createClass(Search, [{
    key: '_init',
    value: function _init() {
      this._setupEl();
      this._setupTabs();
      this._setupFilter();
    }
  }, {
    key: '_setupEl',
    value: function _setupEl() {
      this.el.classList.add('js-enabled');
    }
  }, {
    key: '_setupTabs',
    value: function _setupTabs() {
      var tabEl = this.el.querySelector('.document-search-tabs');
      if (!tabEl) {
        return;
      }
      this.tabs = new _DocumentSearchTabs2.default({
        el: tabEl
      });
    }
  }, {
    key: '_setupFilter',
    value: function _setupFilter() {
      var filterEl = this.el.querySelector('.search-filter');
      this.filter = new _SearchFilter2.default({
        el: filterEl
      });
    }
  }]);

  return Search;
}(_BaseClass3.default);

exports.default = Search;

},{"../../util/BaseClass":109,"./DocumentSearchTabs":74,"./SearchFilter":76}],76:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FIN_YEAR_VALUES = ['2'];

var SearchFilter = function (_BaseClass) {
  _inherits(SearchFilter, _BaseClass);

  function SearchFilter(opts) {
    _classCallCheck(this, SearchFilter);

    return _possibleConstructorReturn(this, (SearchFilter.__proto__ || Object.getPrototypeOf(SearchFilter)).call(this, {
      el: opts.el,
      moreContainer: null,
      moreContainerInner: null,
      moreTrigger: null,
      documentType: null,
      releaseDate: null,
      financialYear: null,
      countrySelector: null,
      citySelector: null,
      citySelectorGroups: [],
      state: {
        moreOpened: false,
        relDateShown: true
      }
    }));
  }

  _createClass(SearchFilter, [{
    key: '_init',
    value: function _init() {
      this._setupEl();
      this._setupEventHandlers();
    }
  }, {
    key: '_setupEl',
    value: function _setupEl() {
      this.moreContainer = this.el.querySelector('.search-filter--form-more-container');
      this.moreContainerInner = this.el.querySelector('.search-filter--form-more-container-inner');

      this.moreTrigger = this.el.querySelector('.search-filter--form-more-trigger');

      // Document Search only
      // this.documentType = this.el.querySelector('#doc-search--doc-type');
      // this.releaseDate = this.el.querySelector('#doc-search--rel-date');
      // this.financialYear = this.el.querySelector('#doc-search--fin-year');

      // Careers Search only
      // this.countrySelector = this.el.querySelector('#career--location-country');
      // this.citySelector = this.el.querySelector('#career--location-city');
      // if (this.citySelector) {
      //   const citySelectorGroups = this.citySelector.querySelectorAll('optgroup');
      //   citySelectorGroups.forEach((citySelectorGroup) => {
      //     this.citySelectorGroups.push(citySelectorGroup.cloneNode(true));
      //   });
      // }
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._onMoreClicked = this._onMoreClicked.bind(this);
      this.moreTrigger.addEventListener('click', this._onMoreClicked);

      // if (this.documentType) {
      //   this._onDocumentTypeChanged = this._onDocumentTypeChanged.bind(this);
      //   this.documentType.addEventListener('change', this._onDocumentTypeChanged);
      // }
      //
      // if (this.countrySelector) {
      //   this._onCountryChanged = this._onCountryChanged.bind(this);
      //   this.countrySelector.addEventListener('change', this._onCountryChanged);
      // }
    }
  }, {
    key: '_getMoreHeight',
    value: function _getMoreHeight() {
      return this.moreContainerInner.getBoundingClientRect().height;
    }
  }, {
    key: '_onMoreClicked',
    value: function _onMoreClicked() {
      if (this.state.moreOpened) {
        return this._closeMore();
      }

      return this._openMore();
    }
  }, {
    key: '_openMore',
    value: function _openMore() {
      var height = this._getMoreHeight();
      this.moreContainer.style.height = height + 'px';
      this.moreTrigger.innerText = '- Less';
      this.state.moreOpened = true;
    }
  }, {
    key: '_closeMore',
    value: function _closeMore() {
      this.moreContainer.style.height = '0px';
      this.moreTrigger.innerText = '+ More';
      this.state.moreOpened = false;
    }
  }, {
    key: '_onDocumentTypeChanged',
    value: function _onDocumentTypeChanged(e) {
      var newValue = e.target.value;
      if (FIN_YEAR_VALUES.indexOf(newValue) >= 0 && this.state.relDateShown) {
        this._showFinYear();
      } else if (FIN_YEAR_VALUES.indexOf(newValue) < 0 && !this.state.relDateShown) {
        this._showRelDate();
      }
    }
  }, {
    key: '_showFinYear',
    value: function _showFinYear() {
      this.financialYear.style.display = 'block';
      this.releaseDate.style.display = 'none';
      this.state.relDateShown = false;
    }
  }, {
    key: '_showRelDate',
    value: function _showRelDate() {
      this.financialYear.style.display = 'none';
      this.releaseDate.style.display = 'block';
      this.state.relDateShown = true;
    }
  }, {
    key: '_onCountryChanged',
    value: function _onCountryChanged(e) {
      var _this2 = this;

      var countryVal = e.target.value;
      var cityGroupId = 'country-cities-' + countryVal;
      var firstOption = this.citySelector.firstElementChild.cloneNode(true);

      this.citySelector.innerHTML = '';
      this.citySelector.appendChild(firstOption);

      if (countryVal === "0") {
        return this.citySelectorGroups.forEach(function (citySelectorGroup) {
          _this2.citySelector.appendChild(citySelectorGroup.cloneNode(true));
        });
      }

      return this.citySelectorGroups.forEach(function (citySelectorGroup) {
        if (citySelectorGroup.id === cityGroupId) {
          _this2.citySelector.appendChild(citySelectorGroup.cloneNode(true));
        }
      });
    }
  }]);

  return SearchFilter;
}(_BaseClass3.default);

exports.default = SearchFilter;

},{"../../util/BaseClass":109}],77:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initSearch;

var _Search = require('./Search');

var _Search2 = _interopRequireDefault(_Search);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initSearch() {
  var SearchEls = document.querySelectorAll('.search');

  SearchEls.forEach(function (el) {
    new _Search2.default({
      el: el
    });
  });
}

},{"./Search":75}],78:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SlotTextRotator = function (_BaseClass) {
	_inherits(SlotTextRotator, _BaseClass);

	function SlotTextRotator() {
		_classCallCheck(this, SlotTextRotator);

		return _possibleConstructorReturn(this, (SlotTextRotator.__proto__ || Object.getPrototypeOf(SlotTextRotator)).apply(this, arguments));
	}

	_createClass(SlotTextRotator, [{
		key: '_init',
		value: function _init() {
			var _el = this.el;
			this.slotMachine(_el);
		}
	}, {
		key: 'slotMachine',
		value: function slotMachine(_el) {
			var spinner = $(_el).find('.rotator_spinning');
			var count = $(spinner).children().length;
			var interval = $(spinner).data("interval");

			var shuffled = function shuffled(num) {
				var arr = [];
				for (var _i = 0; _i < num; _i++) {
					arr.push(_i);
				}

				var i = arr.length,
				    j = 0,
				    temp;

				while (i--) {
					j = Math.floor(Math.random() * (i + 1));
					temp = arr[i];
					arr[i] = arr[j];
					arr[j] = temp;
				}

				return arr;
			};

			var randomArray = shuffled(count);

			var iteration = 0;

			window.setInterval(function () {
				var myHeight = parseInt($(spinner).css('line-height'));

				if (iteration < randomArray.length) {
					var random = randomArray[iteration];
					iteration++;
				} else {
					iteration = 0;
				}
				$(spinner).animate({ scrollTop: random * myHeight }, 500);
			}, interval);
		}
	}]);

	return SlotTextRotator;
}(_BaseClass3.default);

exports.default = SlotTextRotator;

},{"../../util/BaseClass":109}],79:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = initHero;

var _SlotTextRotator = require('./SlotTextRotator');

var _SlotTextRotator2 = _interopRequireDefault(_SlotTextRotator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initHero() {
	var els = document.querySelectorAll('.rotator');
	els.forEach(function (el) {
		new _SlotTextRotator2.default({ el: el });
	});
}

},{"./SlotTextRotator":78}],80:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

var _TwitterCardTweet = require('./TwitterCardTweet');

var _TwitterCardTweet2 = _interopRequireDefault(_TwitterCardTweet);

var _TwitterCardTweetContainer = require('./TwitterCardTweetContainer');

var _TwitterCardTweetContainer2 = _interopRequireDefault(_TwitterCardTweetContainer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var INTERVAL = 7000;

var TwitterCard = function (_BaseClass) {
  _inherits(TwitterCard, _BaseClass);

  function TwitterCard(opts) {
    _classCallCheck(this, TwitterCard);

    return _possibleConstructorReturn(this, (TwitterCard.__proto__ || Object.getPrototypeOf(TwitterCard)).call(this, {
      el: opts.el,
      tweetContainer: null,
      tweets: [],
      index: 0,
      loop: null
    }));
  }

  _createClass(TwitterCard, [{
    key: '_init',
    value: function _init() {
      this._getTweetContainer();
      this._getTweets();
      this._getDimensions();
      this._setupEventHandlers();
      this._run();
      this._startCycle();
    }
  }, {
    key: '_getTweetContainer',
    value: function _getTweetContainer() {
      var tweetContainerEl = this.el.querySelector('.twitter-card-home-tweets-container');
      this.tweetContainer = new _TwitterCardTweetContainer2.default({
        el: tweetContainerEl
      });
    }
  }, {
    key: '_getTweets',
    value: function _getTweets() {
      var _this2 = this;

      var tweetEls = this.el.querySelectorAll('.twitter-card-home-tweet');
      tweetEls.forEach(function (el) {
        _this2.tweets.push(new _TwitterCardTweet2.default({
          el: el,
          parent: _this2
        }));
      });
    }
  }, {
    key: '_getDimensions',
    value: function _getDimensions() {
      this.tweetContainer.setHeight(this._getContainerHeight());
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._onResize = this._onResize.bind(this);
      this.resizeHelper.add(this._onResize);
    }
  }, {
    key: '_onResize',
    value: function _onResize() {
      this._getDimensions();
    }
  }, {
    key: '_getContainerHeight',
    value: function _getContainerHeight() {
      var maxHeight = 0;

      this.tweets.forEach(function (tweet) {
        tweet.setHeight('auto');
      });

      this.tweets.forEach(function (tweet) {
        var height = tweet.getHeight();
        if (height > maxHeight) {
          maxHeight = height;
        }
      });

      this.tweets.forEach(function (tweet) {
        tweet.setHeight(maxHeight + 'px');
      });

      return maxHeight;
    }
  }, {
    key: '_run',
    value: function _run() {
      this._setActiveTweet(this.index);
    }
  }, {
    key: '_setActiveTweet',
    value: function _setActiveTweet(index) {
      this.tweets.forEach(function (tweet) {
        tweet.setInactive();
      });

      this.tweets[this.index].setActive();
    }
  }, {
    key: '_startCycle',
    value: function _startCycle() {
      var _this3 = this;

      if (this.loop) {
        return;
      }
      this.loop = setInterval(function () {
        _this3.index++;
        if (_this3.index > _this3.tweets.length - 1) {
          _this3.index = 0;
        }

        _this3._setActiveTweet(_this3.index);
      }, INTERVAL);
    }
  }]);

  return TwitterCard;
}(_BaseClass3.default);

exports.default = TwitterCard;

},{"../../util/BaseClass":109,"./TwitterCardTweet":81,"./TwitterCardTweetContainer":82}],81:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TwitterCardTweet = function (_BaseClass) {
  _inherits(TwitterCardTweet, _BaseClass);

  function TwitterCardTweet(opts) {
    _classCallCheck(this, TwitterCardTweet);

    return _possibleConstructorReturn(this, (TwitterCardTweet.__proto__ || Object.getPrototypeOf(TwitterCardTweet)).call(this, {
      el: opts.el,
      parent: opts.parent,
      href: null
    }));
  }

  _createClass(TwitterCardTweet, [{
    key: '_init',
    value: function _init() {
      this._getHref();
      this._setupEl();
      this._setupEventHandlers();
    }
  }, {
    key: '_getHref',
    value: function _getHref() {
      this.href = this.el.dataset.href;
    }
  }, {
    key: '_setupEl',
    value: function _setupEl() {
      this.el.classList.add('enabled');
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._onClick = this._onClick.bind(this);
      this.el.addEventListener('click', this._onClick);
    }
  }, {
    key: '_onClick',
    value: function _onClick(e) {
      e.preventDefault();
      if (e.target.nodeName === 'A') {
        var _win = window.open(e.target.href);
        _win.focus();
        return false;
      }
      var win = window.open(this.href);
      win.focus();
      return false;
    }
  }, {
    key: 'setHeight',
    value: function setHeight(height) {
      this.el.style.height = height;
    }
  }, {
    key: 'setActive',
    value: function setActive() {
      this.el.classList.add('active');
    }
  }, {
    key: 'setInactive',
    value: function setInactive() {
      this.el.classList.remove('active');
    }
  }, {
    key: 'getHeight',
    value: function getHeight() {
      return this.el.clientHeight;
    }
  }]);

  return TwitterCardTweet;
}(_BaseClass3.default);

exports.default = TwitterCardTweet;

},{"../../util/BaseClass":109}],82:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TwitterCardTweetContainer = function (_BaseClass) {
  _inherits(TwitterCardTweetContainer, _BaseClass);

  function TwitterCardTweetContainer(opts) {
    _classCallCheck(this, TwitterCardTweetContainer);

    return _possibleConstructorReturn(this, (TwitterCardTweetContainer.__proto__ || Object.getPrototypeOf(TwitterCardTweetContainer)).call(this, {
      el: opts.el,
      parent: opts.parent
    }));
  }

  _createClass(TwitterCardTweetContainer, [{
    key: '_init',
    value: function _init() {
      this._setupEl();
    }
  }, {
    key: '_setupEl',
    value: function _setupEl() {
      this.el.style.position = 'relative';
    }
  }, {
    key: 'setHeight',
    value: function setHeight(height) {
      this.el.style.height = height + 'px';
    }
  }]);

  return TwitterCardTweetContainer;
}(_BaseClass3.default);

exports.default = TwitterCardTweetContainer;

},{"../../util/BaseClass":109}],83:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initTwitterCards;

var _TwitterCard = require('./TwitterCard');

var _TwitterCard2 = _interopRequireDefault(_TwitterCard);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initTwitterCards(selector) {
  var twitterCardEls = document.querySelectorAll(selector);
  twitterCardEls.forEach(function (el) {
    var twitterCard = new _TwitterCard2.default({
      el: el
    });
  });
}

},{"./TwitterCard":80}],84:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _AccordionSection = require('./AccordionSection');

var _AccordionSection2 = _interopRequireDefault(_AccordionSection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Accordion = function () {
  function Accordion(opts) {
    _classCallCheck(this, Accordion);

    this.el = opts.el;
    this.sections = [];

    this._init();
  }

  _createClass(Accordion, [{
    key: '_init',
    value: function _init() {
      this._getSections();
    }
  }, {
    key: '_getSections',
    value: function _getSections() {
      var _this = this;

      var sectionEls = this.el.querySelectorAll('.accordion-section');
      sectionEls.forEach(function (el) {
        _this.sections.push(new _AccordionSection2.default({
          el: el,
          parent: _this
        }));
      });
    }
  }, {
    key: 'closeSections',
    value: function closeSections(animate) {
      return Promise.all(this.sections.map(function (section) {
        return section.close(animate);
      }));
    }
  }, {
    key: 'getSectionById',
    value: function getSectionById(id) {
      return this.sections.find(function (section) {
        return id === section.id;
      });
    }
  }]);

  return Accordion;
}();

exports.default = Accordion;

},{"./AccordionSection":85}],85:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AccordionSection = function () {
  function AccordionSection(opts) {
    _classCallCheck(this, AccordionSection);

    this.el = opts.el;
    this.parent = opts.parent;
    this.id = this.el.id;
    this.header = null;
    this.body = null;
    this.bodyInner = null;
    this.state = {
      opened: false
    };

    this._init();
  }

  _createClass(AccordionSection, [{
    key: '_init',
    value: function _init() {
      this._setupEl();
      this._setupEventHandlers();
    }
  }, {
    key: '_setupEl',
    value: function _setupEl() {
      this.header = this.el.querySelector('.accordion-header');
      this.body = this.el.querySelector('.accordion-body');
      this._createInnerBody();
      this._styleEl();
    }
  }, {
    key: '_createInnerBody',
    value: function _createInnerBody() {
      this.bodyInner = document.createElement('div');
      this.bodyInner.classList.add('accordion-body-inner');
      this.bodyInner.innerHTML = this.body.innerHTML;
      this.body.innerHTML = '';
      this.body.appendChild(this.bodyInner);
    }
  }, {
    key: '_styleEl',
    value: function _styleEl() {
      var sh = this.header.style;
      var sb = this.body.style;

      sh.cursor = 'pointer';

      sb.height = 0;
      sb.transition = 'height 0.3s';
      sb.willChange = 'height';
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._onClick = this._onClick.bind(this);
      this.header.addEventListener('click', this._onClick);
    }
  }, {
    key: '_onClick',
    value: function _onClick() {
      if (this.state.opened) {
        return this.close(true);
      }
      return this.open(true);
    }
  }, {
    key: '_openClose',
    value: function _openClose(animate, height) {
      var _this = this;

      return new Promise(function (res, rej) {
        var sb = _this.body.style;
        if (!animate) {
          sb.transition = '';
          res(_this);
        }

        requestAnimationFrame(function () {
          // wait for the element to finish transitioning, then resolve
          var transitionComplete = function transitionComplete(e) {
            e.stopPropagation();
            _this.body.removeEventListener('transitionend', transitionComplete);
            res(height);
          };
          _this.body.addEventListener('transitionend', transitionComplete);

          sb.height = height + 'px';

          if (!animate) {
            requestAnimationFrame(function () {
              sb.transition = 'height 0.3s';
            });
          }
        });
      });
    }
  }, {
    key: 'open',
    value: function open() {
      var _this2 = this;

      var animate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this.parent.closeSections(animate).then(function (closedSections) {
        var newHeight = _this2.bodyInner.getBoundingClientRect().height;
        var headNavHeight = document.querySelector('#head-nav').getBoundingClientRect().height;
        var newScrollPosition = window.getScrollY() + _this2.el.getBoundingClientRect().top - headNavHeight;
        // if the newScrollPos is outside of the current viewport...
        if (newScrollPosition < window.getScrollY() + headNavHeight) {
          // ...smooth scroll to newPos
          requestAnimationFrame(function () {
            window.scrollTo({
              top: newScrollPosition,
              behavior: 'instant'
            });
          });
        }
        _this2._openClose(animate, newHeight).then(function (height) {
          _this2.el.classList.add('active');
          _this2.state.opened = true;
        });
      });
    }
  }, {
    key: 'close',
    value: function close() {
      var _this3 = this;

      var animate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      return new Promise(function (res, rej) {
        // if it's not open, just resolve
        if (!_this3.state.opened) return res(_this3);
        // else 
        _this3._openClose(animate, 0).then(function (height) {
          _this3.el.classList.remove('active');
          _this3.state.opened = false;
          res(_this3);
        });
      });
    }
  }]);

  return AccordionSection;
}();

exports.default = AccordionSection;

},{}],86:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initAccordion;

var _Accordion = require('./Accordion');

var _Accordion2 = _interopRequireDefault(_Accordion);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initAccordion() {
  var accordionEls = document.querySelectorAll('.accordion-container');
  accordionEls.forEach(function (el) {
    new _Accordion2.default({ el: el });
  });
}

},{"./Accordion":84}],87:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _CookieHelper = require('../../util/CookieHelper');

var _CookieHelper2 = _interopRequireDefault(_CookieHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CookiePolicy = function () {
  function CookiePolicy(opts) {
    _classCallCheck(this, CookiePolicy);

    this.el = opts.el;
    this.button = this.el.querySelector('.cookie-policy-popup--accept');

    this._init();
  }

  _createClass(CookiePolicy, [{
    key: '_init',
    value: function _init() {
      this._checkShowCookiePolicy();
      this._setupEventHandlers();
    }
  }, {
    key: '_checkShowCookiePolicy',
    value: function _checkShowCookiePolicy() {
      if (!_CookieHelper2.default.readCookie('cp-acc')) {
        this.el.classList.add('active');
      }
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._onClick = this._onClick.bind(this);
      this.button.addEventListener('click', this._onClick);
    }
  }, {
    key: '_onClick',
    value: function _onClick() {
      _CookieHelper2.default.createCookie('cp-acc', true);
      this.el.classList.remove('active');
    }
  }]);

  return CookiePolicy;
}();

exports.default = CookiePolicy;

},{"../../util/CookieHelper":110}],88:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initCookiePolicy;

var _CookiePolicy = require('./CookiePolicy');

var _CookiePolicy2 = _interopRequireDefault(_CookiePolicy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initCookiePolicy() {
  var cookiePolicyEl = document.querySelector('.cookie-policy-popup');
  if (cookiePolicyEl) {
    new _CookiePolicy2.default({
      el: cookiePolicyEl
    });
  }
}

},{"./CookiePolicy":87}],89:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initGAEvents;
function initGAEvents() {
  var _this = this;

  if (typeof ga !== "undefined") {
    var gaEventEls = document.querySelectorAll('.ga-event');

    gaEventEls.forEach(function (el) {
      var data = el.dataset;
      var gaFieldsObject = {
        hitType: 'event',
        eventCategory: data.gaCategory,
        eventAction: data.gaAction,
        eventLabel: data.gaLabel || null,
        eventValue: data.gaValue || null
      };

      el.addEventListener('click', sendGAEvent.bind(_this));

      function sendGAEvent() {
        ga('send', gaFieldsObject);
      }
    });
  }
}

},{}],90:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

var _GoogleMapsApi = require('../../util/GoogleMapsApi');

var _GoogleMapsApi2 = _interopRequireDefault(_GoogleMapsApi);

var _MapMarkerGroup = require('./MapMarkerGroup');

var _MapMarkerGroup2 = _interopRequireDefault(_MapMarkerGroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Map = function (_BaseClass) {
  _inherits(Map, _BaseClass);

  function Map(opts) {
    _classCallCheck(this, Map);

    return _possibleConstructorReturn(this, (Map.__proto__ || Object.getPrototypeOf(Map)).call(this, {
      el: opts.el,
      map: null,
      mapApi: null,
      data: {},
      markerGroups: [],
      state: {
        masterShown: false
      }
    }));
  }

  _createClass(Map, [{
    key: '_init',
    value: function _init() {}
  }, {
    key: 'initPromise',
    value: function initPromise() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2._setupMap().then(function () {
          _this2._setupMarkerGroups();
          _this2._setupEventHandlers();
          _this2._placeMarkers();
          resolve();
        });
      });
    }
  }, {
    key: '_setupMap',
    value: function _setupMap() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.mapApi = new _GoogleMapsApi2.default();
        _this3.mapApi.load().then(function () {
          var center = { lat: 24.72146802261679, lng: 1.8283331403378043 };
          _this3.map = new google.maps.Map(_this3.el, {
            zoom: 2.50,
            center: center
          });
          _this3.data = JSON.parse(_this3.el.dataset.mapData);
          resolve();
        });
      });
    }
  }, {
    key: '_setupMarkerGroups',
    value: function _setupMarkerGroups() {
      var _this4 = this;

      this.data.markerGroups.forEach(function (markerGroup) {
        _this4.markerGroups.push(new _MapMarkerGroup2.default({
          id: markerGroup.masterMarker.id,
          data: markerGroup,
          animationData: _this4.data.animationData,
          map: _this4.map
        }));
      });
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._onZoom = this._onZoom.bind(this);
      this.map.addListener('zoom_changed', this._onZoom);
    }
  }, {
    key: '_onZoom',
    value: function _onZoom() {
      this._placeMarkers();
    }
  }, {
    key: '_placeMarkers',
    value: function _placeMarkers() {
      var _this5 = this;

      if (this.state.masterShown && this.map.getZoom() >= 4.0) {
        this.markerGroups.forEach(function (markerGroup) {
          _this5.state.masterShown = false;
          return markerGroup.displayChildren();
        });
      } else if (!this.state.masterShown && this.map.getZoom() < 4.0) {
        this.markerGroups.forEach(function (markerGroup) {
          _this5.state.masterShown = true;
          return markerGroup.displayMaster();
        });
      }
    }
  }]);

  return Map;
}(_BaseClass3.default);

exports.default = Map;

},{"../../util/BaseClass":109,"../../util/GoogleMapsApi":111,"./MapMarkerGroup":92}],91:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _MapPopup = require('./MapPopup');

var _MapPopup2 = _interopRequireDefault(_MapPopup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MARKER_PATH = 'M 12, 12 m -9, 0 a 9,9 0 1,0 18,0 a 9,9 0 1,0 -18,0';
var MARKER_STROKE = '#FFF';
var MARKER_STROKE_WEIGHT = 2;

var MapMarker = function () {
  function MapMarker(opts) {
    _classCallCheck(this, MapMarker);

    this.marker = null;
    this.popup = null;
    this.data = opts.data;
    this.colorHex = opts.colorHex;
    this.masterMarker = opts.masterMarker;
    this.map = opts.map;
    this.masterId = opts.masterId;
    this.id = opts.id;
    if (this.masterMarker) {
      this.animationData = {
        currentTime: 0,
        startTime: 0,
        beginningLngLat: {
          lng: this.masterMarker.data.lng,
          lat: this.masterMarker.data.lat
        },
        currentLngLat: {
          lng: this.masterMarker.data.lng,
          lat: this.masterMarker.data.lat
        },
        duration: opts.animationData.duration
      };
    }

    this._init();
  }

  _createClass(MapMarker, [{
    key: '_init',
    value: function _init() {
      this._createPopup();
      this._createMarker();
      this._setupEventHandlers();
    }
  }, {
    key: '_createPopup',
    value: function _createPopup() {
      this.popup = new _MapPopup2.default({
        content: this.data.name
      }).popup;
    }
  }, {
    key: '_createMarker',
    value: function _createMarker() {
      var icon = {
        path: MARKER_PATH,
        fillColor: this.colorHex,
        fillOpacity: 1,
        scale: 1,
        strokeColor: MARKER_STROKE,
        strokeWeight: MARKER_STROKE_WEIGHT
      };

      this.marker = new google.maps.Marker({
        map: this.map,
        position: new google.maps.LatLng(this.data.lat, this.data.lng),
        icon: icon
      });
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._onMouseOver = this._onMouseOver.bind(this);
      this.marker.addListener('mouseover', this._onMouseOver);

      this._onMouseOut = this._onMouseOut.bind(this);
      this.marker.addListener('mouseout', this._onMouseOut);
    }
  }, {
    key: '_onMouseOver',
    value: function _onMouseOver(e) {
      this.popup.open(this.map, this.marker);
    }
  }, {
    key: '_onMouseOut',
    value: function _onMouseOut(e) {
      this.popup.close(this.map, this.marker);
    }
  }, {
    key: '_animate',
    value: function _animate(dLng, dLat) {
      var _this = this;

      requestAnimationFrame(function () {
        var a = _this.animationData;
        a.currentTime = Date.now();
        var deltaT = a.currentTime - a.startTime;
        var t = Math.min(deltaT / a.duration, 1);

        // Cubic ease
        var ease = t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

        a.currentLngLat.lng = a.beginningLngLat.lng + dLng * ease;
        a.currentLngLat.lat = a.beginningLngLat.lat + dLat * ease;
        _this.marker.setPosition(new google.maps.LatLng(a.currentLngLat.lat, a.currentLngLat.lng));

        if (t < 1) {
          _this._animate(dLng, dLat);
        }
      });
    }
  }, {
    key: 'beginAnimate',
    value: function beginAnimate(lng, lat) {
      var _this2 = this;

      requestAnimationFrame(function () {
        var a = _this2.animationData;
        a.currentTime = a.startTime = Date.now();
        a.beginningLngLat = {
          lng: a.currentLngLat.lng,
          lat: a.currentLngLat.lat
        };
        var dLng = lng - a.currentLngLat.lng;
        var dLat = lat - a.currentLngLat.lat;
        _this2._animate(dLng, dLat);
      });
    }
  }]);

  return MapMarker;
}();

exports.default = MapMarker;

},{"./MapPopup":93}],92:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

var _MapMarker = require('./MapMarker');

var _MapMarker2 = _interopRequireDefault(_MapMarker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MapMarkerGroup = function (_BaseClass) {
  _inherits(MapMarkerGroup, _BaseClass);

  function MapMarkerGroup(opts) {
    _classCallCheck(this, MapMarkerGroup);

    return _possibleConstructorReturn(this, (MapMarkerGroup.__proto__ || Object.getPrototypeOf(MapMarkerGroup)).call(this, {
      data: opts.data,
      markerGraphic: null,
      animationData: opts.animationData,
      map: opts.map,
      masterMarker: null,
      childMarkers: []
    }));
  }

  _createClass(MapMarkerGroup, [{
    key: '_init',
    value: function _init() {
      this._createMarkers();
    }
  }, {
    key: '_createMarkers',
    value: function _createMarkers() {
      this._createMasterMarker();
      this._createChildMarkers();
    }
  }, {
    key: '_createMasterMarker',
    value: function _createMasterMarker() {
      this.masterMarker = new _MapMarker2.default({
        data: this.data.masterMarker,
        colorHex: this.data.colorHex,
        masterMarker: this.masterMarker,
        map: this.map,
        masterId: this.data.masterMarker.id
      });
    }
  }, {
    key: '_createChildMarkers',
    value: function _createChildMarkers() {
      var _this2 = this;

      this.data.cards.forEach(function (childMarker) {
        _this2.childMarkers.push(new _MapMarker2.default({
          data: childMarker,
          colorHex: _this2.data.colorHex,
          animationData: _this2.animationData,
          masterMarker: _this2.masterMarker,
          map: _this2.map,
          masterId: _this2.data.masterMarker.id,
          id: childMarker.id
        }));
      });
    }
  }, {
    key: 'displayChildren',
    value: function displayChildren() {
      var _this3 = this;

      this.masterMarker.marker.setMap(null);
      this.childMarkers.forEach(function (childMarker) {
        childMarker.marker.setMap(_this3.map);
        childMarker.beginAnimate(childMarker.data.lng, childMarker.data.lat);
      });
    }
  }, {
    key: 'displayMaster',
    value: function displayMaster() {
      var _this4 = this;

      this.childMarkers.forEach(function (childMarker) {
        childMarker.beginAnimate(_this4.masterMarker.data.lng, _this4.masterMarker.data.lat);
      });
      setTimeout(function () {
        _this4.childMarkers.forEach(function (childMarker) {
          childMarker.marker.setMap(null);
        });
        _this4.masterMarker.marker.setMap(_this4.map);
      }, this.animationData.duration);
    }
  }]);

  return MapMarkerGroup;
}(_BaseClass3.default);

exports.default = MapMarkerGroup;

},{"../../util/BaseClass":109,"./MapMarker":91}],93:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapPopup = function MapPopup(opts) {
  _classCallCheck(this, MapPopup);

  this.content = opts.content;
  this.popup = new google.maps.InfoWindow({
    content: this.content
  });
};

exports.default = MapPopup;

},{}],94:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

var _NavMenu = require('./NavMenu');

var _NavMenu2 = _interopRequireDefault(_NavMenu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HeadNav = function (_BaseClass) {
  _inherits(HeadNav, _BaseClass);

  function HeadNav(opts) {
    _classCallCheck(this, HeadNav);

    return _possibleConstructorReturn(this, (HeadNav.__proto__ || Object.getPrototypeOf(HeadNav)).call(this, {
      el: opts.el,
      height: null,
      searchHeight: null,
      prevScrollY: 0,
      scrollStreak: 0,
      top: false,
      fixed: false,
      static: false,
      staticPosY: 0,
      searchExpandedOpen: false,
      mobileNavOffset: null,
      mobileButtonOpen: null,
      mobileButtonClose: null,
      searchButton: null,
      searchExpanded: null,
      mainLinks: []
    }));
  }

  _createClass(HeadNav, [{
    key: '_init',
    value: function _init() {
      this._setupEl();
      this._getDimensions();
      this._createMainLinks();
      this._setMainLinkPosition();
      this._setupEventHandlers();
      this._onScroll();
    }
  }, {
    key: '_getDimensions',
    value: function _getDimensions() {
      var navRect = this.el.getBoundingClientRect();
      this.height = navRect.height;

      var mobileNavRect = this.mobileNav.getBoundingClientRect();
      this.mobileNavOffset = mobileNavRect.width;

      var searchRect = this.searchExpanded.getBoundingClientRect();
      this.searchHeight = navRect.height;
    }
  }, {
    key: '_setMainLinkPosition',
    value: function _setMainLinkPosition() {
      if (window.innerWidth < this.breakpoints.desktop) {
        this.mobileNav.style.right = '-' + this.mobileNavOffset + 'px';
      } else {
        this.mobileNav.style.right = 'auto';
      }
    }
  }, {
    key: '_setupEl',
    value: function _setupEl() {
      this.mobileNav = this.el.querySelector('.main-link-container');
      this.mobileButtonOpen = this.el.querySelector('.mobile-menu-button');
      this.mobileButtonClose = this.el.querySelector('.mobile-menu-button-close');
      this.searchButton = this.el.querySelector('.utility-link--search');
      this.searchExpanded = this.el.querySelector('#utility-link--search-expanded');
      this.searchExpanded.classList.add('enabled');
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._onClickMobileButtonOpen = this._onClickMobileButtonOpen.bind(this);
      this.mobileButtonOpen.addEventListener('click', this._onClickMobileButtonOpen);

      this._onClickMobileButtonClose = this._onClickMobileButtonClose.bind(this);
      this.mobileButtonClose.addEventListener('click', this._onClickMobileButtonClose);

      this._onClickSearchButton = this._onClickSearchButton.bind(this);
      this.searchButton.addEventListener('click', this._onClickSearchButton);

      this._onScroll = this._onScroll.bind(this);
      this.scrollHelper.add(this._onScroll);

      this._onResize = this._onResize.bind(this);
      this.resizeHelper.add(this._onResize);
    }
  }, {
    key: '_onClickMobileButtonOpen',
    value: function _onClickMobileButtonOpen(e) {
      e.preventDefault();
      this.el.classList.add('mobile-menu-open');
    }
  }, {
    key: '_onClickMobileButtonClose',
    value: function _onClickMobileButtonClose(e) {
      e.preventDefault();
      this.el.classList.remove('mobile-menu-open');
    }
  }, {
    key: '_onClickSearchButton',
    value: function _onClickSearchButton(e) {
      e.preventDefault();
      if (this.searchExpandedOpen) {
        return this._closeSearchExpanded();
      }
      return this._openSearchExpanded();
    }
  }, {
    key: '_openSearchExpanded',
    value: function _openSearchExpanded() {
      this.searchExpandedOpen = true;
      this.searchButton.classList.add('active');
      this.searchExpanded.classList.add('active');
    }
  }, {
    key: '_closeSearchExpanded',
    value: function _closeSearchExpanded() {
      var _this2 = this;

      var animate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      if (!animate) {
        this.searchExpanded.classList.add('no-animate');
      }

      requestAnimationFrame(function () {
        _this2.searchExpandedOpen = false;
        _this2.searchButton.classList.remove('active');
        _this2.searchExpanded.classList.remove('active');
        requestAnimationFrame(function () {
          if (!animate) {
            _this2.searchExpanded.classList.remove('no-animate');
          }
        });
      });
    }
  }, {
    key: '_onScroll',
    value: function _onScroll(e) {
      if (window.innerWidth < this.breakpoints.desktop) {
        return;
      }

      var scrollY = window.getScrollY();

      this._getScrollStreak(scrollY);
      this._checkState(scrollY);

      this.prevScrollY = scrollY;
    }
  }, {
    key: '_getScrollStreak',
    value: function _getScrollStreak(scrollY) {
      var scrollDiff = this.prevScrollY - scrollY;

      if (scrollDiff >= 0 && this.scrollStreak >= 0) {
        this.scrollStreak += scrollDiff;
      } else if (scrollDiff <= 0 && this.scrollStreak <= 0) {
        this.scrollStreak += scrollDiff;
      } else {
        this.scrollStreak = 0;
      }
    }
  }, {
    key: '_checkTop',
    value: function _checkTop(scrollY) {
      if (!this.fixed && !this.static && scrollY <= this.height) {
        this.top = true;
        this.el.classList.add('top');
      } else if (this.fixed && scrollY <= 0) {
        this.top = true;
        this.el.classList.add('top');
      } else {
        this.top = false;
        this.el.classList.remove('top');
      }
    }
  }, {
    key: '_checkState',
    value: function _checkState(scrollY) {
      if (!this.fixed) {
        this._checkUnfixedState(scrollY);
      } else {
        this._checkFixedState(scrollY);
      }
    }
  }, {
    key: '_checkUnfixedState',
    value: function _checkUnfixedState(scrollY) {
      var staticTolerance = 0;

      if (!this.static) {
        if (this.scrollStreak > staticTolerance && scrollY > 0) {
          this._staticNavbar(scrollY);
        }

        if (this.searchExpandedOpen && scrollY > this.staticPosY + this.height + this.searchHeight) {
          this._closeSearchExpanded(false);
        }
      } else {
        if (scrollY <= this.staticPosY) {
          this._fixNavbarToTop(scrollY);
        } else if (scrollY > this.staticPosY + this.height) {
          this._unstaticNavbar(scrollY);
        }
      }
    }
  }, {
    key: '_checkFixedState',
    value: function _checkFixedState(scrollY) {
      if (!this.static && this.scrollStreak < 0) {
        this._staticFixedNavbar(scrollY);
      }
    }
  }, {
    key: '_fixNavbarToTop',
    value: function _fixNavbarToTop() {
      this.fixed = true;
      this.static = false;
      this.el.classList.add('fixed');
      this.el.classList.remove('static');
      this.el.style.top = '';
    }
  }, {
    key: '_staticNavbar',
    value: function _staticNavbar(scrollY) {
      this.static = true;
      this.staticPosY = Math.max(0, scrollY - this.height);
      this.el.style.top = this.staticPosY + 'px';
      this.el.classList.add('static');
    }
  }, {
    key: '_unstaticNavbar',
    value: function _unstaticNavbar() {
      this.static = false;
    }
  }, {
    key: '_staticFixedNavbar',
    value: function _staticFixedNavbar(scrollY) {
      this.static = true;
      this.fixed = false;
      this.staticPosY = Math.max(0, scrollY);
      this.el.style.top = this.staticPosY + 'px';
      this.el.classList.remove('fixed');
      this.el.classList.add('static');
    }
  }, {
    key: '_onResize',
    value: function _onResize() {
      if (window.innerWidth < this.breakpoints.desktop) {
        this.el.style.top = '';
      }
      this._getDimensions();
      this._setMainLinkPosition();
      this._onScroll();
    }
  }, {
    key: '_createMainLinks',
    value: function _createMainLinks() {
      var mainLinkMenu = this.el.querySelector('.link-container');
      var mainLinkList = mainLinkMenu.querySelector('.link-list');
      if (!mainLinkMenu || !mainLinkList) {
        return;
      }
      new _NavMenu2.default({
        el: mainLinkMenu,
        mainContainer: mainLinkList
      });
    }
  }, {
    key: 'getHeight',
    value: function getHeight() {
      return this.height;
    }
  }]);

  return HeadNav;
}(_BaseClass3.default);

exports.default = HeadNav;

},{"../../util/BaseClass":109,"./NavMenu":96}],95:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

var _NavMenu = require('./NavMenu');

var _NavMenu2 = _interopRequireDefault(_NavMenu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NavLink = function (_BaseClass) {
  _inherits(NavLink, _BaseClass);

  function NavLink(opt) {
    _classCallCheck(this, NavLink);

    return _possibleConstructorReturn(this, (NavLink.__proto__ || Object.getPrototypeOf(NavLink)).call(this, {
      container: opt.container,
      link: null,
      parent: opt.parent,
      submenu: null,
      active: false
    }));
  }

  _createClass(NavLink, [{
    key: '_init',
    value: function _init() {
      this.link = this._createLink();
      this.submenu = this._getSubMenu();
      this._setupEventListeners();
    }
  }, {
    key: '_createLink',
    value: function _createLink() {
      return this.container.querySelector('.nav-link');
    }
  }, {
    key: '_setupEventListeners',
    value: function _setupEventListeners() {
      this._onClick = this._onClick.bind(this);
      this.link.addEventListener('click', this._onClick);

      if (this.submenu) {
        this._onMouseEnter = this._onMouseEnter.bind(this);
        this.container.addEventListener('mouseenter', this._onMouseEnter);
        this._onMouseLeave = this._onMouseLeave.bind(this);
        this.container.addEventListener('mouseleave', this._onMouseLeave);
      }
    }
  }, {
    key: '_getSubMenu',
    value: function _getSubMenu() {
      var subMenuEl = [].slice.call(this.container.children).find(function (child) {
        return child.classList.contains('link-container');
      });

      if (!subMenuEl) {
        return null;
      }

      this.link.classList.add('has-submenu');

      return new _NavMenu2.default({
        el: subMenuEl,
        mainContainer: this.parent.mainContainer
      });
    }
  }, {
    key: '_onClick',
    value: function _onClick(e) {
      if (!this.submenu || window.innerWidth > this.breakpoints.desktop) {
        return true;
      }

      e.preventDefault();
      this.open();
    }
  }, {
    key: '_onMouseEnter',
    value: function _onMouseEnter() {
      if (window.innerWidth > this.breakpoints.desktop) {
        this.open();
      }
    }
  }, {
    key: '_onMouseLeave',
    value: function _onMouseLeave() {
      if (window.innerWidth > this.breakpoints.desktop) {
        this.close();
      }
    }
  }, {
    key: 'open',
    value: function open() {
      this.active = true;
      if (!this.submenu) {
        this.link.classList.add('active');
        return true;
      }
      this.parent.closeMenus();
      this.submenu.open();
      this.link.classList.add('active');
    }
  }, {
    key: 'close',
    value: function close() {
      if (!this.submenu) {
        this.link.classList.remove('active');
        return true;
      }
      if (this.active) {
        this.submenu.close();
        this.link.classList.remove('active');
      }
    }
  }]);

  return NavLink;
}(_BaseClass3.default);

exports.default = NavLink;

},{"../../util/BaseClass":109,"./NavMenu":96}],96:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

var _NavLink = require('./NavLink');

var _NavLink2 = _interopRequireDefault(_NavLink);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NavMenu = function (_BaseClass) {
  _inherits(NavMenu, _BaseClass);

  function NavMenu(opts) {
    _classCallCheck(this, NavMenu);

    return _possibleConstructorReturn(this, (NavMenu.__proto__ || Object.getPrototypeOf(NavMenu)).call(this, {
      el: opts.el,
      linkListEl: null,
      linkContainerEl: null,
      mainContainer: opts.mainContainer,
      closeButton: null,
      links: [],
      active: false,
      dimensions: null
    }));
  }

  _createClass(NavMenu, [{
    key: '_init',
    value: function _init() {
      this.linkListEl = this.el.querySelector('.link-list');
      this.linkContainerEl = this.linkListEl.parentElement;
      this._createLinks();
      this._createButtons();
      this._getDimensions();
      this._setupEventHandlers();
      this._onResize();
    }
  }, {
    key: '_createLinks',
    value: function _createLinks() {
      var _this2 = this;

      var linkList = this.el.querySelector('.link-list');
      var children = [].slice.call(linkList.children);
      if (!children) {
        return null;
      }

      var childLinkContainers = children.filter(function (child) {
        return child.classList.contains('link-item');
      });

      childLinkContainers.forEach(function (container) {
        _this2.links.push(new _NavLink2.default({
          container: container,
          parent: _this2
        }));
      });
    }
  }, {
    key: '_createButtons',
    value: function _createButtons() {
      this.closeButton = this.el.querySelector('.nav-back');
      this.close = this.close.bind(this);
      this.closeButton.addEventListener('click', this.close);
    }
  }, {
    key: '_getDimensions',
    value: function _getDimensions(force) {
      if (!this.dimensions || force) {
        var rect = this.linkListEl.getBoundingClientRect();
        this.dimensions = {
          windowHeight: window.innerHeight,
          height: rect.height
        };
      }
      return this.dimensions;
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._onResize = this._onResize.bind(this);
      this.resizeHelper.add(this._onResize);
      // this._preventScrolling = this._preventScrolling.bind(this);
      // this.linkListEl.addEventListener('wheel', this._preventScrolling);
      // this.linkListEl.addEventListener("touchmove" , this._preventScrolling);
    }
  }, {
    key: '_onResize',
    value: function _onResize() {
      var d = this._getDimensions(true);
      if (d.height > d.windowHeight) {
        return this.linkContainerEl.style.overflowY = 'scroll';
      }

      return this.linkContainerEl.style.overflowY = '';
    }
  }, {
    key: '_preventScrolling',
    value: function _preventScrolling(e) {
      var d = this._getDimensions();
      console.log(this.linkListEl, d);
      if (d.height <= d.windowHeight) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }, {
    key: 'open',
    value: function open() {
      if (this.active) {
        return;
      };
      this.active = true;
      this.el.classList.add('active');
      if (window.innerWidth < this.breakpoints.desktop) {
        var currentTransform = this.mainContainer.style.transform;
        if (currentTransform) {
          currentTransform = parseInt(currentTransform.replace('translateX(', '').replace(')', ''));
        } else {
          currentTransform = 0;
        }
        var newTransform = currentTransform - 100;
        this.mainContainer.style.transform = 'translateX(' + newTransform + '%)';
      }
    }
  }, {
    key: 'close',
    value: function close() {
      if (!this.active) {
        return;
      };
      this.active = false;

      this.el.classList.remove('active');
      if (window.innerWidth < this.breakpoints.desktop) {
        var currentTransform = this.mainContainer.style.transform;
        if (currentTransform) {
          currentTransform = parseInt(currentTransform.replace('translateX(', '').replace(')', ''));
        } else {
          currentTransform = 0;
        }
        var newTransform = currentTransform + 100;
        this.mainContainer.style.transform = 'translateX(' + newTransform + '%)';
      }
    }
  }, {
    key: 'closeMenus',
    value: function closeMenus() {
      this.links.forEach(function (link) {
        link.close();
      });
    }
  }]);

  return NavMenu;
}(_BaseClass3.default);

exports.default = NavMenu;

},{"../../util/BaseClass":109,"./NavLink":95}],97:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initSemiSticky;

var _semiSticky = require('./semiSticky');

var _semiSticky2 = _interopRequireDefault(_semiSticky);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initSemiSticky() {
  var semiStickyEls = document.querySelectorAll('.semi-sticky');
  semiStickyEls.forEach(function (el) {
    new _semiSticky2.default({ el: el });
  });
}

},{"./semiSticky":98}],98:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TEMPLATE_SEMISTICKY_INTERNAL = '\n  <div class="semi-sticky--internal"></div>\n';

var HEADER_HEIGHT = 88;

var SemiSticky = function (_BaseClass) {
  _inherits(SemiSticky, _BaseClass);

  function SemiSticky(opts) {
    _classCallCheck(this, SemiSticky);

    return _possibleConstructorReturn(this, (SemiSticky.__proto__ || Object.getPrototypeOf(SemiSticky)).call(this, {
      el: opts.el,
      container: null,
      internalEl: null,
      dimensions: {},
      state: {
        top: false,
        bottom: false,
        headerTransitioning: false,
        headerShown: false
      }
    }));
  }

  _createClass(SemiSticky, [{
    key: '_init',
    value: function _init() {
      this._setupEl();
      this._getDimensions();
      this._setInternalDimensions();
      this._checkBreakpoint();
      this._setupEventHandlers();
    }
  }, {
    key: '_setupEl',
    value: function _setupEl() {
      var _this2 = this;

      this.container = this.el.parentElement;

      var tempEl = document.createElement('div');
      tempEl.innerHTML = TEMPLATE_SEMISTICKY_INTERNAL.trim();
      this.internalEl = tempEl.firstChild;

      var elStyle = this.el.style;
      elStyle.height = '100%';

      [].slice.call(this.el.children).forEach(function (child) {
        _this2.internalEl.appendChild(child);
      });

      this.el.appendChild(this.internalEl);
    }
  }, {
    key: '_getDimensions',
    value: function _getDimensions() {
      var rect = this.el.getBoundingClientRect();
      var internalRect = this.internalEl.getBoundingClientRect();
      var containerRect = this.container.getBoundingClientRect();

      var currentScrollY = window.getScrollY();
      this.dimensions = {
        window: {
          height: window.innerHeight,
          width: window.innerWidth
        },
        top: rect.top + currentScrollY,
        bottom: rect.top + currentScrollY + rect.height,
        width: rect.width,
        height: rect.height,
        internalEl: {
          top: internalRect.top + currentScrollY,
          bottom: internalRect.top + currentScrollY + internalRect.height,
          height: internalRect.height
        },
        container: {
          height: containerRect.height
        }
      };

      this.dimensions.anchor = 'top';
      if (this.dimensions.window.height < this.dimensions.internalEl.height) {
        this.dimensions.anchor = 'bottom';
      }
    }
  }, {
    key: '_setInternalDimensions',
    value: function _setInternalDimensions() {
      var c = this.dimensions.container;
      var i = this.dimensions.internalEl;

      if (c.height < i.height) {
        this.container.style.height = i.height + 10 + 'px';
      }

      var s = this.internalEl.style;
      s.top = HEADER_HEIGHT + 'px';
      s.width = this.dimensions.width + 'px';
      s.backfaceVisibility = 'hidden';
    }
  }, {
    key: '_checkBreakpoint',
    value: function _checkBreakpoint() {
      if (this.dimensions.window.width < this.breakpoints.desktop) {
        this._resetPosition();
      }
    }
  }, {
    key: '_resetPosition',
    value: function _resetPosition() {
      var style = this.internalEl.style;
      style.top = 'inherit';
      style.width = 'inherit';
      style.backfaceVisibility = 'inherit';
      style.position = 'inherit';
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._onScroll = this._onScroll.bind(this);
      this.scrollHelper.add(this._onScroll);

      this._onResize = this._onResize.bind(this);
      this.resizeHelper.add(this._onResize);
    }
  }, {
    key: '_onScroll',
    value: function _onScroll() {
      if (this.dimensions.window.width < this.breakpoints.desktop) {
        return;
      }
      var y = this.scrollHelper.scrollY;
      this._getScrollStreak(y);
      this.prevScrollY = y;
      var s = this.state;
      var d = this.dimensions;

      if (d.window.height >= d.internalEl.height) {
        return this._fitScroll(y, s, d);
      }
      return this._overflowScroll(y, s, d);
    }
  }, {
    key: '_fitScroll',
    value: function _fitScroll(y, s, d) {
      if (s.headerTransitioning) {
        if (y < d.internalEl.top - HEADER_HEIGHT) {
          s.headerShown = true;
          s.headerTransitioning = false;
          return this._stickInternal(HEADER_HEIGHT);
        }

        if (y > d.internalEl.top) {
          s.headerShown = false;
          s.headerTransitioning = false;
          return this._stickInternal(0);
        }
      } else {
        if (s.top) {
          if (y > d.bottom - d.internalEl.height) {
            s.bottom = true;
            return this._staticAtPosition(d.height - d.internalEl.height);
          }

          if (s.headerShown) {
            if (y < d.top - HEADER_HEIGHT) {
              s.headerShown = false;
              return this._staticAtPosition(0);
            }

            if (this.scrollStreak < 0) {
              s.headerTransitioning = true;
              s.headerShown = false;
              return this._staticAtPosition(y - d.top + HEADER_HEIGHT);
            }
          }

          if (!s.headerShown) {
            if (this.scrollStreak > 0) {
              s.headerTransitioning = true;
              return this._staticAtPosition(y - d.top);
            }
          }
        } else {
          if (s.bottom && y <= d.bottom - d.internalEl.height - HEADER_HEIGHT) {
            s.headerShown = true;
            this.state.bottom = false;
            return this._stickInternal(HEADER_HEIGHT);
          }
          if (!s.headerShown && !s.bottom) {
            if (y > d.internalEl.top) {
              return this._stickInternal(0);
            }
          }
        }
      }
    }
  }, {
    key: '_overflowScroll',
    value: function _overflowScroll(y, s, d) {
      var botY = y + d.window.height;

      if (s.headerTransitioning) {
        if (y < d.internalEl.top - HEADER_HEIGHT) {
          s.headerShown = true;
          s.headerTransitioning = false;
          return this._stickInternal(HEADER_HEIGHT);
        }

        if (botY > d.internalEl.bottom) {
          s.headerShown = false;
          s.headerTransitioning = false;
          return this._stickInternal(d.window.height - d.internalEl.height);
        }
      } else {
        if (s.top) {
          if (botY > d.bottom) {
            s.bottom = true;
            return this._staticAtPosition(d.height - d.internalEl.height);
          }

          if (s.headerShown) {
            if (y < d.top - HEADER_HEIGHT) {
              s.headerShown = false;
              return this._staticAtPosition(0);
            }

            if (this.scrollStreak < 0) {
              s.headerTransitioning = true;
              s.headerShown = false;
              return this._staticAtPosition(y - d.top + HEADER_HEIGHT);
            }
          }

          if (!s.headerShown) {
            if (this.scrollStreak > 0) {
              s.headerTransitioning = true;
              return this._staticAtPosition(botY - d.top - d.internalEl.height);
            }
          }
        } else {
          if (s.bottom && y <= d.bottom - d.internalEl.height - HEADER_HEIGHT) {
            s.headerShown = true;
            this.state.bottom = false;
            return this._stickInternal(HEADER_HEIGHT);
          }
          if (!s.headerShown && !s.bottom) {
            if (botY > d.internalEl.bottom) {
              return this._stickInternal(d.window.height - d.internalEl.height);
            }
          }
        }
      }
    }
  }, {
    key: '_getScrollStreak',
    value: function _getScrollStreak(scrollY) {
      var scrollDiff = this.prevScrollY - scrollY;

      if (scrollDiff >= 0 && this.scrollStreak >= 0) {
        this.scrollStreak += scrollDiff;
      } else if (scrollDiff <= 0 && this.scrollStreak <= 0) {
        this.scrollStreak += scrollDiff;
      } else {
        this.scrollStreak = 0;
      }
    }
  }, {
    key: '_stickInternal',
    value: function _stickInternal(position) {
      var style = this.internalEl.style;
      style.position = 'fixed';
      style.top = position + 'px';
      this.state.top = true;
    }
  }, {
    key: '_staticAtPosition',
    value: function _staticAtPosition(position) {
      var style = this.internalEl.style;
      style.position = 'absolute';
      style.top = position + 'px';
      this.state.top = false;
      this._getDimensions();
    }
  }, {
    key: '_onResize',
    value: function _onResize() {
      this._getDimensions();
      this._setInternalDimensions();
      this._checkBreakpoint();
      this._onScroll();
    }
  }]);

  return SemiSticky;
}(_BaseClass3.default);

exports.default = SemiSticky;

},{"../../util/BaseClass":109}],99:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var pixelRatio = window.devicePixelRatio;
  if (pixelRatio == 1) {
    return false;
  }

  var images = document.querySelectorAll('.responsively-lazy');

  images.forEach(function (image) {
    var srcset = image.dataset.srcset;
    if (!srcset) {
      return;
    }

    var matches = srcset.match(/ ([0-9]+w)/g);
    if (!matches) {
      return;
    }

    var convertedBreakpoints = [];
    matches.forEach(function (match) {
      var matchArray = [];
      var matchInt = parseInt(match);
      matchArray.push(matchInt);
      matchArray.push(Math.floor(matchInt * pixelRatio));
      convertedBreakpoints.push(matchArray);
    });

    convertedBreakpoints.map(function (breakpoint) {
      image.dataset.srcset = image.dataset.srcset.replace(breakpoint[0], breakpoint[1]);
    });
  });
};

},{}],100:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

var _SliderOptions = require('./SliderOptions');

var _SliderOptions2 = _interopRequireDefault(_SliderOptions);

var _SliderTrack = require('./SliderTrack');

var _SliderTrack2 = _interopRequireDefault(_SliderTrack);

var _SliderChild = require('./SliderChild');

var _SliderChild2 = _interopRequireDefault(_SliderChild);

var _SliderControls = require('./SliderControls');

var _SliderControls2 = _interopRequireDefault(_SliderControls);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Slider = function (_BaseClass) {
  _inherits(Slider, _BaseClass);

  function Slider(opts) {
    _classCallCheck(this, Slider);

    return _possibleConstructorReturn(this, (Slider.__proto__ || Object.getPrototypeOf(Slider)).call(this, {
      el: opts.el,
      track: null,
      controls: null,
      dimensions: {},
      children: [],
      container: null,
      index: 0,
      currentTransform: 0,
      state: {
        paused: true,
        interacted: false
      },
      indexWidths: [],
      indexTransforms: [],
      loop: null,
      jsOptions: opts.options,
      options: null
    }));
  }

  _createClass(Slider, [{
    key: '_init',
    value: function _init() {
      var _this2 = this;

      this._setOptions();
      this._getDimensions();
      this._getChildren();
      this._getIndexData();
      this._updateEl();
      this._setupEventHandlers();
      requestAnimationFrame(function () {
        _this2._onResize();
        _this2.setActiveChild(_this2.index);
      });
    }
  }, {
    key: '_getDimensions',
    value: function _getDimensions() {
      var rect = this.el.getBoundingClientRect();
      this.dimensions.top = rect.top + window.getScrollY();
      this.dimensions.height = rect.height;
      this.dimensions.width = rect.width;
      this.dimensions.windowHeight = window.innerHeight;
    }
  }, {
    key: '_setOptions',
    value: function _setOptions() {
      if (this.jsOptions) {
        return this.options = new _SliderOptions2.default({ options: this.jsOptions });
      }

      var options = this.el.dataset.sliderOptions ? JSON.parse(this.el.dataset.sliderOptions) : {};
      this.options = new _SliderOptions2.default({ options: options });
    }
  }, {
    key: '_getChildren',
    value: function _getChildren() {
      var _this3 = this;

      var childEls = [].slice.call(this.el.children);
      childEls.forEach(function (el) {
        _this3.children.push(new _SliderChild2.default({
          el: el,
          parent: _this3
        }));
      });
    }
  }, {
    key: '_getIndexData',
    value: function _getIndexData() {
      this.indexWidths = [];
      for (var i = 0; i < this.children.length; i++) {
        this.indexWidths.push(this.children[i].getOuterWidth());
      }

      this.indexTransforms = [];
      var currentIndexTransform = 0;
      var centered = this.options.getCentered();
      if (centered) {
        currentIndexTransform -= this.dimensions.width / 2 - this.indexWidths[0] / 2;
      }
      for (var _i = 0; _i < this.children.length; _i++) {
        this.indexTransforms.push(currentIndexTransform);
        currentIndexTransform += this.indexWidths[_i];
      }
    }
  }, {
    key: '_updateEl',
    value: function _updateEl() {
      this._createTrack();
      this._createControls();
      this._addChildrenToTrack();
    }
  }, {
    key: '_createTrack',
    value: function _createTrack() {
      this.track = new _SliderTrack2.default({
        parent: this
      });
      this.el.appendChild(this.track.el);
    }
  }, {
    key: '_createControls',
    value: function _createControls() {
      this.controls = new _SliderControls2.default({
        parent: this
      });
      this.el.appendChild(this.controls.el);
    }
  }, {
    key: '_addChildrenToTrack',
    value: function _addChildrenToTrack() {
      var _this4 = this;

      this.children.forEach(function (child) {
        _this4.track.addChild(child.el);
      });

      this._getDimensions();
      this.track.resize();
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._onScroll = this._onScroll.bind(this);
      this.scrollHelper.add(this._onScroll);

      this._onResize = this._onResize.bind(this);
      this.resizeHelper.add(this._onResize);
    }
  }, {
    key: '_setTransformInfinite',
    value: function _setTransformInfinite() {
      var _this5 = this;

      var newIndex = 1;
      if (this.index === 0) {
        newIndex = this.children.length - 2;
      }

      this._setTransform();
      setTimeout(function () {
        _this5.track.el.classList.add('no-animate');
        requestAnimationFrame(function () {
          _this5.index = newIndex;
          _this5._setTransform(false);
          requestAnimationFrame(function () {
            _this5.track.el.classList.remove('no-animate');
          });
        });
      }, this.options.getDuration());
    }
  }, {
    key: '_setTransform',
    value: function _setTransform() {
      var _this6 = this;

      var animate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      if (!animate) {
        this.track.el.classList.add('no-animate');
        requestAnimationFrame(function () {
          _this6.track.el.classList.remove('no-animate');
        });
      }
      var transform = this.getTransformOfIndex(this.index);
      this.track.setTransform(transform, animate);
    }
  }, {
    key: '_onResize',
    value: function _onResize() {
      this.track.resize();
      this._getDimensions();
      this._getIndexData();
      this.setActiveChild(this.index);
    }
  }, {
    key: '_onScroll',
    value: function _onScroll() {
      if (this.state.interacted) {
        return;
      }

      var topScreenY = window.getScrollY();
      var bottomScreenY = topScreenY + this.dimensions.windowHeight;
      if (this.state.paused && bottomScreenY > this.dimensions.top && topScreenY < this.dimensions.top + this.dimensions.height) {
        this.startCycle();
      } else if (!this.state.paused && bottomScreenY <= this.dimensions.top || !this.state.paused && topScreenY >= this.dimensions.top + this.dimensions.height) {
        this.stopCycle();
      }
    }
  }, {
    key: 'startCycle',
    value: function startCycle() {
      var _this7 = this;

      if (this.interacted || !this.options.getInterval()) {
        return;
      }
      if (this.loop) {
        this.stopCycle();
      }
      this.state.paused = false;
      this.loop = setInterval(function () {
        _this7.nextSlide();
      }, this.options.getInterval());
    }
  }, {
    key: 'stopCycle',
    value: function stopCycle() {
      this.state.paused = true;
      clearInterval(this.loop);
    }
  }, {
    key: 'nextSlide',
    value: function nextSlide(e) {
      this.index++;
      if (this.index >= this.children.length) {
        if (this.options.getWrapping()) {
          this.index = 0;
        } else {
          this.index = this.children.length - 1;
        }
      }
      this.setActiveChild(this.index);
    }
  }, {
    key: 'prevSlide',
    value: function prevSlide(e) {
      this.index--;
      if (this.index < 0) {
        if (this.options.getWrapping()) {
          this.index = this.children.length - 1;
        } else {
          this.index = 0;
        }
      }
      this.setActiveChild(this.index);
    }
  }, {
    key: 'setActiveChild',
    value: function setActiveChild(index) {
      var _this8 = this;

      var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      this.index = index;

      this.children.forEach(function (child) {
        child.setInactive();
      });
      requestAnimationFrame(function () {
        _this8._setTransform(animate);
        _this8.children[_this8.index].setActive();
        _this8.controls.setActiveChild(_this8.index);
      });
    }
  }, {
    key: 'getTransformOfIndex',
    value: function getTransformOfIndex(index) {
      if (this.children.length <= this.getSlidesToShow()) {
        return 0;
      }
      return -this.indexTransforms[index];
    }
  }, {
    key: 'getSlidesToShow',
    value: function getSlidesToShow() {
      return this.options.getSlidesToShow();
    }
  }]);

  return Slider;
}(_BaseClass3.default);

exports.default = Slider;

},{"../../util/BaseClass":109,"./SliderChild":102,"./SliderControls":103,"./SliderOptions":105,"./SliderTrack":106}],101:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Slider = require('./Slider');

var _Slider2 = _interopRequireDefault(_Slider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SliderBuilder = function () {
  function SliderBuilder(selector) {
    _classCallCheck(this, SliderBuilder);

    this.selector = selector;
    this._init();
  }

  _createClass(SliderBuilder, [{
    key: '_init',
    value: function _init() {
      var sliderEls = document.querySelectorAll(this.selector);
      sliderEls.forEach(function (el) {
        new _Slider2.default({
          el: el
        });
      });
    }
  }]);

  return SliderBuilder;
}();

exports.default = SliderBuilder;

},{"./Slider":100}],102:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SliderChild = function (_BaseClass) {
  _inherits(SliderChild, _BaseClass);

  function SliderChild(opts) {
    _classCallCheck(this, SliderChild);

    return _possibleConstructorReturn(this, (SliderChild.__proto__ || Object.getPrototypeOf(SliderChild)).call(this, Object.assign(opts, {
      el: opts.el,
      parent: opts.parent,
      width: null,
      height: null,
      outerWidth: null,
      state: {
        active: false
      }
    })));
  }

  _createClass(SliderChild, [{
    key: '_init',
    value: function _init() {
      var _this2 = this;

      this.el.classList.add('ab-slider--slide');
      requestAnimationFrame(function () {
        _this2.getWidth();
      });
      this._setupEventHandlers();
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      var _this3 = this;

      var images = this.el.querySelectorAll('img');
      images.forEach(function (img) {
        img.onload = function () {
          _this3.width = _this3.outerWidth = null;
          _this3.parent._onResize();
        };
      });

      this.resizeHelper.add(function () {
        _this3.width = _this3.outerWidth = _this3.height = null;
      });
    }
  }, {
    key: 'getWidth',
    value: function getWidth(compStyle) {
      if (this.width) {
        return this.width;
      }

      var slidesToShow = this.parent.getSlidesToShow();
      var computedStyle = compStyle || window.getComputedStyle(this.el);
      var marginLeft = computedStyle.marginLeft;
      var marginRight = computedStyle.marginRight;
      if (slidesToShow) {
        this.width = this.parent.el.clientWidth / slidesToShow;
        if (marginLeft) {
          this.width -= parseInt(marginLeft);
        }
        if (marginRight) {
          this.width -= parseInt(marginRight);
        }
        this.el.style.width = this.width + 'px';
        this.el.style.flexBasis = this.width + 'px';
      } else {
        this.width = Math.floor(this.el.clientWidth);
      }

      return this.width;
    }
  }, {
    key: 'getHeight',
    value: function getHeight() {
      if (this.height) {
        return this.height;
      }

      this.width = Math.floor(this.el.clientHeight);

      return this.width;
    }
  }, {
    key: 'setHeight',
    value: function setHeight(height) {
      this.el.style.height = height + 'px';
    }
  }, {
    key: 'getOuterWidth',
    value: function getOuterWidth() {
      if (this.outerWidth) {
        return this.outerWidth;
      }

      var computedStyle = window.getComputedStyle(this.el);
      var width = this.getWidth(computedStyle);
      var marginLeft = computedStyle.marginLeft;
      var marginRight = computedStyle.marginRight;
      if (marginLeft) {
        width += parseInt(marginLeft);
      }
      if (marginRight) {
        width += parseInt(marginRight);
      }
      this.outerWidth = width;

      return this.outerWidth;
    }
  }, {
    key: 'setActive',
    value: function setActive() {
      this.state.active = true;
      this.el.classList.add('active');
    }
  }, {
    key: 'setInactive',
    value: function setInactive() {
      if (this.state.active) {
        this.state.active = false;
        this.el.classList.remove('active');
      }
    }
  }]);

  return SliderChild;
}(_BaseClass3.default);

exports.default = SliderChild;

},{"../../util/BaseClass":109}],103:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

var _SliderNavButton = require('./SliderNavButton');

var _SliderNavButton2 = _interopRequireDefault(_SliderNavButton);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TEMPLATE_SLIDER_CONTROLS = '\n  <div class="ab-slider--controls">\n    <a href="javascript:void(0);" class="ab-slider--control control-prev"><span class="ada-text">Previous</span></a>\n    <div class="ab-slider--nav-container">\n      <div class="ab-slider--nav-container---dot-container"></div>\n      <div class="ab-slider--nav-container---number-container"></div>\n    </div>\n    <a href="javascript:void(0);" class="ab-slider--control control-next"><span class="ada-text">Next</span></a>\n  </div>\n';

var SliderControls = function (_BaseClass) {
  _inherits(SliderControls, _BaseClass);

  function SliderControls(opts) {
    _classCallCheck(this, SliderControls);

    return _possibleConstructorReturn(this, (SliderControls.__proto__ || Object.getPrototypeOf(SliderControls)).call(this, {
      el: null,
      parent: opts.parent,
      prevButton: null,
      nextButton: null,
      navNumber: null,
      childrenNavDots: []
    }));
  }

  _createClass(SliderControls, [{
    key: '_init',
    value: function _init() {
      this._getEl();
      this._setupEventHandlers();
    }
  }, {
    key: '_getEl',
    value: function _getEl() {
      var tempElControl = document.createElement('div');
      tempElControl.innerHTML = TEMPLATE_SLIDER_CONTROLS.trim();
      this.el = tempElControl.firstChild;
      this.prevButton = this.el.querySelector('.control-prev');
      this.nextButton = this.el.querySelector('.control-next');

      this._setupNavDots();
      this._setupNavNumber();
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._onControlClick = this._onControlClick.bind(this);
      this.nextButton.addEventListener('click', this._onControlClick);
      this.prevButton.addEventListener('click', this._onControlClick);
    }
  }, {
    key: '_onControlClick',
    value: function _onControlClick(e) {
      e.preventDefault();
      this.parent.stopCycle();

      this.parent.state.interacted = true;
      var classes = e.target.classList;
      if (classes.contains('control-prev')) {
        this.parent.prevSlide();
      } else if (classes.contains('control-next')) {
        this.parent.nextSlide();
      }
    }
  }, {
    key: '_setupNavDots',
    value: function _setupNavDots() {
      var _this2 = this;

      var dotContainer = this.el.querySelector('.ab-slider--nav-container---dot-container');

      this.parent.children.forEach(function (child, i) {
        var navButton = new _SliderNavButton2.default({
          index: i,
          parent: _this2.parent
        });
        _this2.childrenNavDots.push(navButton);
        dotContainer.appendChild(navButton.el);
      });
    }
  }, {
    key: '_setNavDots',
    value: function _setNavDots() {
      if (this.parent.options.getWrapping()) {
        return;
      }

      this._enableNavDots();
      if (this.parent.index === 0) {
        this.prevButton.classList.add('disabled');
      }
      if (this.parent.index === this.parent.children.length - 1) {
        this.nextButton.classList.add('disabled');
      }
    }
  }, {
    key: '_setupNavNumber',
    value: function _setupNavNumber() {
      this.navNumber = this.el.querySelector('.ab-slider--nav-container---number-container');
    }
  }, {
    key: '_setNavNumber',
    value: function _setNavNumber() {
      this.navNumber.innerText = this.parent.index + 1 + ' of ' + this.parent.children.length;
    }
  }, {
    key: '_enableNavDots',
    value: function _enableNavDots() {
      this.prevButton.classList.remove('disabled');
      this.nextButton.classList.remove('disabled');
    }
  }, {
    key: 'setActiveChild',
    value: function setActiveChild(index) {
      this.childrenNavDots.forEach(function (child) {
        child.setInactive();
      });
      this.childrenNavDots[index].setActive();

      this._setNavDots();
      this._setNavNumber();
    }
  }]);

  return SliderControls;
}(_BaseClass3.default);

exports.default = SliderControls;

},{"../../util/BaseClass":109,"./SliderNavButton":104}],104:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TEMPLATE_SLIDER_CONTROLS__NAV_BUTTON = '\n  <a href="javascript:void(0);" class="ab-slider--nav-container---nav-button"></a>\n';

var SliderNavButton = function (_BaseClass) {
  _inherits(SliderNavButton, _BaseClass);

  function SliderNavButton(opts) {
    _classCallCheck(this, SliderNavButton);

    return _possibleConstructorReturn(this, (SliderNavButton.__proto__ || Object.getPrototypeOf(SliderNavButton)).call(this, Object.assign(opts, {
      index: opts.index,
      parent: opts.parent,
      el: null,
      active: false
    })));
  }

  _createClass(SliderNavButton, [{
    key: '_init',
    value: function _init() {
      this._getEl();
      this._setupEventHandlers();
    }
  }, {
    key: '_getEl',
    value: function _getEl() {
      var tempElNavButton = document.createElement('div');
      tempElNavButton.innerHTML = TEMPLATE_SLIDER_CONTROLS__NAV_BUTTON.trim();
      this.el = tempElNavButton.firstChild;
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._onClick = this._onClick.bind(this);
      this.el.addEventListener('click', this._onClick);
    }
  }, {
    key: '_onClick',
    value: function _onClick() {
      this.parent.setActiveChild(this.index);
    }
  }, {
    key: 'setActive',
    value: function setActive() {
      if (!this.active) {
        this.active = true;
        this.el.classList.add('active');
      }
    }
  }, {
    key: 'setInactive',
    value: function setInactive() {
      if (this.active) {
        this.active = false;
        this.el.classList.remove('active');
      }
    }
  }]);

  return SliderNavButton;
}(_BaseClass3.default);

exports.default = SliderNavButton;

},{"../../util/BaseClass":109}],105:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SliderControls = function (_BaseClass) {
  _inherits(SliderControls, _BaseClass);

  function SliderControls(opts) {
    _classCallCheck(this, SliderControls);

    return _possibleConstructorReturn(this, (SliderControls.__proto__ || Object.getPrototypeOf(SliderControls)).call(this, {
      userOptions: opts.options,
      duration: null,
      interval: null,
      infinite: null,
      slidesToShow: null,
      responsive: null
    }));
  }

  _createClass(SliderControls, [{
    key: '_init',
    value: function _init() {
      this._getOptions();
    }
  }, {
    key: '_getOptions',
    value: function _getOptions() {
      this.duration = this._getInitialDuration();
      this.interval = this._getInitialInterval();
      // this.infinite = this._getInitialInfinite();
      this.centered = this._getInitialCentered();
      this.touch = this._getInitialTouch();
      this.slidesToShow = this._getInitialSlidesToShow();
      this.wrapping = this._getInitialWrapping();
      this.responsive = this._getInitialResponsive();
      this.navType = this._getInitialNavType();

      Object.assign(this, this.userOptions);
    }
  }, {
    key: '_getInitialDuration',
    value: function _getInitialDuration() {
      return this.userOptions.duration || 500;
    }
  }, {
    key: '_getInitialInterval',
    value: function _getInitialInterval() {
      if (typeof this.userOptions.interval !== 'number') {
        return false;
      }

      return this.userOptions.interval;
    }

    // _getInitialInfinite () {
    //   const universalInfinite =  typeof this.userOptions.infinite !== 'undefined' && this.userOptions.infinite !== "false" ? true : false
    //   if (universalInfinite === true) {
    //     this.parent.index = 1;
    //     return true;
    //   };

    //   this.userOptions.breakpoints && this.userOptions.breakpoints.forEach((breakpoint) => {
    //     if (breakpoint.settings.infinite) {
    //       this.parent.index = 1;
    //       return true;
    //     }
    //   });

    //   return false;
    // }

  }, {
    key: '_getInitialCentered',
    value: function _getInitialCentered() {
      return typeof this.userOptions.centered === 'undefined' || this.userOptions.centered === "false" ? false : true;
    }
  }, {
    key: '_getInitialTouch',
    value: function _getInitialTouch() {
      return typeof this.userOptions.wrapping === 'undefined' || this.userOptions.wrapping !== "false" ? true : false;
    }
  }, {
    key: '_getInitialSlidesToShow',
    value: function _getInitialSlidesToShow() {
      return this.userOptions.slidesToShow || 0;
    }
  }, {
    key: '_getInitialWrapping',
    value: function _getInitialWrapping() {
      return typeof this.userOptions.wrapping === 'undefined' || this.userOptions.wrapping !== "false" ? true : false;
    }
  }, {
    key: '_getInitialResponsive',
    value: function _getInitialResponsive() {
      if (!this.userOptions.responsive) {
        return [];
      }

      var responsive = this.userOptions.responsive.sort(function (a, b) {
        return a.breakpoint < b.breakpoint;
      });

      return responsive;
    }
  }, {
    key: '_getInitialNavType',
    value: function _getInitialNavType() {
      var navTypes = ['dotted', 'numbered'];
      if (navTypes.indexOf(this.userOptions.navType) === -1) {
        return navTypes[0];
      }

      return this.userOptions.navType;
    }
  }, {
    key: '_getForBreakpoint',
    value: function _getForBreakpoint(option) {
      var value = this[option];
      this.responsive.forEach(function (breakpoint) {
        if (breakpoint.settings[option] && window.innerWidth <= breakpoint.breakpoint) {
          value = breakpoint.settings[option];
        }
      });

      return value;
    }
  }, {
    key: 'getDuration',
    value: function getDuration() {
      return this._getForBreakpoint('duration');
    }
  }, {
    key: 'getInterval',
    value: function getInterval() {
      return this._getForBreakpoint('interval');
    }

    // getInfinite () {
    //   return this._getForBreakpoint('infinite');
    // }

  }, {
    key: 'getCentered',
    value: function getCentered() {
      return this._getForBreakpoint('centered');
    }
  }, {
    key: 'getTouch',
    value: function getTouch() {
      return this._getForBreakpoint('touch');
    }
  }, {
    key: 'getSlidesToShow',
    value: function getSlidesToShow() {
      return this._getForBreakpoint('slidesToShow');
    }
  }, {
    key: 'getWrapping',
    value: function getWrapping() {
      return this._getForBreakpoint('wrapping');
    }
  }, {
    key: 'getNavType',
    value: function getNavType() {
      return this._getForBreakpoint('navType');
    }
  }]);

  return SliderControls;
}(_BaseClass3.default);

exports.default = SliderControls;

},{"../../util/BaseClass":109}],106:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseClass2 = require('../../util/BaseClass');

var _BaseClass3 = _interopRequireDefault(_BaseClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TEMPLATE_SLIDER_TRACK = '\n  <div class="ab-slider-track cf"></div>\n';

var SliderTrack = function (_BaseClass) {
  _inherits(SliderTrack, _BaseClass);

  function SliderTrack(opts) {
    _classCallCheck(this, SliderTrack);

    return _possibleConstructorReturn(this, (SliderTrack.__proto__ || Object.getPrototypeOf(SliderTrack)).call(this, {
      el: null,
      parent: opts.parent,
      startingTransform: 0,
      endingTransform: 0,
      transform: 0,
      width: 0,
      state: {},
      touchData: {}
    }));
  }

  _createClass(SliderTrack, [{
    key: '_init',
    value: function _init() {
      this._getEl();
      this._setupEventHandlers();
    }
  }, {
    key: '_getEl',
    value: function _getEl() {
      var tempEl = document.createElement('div');
      tempEl.innerHTML = TEMPLATE_SLIDER_TRACK.trim();
      this.el = tempEl.firstChild;
      this._addTrackOptions();
    }
  }, {
    key: '_addTrackOptions',
    value: function _addTrackOptions() {
      this.el.style.transition = 'transform ' + this.parent.options.getDuration() + 'ms';
      this.el.style.willChange = 'transform';
      this.el.style.backfaceVisibility = 'hidden';
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      this._onTouchStart = this._onTouchStart.bind(this);
      this.el.addEventListener('touchstart', this._onTouchStart, { passive: true });
      this._onTouchMove = this._onTouchMove.bind(this);
      this.el.addEventListener('touchmove', this._onTouchMove, { passive: true });
      this._onTouchEnd = this._onTouchEnd.bind(this);
      this.el.addEventListener('touchend', this._onTouchEnd, { passive: true });
    }
  }, {
    key: '_onTouchStart',
    value: function _onTouchStart(e) {
      e.stopPropagation();
      if (!this.parent.options.getTouch()) {
        return;
      }
      if (!this.parent.state.interacted) {
        this.parent.state.interacted = true;
        this.parent.stopCycle();
      }

      this.touchData.moved = false;
      this.el.classList.add('no-animate');
      this.touchData.initX = this.touchData.sessionStartX = e.touches[0].clientX;
      this.touchData.initY = this.touchData.sessionStartY = e.touches[0].clientY;
    }
  }, {
    key: '_onTouchMove',
    value: function _onTouchMove(e) {
      var _this2 = this;

      e.stopPropagation();
      if (!this.parent.options.getTouch() || this.state.ticking) {
        return;
      }
      this.state.ticking = true;
      requestAnimationFrame(function () {
        var newX = e.touches[0].clientX;
        var deltaX = newX - _this2.touchData.initX;
        var newY = e.touches[0].clientY;
        var deltaY = newY - _this2.touchData.initY;
        var deltaRatio = Math.abs(deltaX / deltaY);

        if (Math.abs(Math.floor(deltaX)) > 0) {
          _this2.touchData.moved = true;
        }
        _this2.touchData.initX = newX;
        _this2.touchData.finalX = e.touches[0].clientX;
        _this2.touchData.initY = newY;
        _this2.touchData.finalY = e.touches[0].clientY;

        _this2.state.ticking = false;

        if (deltaRatio < 1.25) {
          return;
        }

        var newTransform = Math.min(Math.max(_this2.transform + deltaX, _this2.endingTransform + -100), _this2.startingTransform + 100);
        _this2.setTransform(newTransform);
      });
    }
  }, {
    key: '_onTouchEnd',
    value: function _onTouchEnd(e) {
      e.stopPropagation();
      this.el.classList.remove('no-animate');
      if (!this.parent.options.getTouch() || !this.touchData.moved) {
        return;
      }

      var totalDeltaX = this.touchData.sessionStartX - this.touchData.finalX;
      var threshold = 0.5;
      if (totalDeltaX > 0) {
        threshold -= 0.3;
      } else {
        threshold += 0.3;
      }

      var newIndex = this.parent.indexTransforms.length - 1;
      for (var i = 0; i < this.parent.indexTransforms.length; i++) {
        if (this.transform > -this.parent.indexTransforms[i]) {
          newIndex = i - 1;
          var percentThroughIndex = (this.transform - -this.parent.indexTransforms[i - 1]) / -this.parent.indexWidths[i - 1];
          if (percentThroughIndex > threshold) {
            newIndex++;
          }

          if (newIndex < 0) {
            newIndex = 0;
          } else if (newIndex >= this.parent.children.length) {
            newIndex = this.parent.children.length - 1;
          }
          break;
        }
      }

      return this.parent.setActiveChild(newIndex);
    }
  }, {
    key: 'addChild',
    value: function addChild(el) {
      this.el.appendChild(el);
    }
  }, {
    key: 'resize',
    value: function resize() {
      this._addTrackOptions();
      var width = 0;
      var maxHeight = 0;
      this.parent.children.forEach(function (child) {
        width += child.getOuterWidth();
        maxHeight = Math.max(maxHeight, child.getHeight());
      });
      this.width = Math.ceil(width);

      this.el.style.width = this.width + 'px';

      this.startingTransform = this.parent.getTransformOfIndex(0);
      this.endingTransform = this.parent.getTransformOfIndex(this.parent.children.length - 1);
    }
  }, {
    key: 'setTransform',
    value: function setTransform(transform) {
      var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      this.transform = transform;
      this.el.style.transform = 'translateX(' + this.transform + 'px)';
    }
  }]);

  return SliderTrack;
}(_BaseClass3.default);

exports.default = SliderTrack;

},{"../../util/BaseClass":109}],107:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initSliders;

var _SliderBuilder = require('./SliderBuilder');

var _SliderBuilder2 = _interopRequireDefault(_SliderBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initSliders(selector) {
  new _SliderBuilder2.default(selector);
}

},{"./SliderBuilder":101}],108:[function(require,module,exports){
'use strict';

var _device = require('./util/device');

var _device2 = _interopRequireDefault(_device);

var _App = require('./App');

var _App2 = _interopRequireDefault(_App);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.onload = function () {

  var app = new _App2.default();
  app.start();
};

},{"./App":40,"./util/device":113}],109:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ThrottleHelper = require('./ThrottleHelper');

var _ThrottleHelper2 = _interopRequireDefault(_ThrottleHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BaseClass = function () {
  function BaseClass(opt) {
    _classCallCheck(this, BaseClass);

    for (var key in opt) {
      this[key] = opt[key];
    }
    this.breakpoints = {
      desktop: 1030
    };
    this.scrollHelper = _ThrottleHelper2.default.getInstance('scroll');
    this.resizeHelper = _ThrottleHelper2.default.getInstance('resize');
    this._init();
  }

  _createClass(BaseClass, [{
    key: '_init',
    value: function _init() {
      // NOOP
    }
  }]);

  return BaseClass;
}();

exports.default = BaseClass;

},{"./ThrottleHelper":112}],110:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* Cookie Helper */
/*****************************************************************
 * basic class to help us create/read/delete user cookies.       *
 *****************************************************************/

var CookieHelper = function () {
  function CookieHelper() {
    _classCallCheck(this, CookieHelper);
  }

  _createClass(CookieHelper, null, [{
    key: 'createCookie',
    value: function createCookie(name, value, seconds) {
      var expires = '';
      if (seconds) {
        var date = new Date();
        date.setTime(date.getTime() + seconds);
        expires = 'expires=' + date.toUTCString();
      }
      document.cookie = name + '=' + value + ';' + expires + ';path=/;';
    }
  }, {
    key: 'readCookie',
    value: function readCookie(name) {
      var nameEQ = name + '=';
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
          c = c.substring(1, c.length);
        }if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    }
  }, {
    key: 'eraseCookie',
    value: function eraseCookie(name) {
      this.createCookie(name, '', -1);
    }
  }]);

  return CookieHelper;
}();

exports.default = CookieHelper;

},{}],111:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Use this class to ensure Google Maps API javascript is loaded before running any google map specific code.
 */
var GoogleMapsApi = function () {
  /**
   * Constructor set up config.
   */
  function GoogleMapsApi() {
    _classCallCheck(this, GoogleMapsApi);

    // api key for google maps
    this.apiKey = 'AIzaSyAL2999KE_PQ1I74lC-I_kdxyvilZIVP1Y';

    // set a globally scoped callback if it doesn't already exist
    if (!window._GoogleMapsApi) {
      this.callbackName = '_GoogleMapsApi.mapLoaded';
      window._GoogleMapsApi = this;
      window._GoogleMapsApi.mapLoaded = this.mapLoaded.bind(this);
    }
  }

  /**
   * Load the Google Maps API javascript
   */


  _createClass(GoogleMapsApi, [{
    key: 'load',
    value: function load() {
      var _this = this;

      if (!this.promise) {
        this.promise = new Promise(function (resolve) {
          _this.resolve = resolve;
          if (typeof window.google === 'undefined') {
            var script = document.createElement('script');
            script.src = '//maps.googleapis.com/maps/api/js?key=' + _this.apiKey + '&callback=' + _this.callbackName;
            script.async = true;
            document.body.append(script);
          } else {
            _this.resolve();
          }
        });
      }

      return this.promise;
    }

    /**
     * Globally scoped callback for the map loaded
     */

  }, {
    key: 'mapLoaded',
    value: function mapLoaded() {
      if (this.resolve) {
        this.resolve();
      }
    }
  }]);

  return GoogleMapsApi;
}();

exports.default = GoogleMapsApi;

},{}],112:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ThrottleHelper = function () {
  function ThrottleHelper(type) {
    _classCallCheck(this, ThrottleHelper);

    this.queue = [];
    this.ticking = false;
    this._onUpdate = this._onUpdate.bind(this);
    this.type = type;
    this._init();
  }

  _createClass(ThrottleHelper, [{
    key: '_init',
    value: function _init() {
      window.addEventListener(this.type, this._onUpdate, { passive: true });
    }
  }, {
    key: '_onUpdate',
    value: function _onUpdate(e) {
      if (this.ticking) {
        return;
      }
      this.ticking = true;
      if (this.type === 'scroll') {
        this.scrollY = window.getScrollY();
      }
      requestAnimationFrame(this._update.bind(this, e));
    }
  }, {
    key: '_update',
    value: function _update(e) {
      this.queue.forEach(function (fn) {
        fn(e);
      });
      this.ticking = false;
    }
  }, {
    key: 'add',
    value: function add(fn) {
      this.queue.push(fn);
    }
  }, {
    key: 'remove',
    value: function remove(fn) {
      var fnIndex = this.queue.indexOf(fn);
      if (fnIndex === -1) {
        return;
      }

      this.queue.slice(fnIndex, 1);
    }
  }], [{
    key: 'getInstance',
    value: function getInstance(type) {
      var instance = ThrottleHelper.instances.find(function (instance) {
        return instance.type === type;
      });
      if (!instance) {
        instance = new ThrottleHelper(type);
        ThrottleHelper.instances.push(instance);
      }
      return instance;
    }
  }]);

  return ThrottleHelper;
}();

exports.default = ThrottleHelper;


ThrottleHelper.instances = [];

},{}],113:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Save the previous value of the device variable.
var previousDevice = window.device;

var device = {};

var changeOrientationList = [];

// Add device as a global object.
window.device = device;

// The <html> element.
var documentElement = window.document.documentElement;

// The client user agent string.
// Lowercase, so we can use the more efficient indexOf(), instead of Regex
var userAgent = window.navigator.userAgent.toLowerCase();

// Detectable television devices.
var television = ['googletv', 'viera', 'smarttv', 'internet.tv', 'netcast', 'nettv', 'appletv', 'boxee', 'kylo', 'roku', 'dlnadoc', 'pov_tv', 'hbbtv', 'ce-html'];

// Main functions
// --------------

device.macos = function () {
  return find('mac');
};

device.ios = function () {
  return device.iphone() || device.ipod() || device.ipad();
};

device.iphone = function () {
  return !device.windows() && find('iphone');
};

device.ipod = function () {
  return find('ipod');
};

device.ipad = function () {
  return find('ipad');
};

device.android = function () {
  return !device.windows() && find('android');
};

device.androidPhone = function () {
  return device.android() && find('mobile');
};

device.androidTablet = function () {
  return device.android() && !find('mobile');
};

device.blackberry = function () {
  return find('blackberry') || find('bb10') || find('rim');
};

device.blackberryPhone = function () {
  return device.blackberry() && !find('tablet');
};

device.blackberryTablet = function () {
  return device.blackberry() && find('tablet');
};

device.windows = function () {
  return find('windows');
};

device.windowsPhone = function () {
  return device.windows() && find('phone');
};

device.windowsTablet = function () {
  return device.windows() && find('touch') && !device.windowsPhone();
};

device.fxos = function () {
  return (find('(mobile') || find('(tablet')) && find(' rv:');
};

device.fxosPhone = function () {
  return device.fxos() && find('mobile');
};

device.fxosTablet = function () {
  return device.fxos() && find('tablet');
};

device.meego = function () {
  return find('meego');
};

device.cordova = function () {
  return window.cordova && location.protocol === 'file:';
};

device.nodeWebkit = function () {
  return _typeof(window.process) === 'object';
};

device.mobile = function () {
  return device.androidPhone() || device.iphone() || device.ipod() || device.windowsPhone() || device.blackberryPhone() || device.fxosPhone() || device.meego();
};

device.tablet = function () {
  return device.ipad() || device.androidTablet() || device.blackberryTablet() || device.windowsTablet() || device.fxosTablet();
};

device.desktop = function () {
  return !device.tablet() && !device.mobile();
};

device.television = function () {
  var i = 0;
  while (i < television.length) {
    if (find(television[i])) {
      return true;
    }
    i++;
  }
  return false;
};

device.portrait = function () {
  if (screen.orientation && Object.prototype.hasOwnProperty.call(window, 'onorientationchange')) {
    return screen.orientation.type.includes('portrait');
  }
  return window.innerHeight / window.innerWidth > 1;
};

device.landscape = function () {
  if (screen.orientation && Object.prototype.hasOwnProperty.call(window, 'onorientationchange')) {
    return screen.orientation.type.includes('landscape');
  }
  return window.innerHeight / window.innerWidth < 1;
};

// Public Utility Functions
// ------------------------

// Run device.js in noConflict mode,
// returning the device variable to its previous owner.
device.noConflict = function () {
  window.device = previousDevice;
  return this;
};

// Private Utility Functions
// -------------------------

// Simple UA string search
function find(needle) {
  return userAgent.indexOf(needle) !== -1;
}

// Check if documentElement already has a given class.
function hasClass(className) {
  return documentElement.className.match(new RegExp(className, 'i'));
}

// Add one or more CSS classes to the <html> element.
function addClass(className) {
  var currentClassNames = null;
  if (!hasClass(className)) {
    currentClassNames = documentElement.className.replace(/^\s+|\s+$/g, '');
    documentElement.className = currentClassNames + ' ' + className;
  }
}

// Remove single CSS class from the <html> element.
function removeClass(className) {
  if (hasClass(className)) {
    documentElement.className = documentElement.className.replace(' ' + className, '');
  }
}

// HTML Element Handling
// ---------------------

// Insert the appropriate CSS class based on the _user_agent.

if (device.ios()) {
  if (device.ipad()) {
    addClass('ios ipad tablet');
  } else if (device.iphone()) {
    addClass('ios iphone mobile');
  } else if (device.ipod()) {
    addClass('ios ipod mobile');
  }
} else if (device.macos()) {
  addClass('macos desktop');
} else if (device.android()) {
  if (device.androidTablet()) {
    addClass('android tablet');
  } else {
    addClass('android mobile');
  }
} else if (device.blackberry()) {
  if (device.blackberryTablet()) {
    addClass('blackberry tablet');
  } else {
    addClass('blackberry mobile');
  }
} else if (device.windows()) {
  if (device.windowsTablet()) {
    addClass('windows tablet');
  } else if (device.windowsPhone()) {
    addClass('windows mobile');
  } else {
    addClass('windows desktop');
  }
} else if (device.fxos()) {
  if (device.fxosTablet()) {
    addClass('fxos tablet');
  } else {
    addClass('fxos mobile');
  }
} else if (device.meego()) {
  addClass('meego mobile');
} else if (device.nodeWebkit()) {
  addClass('node-webkit');
} else if (device.television()) {
  addClass('television');
} else if (device.desktop()) {
  addClass('desktop');
}

if (device.cordova()) {
  addClass('cordova');
}

// Orientation Handling
// --------------------

// Handle device orientation changes.
function handleOrientation() {
  if (device.landscape()) {
    removeClass('portrait');
    addClass('landscape');
    walkOnChangeOrientationList('landscape');
  } else {
    removeClass('landscape');
    addClass('portrait');
    walkOnChangeOrientationList('portrait');
  }
  setOrientationCache();
}

function walkOnChangeOrientationList(newOrientation) {
  for (var index in changeOrientationList) {
    changeOrientationList[index](newOrientation);
  }
}

device.onChangeOrientation = function (cb) {
  if (typeof cb == 'function') {
    changeOrientationList.push(cb);
  }
};

// Detect whether device supports orientationchange event,
// otherwise fall back to the resize event.
var orientationEvent = 'resize';
if (Object.prototype.hasOwnProperty.call(window, 'onorientationchange')) {
  orientationEvent = 'orientationchange';
}

// Listen for changes in orientation.
if (window.addEventListener) {
  window.addEventListener(orientationEvent, handleOrientation, false);
} else if (window.attachEvent) {
  window.attachEvent(orientationEvent, handleOrientation);
} else {
  window[orientationEvent] = handleOrientation;
}

handleOrientation();

// Public functions to get the current value of type, os, or orientation
// ---------------------------------------------------------------------

function findMatch(arr) {
  for (var i = 0; i < arr.length; i++) {
    if (device[arr[i]]()) {
      return arr[i];
    }
  }
  return 'unknown';
}

device.type = findMatch(['mobile', 'tablet', 'desktop']);
device.os = findMatch(['ios', 'iphone', 'ipad', 'ipod', 'android', 'blackberry', 'windows', 'fxos', 'meego', 'television']);

function setOrientationCache() {
  device.orientation = findMatch(['portrait', 'landscape']);
}

setOrientationCache();

exports.default = device;

},{}],114:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  if (typeof Object.assign != 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
      value: function assign(target, varArgs) {
        // .length of function is 2
        'use strict';

        if (target == null) {
          // TypeError if undefined or null
          throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];

          if (nextSource != null) {
            // Skip over if undefined or null
            for (var nextKey in nextSource) {
              // Avoid bugs when hasOwnProperty is shadowed
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true
    });
  }
}();

},{}],115:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  // [Array].find
  // https://tc39.github.io/ecma262/#sec-array.prototype.find
  if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
      value: function value(predicate) {
        if (this == null) {
          throw new TypeError('"this" is null or not defined');
        }
        var o = Object(this);
        var len = o.length >>> 0;
        if (typeof predicate !== 'function') {
          throw new TypeError('predicate must be a function');
        }
        var thisArg = arguments[1];
        var k = 0;
        while (k < len) {
          var kValue = o[k];
          if (predicate.call(thisArg, kValue, k, o)) {
            return kValue;
          }
          k++;
        }
        return undefined;
      },
      configurable: true,
      writable: true
    });
  }
}();

},{}],116:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  // [NodeList].forEach
  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
      thisArg = thisArg || window;
      for (var i = 0; i < this.length; i++) {
        callback.call(thisArg, this[i], i, this);
      }
    };
  }
}();

},{}],117:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  window.getScrollY = function getScrollY() {
    return window.scrollY || window.pageYOffset;
  };
}();

},{}],118:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/*! npm.im/object-fit-images 3.2.3 */
exports.default = function () {
  'use strict';

  var OFI = 'bfred-it:object-fit-images';
  var propRegex = /(object-fit|object-position)\s*:\s*([\-\w\s%]+)/g;
  var testImg = typeof Image === 'undefined' ? { style: { 'object-position': 1 } } : new Image();
  var supportsObjectFit = 'object-fit' in testImg.style;
  var supportsObjectPosition = 'object-position' in testImg.style;
  var supportsOFI = 'background-size' in testImg.style;
  var supportsCurrentSrc = typeof testImg.currentSrc === 'string';
  var nativeGetAttribute = testImg.getAttribute;
  var nativeSetAttribute = testImg.setAttribute;
  var autoModeEnabled = false;

  function createPlaceholder(w, h) {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + h + "'%3E%3C/svg%3E";
  }

  function polyfillCurrentSrc(el) {
    if (el.srcset && !supportsCurrentSrc && window.picturefill) {
      var pf = window.picturefill._;
      // parse srcset with picturefill where currentSrc isn't available
      if (!el[pf.ns] || !el[pf.ns].evaled) {
        // force synchronous srcset parsing
        pf.fillImg(el, { reselect: true });
      }

      if (!el[pf.ns].curSrc) {
        // force picturefill to parse srcset
        el[pf.ns].supported = false;
        pf.fillImg(el, { reselect: true });
      }

      // retrieve parsed currentSrc, if any
      el.currentSrc = el[pf.ns].curSrc || el.src;
    }
  }

  function getStyle(el) {
    var style = getComputedStyle(el).fontFamily;
    var parsed;
    var props = {};
    while ((parsed = propRegex.exec(style)) !== null) {
      props[parsed[1]] = parsed[2];
    }
    return props;
  }

  function setPlaceholder(img, width, height) {
    // Default: fill width, no height
    var placeholder = createPlaceholder(width || 1, height || 0);

    // Only set placeholder if it's different
    if (nativeGetAttribute.call(img, 'src') !== placeholder) {
      nativeSetAttribute.call(img, 'src', placeholder);
    }
  }

  function onImageReady(img, callback) {
    // naturalWidth is only available when the image headers are loaded,
    // this loop will poll it every 100ms.
    if (img.naturalWidth) {
      callback(img);
    } else {
      setTimeout(onImageReady, 100, img, callback);
    }
  }

  function fixOne(el) {
    var style = getStyle(el);
    var ofi = el[OFI];
    style['object-fit'] = style['object-fit'] || 'fill'; // default value

    // Avoid running where unnecessary, unless OFI had already done its deed
    if (!ofi.img) {
      // fill is the default behavior so no action is necessary
      if (style['object-fit'] === 'fill') {
        return;
      }

      // Where object-fit is supported and object-position isn't (Safari < 10)
      if (!ofi.skipTest && // unless user wants to apply regardless of browser support
      supportsObjectFit && // if browser already supports object-fit
      !style['object-position'] // unless object-position is used
      ) {
          return;
        }
    }

    // keep a clone in memory while resetting the original to a blank
    if (!ofi.img) {
      ofi.img = new Image(el.width, el.height);
      ofi.img.srcset = nativeGetAttribute.call(el, "data-ofi-srcset") || el.srcset;
      ofi.img.src = nativeGetAttribute.call(el, "data-ofi-src") || el.src;

      // preserve for any future cloneNode calls
      // https://github.com/bfred-it/object-fit-images/issues/53
      nativeSetAttribute.call(el, "data-ofi-src", el.src);
      if (el.srcset) {
        nativeSetAttribute.call(el, "data-ofi-srcset", el.srcset);
      }

      setPlaceholder(el, el.naturalWidth || el.width, el.naturalHeight || el.height);

      // remove srcset because it overrides src
      if (el.srcset) {
        el.srcset = '';
      }
      try {
        keepSrcUsable(el);
      } catch (err) {
        if (window.console) {
          console.warn('https://bit.ly/ofi-old-browser');
        }
      }
    }

    polyfillCurrentSrc(ofi.img);

    el.style.backgroundImage = "url(\"" + (ofi.img.currentSrc || ofi.img.src).replace(/"/g, '\\"') + "\")";
    el.style.backgroundPosition = style['object-position'] || 'center';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundOrigin = 'content-box';

    if (/scale-down/.test(style['object-fit'])) {
      onImageReady(ofi.img, function () {
        if (ofi.img.naturalWidth > el.width || ofi.img.naturalHeight > el.height) {
          el.style.backgroundSize = 'contain';
        } else {
          el.style.backgroundSize = 'auto';
        }
      });
    } else {
      el.style.backgroundSize = style['object-fit'].replace('none', 'auto').replace('fill', '100% 100%');
    }

    onImageReady(ofi.img, function (img) {
      setPlaceholder(el, img.naturalWidth, img.naturalHeight);
    });
  }

  function keepSrcUsable(el) {
    var descriptors = {
      get: function get(prop) {
        return el[OFI].img[prop ? prop : 'src'];
      },
      set: function set(value, prop) {
        el[OFI].img[prop ? prop : 'src'] = value;
        nativeSetAttribute.call(el, "data-ofi-" + prop, value); // preserve for any future cloneNode
        fixOne(el);
        return value;
      }
    };
    Object.defineProperty(el, 'src', descriptors);
    Object.defineProperty(el, 'currentSrc', {
      get: function get() {
        return descriptors.get('currentSrc');
      }
    });
    Object.defineProperty(el, 'srcset', {
      get: function get() {
        return descriptors.get('srcset');
      },
      set: function set(ss) {
        return descriptors.set(ss, 'srcset');
      }
    });
  }

  function hijackAttributes() {
    function getOfiImageMaybe(el, name) {
      return el[OFI] && el[OFI].img && (name === 'src' || name === 'srcset') ? el[OFI].img : el;
    }
    if (!supportsObjectPosition) {
      HTMLImageElement.prototype.getAttribute = function (name) {
        return nativeGetAttribute.call(getOfiImageMaybe(this, name), name);
      };

      HTMLImageElement.prototype.setAttribute = function (name, value) {
        return nativeSetAttribute.call(getOfiImageMaybe(this, name), name, String(value));
      };
    }
  }

  function fix(imgs, opts) {
    var startAutoMode = !autoModeEnabled && !imgs;
    opts = opts || {};
    imgs = imgs || 'img';

    if (supportsObjectPosition && !opts.skipTest || !supportsOFI) {
      return false;
    }

    // use imgs as a selector or just select all images
    if (imgs === 'img') {
      imgs = document.getElementsByTagName('img');
    } else if (typeof imgs === 'string') {
      imgs = document.querySelectorAll(imgs);
    } else if (!('length' in imgs)) {
      imgs = [imgs];
    }

    // apply fix to all
    for (var i = 0; i < imgs.length; i++) {
      imgs[i][OFI] = imgs[i][OFI] || {
        skipTest: opts.skipTest
      };
      fixOne(imgs[i]);
    }

    if (startAutoMode) {
      document.body.addEventListener('load', function (e) {
        if (e.target.tagName === 'IMG') {
          fix(e.target, {
            skipTest: opts.skipTest
          });
        }
      }, true);
      autoModeEnabled = true;
      imgs = 'img'; // reset to a generic selector for watchMQ
    }

    // if requested, watch media queries for object-fit change
    if (opts.watchMQ) {
      window.addEventListener('resize', fix.bind(null, imgs, {
        skipTest: opts.skipTest
      }));
    }
  }

  fix.supportsObjectFit = supportsObjectFit;
  fix.supportsObjectPosition = supportsObjectPosition;

  hijackAttributes();

  return fix;
}();

},{}],119:[function(require,module,exports){
(function (process,global){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function (t, e) {
  "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : t.ES6Promise = e();
}(undefined, function () {
  "use strict";
  function t(t) {
    var e = typeof t === "undefined" ? "undefined" : _typeof(t);return null !== t && ("object" === e || "function" === e);
  }function e(t) {
    return "function" == typeof t;
  }function n(t) {
    B = t;
  }function r(t) {
    G = t;
  }function o() {
    return function () {
      return process.nextTick(a);
    };
  }function i() {
    return "undefined" != typeof z ? function () {
      z(a);
    } : c();
  }function s() {
    var t = 0,
        e = new J(a),
        n = document.createTextNode("");return e.observe(n, { characterData: !0 }), function () {
      n.data = t = ++t % 2;
    };
  }function u() {
    var t = new MessageChannel();return t.port1.onmessage = a, function () {
      return t.port2.postMessage(0);
    };
  }function c() {
    var t = setTimeout;return function () {
      return t(a, 1);
    };
  }function a() {
    for (var t = 0; t < W; t += 2) {
      var e = V[t],
          n = V[t + 1];e(n), V[t] = void 0, V[t + 1] = void 0;
    }W = 0;
  }function f() {
    try {
      var t = Function("return this")().require("vertx");return z = t.runOnLoop || t.runOnContext, i();
    } catch (e) {
      return c();
    }
  }function l(t, e) {
    var n = this,
        r = new this.constructor(p);void 0 === r[Z] && O(r);var o = n._state;if (o) {
      var i = arguments[o - 1];G(function () {
        return P(o, r, i, n._result);
      });
    } else E(n, r, t, e);return r;
  }function h(t) {
    var e = this;if (t && "object" == (typeof t === "undefined" ? "undefined" : _typeof(t)) && t.constructor === e) return t;var n = new e(p);return g(n, t), n;
  }function p() {}function v() {
    return new TypeError("You cannot resolve a promise with itself");
  }function d() {
    return new TypeError("A promises callback cannot return that same promise.");
  }function _(t) {
    try {
      return t.then;
    } catch (e) {
      return nt.error = e, nt;
    }
  }function y(t, e, n, r) {
    try {
      t.call(e, n, r);
    } catch (o) {
      return o;
    }
  }function m(t, e, n) {
    G(function (t) {
      var r = !1,
          o = y(n, e, function (n) {
        r || (r = !0, e !== n ? g(t, n) : S(t, n));
      }, function (e) {
        r || (r = !0, j(t, e));
      }, "Settle: " + (t._label || " unknown promise"));!r && o && (r = !0, j(t, o));
    }, t);
  }function b(t, e) {
    e._state === tt ? S(t, e._result) : e._state === et ? j(t, e._result) : E(e, void 0, function (e) {
      return g(t, e);
    }, function (e) {
      return j(t, e);
    });
  }function w(t, n, r) {
    n.constructor === t.constructor && r === l && n.constructor.resolve === h ? b(t, n) : r === nt ? (j(t, nt.error), nt.error = null) : void 0 === r ? S(t, n) : e(r) ? m(t, n, r) : S(t, n);
  }function g(e, n) {
    e === n ? j(e, v()) : t(n) ? w(e, n, _(n)) : S(e, n);
  }function A(t) {
    t._onerror && t._onerror(t._result), T(t);
  }function S(t, e) {
    t._state === $ && (t._result = e, t._state = tt, 0 !== t._subscribers.length && G(T, t));
  }function j(t, e) {
    t._state === $ && (t._state = et, t._result = e, G(A, t));
  }function E(t, e, n, r) {
    var o = t._subscribers,
        i = o.length;t._onerror = null, o[i] = e, o[i + tt] = n, o[i + et] = r, 0 === i && t._state && G(T, t);
  }function T(t) {
    var e = t._subscribers,
        n = t._state;if (0 !== e.length) {
      for (var r = void 0, o = void 0, i = t._result, s = 0; s < e.length; s += 3) {
        r = e[s], o = e[s + n], r ? P(n, r, o, i) : o(i);
      }t._subscribers.length = 0;
    }
  }function M(t, e) {
    try {
      return t(e);
    } catch (n) {
      return nt.error = n, nt;
    }
  }function P(t, n, r, o) {
    var i = e(r),
        s = void 0,
        u = void 0,
        c = void 0,
        a = void 0;if (i) {
      if (s = M(r, o), s === nt ? (a = !0, u = s.error, s.error = null) : c = !0, n === s) return void j(n, d());
    } else s = o, c = !0;n._state !== $ || (i && c ? g(n, s) : a ? j(n, u) : t === tt ? S(n, s) : t === et && j(n, s));
  }function x(t, e) {
    try {
      e(function (e) {
        g(t, e);
      }, function (e) {
        j(t, e);
      });
    } catch (n) {
      j(t, n);
    }
  }function C() {
    return rt++;
  }function O(t) {
    t[Z] = rt++, t._state = void 0, t._result = void 0, t._subscribers = [];
  }function k() {
    return new Error("Array Methods must be provided an Array");
  }function F(t) {
    return new ot(this, t).promise;
  }function Y(t) {
    var e = this;return new e(U(t) ? function (n, r) {
      for (var o = t.length, i = 0; i < o; i++) {
        e.resolve(t[i]).then(n, r);
      }
    } : function (t, e) {
      return e(new TypeError("You must pass an array to race."));
    });
  }function q(t) {
    var e = this,
        n = new e(p);return j(n, t), n;
  }function D() {
    throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");
  }function K() {
    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
  }function L() {
    var t = void 0;if ("undefined" != typeof global) t = global;else if ("undefined" != typeof self) t = self;else try {
      t = Function("return this")();
    } catch (e) {
      throw new Error("polyfill failed because global object is unavailable in this environment");
    }var n = t.Promise;if (n) {
      var r = null;try {
        r = Object.prototype.toString.call(n.resolve());
      } catch (e) {}if ("[object Promise]" === r && !n.cast) return;
    }t.Promise = it;
  }var N = void 0;N = Array.isArray ? Array.isArray : function (t) {
    return "[object Array]" === Object.prototype.toString.call(t);
  };var U = N,
      W = 0,
      z = void 0,
      B = void 0,
      G = function G(t, e) {
    V[W] = t, V[W + 1] = e, W += 2, 2 === W && (B ? B(a) : X());
  },
      H = "undefined" != typeof window ? window : void 0,
      I = H || {},
      J = I.MutationObserver || I.WebKitMutationObserver,
      Q = "undefined" == typeof self && "undefined" != typeof process && "[object process]" === {}.toString.call(process),
      R = "undefined" != typeof Uint8ClampedArray && "undefined" != typeof importScripts && "undefined" != typeof MessageChannel,
      V = new Array(1e3),
      X = void 0;X = Q ? o() : J ? s() : R ? u() : void 0 === H && "function" == typeof require ? f() : c();var Z = Math.random().toString(36).substring(2),
      $ = void 0,
      tt = 1,
      et = 2,
      nt = { error: null },
      rt = 0,
      ot = function () {
    function t(t, e) {
      this._instanceConstructor = t, this.promise = new t(p), this.promise[Z] || O(this.promise), U(e) ? (this.length = e.length, this._remaining = e.length, this._result = new Array(this.length), 0 === this.length ? S(this.promise, this._result) : (this.length = this.length || 0, this._enumerate(e), 0 === this._remaining && S(this.promise, this._result))) : j(this.promise, k());
    }return t.prototype._enumerate = function (t) {
      for (var e = 0; this._state === $ && e < t.length; e++) {
        this._eachEntry(t[e], e);
      }
    }, t.prototype._eachEntry = function (t, e) {
      var n = this._instanceConstructor,
          r = n.resolve;if (r === h) {
        var o = _(t);if (o === l && t._state !== $) this._settledAt(t._state, e, t._result);else if ("function" != typeof o) this._remaining--, this._result[e] = t;else if (n === it) {
          var i = new n(p);w(i, t, o), this._willSettleAt(i, e);
        } else this._willSettleAt(new n(function (e) {
          return e(t);
        }), e);
      } else this._willSettleAt(r(t), e);
    }, t.prototype._settledAt = function (t, e, n) {
      var r = this.promise;r._state === $ && (this._remaining--, t === et ? j(r, n) : this._result[e] = n), 0 === this._remaining && S(r, this._result);
    }, t.prototype._willSettleAt = function (t, e) {
      var n = this;E(t, void 0, function (t) {
        return n._settledAt(tt, e, t);
      }, function (t) {
        return n._settledAt(et, e, t);
      });
    }, t;
  }(),
      it = function () {
    function t(e) {
      this[Z] = C(), this._result = this._state = void 0, this._subscribers = [], p !== e && ("function" != typeof e && D(), this instanceof t ? x(this, e) : K());
    }return t.prototype["catch"] = function (t) {
      return this.then(null, t);
    }, t.prototype["finally"] = function (t) {
      var e = this,
          n = e.constructor;return e.then(function (e) {
        return n.resolve(t()).then(function () {
          return e;
        });
      }, function (e) {
        return n.resolve(t()).then(function () {
          throw e;
        });
      });
    }, t;
  }();return it.prototype.then = l, it.all = F, it.race = Y, it.resolve = h, it.reject = q, it._setScheduler = n, it._setAsap = r, it._asap = G, it.polyfill = L, it.Promise = it, it.polyfill(), it;
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":12}],120:[function(require,module,exports){
// https://github.com/iamdustan/smoothscroll

'use strict';

// polyfill

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = function polyfill() {
  // aliases
  var w = window;
  var d = document;

  // return if scroll behavior is supported and polyfill is not forced
  if ('scrollBehavior' in d.documentElement.style && w.__forceSmoothScrollPolyfill__ !== true) {
    return;
  }

  // globals
  var Element = w.HTMLElement || w.Element;
  var SCROLL_TIME = 468;

  // object gathering original scroll methods
  var original = {
    scroll: w.scroll || w.scrollTo,
    scrollBy: w.scrollBy,
    elementScroll: Element.prototype.scroll || scrollElement,
    scrollIntoView: Element.prototype.scrollIntoView
  };

  // define timing method
  var now = w.performance && w.performance.now ? w.performance.now.bind(w.performance) : Date.now;

  /**
   * indicates if a the current browser is made by Microsoft
   * @method isMicrosoftBrowser
   * @param {String} userAgent
   * @returns {Boolean}
   */
  function isMicrosoftBrowser(userAgent) {
    var userAgentPatterns = ['MSIE ', 'Trident/', 'Edge/'];

    return new RegExp(userAgentPatterns.join('|')).test(userAgent);
  }

  /*
   * IE has rounding bug rounding down clientHeight and clientWidth and
   * rounding up scrollHeight and scrollWidth causing false positives
   * on hasScrollableSpace
   */
  var ROUNDING_TOLERANCE = isMicrosoftBrowser(w.navigator.userAgent) ? 1 : 0;

  /**
   * changes scroll position inside an element
   * @method scrollElement
   * @param {Number} x
   * @param {Number} y
   * @returns {undefined}
   */
  function scrollElement(x, y) {
    this.scrollLeft = x;
    this.scrollTop = y;
  }

  /**
   * returns result of applying ease math function to a number
   * @method ease
   * @param {Number} k
   * @returns {Number}
   */
  function ease(k) {
    return 0.5 * (1 - Math.cos(Math.PI * k));
  }

  /**
   * indicates if a smooth behavior should be applied
   * @method shouldBailOut
   * @param {Number|Object} firstArg
   * @returns {Boolean}
   */
  function shouldBailOut(firstArg) {
    if (firstArg === null || (typeof firstArg === 'undefined' ? 'undefined' : _typeof(firstArg)) !== 'object' || firstArg.behavior === undefined || firstArg.behavior === 'auto' || firstArg.behavior === 'instant') {
      // first argument is not an object/null
      // or behavior is auto, instant or undefined
      return true;
    }

    if ((typeof firstArg === 'undefined' ? 'undefined' : _typeof(firstArg)) === 'object' && firstArg.behavior === 'smooth') {
      // first argument is an object and behavior is smooth
      return false;
    }

    // throw error when behavior is not supported
    throw new TypeError('behavior member of ScrollOptions ' + firstArg.behavior + ' is not a valid value for enumeration ScrollBehavior.');
  }

  /**
   * indicates if an element has scrollable space in the provided axis
   * @method hasScrollableSpace
   * @param {Node} el
   * @param {String} axis
   * @returns {Boolean}
   */
  function hasScrollableSpace(el, axis) {
    if (axis === 'Y') {
      return el.clientHeight + ROUNDING_TOLERANCE < el.scrollHeight;
    }

    if (axis === 'X') {
      return el.clientWidth + ROUNDING_TOLERANCE < el.scrollWidth;
    }
  }

  /**
   * indicates if an element has a scrollable overflow property in the axis
   * @method canOverflow
   * @param {Node} el
   * @param {String} axis
   * @returns {Boolean}
   */
  function canOverflow(el, axis) {
    var overflowValue = w.getComputedStyle(el, null)['overflow' + axis];

    return overflowValue === 'auto' || overflowValue === 'scroll';
  }

  /**
   * indicates if an element can be scrolled in either axis
   * @method isScrollable
   * @param {Node} el
   * @param {String} axis
   * @returns {Boolean}
   */
  function isScrollable(el) {
    var isScrollableY = hasScrollableSpace(el, 'Y') && canOverflow(el, 'Y');
    var isScrollableX = hasScrollableSpace(el, 'X') && canOverflow(el, 'X');

    return isScrollableY || isScrollableX;
  }

  /**
   * finds scrollable parent of an element
   * @method findScrollableParent
   * @param {Node} el
   * @returns {Node} el
   */
  function findScrollableParent(el) {
    var isBody;

    do {
      el = el.parentNode;

      isBody = el === d.body;
    } while (isBody === false && isScrollable(el) === false);

    isBody = null;

    return el;
  }

  /**
   * self invoked function that, given a context, steps through scrolling
   * @method step
   * @param {Object} context
   * @returns {undefined}
   */
  function step(context) {
    var time = now();
    var value;
    var currentX;
    var currentY;
    var elapsed = (time - context.startTime) / SCROLL_TIME;

    // avoid elapsed times higher than one
    elapsed = elapsed > 1 ? 1 : elapsed;

    // apply easing to elapsed time
    value = ease(elapsed);

    currentX = context.startX + (context.x - context.startX) * value;
    currentY = context.startY + (context.y - context.startY) * value;

    context.method.call(context.scrollable, currentX, currentY);

    // scroll more if we have not reached our destination
    if (currentX !== context.x || currentY !== context.y) {
      w.requestAnimationFrame(step.bind(w, context));
    }
  }

  /**
   * scrolls window or element with a smooth behavior
   * @method smoothScroll
   * @param {Object|Node} el
   * @param {Number} x
   * @param {Number} y
   * @returns {undefined}
   */
  function smoothScroll(el, x, y) {
    var scrollable;
    var startX;
    var startY;
    var method;
    var startTime = now();

    // define scroll context
    if (el === d.body) {
      scrollable = w;
      startX = w.scrollX || w.pageXOffset;
      startY = w.scrollY || w.pageYOffset;
      method = original.scroll;
    } else {
      scrollable = el;
      startX = el.scrollLeft;
      startY = el.scrollTop;
      method = scrollElement;
    }

    // scroll looping over a frame
    step({
      scrollable: scrollable,
      method: method,
      startTime: startTime,
      startX: startX,
      startY: startY,
      x: x,
      y: y
    });
  }

  // ORIGINAL METHODS OVERRIDES
  // w.scroll and w.scrollTo
  w.scroll = w.scrollTo = function () {
    // avoid action when no arguments are passed
    if (arguments[0] === undefined) {
      return;
    }

    // avoid smooth behavior if not required
    if (shouldBailOut(arguments[0]) === true) {
      original.scroll.call(w, arguments[0].left !== undefined ? arguments[0].left : _typeof(arguments[0]) !== 'object' ? arguments[0] : w.scrollX || w.pageXOffset,
      // use top prop, second argument if present or fallback to scrollY
      arguments[0].top !== undefined ? arguments[0].top : arguments[1] !== undefined ? arguments[1] : w.scrollY || w.pageYOffset);

      return;
    }

    // LET THE SMOOTHNESS BEGIN!
    smoothScroll.call(w, d.body, arguments[0].left !== undefined ? ~~arguments[0].left : w.scrollX || w.pageXOffset, arguments[0].top !== undefined ? ~~arguments[0].top : w.scrollY || w.pageYOffset);
  };

  // w.scrollBy
  w.scrollBy = function () {
    // avoid action when no arguments are passed
    if (arguments[0] === undefined) {
      return;
    }

    // avoid smooth behavior if not required
    if (shouldBailOut(arguments[0])) {
      original.scrollBy.call(w, arguments[0].left !== undefined ? arguments[0].left : _typeof(arguments[0]) !== 'object' ? arguments[0] : 0, arguments[0].top !== undefined ? arguments[0].top : arguments[1] !== undefined ? arguments[1] : 0);

      return;
    }

    // LET THE SMOOTHNESS BEGIN!
    smoothScroll.call(w, d.body, ~~arguments[0].left + (w.scrollX || w.pageXOffset), ~~arguments[0].top + (w.scrollY || w.pageYOffset));
  };

  // Element.prototype.scroll and Element.prototype.scrollTo
  Element.prototype.scroll = Element.prototype.scrollTo = function () {
    // avoid action when no arguments are passed
    if (arguments[0] === undefined) {
      return;
    }

    // avoid smooth behavior if not required
    if (shouldBailOut(arguments[0]) === true) {
      // if one number is passed, throw error to match Firefox implementation
      if (typeof arguments[0] === 'number' && arguments[1] === undefined) {
        throw new SyntaxError('Value could not be converted');
      }

      original.elementScroll.call(this,
      // use left prop, first number argument or fallback to scrollLeft
      arguments[0].left !== undefined ? ~~arguments[0].left : _typeof(arguments[0]) !== 'object' ? ~~arguments[0] : this.scrollLeft,
      // use top prop, second argument or fallback to scrollTop
      arguments[0].top !== undefined ? ~~arguments[0].top : arguments[1] !== undefined ? ~~arguments[1] : this.scrollTop);

      return;
    }

    var left = arguments[0].left;
    var top = arguments[0].top;

    // LET THE SMOOTHNESS BEGIN!
    smoothScroll.call(this, this, typeof left === 'undefined' ? this.scrollLeft : ~~left, typeof top === 'undefined' ? this.scrollTop : ~~top);
  };

  // Element.prototype.scrollBy
  Element.prototype.scrollBy = function () {
    // avoid action when no arguments are passed
    if (arguments[0] === undefined) {
      return;
    }

    // avoid smooth behavior if not required
    if (shouldBailOut(arguments[0]) === true) {
      original.elementScroll.call(this, arguments[0].left !== undefined ? ~~arguments[0].left + this.scrollLeft : ~~arguments[0] + this.scrollLeft, arguments[0].top !== undefined ? ~~arguments[0].top + this.scrollTop : ~~arguments[1] + this.scrollTop);

      return;
    }

    this.scroll({
      left: ~~arguments[0].left + this.scrollLeft,
      top: ~~arguments[0].top + this.scrollTop,
      behavior: arguments[0].behavior
    });
  };

  // Element.prototype.scrollIntoView
  Element.prototype.scrollIntoView = function () {
    // avoid smooth behavior if not required
    if (shouldBailOut(arguments[0]) === true) {
      original.scrollIntoView.call(this, arguments[0] === undefined ? true : arguments[0]);

      return;
    }

    // LET THE SMOOTHNESS BEGIN!
    var scrollableParent = findScrollableParent(this);
    var parentRects = scrollableParent.getBoundingClientRect();
    var clientRects = this.getBoundingClientRect();

    if (scrollableParent !== d.body) {
      // reveal element inside parent
      smoothScroll.call(this, scrollableParent, scrollableParent.scrollLeft + clientRects.left - parentRects.left, scrollableParent.scrollTop + clientRects.top - parentRects.top);

      // reveal parent in viewport unless is fixed
      if (w.getComputedStyle(scrollableParent).position !== 'fixed') {
        w.scrollBy({
          left: parentRects.left,
          top: parentRects.top,
          behavior: 'smooth'
        });
      }
    } else {
      // reveal element in viewport
      w.scrollBy({
        left: clientRects.left,
        top: clientRects.top,
        behavior: 'smooth'
      });
    }
  };
}();

// if (typeof exports === 'object' && typeof module !== 'undefined') {
//   // commonjs
//   module.exports = { polyfill: polyfill };
// } else {
//   // global
//   polyfill();
// }

},{}],121:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('./iePolyfills/assign');

var _assign2 = _interopRequireDefault(_assign);

var _find = require('./iePolyfills/find');

var _find2 = _interopRequireDefault(_find);

var _forEach = require('./iePolyfills/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _getScrollY = require('./iePolyfills/getScrollY');

var _getScrollY2 = _interopRequireDefault(_getScrollY);

var _smoothscroll = require('./iePolyfills/smoothscroll');

var _smoothscroll2 = _interopRequireDefault(_smoothscroll);

var _objectFit = require('./iePolyfills/objectFit');

var _objectFit2 = _interopRequireDefault(_objectFit);

var _promise = require('./iePolyfills/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function initIeHelpers() {
  // console.log('initialized iePolyfills');
  (0, _objectFit2.default)();
}();

},{"./iePolyfills/assign":114,"./iePolyfills/find":115,"./iePolyfills/forEach":116,"./iePolyfills/getScrollY":117,"./iePolyfills/objectFit":118,"./iePolyfills/promise":119,"./iePolyfills/smoothscroll":120}],122:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = initSmoothScrollers;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SmoothScroller = function () {
  function SmoothScroller(opt) {
    _classCallCheck(this, SmoothScroller);

    this.el = opt.el;
    this.headNav = opt.headNav;
    this.linkedEl = false;
    this._init();
  }

  _createClass(SmoothScroller, [{
    key: '_init',
    value: function _init() {
      this._getLinkedEl();
      if (this.linkedEl) {
        this._setupEventHandlers();
      }
    }
  }, {
    key: '_getLinkedEl',
    value: function _getLinkedEl() {
      var href = this.el.attributes.href.value;
      if (href && href !== '#') {
        try {
          this.linkedEl = document.querySelector(href);
        } catch (error) {
          this.linkedEl = null;
        }
      }
    }
  }, {
    key: '_setupEventHandlers',
    value: function _setupEventHandlers() {
      var _this = this;

      this.el.addEventListener('click', function (e) {
        e.preventDefault();
        var y = window.getScrollY();
        var posY = _this.linkedEl.getBoundingClientRect().top;

        if (y > posY + y) {
          posY -= _this.headNav.getHeight();
        }

        window.scrollBy({
          top: posY,
          behavior: 'smooth'
        });
        return false;
      });
    }
  }]);

  return SmoothScroller;
}();

function initSmoothScrollers(headNav) {
  var smoothScrollerEls = document.querySelectorAll('a[href^="#"]');
  smoothScrollerEls.forEach(function (el) {
    new SmoothScroller({
      el: el,
      headNav: headNav
    });
  });
};

},{}]},{},[108]);

define('modules/tabbedContent', function(){
	var tabbedContent = (function() {
    /* Private Functions */

		return {
			/* Public Functions */
			init : function(tabContainer) {
        var windowElement = $(window),
          breakpoint    = $(tabContainer).data("breakpoint") ? $(tabContainer).data("breakpoint") : 992,
          toggleButton  = $(tabContainer).find("button"),
				    tabList       = $(tabContainer).find("ul"), 
              tabListItems  = $(tabList).find("li"),
              tabListLinks  = $(tabList).find("li>a"), 
				  closeTabMenu = function() {
            $(tabList).slideToggle("slow");
            $(toggleButton).toggleClass('collapsed');   
          };
                
				tabListLinks.each(function(i, tab) {
					/* Create the on-click events */
					$(tab).click(function(e) {
						/* clear all active flags & activate THIS tab*/
						tabListItems.removeClass("active selected");
						$(tab).parent().addClass("active selected");

						if ($(tab).data("showall")) {
							$(tabContainer).children("div").show();
						} else {
							$(tabContainer).children("div").hide();
							$(tabContainer).children("div.tab-" + i).show();
						}
						
            //swap button text for active tab item and close tab menu @mobile
            if (windowElement.width() < breakpoint) {
              $(toggleButton).text($(tab).parent().text());
              closeTabMenu(); 
            }
					});
				});

				/* Check to see if the page was loaded with our anchor */
				if (window.location.hash.indexOf("#") != -1) {
					/* does it start with THIS container */
					if (window.location.hash.indexOf(tabContainer.attr("id")) == 1) {
						tabList.find('a[href$="' + window.location.hash + '"]').click();
					}
				} else {
					tabListLinks.each(function(i, tab) {
				    if ($(tab).data("showall")) {
				      $(tabContainer).children("div").show();
							$(tab).parent().addClass("active");
					  } else if ($(tab).data("isdefault")) {
							/* Get the index from the href */
							var i = $(tab).attr("href").split("-");
							$(tabContainer).children("div").hide();
							$(tabContainer).children("div.tab-" + i[i.length - 1]).show();
							$(tab).parent().addClass("active");
						}
					});
				}

        /* if (windowElement.width() < breakpoint) {
          $(tabList).hide();
        } */
                
        /* event handlers */
        // toggle tab list open/closed
        $(toggleButton).click(function(e) {
          closeTabMenu();  
        });
                
        // window resize
        windowElement.on("debouncedresize", function () {
          if (windowElement.width() < breakpoint) {
            var activeTabTitle = $(tabList).find("li.active.selected > a").text();
            $(toggleButton).text(activeTabTitle);
            $(tabList).hide();
          }
        });
			}
		}
	})();
	return tabbedContent;
});
define('modules/accordionModule', function(){
    var accordionModule = (function () {
      var counter = 0;
      
        var hideSections = function(accordionId) {
            $('#'+accordionId+' .panel-heading').on('click', function() {
                var parent = $(this).closest('.accordion');
                var panel_collapse_id = $(this).next().attr('id');
                parent.find("div[class^='panel-collapse'][id!='"+ panel_collapse_id +"']").removeClass('in').addClass('collapse');
                parent.find("a[class^='panel-toggle']").addClass('collapsed');
              
                // Un-comment this in order to re-enable the automatic scrolling
                /*var parentPosY = $(this).offset();
                var offset = ($('.second-nav.sticky').length > 0) ? 80 : 20;
                $('html, body').animate({scrollTop: parentPosY.top - offset}, "slow");*/
            });
        };

        var scrollTo = function(accordionIndex, sectionIndex){
            if ((parseInt(accordionIndex)>=0) && (parseInt(sectionIndex)>=0)){
                var accordion = $(".accordion").get(accordionIndex);
                var section = $(accordion).find("div[class^='accordionSection']")[sectionIndex];
                var parentPosY = $(section).offset();
                $('html, body').animate({scrollTop: parentPosY.top - 130}, "slow");
            }
        };

        var showAccordionSection = function (accordionIndex,sectionIndex, accordionId) {
            // Get accordion and section
            var section;
            if (accordionIndex != null) {
                var accordionbyIndex = $(".accordion").get(accordionIndex);
                var id = $(accordionbyIndex).attr('id');
                section = $(accordionbyIndex).find("div[class^='accordionSection']")[sectionIndex];
            }
            else {
                section = $("#" + accordionId).find("div[class^='accordionSection']")[sectionIndex];
            }

            //Show body
            var section_body = $(section).find("div[class^='panel-collapse']")[0];
            $(section_body).removeClass('collapse').addClass('in');
            //Show Orange header
            var section_header = $(section).find("a")[0];
            $(section_header).removeClass('collapsed');
        };

        return {
            init: function(accordionIndex,sectionIndex,accordionId){
                hideSections(accordionId);
                showAccordionSection(accordionIndex, 0, accordionId);

                // handle deeplinking to accordion content
                var _pageAccordionIndex = null,
                     _pageSectionIndex = null;

                if (window.location.hash != ""){
                  var hash = window.location.hash.replace("#", ""),
                      namedAnchor = $('#'+accordionId+' a[name="'+hash+'"]');
                  
                  // fix for accordion ids changing on page load
                  if(namedAnchor.length >= 0){
                    var accordions = $('.panel-toggle');
                    $.each(accordions, function(key, value){
                      var title = $.trim($(this).text().replace(/ /g,''));

                      if(title.toLowerCase() === hash.toLowerCase()){
                        namedAnchor = $(this);
                      }
                    });
                  }

                  if(namedAnchor.closest('.accordionSection').length > 0){
                    // determine which accordion container this is part of
                    var accordionContainer = namedAnchor.closest('.accordion');
                    _pageAccordionIndex = $('.accordion').index(accordionContainer);
                    // determine which accordion this is part of
                    var accordionSection = namedAnchor.closest('.accordionSection');
                    _pageSectionIndex= $('#'+accordionId+' .accordionSection').index(accordionSection);
                  }
                }

                if(_pageAccordionIndex != null && _pageSectionIndex != null){
                  scrollTo(_pageAccordionIndex, _pageSectionIndex, accordionId);
                  showAccordionSection(_pageAccordionIndex,_pageSectionIndex,accordionId);
                }else{
                  scrollTo(accordionIndex, sectionIndex,accordionId);
                  if(!accordionIndex) accordionIndex = counter;
                  if (parseInt(sectionIndex)>=0){
                     showAccordionSection(accordionIndex,sectionIndex,accordionId);
                  }
                  counter++;
                }
            }
        };
    })();
    return accordionModule;
});

