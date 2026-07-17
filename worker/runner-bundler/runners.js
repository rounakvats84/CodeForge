"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runners = void 0;
const cpp_1 = require("../runners/cpp");
const python_1 = require("../runners/python");
const java_1 = require("../runners/java");
exports.runners = {
    cpp: cpp_1.cppRunner,
    python: python_1.pythonRunner,
    java: java_1.javaRunner
};
//# sourceMappingURL=runners.js.map