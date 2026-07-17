"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeSourceCode = writeSourceCode;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
async function writeSourceCode(tempDir, sourceFile, generatedCode) {
    const filePath = path_1.default.join(tempDir, sourceFile);
    await promises_1.default.writeFile(filePath, generatedCode, "utf8");
    return filePath;
}
//# sourceMappingURL=writeSourceCode.js.map