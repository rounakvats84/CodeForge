"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTempFolder = createTempFolder;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
async function createTempFolder() {
    const folderName = Date.now().toString();
    const tempDir = path_1.default.join("temp", folderName);
    await promises_1.default.mkdir(tempDir, {
        recursive: true
    });
    return tempDir;
}
//# sourceMappingURL=createTempFolder.js.map