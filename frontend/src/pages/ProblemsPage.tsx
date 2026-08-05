import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Problem {
  id: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await axios.get("http://localhost:3000/problems");
        if (res.data.success) {
          setProblems(res.data.data);
        }
      } catch (error: any) {
        console.error("🔴 API Error (Fetch Problems):", error.response || error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const getDifficultyBadge = (difficulty: string) => {
    // Increased the group-hover glow intensity for a more noticeable effect
    switch (difficulty) {
      case "EASY":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_2px_8px_-3px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_16px_rgba(16,185,129,0.4)]";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_2px_8px_-3px_rgba(245,158,11,0.15)] group-hover:shadow-[0_0_16px_rgba(245,158,11,0.4)]";
      case "HARD":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_2px_8px_-3px_rgba(244,63,94,0.15)] group-hover:shadow-[0_0_16px_rgba(244,63,94,0.4)]";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20 shadow-[0_2px_8px_-3px_rgba(113,113,122,0.15)] group-hover:shadow-[0_0_16px_rgba(113,113,122,0.4)]";
    }
  };

  const formatDifficulty = (difficulty: string) => {
    return difficulty.charAt(0) + difficulty.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-6 relative flex flex-col items-center">
      
      <div className="w-full max-w-[760px] mt-[20vh] relative z-10 flex flex-col space-y-6">
        
        <div className="px-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Problem Set</h1>
        </div>

        <div className="w-full bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.04] shadow-[0_24px_48px_rgba(0,0,0,0.8),inset_0_1px_1px_0_rgba(255,255,255,0.06)] rounded-2xl overflow-hidden relative">
          
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent pointer-events-none" />

          {/* Header Row - Divider line is strictly defined here */}
          <div className="grid grid-cols-[60px_1fr_120px] px-8 py-5 border-b border-white/[0.04] text-[11px] font-semibold text-zinc-600 uppercase tracking-widest relative z-10">
            <div>#</div>
            <div>Title</div>
            <div className="text-right">Difficulty</div>
          </div>

          <div className="flex flex-col relative z-10">
            {loading ? (
              <div className="p-12 text-center text-zinc-600 text-sm animate-pulse">
                Loading problems...
              </div>
            ) : problems.length === 0 ? (
              <div className="p-12 text-center text-zinc-600 text-sm">
                No problems available at the moment.
              </div>
            ) : (
              problems.map((problem, index) => (
                <div
                  key={problem.id}
                  onClick={() => navigate(`/problems/${problem.id}`)}
                  // HOVER CHANGES:
                  // 1. Lift increased to -translate-y-[2px] for clear upward movement.
                  // 2. Removed the inset top border (inset_0_1px_0...) so the divider line STAYS STATIC.
                  // 3. Deepened the drop shadow for emphasis.
                  className={`group grid grid-cols-[60px_1fr_120px] items-center px-8 py-7 transition-all duration-200 ease-out cursor-pointer hover:-translate-y-[2px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.6)] ${
                    index !== problems.length - 1 ? "border-b border-white/[0.03]" : ""
                  }`}
                >
                  
                  <div className="text-zinc-500 text-sm font-medium group-hover:text-zinc-300 transition-colors duration-200">
                    {index + 1}
                  </div>
                  
                  {/* TEXT GLOW: Added group-hover:drop-shadow for a clean, premium glow effect on the text itself */}
                  <div className="text-zinc-300 text-sm font-medium group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all duration-200">
                    {problem.title}
                  </div>
                  
                  <div className="flex justify-end">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] tracking-wide font-semibold border transition-all duration-200 ease-out ${getDifficultyBadge(
                        problem.difficulty
                      )}`}
                    >
                      {formatDifficulty(problem.difficulty)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}