import { useState } from "react";
import axios from "axios";

interface DescriptionPanelProps {
  problem: any;
  submitResult?: any;
  onClearSubmit?: () => void;
  onViewPastSubmission?: (data: any) => void;
}

export default function DescriptionPanel({ problem, submitResult, onClearSubmit, onViewPastSubmission }: DescriptionPanelProps) {
  const [activeTab, setActiveTab] = useState<"description" | "submissions">("description");
  
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "EASY": return "text-emerald-400";
      case "MEDIUM": return "text-amber-400";
      case "HARD": return "text-rose-400";
      default: return "text-zinc-400";
    }
  };

  const formatInput = (testCase: any) => {
    if (!testCase) return "";
    const { expectedOutput, explanation, _id, ...inputs } = testCase; 
    return Object.entries(inputs)
      .map(([key, value]) => `${key} = ${JSON.stringify(value)}`)
      .join(", ");
  };

  // ENHANCED: Safely handles any number of spaces and formats into array brackets
  const formatOutput = (str: string | undefined | null) => {
    if (!str) return "";
    let trimmed = String(str).trim();
    if (!trimmed.startsWith("[") && trimmed.includes(" ")) {
      // Split by any amount of whitespace and join with comma
      return `[${trimmed.split(/\s+/).join(", ")}]`;
    }
    return trimmed;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleString("en-GB", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  const formatJustDate = (dateString: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const handleSubmissionsClick = async () => {
    setActiveTab("submissions");
    setIsLoadingSubmissions(true);
    try {
      const res = await axios.get(`http://localhost:3000/submissions`, { withCredentials: true });
      if (res.data.success) {
        const problemSubmissions = res.data.data.filter((s: any) => s.problemId === problem.id);
        setSubmissionsList(problemSubmissions);
      }
    } catch (error) {
      console.error("🔴 Failed to fetch submissions:", error);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const handleViewSubmissionDetails = async (submissionId: string) => {
    try {
      const res = await axios.get(`http://localhost:3000/submissions/${submissionId}`, { withCredentials: true });
      if (res.data.success && onViewPastSubmission) {
        onViewPastSubmission(res.data.data);
      }
    } catch (error) {
      console.error("🔴 Failed to fetch submission details:", error);
    }
  };

  if (submitResult) {
    const { 
      status, verdict, passedTestCases, totalTestCases, 
      compilerOutput, runtimeError, runtime, 
      runResults, code, language, completedAt 
    } = submitResult;
    
    const isSuccess = verdict === "ACCEPTED";
    
    const getVerdictStyle = (v: string) => {
      if (v === "ACCEPTED") return "text-emerald-500";
      if (v === "SYSTEM_ERROR" || status === "ERROR") return "text-rose-500";
      return "text-rose-500"; 
    };

    const failedCase = runResults?.find((r: any) => r.passed === false);

    return (
      <div className="flex flex-col h-full bg-[#121214] border border-white/[0.04] rounded-xl overflow-hidden relative z-50">
        <div className="flex bg-[#121214] h-11 px-4 items-center justify-between shrink-0 border-b border-white/[0.04]">
          <span className="text-sm font-semibold text-zinc-200">Submission Result</span>
          <button 
            onClick={onClearSubmit}
            className="text-zinc-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/[0.1]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {(status === "QUEUED" || status === "RUNNING") ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-300 space-y-6">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="font-bold tracking-widest uppercase text-lg">{status}...</p>
              <p className="text-sm text-zinc-500">Evaluating your submission on all hidden testcases</p>
            </div>
          ) : (
            <div className="max-w-4xl space-y-8">
              
              <div>
                <div className="flex items-baseline gap-3 mb-2">
                  <h2 className={`text-[28px] font-semibold capitalize tracking-tight ${getVerdictStyle(verdict)}`}>
                    {verdict?.replace(/_/g, " ").toLowerCase() || "Error"}
                  </h2>
                  {totalTestCases && (
                    <span className="text-zinc-400 font-medium">
                      {passedTestCases} / {totalTestCases} test cases
                    </span>
                  )}
                </div>
                
                {completedAt && (
                  <div className="flex items-center text-sm font-medium text-zinc-500 gap-2">
                    {runtime !== null && <span>Time: {runtime}ms <span className="mx-1.5">•</span></span>}
                    <span>Submitted at: {formatDate(completedAt)}</span>
                  </div>
                )}
              </div>

              {isSuccess && runtime !== null && (
                <div className="p-5 bg-[#1e1e20] border border-white/[0.04] rounded-xl w-64">
                  <div className="flex items-center gap-2 text-zinc-400 font-semibold text-sm mb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Runtime
                  </div>
                  <div className="text-3xl font-bold text-white tracking-tight">
                    {runtime}<span className="text-lg font-semibold text-zinc-500 ml-1">ms</span>
                  </div>
                </div>
              )}

              {!isSuccess && (
                <div className="space-y-6">
                  {status === "ERROR" || verdict === "SYSTEM_ERROR" ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg font-mono text-sm text-red-400 whitespace-pre-wrap">
                      {runtimeError || "Failed to execute code. Internal system error."}
                    </div>
                  ) : verdict === "COMPILATION_ERROR" ? (
                    <div className="p-5 bg-red-950/30 border border-red-900/50 rounded-lg font-mono text-sm text-red-400 whitespace-pre-wrap overflow-x-auto">
                      {compilerOutput}
                    </div>
                  ) : (
                    <>
                      {runtimeError && (
                        <div className="space-y-2">
                          <div className="text-sm font-bold text-zinc-400">Runtime Error</div>
                          <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg font-mono text-sm text-red-400 whitespace-pre-wrap">
                            {runtimeError}
                          </div>
                        </div>
                      )}
                      
                      {failedCase && (
                        <div className="space-y-4">
                          {failedCase.input && (
                            <div className="space-y-2">
                              <div className="text-sm font-bold text-zinc-400">Input</div>
                              <div className="p-4 bg-[#1e1e20] border border-white/[0.04] rounded-lg font-mono text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                                {failedCase.input}
                              </div>
                            </div>
                          )}

                          {failedCase.actualOutput && (
                            <div className="space-y-2">
                              <div className="text-sm font-bold text-zinc-400">Output</div>
                              <div className="p-4 bg-[#1e1e20] border border-white/[0.04] rounded-lg font-mono text-sm text-red-400 whitespace-pre-wrap">
                                {formatOutput(failedCase.actualOutput)}
                              </div>
                            </div>
                          )}

                          {failedCase.expectedOutput && (
                            <div className="space-y-2">
                              <div className="text-sm font-bold text-zinc-400">Expected</div>
                              <div className="p-4 bg-[#1e1e20] border border-white/[0.04] rounded-lg font-mono text-sm text-emerald-400 whitespace-pre-wrap">
                                {formatOutput(failedCase.expectedOutput)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {code && (
                <div className="space-y-3 pt-6 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2 text-[15px] font-semibold text-zinc-300">
                    Code <span className="text-zinc-600">|</span> <span className="text-zinc-400">{language === 'cpp' ? 'C++' : language === 'python' ? 'Python' : 'Java'}</span>
                  </div>
                  <div className="p-5 bg-[#1e1e1e] border border-white/[0.04] rounded-xl overflow-hidden">
                    <pre className="font-mono text-[13px] text-zinc-300 whitespace-pre-wrap overflow-x-auto custom-scrollbar">
                      <code>{code}</code>
                    </pre>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#121214] border border-white/[0.04] rounded-xl overflow-hidden">
      <div className="flex bg-[#121214] h-11 px-2 items-end shrink-0 border-b border-white/[0.04]">
        <button 
          onClick={() => setActiveTab("description")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "description" ? "border-white text-zinc-100" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Description
        </button>
        <button 
          onClick={handleSubmissionsClick}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "submissions" ? "border-white text-zinc-100" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Submissions
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar relative">
        {activeTab === "description" && (
          <div className="space-y-8">
            <div className="space-y-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">{problem.title}</h1>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty.charAt(0) + problem.difficulty.slice(1).toLowerCase()}
              </span>
            </div>
            
            <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {problem.description}
            </div>

            {problem.visibleTestCases && problem.visibleTestCases.length > 0 && (
              <div className="space-y-6">
                {problem.visibleTestCases.map((tc: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <p className="font-bold text-zinc-200 text-sm">Example {index + 1}:</p>
                    <div className="pl-4 border-l-2 border-white/[0.1] space-y-2">
                      <p className="text-sm">
                        <span className="font-semibold text-zinc-400">Input: </span> 
                        <span className="font-mono text-zinc-300">{formatInput(tc)}</span>
                      </p>
                      {/* APPLYING THE FORMATTER HERE */}
                      <p className="text-sm">
                        <span className="font-semibold text-zinc-400">Output: </span> 
                        <span className="font-mono text-zinc-300">{formatOutput(tc.expectedOutput)}</span>
                      </p>
                      
                      {(tc.explanation || (index === 0 && problem.explanation)) && (
                        <p className="text-sm leading-relaxed">
                          <span className="font-semibold text-zinc-400">Explanation: </span> 
                          <span className="text-zinc-300">{tc.explanation || problem.explanation}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-8 space-y-4 border-t border-white/[0.06]">
              {problem.topics && problem.topics.length > 0 && (
                <details className="group cursor-pointer bg-[#1c1c1e] border border-white/[0.04] rounded-xl overflow-hidden shadow-sm">
                  <summary className="text-[14px] font-semibold text-zinc-300 hover:text-white select-none list-none flex items-center p-3.5 transition-colors">
                    <span className="mr-3 transition-transform group-open:rotate-90 text-[10px] text-zinc-500">▶</span>
                    Topics
                  </summary>
                  <div className="flex flex-wrap gap-2 px-4 pb-4 pl-8">
                    {problem.topics.map((t: string, i: number) => (
                      <span key={i} className="text-xs px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] transition-colors cursor-pointer rounded-full text-zinc-300">{t}</span>
                    ))}
                  </div>
                </details>
              )}

              {problem.hints && problem.hints.length > 0 && (
                <div className="space-y-3">
                  {problem.hints.map((hint: string, i: number) => (
                    <details key={i} className="group cursor-pointer bg-[#1c1c1e] border border-white/[0.04] rounded-xl overflow-hidden shadow-sm">
                      <summary className="text-[14px] font-semibold text-zinc-300 hover:text-white select-none list-none flex items-center p-3.5 transition-colors">
                        <span className="mr-3 transition-transform group-open:rotate-90 text-[10px] text-zinc-500">▶</span>
                        Hint {i + 1}
                      </summary>
                      <div className="text-[13px] text-zinc-400 leading-relaxed px-4 pb-4 pl-8">
                        {hint}
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
        
        {activeTab === "submissions" && (
          <div className="h-full">
            {isLoadingSubmissions ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : submissionsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>No submissions found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between px-6 py-3 text-[12px] font-bold text-zinc-500 uppercase tracking-wider">
                  <div className="w-1/3">Submission</div>
                  <div className="w-1/3 text-center">Language</div>
                  <div className="w-1/3 text-right">Runtime</div>
                </div>

                <div className="flex flex-col gap-1">
                  {submissionsList.map((sub, idx) => (
                    <div 
                      key={sub.id} 
                      onClick={() => handleViewSubmissionDetails(sub.id)}
                      className={`flex justify-between items-center px-6 py-4 rounded-xl cursor-pointer transition-all duration-200 ${idx % 2 === 0 ? 'bg-[#1c1c1e]' : 'bg-transparent'} hover:bg-white/[0.04]`}
                    >
                      <div className="w-1/3 flex flex-col">
                        <span className={`text-[15px] font-bold capitalize ${sub.verdict === 'ACCEPTED' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {sub.verdict?.replace(/_/g, " ").toLowerCase() || "Queued"}
                        </span>
                        <span className="text-xs text-zinc-500 mt-1 font-medium">{formatJustDate(sub.createdAt)}</span>
                      </div>
                      
                      <div className="w-1/3 text-center text-[13px] font-medium text-zinc-300">
                        {sub.language === 'cpp' ? 'C++' : sub.language === 'python' ? 'Python' : 'Java'}
                      </div>
                      
                      <div className="w-1/3 text-right text-[13px] font-mono font-medium text-zinc-300">
                        {sub.runtime !== null ? `${sub.runtime} ms` : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}