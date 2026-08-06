import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

interface EditorPanelProps {
  problemId: string;
  onExecute: (language: string, code: string, type: "RUN" | "SUBMIT") => void;
}

export default function EditorPanel({ problemId, onExecute }: EditorPanelProps) {
  const [language, setLanguage] = useState("cpp");
  
  // Start empty. The backend is the source of truth.
  const [codeState, setCodeState] = useState<Record<string, string>>({
    cpp: "", java: "", python: ""
  });
  const [isResetting, setIsResetting] = useState(false);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch saved Editor State (Lazy Initialization handled by backend)
  useEffect(() => {
    const fetchSavedState = async () => {
      try {
        const res = await axios.get(`http://localhost:3002/api/editor/${problemId}`, { withCredentials: true });
        if (res.data.success && res.data.data) {
          const saved = res.data.data;
          setCodeState({
            cpp: saved.codeCpp || "",
            java: saved.codeJava || "",
            python: saved.codePython || "",
          });
        }
      } catch (error) {
        console.error("Failed to load saved editor state");
      }
    };
    fetchSavedState();
  }, [problemId]);

  // 2. Handle Reset
  const handleReset = async () => {
    setIsResetting(true);
    try {
      const res = await axios.post(`http://localhost:3002/api/editor/${problemId}/reset`, {}, { withCredentials: true });
      if (res.data.success && res.data.data) {
        const resetState = res.data.data;
        setCodeState({
          cpp: resetState.codeCpp || "",
          java: resetState.codeJava || "",
          python: resetState.codePython || "",
        });
      }
    } catch (error) {
      console.error("Failed to reset editor state");
    } finally {
      setIsResetting(false);
    }
  };

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

  const handleCodeChange = (val: string | undefined) => {
    const newCode = val || "";
    setCodeState(prev => ({ ...prev, [language]: newCode }));

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await axios.post(`http://localhost:3002/api/editor/save`, {
          problemId,
          language,
          code: newCode
        }, { withCredentials: true });
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border border-white/[0.04] rounded-xl overflow-hidden relative">
      
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

        <div className="flex items-center gap-3">
          {/* Elegant static reset button with soft shadow */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            title="Reset to default code"
            className="p-1.5 rounded-md bg-white/[0.04] text-zinc-400 border border-white/[0.05] hover:bg-white/[0.08] hover:text-zinc-100 transition-colors shadow-sm disabled:opacity-50"
          >
            <svg 
              className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>

          <div className="w-[1px] h-4 bg-white/[0.1]"></div>

          <div className="flex gap-2">
            <button 
              onClick={() => onExecute(language, codeState[language], "RUN")}
              className="px-4 py-1.5 text-[11px] font-semibold tracking-wide rounded-md bg-white/[0.05] text-zinc-300 border border-white/[0.05] hover:bg-white/[0.1] hover:text-white transition-all shadow-sm"
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