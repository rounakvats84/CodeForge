import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

const STARTER_CODE: Record<string, string> = {
  cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};",
  java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}",
  python: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        "
};

interface EditorPanelProps {
  problemId: string;
  onExecute: (language: string, code: string, type: "RUN" | "SUBMIT") => void;
}

export default function EditorPanel({ problemId, onExecute }: EditorPanelProps) {
  const [language, setLanguage] = useState("cpp");
  const [codeState, setCodeState] = useState<Record<string, string>>(STARTER_CODE);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Fetch saved Editor State on Mount
  useEffect(() => {
    const fetchSavedState = async () => {
      try {
        // Monaco backend runs on port 3002[cite: 1]
        const res = await axios.get(`http://localhost:3002/api/editor/${problemId}`, { withCredentials: true });
        if (res.data.success && res.data.data) {
          const saved = res.data.data;
          setCodeState({
            cpp: saved.codeCpp || STARTER_CODE.cpp,
            java: saved.codeJava || STARTER_CODE.java,
            python: saved.codePython || STARTER_CODE.python,
          });
        }
      } catch (error) {
        console.error("Failed to load saved editor state");
      }
    };
    fetchSavedState();
  }, [problemId]);

  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.defineTheme('leetcode-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#ffffff0a',
      }
    });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  // 2. Debounced Auto-Save
  const handleCodeChange = (val: string | undefined) => {
    const newCode = val || "";
    setCodeState(prev => ({ ...prev, [language]: newCode }));

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout to save after 1000ms of inactivity
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await axios.post(`http://localhost:3002/api/editor/save`, { //[cite: 1]
          problemId,
          language,
          code: newCode
        }, { withCredentials: true });
        console.log(`💾 Auto-saved ${language} code`);
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border border-white/[0.04] rounded-xl overflow-hidden relative">
      
      {/* Editor Header with Run & Submit Actions */}
      <div className="h-11 flex justify-between items-center px-4 bg-[#121214] border-b border-white/[0.04] shrink-0 absolute top-0 left-0 right-0 z-10">
        <select 
          value={language}
          onChange={handleLanguageChange}
          className="bg-transparent text-zinc-300 text-xs py-1 rounded outline-none cursor-pointer hover:text-white transition-colors"
        >
          <option value="cpp" className="bg-[#1e1e20]">C++</option>
          <option value="java" className="bg-[#1e1e20]">Java</option>
          <option value="python" className="bg-[#1e1e20]">Python</option>
        </select>

        <div className="flex gap-2">
          <button 
            onClick={() => onExecute(language, codeState[language], "RUN")}
            className="px-4 py-1.5 text-[11px] font-semibold tracking-wide rounded-md bg-white/[0.05] text-zinc-300 border border-white/[0.05] hover:bg-white/[0.1] hover:text-white transition-all"
          >
            Run
          </button>
          <button 
            onClick={() => onExecute(language, codeState[language], "SUBMIT")}
            className="px-4 py-1.5 text-[11px] font-semibold tracking-wide rounded-md bg-emerald-600/90 text-white hover:bg-emerald-500 shadow-sm transition-all"
          >
            Submit
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative pt-11">
        <Editor
          height="100%"
          language={language}
          theme="leetcode-dark"
          value={codeState[language]}
          onChange={handleCodeChange}
          beforeMount={handleEditorWillMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "Geist Mono, monospace",
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            automaticLayout: true,
            padding: { top: 16 }
          }}
        />
      </div>
    </div>
  );
}