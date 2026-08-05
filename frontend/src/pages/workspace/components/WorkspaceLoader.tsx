export default function WorkspaceLoader() {
  return (
    <div className="h-screen w-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 font-sans">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden">
          <div className="h-full bg-zinc-600 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
        </div>
        <div className="text-xs font-medium tracking-widest uppercase text-zinc-500">Preparing Workspace...</div>
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}