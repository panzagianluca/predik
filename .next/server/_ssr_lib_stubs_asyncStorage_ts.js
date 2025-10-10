"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "_ssr_lib_stubs_asyncStorage_ts";
exports.ids = ["_ssr_lib_stubs_asyncStorage_ts"];
exports.modules = {

/***/ "(ssr)/./lib/stubs/asyncStorage.ts":
/*!***********************************!*\
  !*** ./lib/stubs/asyncStorage.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AsyncStorage: () => (/* binding */ AsyncStorage),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nconst store = new Map();\nconst AsyncStorage = {\n    async getItem (key) {\n        return store.has(key) ? store.get(key) : null;\n    },\n    async setItem (key, value) {\n        store.set(key, value);\n    },\n    async removeItem (key) {\n        store.delete(key);\n    },\n    async clear () {\n        store.clear();\n    },\n    async getAllKeys () {\n        return Array.from(store.keys());\n    }\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AsyncStorage);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9saWIvc3R1YnMvYXN5bmNTdG9yYWdlLnRzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsTUFBTUEsUUFBUSxJQUFJQztBQUVsQixNQUFNQyxlQUFlO0lBQ25CLE1BQU1DLFNBQVFDLEdBQVc7UUFDdkIsT0FBT0osTUFBTUssR0FBRyxDQUFDRCxPQUFPSixNQUFNTSxHQUFHLENBQUNGLE9BQVE7SUFDNUM7SUFDQSxNQUFNRyxTQUFRSCxHQUFXLEVBQUVJLEtBQWE7UUFDdENSLE1BQU1TLEdBQUcsQ0FBQ0wsS0FBS0k7SUFDakI7SUFDQSxNQUFNRSxZQUFXTixHQUFXO1FBQzFCSixNQUFNVyxNQUFNLENBQUNQO0lBQ2Y7SUFDQSxNQUFNUTtRQUNKWixNQUFNWSxLQUFLO0lBQ2I7SUFDQSxNQUFNQztRQUNKLE9BQU9DLE1BQU1DLElBQUksQ0FBQ2YsTUFBTWdCLElBQUk7SUFDOUI7QUFDRjtBQUVBLGlFQUFlZCxZQUFZQSxFQUFDO0FBQ0oiLCJzb3VyY2VzIjpbIi9Vc2Vycy9wYW56YS9Eb2N1bWVudHMvUGVyc29uYWxQcm9qZWN0cy9wcmVkaWsvbGliL3N0dWJzL2FzeW5jU3RvcmFnZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzdG9yZSA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG5cbmNvbnN0IEFzeW5jU3RvcmFnZSA9IHtcbiAgYXN5bmMgZ2V0SXRlbShrZXk6IHN0cmluZykge1xuICAgIHJldHVybiBzdG9yZS5oYXMoa2V5KSA/IHN0b3JlLmdldChrZXkpISA6IG51bGw7XG4gIH0sXG4gIGFzeW5jIHNldEl0ZW0oa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICBzdG9yZS5zZXQoa2V5LCB2YWx1ZSk7XG4gIH0sXG4gIGFzeW5jIHJlbW92ZUl0ZW0oa2V5OiBzdHJpbmcpIHtcbiAgICBzdG9yZS5kZWxldGUoa2V5KTtcbiAgfSxcbiAgYXN5bmMgY2xlYXIoKSB7XG4gICAgc3RvcmUuY2xlYXIoKTtcbiAgfSxcbiAgYXN5bmMgZ2V0QWxsS2V5cygpIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShzdG9yZS5rZXlzKCkpO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBBc3luY1N0b3JhZ2U7XG5leHBvcnQgeyBBc3luY1N0b3JhZ2UgfTtcbiJdLCJuYW1lcyI6WyJzdG9yZSIsIk1hcCIsIkFzeW5jU3RvcmFnZSIsImdldEl0ZW0iLCJrZXkiLCJoYXMiLCJnZXQiLCJzZXRJdGVtIiwidmFsdWUiLCJzZXQiLCJyZW1vdmVJdGVtIiwiZGVsZXRlIiwiY2xlYXIiLCJnZXRBbGxLZXlzIiwiQXJyYXkiLCJmcm9tIiwia2V5cyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./lib/stubs/asyncStorage.ts\n");

/***/ })

};
;