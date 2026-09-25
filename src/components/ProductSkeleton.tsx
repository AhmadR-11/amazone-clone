'use client';

export default function ProductSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="glass-panel rounded-2xl border border-slate-800/80 p-4 flex flex-col justify-between animate-pulse h-80"
        >
          <div>
            <div className="h-44 bg-slate-800/60 rounded-xl mb-3 skeleton-shimmer" />
            <div className="h-3 bg-slate-800/60 rounded w-full mb-2 skeleton-shimmer" />
            <div className="h-3 bg-slate-800/60 rounded w-3/4 mb-3 skeleton-shimmer" />
            <div className="h-3 bg-slate-800/60 rounded w-1/3 mb-2 skeleton-shimmer" />
          </div>
          <div className="pt-2 border-t border-slate-800/60">
            <div className="h-5 bg-slate-800/60 rounded w-24 mb-2 skeleton-shimmer" />
            <div className="h-9 bg-slate-800/80 rounded-xl skeleton-shimmer" />
          </div>
        </div>
      ))}
    </>
  );
}
