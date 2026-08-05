import { useState, useEffect } from "react";

interface TestcasePanelProps {
  problem: any;
  submissionResult: any; 
}

export default function TestcasePanel({ problem, submissionResult }: TestcasePanelProps) {
  const [activeTab, setActiveTab] = useState<"testcases" | "result">("testcases");
  const [activeCase, setActiveCase] = useState<any>(null);
  const [activeResultCaseIdx, setActiveResultCaseIdx] = useState<number>(0);

  // Auto-switch to the Result tab automatically
  useEffect(() => {
    if (submissionResult) {
      setActiveTab("result");
      setActiveResultCaseIdx(0);
    }
  }, [submissionResult]);

  useEffect(() => {
    if (problem?.visibleTestCases?.length > 0 && !activeCase) {
      setActiveCase(problem.visibleTestCases[0]);
    }
  }, [problem, activeCase]);

  const getInputsOnly = (tc: any) => {
    if (!tc) return {};
    const { expectedOutput, _id, ...inputs } = tc;
    return inputs;
  };

  const formatOutput = (str: string | undefined | null) => {
    if (!str) return "";
    let trimmed = String(str).trim();
    if (!trimmed.startsWith("[") && trimmed.includes(" ")) {
      return `[${trimmed.split(" ").join(", ")}]`;
    }
    return trimmed;
  };

  const renderResultContent = () => {
    if (!submissionResult) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-3">
          <p className="text-lg font-semibold text-zinc-300 tracking-wide">You must run your code first</p>
        </div>
      );
    }

    const { status, verdict, passedTestCases, totalTestCases, compilerOutput, runtimeError, runtime, runResults } = submissionResult;

    if (status === "QUEUED" || status === "RUNNING") {
      return (
        <div className="flex flex-col items-center justify-center h-full text-zinc-300 text-sm space-y-4">
          <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-semibold tracking-widest uppercase text-sm">{status}...</p>
        </div>
      );
    }

    if (status === "ERROR" || verdict === "SYSTEM_ERROR") {
      return (
        <div className="p-4">
          <h2 className="text-lg font-bold text-red-500 mb-2">System Error</h2>
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md font-mono text-sm text-red-400 whitespace-pre-wrap">
            {runtimeError || "Failed to execute code."}
          </div>
        </div>
      );
    }

    if (verdict === "COMPILATION_ERROR") {
      return (
        <div className="p-4 space-y-4">
          <h2 className="text-lg font-bold text-red-500">Compilation Error</h2>
          <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg font-mono text-[13px] text-red-400 whitespace-pre-wrap overflow-x-auto">
            {compilerOutput}
          </div>
        </div>
      );
    }

    const isSuccess = verdict === "ACCEPTED";
    const verdictColor = isSuccess ? "text-emerald-400" : "text-red-500";
    const resultsArray = runResults || [];
    const currentViewCase = resultsArray[activeResultCaseIdx];

    return (
      <div className="p-4 pt-2 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-6">
            <h2 className={`text-lg font-bold uppercase ${verdictColor}`}>
              {verdict.replace(/_/g, " ")}
            </h2>
            <span className="text-sm text-zinc-400 font-medium">
              Runtime: <span className="font-mono text-zinc-200 ml-1">{runtime || 0} ms</span>
            </span>
          </div>
          
          <div className="text-sm text-zinc-400 font-medium">
            Passed testcases: <span className="text-zinc-200 ml-1">{passedTestCases} / {totalTestCases}</span>
          </div>
        </div>

        {resultsArray.length > 0 && (
          <div className="space-y-5">
            <div className="flex gap-2 mb-2">
              {resultsArray.map((res: any, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveResultCaseIdx(idx)}
                  className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeResultCaseIdx === idx ? "bg-white/[0.08] text-zinc-100" : "bg-transparent text-zinc-400 hover:bg-white/[0.04]"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${res.passed ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  Case {res.caseNumber}
                </button>
              ))}
            </div>

            {currentViewCase && (
              <div className="space-y-4">
                
                {runtimeError && !currentViewCase.passed && (
                  <div className="space-y-1.5">
                    <div className="text-sm font-semibold text-zinc-300">Runtime Error</div>
                    <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg font-mono text-[13px] text-red-400 whitespace-pre-wrap">
                      {runtimeError}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="text-sm font-semibold text-zinc-300">Input</div>
                  <div className="p-3 bg-[#1e1e20] border border-white/[0.04] rounded-lg font-mono text-sm text-zinc-100 whitespace-pre-wrap leading-relaxed">
                    {currentViewCase.input}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-sm font-semibold text-zinc-300">Output</div>
                  <div className={`p-3 bg-[#1e1e20] border border-white/[0.04] rounded-lg font-mono text-sm whitespace-pre-wrap ${currentViewCase.passed ? 'text-zinc-100' : 'text-red-400'}`}>
                    {formatOutput(currentViewCase.actualOutput)}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-sm font-semibold text-zinc-300">Expected</div>
                  <div className="p-3 bg-[#1e1e20] border border-white/[0.04] rounded-lg font-mono text-sm text-emerald-400 whitespace-pre-wrap">
                    {formatOutput(currentViewCase.expectedOutput)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#121214] border border-white/[0.04] rounded-xl overflow-hidden">
      <div className="flex bg-[#121214] h-11 px-2 items-end shrink-0 border-b border-white/[0.04]">
        <button 
          onClick={() => setActiveTab("testcases")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "testcases" ? "border-white text-zinc-100" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Testcases
        </button>
        <button 
          onClick={() => setActiveTab("result")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "result" ? "border-white text-zinc-100" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Test Result
          {(submissionResult?.status === "QUEUED" || submissionResult?.status === "RUNNING") && (
            <span className="flex h-2 w-2 relative ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === "testcases" && (
          <div className="space-y-5">
            <div className="flex gap-2">
              {problem?.visibleTestCases?.map((tc: any, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveCase(tc)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeCase === tc ? "bg-white/[0.08] text-zinc-100" : "bg-transparent text-zinc-400 hover:bg-white/[0.04]"
                  }`}
                >
                  Case {idx + 1}
                </button>
              ))}
            </div>
            
            <div className="space-y-4">
              {activeCase && Object.entries(getInputsOnly(activeCase)).map(([key, value]) => (
                <div key={key} className="space-y-1.5">
                  <div className="text-sm font-bold text-zinc-200">{key} =</div>
                  <div className="p-3 bg-black/40 border border-white/[0.04] rounded-lg font-mono text-sm text-zinc-100 whitespace-pre-wrap">
                    {JSON.stringify(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "result" && (
          <div className="h-full">
            {renderResultContent()}
          </div>
        )}
      </div>
    </div>
  );
}