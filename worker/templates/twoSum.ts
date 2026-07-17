import { TestCase } from "../types/TestCase";

export function generateCppTwoSum(
    code: string,
    testCase: TestCase
): string {

    return `
#include<bits/stdc++.h>

using namespace std;

${code}

int main(){

    vector<int> nums={${testCase.nums.join(",")}};

    int target=${testCase.target};

    Solution obj;

    vector<int> ans=obj.twoSum(nums,target);

    for(int x:ans)
        cout<<x<<" ";

}
`;

}

export function generatePythonTwoSum(
    code: string,
    testCase: TestCase
): string {

    return `
${code}

nums=[${testCase.nums.join(",")}]

target=${testCase.target}

obj=Solution()

ans=obj.twoSum(nums,target)

print(*ans)
`;

}

export function generateJavaTwoSum(
    code: string,
    testCase: TestCase
): string {

    return `
import java.util.*;

${code}

public class Main{

    public static void main(String[] args){

        int[] nums={${testCase.nums.join(",")}};

        int target=${testCase.target};

        Solution obj=new Solution();

        int[] ans=obj.twoSum(nums,target);

        for(int x:ans)
            System.out.print(x+" ");

    }

}
`;

}