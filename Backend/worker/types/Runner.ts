import { TestCase } from "./TestCase";

export interface Runner {
    sourceFile: string;
    
    // Added template parameter
    generateSourceCode(
        code: string,
        testCase: any, 
        template: string
    ): string;

    compile(
        tempDir: string,
        containerName: string
    ): Promise<void>;

    execute(
        tempDir: string,
        containerName: string
    ): Promise<string>;
}