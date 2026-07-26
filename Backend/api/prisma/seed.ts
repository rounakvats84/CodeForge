import prisma from "../src/config/prisma"; 


async function main() {
  await prisma.problem.create({
    data: {
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      difficulty: 'EASY',
      
      templateCpp: `
#include<bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main(){
    vector<int> nums={{{nums}}};
    int target={{target}};
    Solution obj;
    vector<int> ans=obj.twoSum(nums,target);
    for(int x:ans)
        cout<<x<<" ";
}
`,
      templateJava: `
import java.util.*;

{{USER_CODE}}

public class Main{
    public static void main(String[] args){
        int[] nums={{{nums}}};
        int target={{target}};
        Solution obj=new Solution();
        int[] ans=obj.twoSum(nums,target);
        for(int x:ans)
            System.out.print(x+" ");
    }
}
`,
      templatePython: `
{{USER_CODE}}

nums=[{{nums}}]
target={{target}}
obj=Solution()
ans=obj.twoSum(nums,target)
print(*ans)
`,
      visibleTestCases: [
        { nums: [2, 7, 11, 15], target: 9, expectedOutput: "0 1" },
        { nums: [3, 2, 4], target: 6, expectedOutput: "1 2" },
        { nums: [3, 3], target: 6, expectedOutput: "0 1" }
      ],
      hiddenTestCases: [
        { nums: [2, 5, 5, 11], target: 10, expectedOutput: "1 2" },
        { nums: [-1, -2, -3, -4, -5], target: -8, expectedOutput: "2 4" }
      ]
    }
  });
  console.log('Problem with dynamic templates seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });