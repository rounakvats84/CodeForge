"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanup = cleanup;
const promises_1 = __importDefault(require("fs/promises"));
async function cleanup(tempDir) {
    await promises_1.default.rm(tempDir, {
        recursive: true,
        force: true
    });
}
//# sourceMappingURL=cleanup.js.map