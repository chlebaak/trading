export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="text-amber-500 font-bold tracking-wider animate-pulse">LOADING DATA...</p>
      </div>
    </div>
  );
}
