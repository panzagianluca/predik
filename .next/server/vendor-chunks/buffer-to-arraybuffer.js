/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/buffer-to-arraybuffer";
exports.ids = ["vendor-chunks/buffer-to-arraybuffer"];
exports.modules = {

/***/ "(ssr)/./node_modules/buffer-to-arraybuffer/buffer-to-arraybuffer.js":
/*!*********************************************************************!*\
  !*** ./node_modules/buffer-to-arraybuffer/buffer-to-arraybuffer.js ***!
  \*********************************************************************/
/***/ (function(module, exports) {

eval("(function(root) {\n  var isArrayBufferSupported = (new Buffer(0)).buffer instanceof ArrayBuffer;\n\n  var bufferToArrayBuffer = isArrayBufferSupported ? bufferToArrayBufferSlice : bufferToArrayBufferCycle;\n\n  function bufferToArrayBufferSlice(buffer) {\n    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);\n  }\n\n  function bufferToArrayBufferCycle(buffer) {\n    var ab = new ArrayBuffer(buffer.length);\n    var view = new Uint8Array(ab);\n    for (var i = 0; i < buffer.length; ++i) {\n      view[i] = buffer[i];\n    }\n    return ab;\n  }\n\n  if (true) {\n    if ( true && module.exports) {\n      exports = module.exports = bufferToArrayBuffer;\n    }\n    exports.bufferToArrayBuffer = bufferToArrayBuffer;\n  } else {}\n})(this);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvYnVmZmVyLXRvLWFycmF5YnVmZmVyL2J1ZmZlci10by1hcnJheWJ1ZmZlci5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsbUJBQW1CO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU0sSUFBOEI7QUFDcEMsUUFBUSxLQUE2QjtBQUNyQztBQUNBO0FBQ0EsSUFBSSwyQkFBMkI7QUFDL0IsSUFBSSxLQUFLLEVBTU47QUFDSCxDQUFDIiwic291cmNlcyI6WyIvVXNlcnMvcGFuemEvRG9jdW1lbnRzL1BlcnNvbmFsUHJvamVjdHMvcHJlZGlrL25vZGVfbW9kdWxlcy9idWZmZXItdG8tYXJyYXlidWZmZXIvYnVmZmVyLXRvLWFycmF5YnVmZmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbihyb290KSB7XG4gIHZhciBpc0FycmF5QnVmZmVyU3VwcG9ydGVkID0gKG5ldyBCdWZmZXIoMCkpLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyO1xuXG4gIHZhciBidWZmZXJUb0FycmF5QnVmZmVyID0gaXNBcnJheUJ1ZmZlclN1cHBvcnRlZCA/IGJ1ZmZlclRvQXJyYXlCdWZmZXJTbGljZSA6IGJ1ZmZlclRvQXJyYXlCdWZmZXJDeWNsZTtcblxuICBmdW5jdGlvbiBidWZmZXJUb0FycmF5QnVmZmVyU2xpY2UoYnVmZmVyKSB7XG4gICAgcmV0dXJuIGJ1ZmZlci5idWZmZXIuc2xpY2UoYnVmZmVyLmJ5dGVPZmZzZXQsIGJ1ZmZlci5ieXRlT2Zmc2V0ICsgYnVmZmVyLmJ5dGVMZW5ndGgpO1xuICB9XG5cbiAgZnVuY3Rpb24gYnVmZmVyVG9BcnJheUJ1ZmZlckN5Y2xlKGJ1ZmZlcikge1xuICAgIHZhciBhYiA9IG5ldyBBcnJheUJ1ZmZlcihidWZmZXIubGVuZ3RoKTtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGFiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ1ZmZlci5sZW5ndGg7ICsraSkge1xuICAgICAgdmlld1tpXSA9IGJ1ZmZlcltpXTtcbiAgICB9XG4gICAgcmV0dXJuIGFiO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gYnVmZmVyVG9BcnJheUJ1ZmZlcjtcbiAgICB9XG4gICAgZXhwb3J0cy5idWZmZXJUb0FycmF5QnVmZmVyID0gYnVmZmVyVG9BcnJheUJ1ZmZlcjtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoW10sIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGJ1ZmZlclRvQXJyYXlCdWZmZXI7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5idWZmZXJUb0FycmF5QnVmZmVyID0gYnVmZmVyVG9BcnJheUJ1ZmZlcjtcbiAgfVxufSkodGhpcyk7XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/buffer-to-arraybuffer/buffer-to-arraybuffer.js\n");

/***/ })

};
;