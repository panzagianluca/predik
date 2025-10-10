/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/url-set-query";
exports.ids = ["vendor-chunks/url-set-query"];
exports.modules = {

/***/ "(ssr)/./node_modules/url-set-query/index.js":
/*!*********************************************!*\
  !*** ./node_modules/url-set-query/index.js ***!
  \*********************************************/
/***/ ((module) => {

eval("module.exports = urlSetQuery\nfunction urlSetQuery (url, query) {\n  if (query) {\n    // remove optional leading symbols\n    query = query.trim().replace(/^(\\?|#|&)/, '')\n\n    // don't append empty query\n    query = query ? ('?' + query) : query\n\n    var parts = url.split(/[\\?\\#]/)\n    var start = parts[0]\n    if (query && /\\:\\/\\/[^\\/]*$/.test(start)) {\n      // e.g. http://foo.com -> http://foo.com/\n      start = start + '/'\n    }\n    var match = url.match(/(\\#.*)$/)\n    url = start + query\n    if (match) { // add hash back in\n      url = url + match[0]\n    }\n  }\n  return url\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvdXJsLXNldC1xdWVyeS9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyIvVXNlcnMvcGFuemEvRG9jdW1lbnRzL1BlcnNvbmFsUHJvamVjdHMvcHJlZGlrL25vZGVfbW9kdWxlcy91cmwtc2V0LXF1ZXJ5L2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gdXJsU2V0UXVlcnlcbmZ1bmN0aW9uIHVybFNldFF1ZXJ5ICh1cmwsIHF1ZXJ5KSB7XG4gIGlmIChxdWVyeSkge1xuICAgIC8vIHJlbW92ZSBvcHRpb25hbCBsZWFkaW5nIHN5bWJvbHNcbiAgICBxdWVyeSA9IHF1ZXJ5LnRyaW0oKS5yZXBsYWNlKC9eKFxcP3wjfCYpLywgJycpXG5cbiAgICAvLyBkb24ndCBhcHBlbmQgZW1wdHkgcXVlcnlcbiAgICBxdWVyeSA9IHF1ZXJ5ID8gKCc/JyArIHF1ZXJ5KSA6IHF1ZXJ5XG5cbiAgICB2YXIgcGFydHMgPSB1cmwuc3BsaXQoL1tcXD9cXCNdLylcbiAgICB2YXIgc3RhcnQgPSBwYXJ0c1swXVxuICAgIGlmIChxdWVyeSAmJiAvXFw6XFwvXFwvW15cXC9dKiQvLnRlc3Qoc3RhcnQpKSB7XG4gICAgICAvLyBlLmcuIGh0dHA6Ly9mb28uY29tIC0+IGh0dHA6Ly9mb28uY29tL1xuICAgICAgc3RhcnQgPSBzdGFydCArICcvJ1xuICAgIH1cbiAgICB2YXIgbWF0Y2ggPSB1cmwubWF0Y2goLyhcXCMuKikkLylcbiAgICB1cmwgPSBzdGFydCArIHF1ZXJ5XG4gICAgaWYgKG1hdGNoKSB7IC8vIGFkZCBoYXNoIGJhY2sgaW5cbiAgICAgIHVybCA9IHVybCArIG1hdGNoWzBdXG4gICAgfVxuICB9XG4gIHJldHVybiB1cmxcbn1cbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/url-set-query/index.js\n");

/***/ })

};
;