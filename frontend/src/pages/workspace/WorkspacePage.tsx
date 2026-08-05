import { useEffect, useState, Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Group, Panel, Separator } from "react-resizable-panels";
import { io, Socket } from "socket.io-client";
import WorkspaceLoader from "./components/WorkspaceLoader";

const EditorPanel = lazy(() => import("./components/EditorPanel"));
const DescriptionPanel = lazy(() => import("./components/DescriptionPanel"));
const TestcasePanel = lazy(() => import("./components/TestcasePanel"));

export default function WorkspacePage() {
  const { id } = useParams();
  const [problem, setProblem] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const [socket, setSocket] = useState<Socket | null>(null);
  
  const [runResult, setRunResult] = useState<any>(null);
  const [submitResult, setSubmitResult] = useState<any>(null);

  const clearSubmitResult = () => setSubmitResult(null);

  // NEW: Handler to open past submissions in the overlay
  const handleViewPastSubmission = (pastSubmissionData: any) => {
    setSubmitResult(pastSubmissionData);
  };

  useEffect(() => {
    const newSocket = io("http://localhost:3001", {
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("🟢 Connected to WebSocket Server");
    });

    newSocket.on("submissionResult", (data) => {
      if (data.executionType === "RUN") {
        setRunResult((prev: any) => ({ ...prev, ...data }));
      } else if (data.executionType === "SUBMIT") {
        setSubmitResult((prev: any) => ({ ...prev, ...data }));
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchProblem = async () => {
      const startTime = Date.now();
      try {
        const res = await axios.get(`http://localhost:3000/problems/${id}`, { withCredentials: true });
        if (res.data.success) {
          setProblem(res.data.data);
        }
      } catch (err: any) {
        setError("Failed to load problem.");
      } finally {
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, 1500 - elapsed);
        setTimeout(() => setIsReady(true), remainingTime);
      }
    };
    fetchProblem();
  }, [id]);

  const handleExecution = async (language: string, code: string, type: "RUN" | "SUBMIT") => {
    if (type === "RUN") {
      setRunResult({ status: "QUEUED", executionType: "RUN" });
    } else {
      setSubmitResult({ status: "QUEUED", executionType: "SUBMIT" });
    }
    
    try {
      const endpoint = type === "RUN" ? "/submissions/run" : "/submissions";
      const res = await axios.post(
        `http://localhost:3000${endpoint}`,
        { problemId: id, language, code, executionType: type },
        { withCredentials: true }
      );

      if (res.data.success && res.data.data.id) {
        const submissionId = res.data.data.id;
        
        if (type === "RUN") {
          setRunResult({ status: "RUNNING", executionType: "RUN" });
        } else {
          setSubmitResult({ status: "RUNNING", executionType: "SUBMIT" });
        }
        
        socket?.emit("subscribeToSubmission", submissionId);
      }
    } catch (err) {
      const errorPayload = { status: "ERROR", verdict: "SYSTEM_ERROR", runtimeError: "Failed to reach execution server." };
      if (type === "RUN") setRunResult(errorPayload);
      else setSubmitResult(errorPayload);
    }
  };

  if (error) return <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-red-400">{error}</div>;

  return (
    <>
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#09090b] transition-all duration-700 ease-in-out ${isReady ? "opacity-0 pointer-events-none scale-105" : "opacity-100 scale-100"}`}>
        <WorkspaceLoader />
      </div>

      <div className={`h-screen w-screen bg-[#09090b] text-zinc-100 font-sans p-3 pt-2 flex flex-col overflow-hidden transition-opacity duration-700 ease-in-out delay-100 ${isReady ? "opacity-100" : "opacity-0"}`}>
        
        <div className="flex items-center justify-between px-2 pb-3 shrink-0">
          <div className="flex-1 text-[13px] font-medium text-zinc-400">
            Problems <span className="mx-2 text-zinc-600">/</span> <span className="text-zinc-200">{problem?.title || "Loading..."}</span>
          </div>
          <div className="flex-1" />
        </div>

        <div className="flex-1 min-h-0">
          <Group orientation="horizontal" className="h-full rounded-xl overflow-hidden">
            
            <Panel defaultSize={45} minSize={25}>
              <Suspense fallback={null}>
                {problem && (
                  <DescriptionPanel 
                    problem={problem} 
                    submitResult={submitResult} 
                    onClearSubmit={clearSubmitResult} 
                    onViewPastSubmission={handleViewPastSubmission} 
                  />
                )}
              </Suspense>
            </Panel>

            <Separator className="w-[6px] bg-transparent hover:bg-zinc-800/30 transition-colors cursor-col-resize flex items-center justify-center relative z-10 group mx-0.5">
              <div className="h-6 w-[3px] rounded-full bg-zinc-700 group-hover:bg-zinc-400 transition-colors" />
            </Separator>

            <Panel defaultSize={55} minSize={30}>
              <Group orientation="vertical">
                <Panel defaultSize={60} minSize={20}>
                  <Suspense fallback={null}>
                    <EditorPanel problemId={id!} onExecute={handleExecution} />
                  </Suspense>
                </Panel>

                <Separator className="h-[5px] bg-transparent hover:bg-zinc-800/40 transition-colors cursor-row-resize flex items-center justify-center relative z-10 group my-0.5">
                  <div className="w-8 h-[3px] rounded-full bg-zinc-700 group-hover:bg-zinc-400 transition-colors" />
                </Separator>

                <Panel defaultSize={40} minSize={15}>
                  <Suspense fallback={null}>
                    {problem && <TestcasePanel problem={problem} submissionResult={runResult} />}
                  </Suspense>
                </Panel>
              </Group>
            </Panel>

          </Group>
        </div>
      </div>
    </>
  );
}