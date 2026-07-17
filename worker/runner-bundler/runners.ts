import { cppRunner } from "../runners/cpp";
import { pythonRunner } from "../runners/python";
import { javaRunner } from "../runners/java";

export const runners = {
    cpp: cppRunner,
    python: pythonRunner,
    java: javaRunner
};