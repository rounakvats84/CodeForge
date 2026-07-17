"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCppTwoSum = generateCppTwoSum;
exports.generatePythonTwoSum = generatePythonTwoSum;
exports.generateJavaTwoSum = generateJavaTwoSum;
function generateCppTwoSum(code, testCase) {
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
function generatePythonTwoSum(code, testCase) {
    return `
${code}

nums=[${testCase.nums.join(",")}]

target=${testCase.target}

obj=Solution()

ans=obj.twoSum(nums,target)

print(*ans)
`;
}
function generateJavaTwoSum(code, testCase) {
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
//# sourceMappingURL=twoSum.js.map