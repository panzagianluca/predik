"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/responselike";
exports.ids = ["vendor-chunks/responselike"];
exports.modules = {

/***/ "(ssr)/./node_modules/responselike/node_modules/lowercase-keys/index.js":
/*!************************************************************************!*\
  !*** ./node_modules/responselike/node_modules/lowercase-keys/index.js ***!
  \************************************************************************/
/***/ ((module) => {

eval("\nmodule.exports = object => {\n\tconst result = {};\n\n\tfor (const [key, value] of Object.entries(object)) {\n\t\tresult[key.toLowerCase()] = value;\n\t}\n\n\treturn result;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvcmVzcG9uc2VsaWtlL25vZGVfbW9kdWxlcy9sb3dlcmNhc2Uta2V5cy9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBYTtBQUNiO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EiLCJzb3VyY2VzIjpbIi9Vc2Vycy9wYW56YS9Eb2N1bWVudHMvUGVyc29uYWxQcm9qZWN0cy9wcmVkaWsvbm9kZV9tb2R1bGVzL3Jlc3BvbnNlbGlrZS9ub2RlX21vZHVsZXMvbG93ZXJjYXNlLWtleXMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBvYmplY3QgPT4ge1xuXHRjb25zdCByZXN1bHQgPSB7fTtcblxuXHRmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhvYmplY3QpKSB7XG5cdFx0cmVzdWx0W2tleS50b0xvd2VyQ2FzZSgpXSA9IHZhbHVlO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn07XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/responselike/node_modules/lowercase-keys/index.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/responselike/src/index.js":
/*!************************************************!*\
  !*** ./node_modules/responselike/src/index.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\nconst Readable = (__webpack_require__(/*! stream */ \"stream\").Readable);\nconst lowercaseKeys = __webpack_require__(/*! lowercase-keys */ \"(ssr)/./node_modules/responselike/node_modules/lowercase-keys/index.js\");\n\nclass Response extends Readable {\n\tconstructor(statusCode, headers, body, url) {\n\t\tif (typeof statusCode !== 'number') {\n\t\t\tthrow new TypeError('Argument `statusCode` should be a number');\n\t\t}\n\t\tif (typeof headers !== 'object') {\n\t\t\tthrow new TypeError('Argument `headers` should be an object');\n\t\t}\n\t\tif (!(body instanceof Buffer)) {\n\t\t\tthrow new TypeError('Argument `body` should be a buffer');\n\t\t}\n\t\tif (typeof url !== 'string') {\n\t\t\tthrow new TypeError('Argument `url` should be a string');\n\t\t}\n\n\t\tsuper();\n\t\tthis.statusCode = statusCode;\n\t\tthis.headers = lowercaseKeys(headers);\n\t\tthis.body = body;\n\t\tthis.url = url;\n\t}\n\n\t_read() {\n\t\tthis.push(this.body);\n\t\tthis.push(null);\n\t}\n}\n\nmodule.exports = Response;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvcmVzcG9uc2VsaWtlL3NyYy9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBYTs7QUFFYixpQkFBaUIsc0RBQTBCO0FBQzNDLHNCQUFzQixtQkFBTyxDQUFDLDhGQUFnQjs7QUFFOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSIsInNvdXJjZXMiOlsiL1VzZXJzL3BhbnphL0RvY3VtZW50cy9QZXJzb25hbFByb2plY3RzL3ByZWRpay9ub2RlX21vZHVsZXMvcmVzcG9uc2VsaWtlL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmNvbnN0IFJlYWRhYmxlID0gcmVxdWlyZSgnc3RyZWFtJykuUmVhZGFibGU7XG5jb25zdCBsb3dlcmNhc2VLZXlzID0gcmVxdWlyZSgnbG93ZXJjYXNlLWtleXMnKTtcblxuY2xhc3MgUmVzcG9uc2UgZXh0ZW5kcyBSZWFkYWJsZSB7XG5cdGNvbnN0cnVjdG9yKHN0YXR1c0NvZGUsIGhlYWRlcnMsIGJvZHksIHVybCkge1xuXHRcdGlmICh0eXBlb2Ygc3RhdHVzQ29kZSAhPT0gJ251bWJlcicpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IGBzdGF0dXNDb2RlYCBzaG91bGQgYmUgYSBudW1iZXInKTtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBoZWFkZXJzICE9PSAnb2JqZWN0Jykge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgYGhlYWRlcnNgIHNob3VsZCBiZSBhbiBvYmplY3QnKTtcblx0XHR9XG5cdFx0aWYgKCEoYm9keSBpbnN0YW5jZW9mIEJ1ZmZlcikpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IGBib2R5YCBzaG91bGQgYmUgYSBidWZmZXInKTtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBgdXJsYCBzaG91bGQgYmUgYSBzdHJpbmcnKTtcblx0XHR9XG5cblx0XHRzdXBlcigpO1xuXHRcdHRoaXMuc3RhdHVzQ29kZSA9IHN0YXR1c0NvZGU7XG5cdFx0dGhpcy5oZWFkZXJzID0gbG93ZXJjYXNlS2V5cyhoZWFkZXJzKTtcblx0XHR0aGlzLmJvZHkgPSBib2R5O1xuXHRcdHRoaXMudXJsID0gdXJsO1xuXHR9XG5cblx0X3JlYWQoKSB7XG5cdFx0dGhpcy5wdXNoKHRoaXMuYm9keSk7XG5cdFx0dGhpcy5wdXNoKG51bGwpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVzcG9uc2U7XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/responselike/src/index.js\n");

/***/ })

};
;