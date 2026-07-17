import { TestCase } from "./TestCase";

export interface Runner {

    sourceFile: string;

    generateSourceCode(
        code: string,
        testCase: TestCase
    ): string;

    compile(
        tempDir: string
    ): Promise<void>;

    execute(
        tempDir: string
    ): Promise<string>;

}