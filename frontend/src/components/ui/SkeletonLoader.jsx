import React from 'react';

export function CardSkeleton() {
  return (
    <div className="rounded-2xl p-5 border border-white/5 bg-slate-900/40 dark:bg-slate-900/40 backdrop-blur-md animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 dark:bg-slate-800" />
          <div className="space-y-1.5">
            <div className="w-16 h-4 bg-slate-800 rounded" />
            <div className="w-24 h-3 bg-slate-800/60 rounded" />
          </div>
        </div>
        <div className="w-14 h-5 rounded-full bg-slate-800" />
      </div>
      <div className="space-y-2">
        <div className="w-3/4 h-3.5 bg-slate-800/70 rounded" />
        <div className="w-1/2 h-3 bg-slate-800/50 rounded" />
      </div>
      <div className="pt-2 border-t border-white/5 flex gap-2">
        <div className="w-full h-8 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-white/5 bg-slate-900/30 animate-pulse flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800" />
        <div className="space-y-1.5">
          <div className="w-28 h-4 bg-slate-800 rounded" />
          <div className="w-40 h-3 bg-slate-800/60 rounded" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-16 h-6 bg-slate-800 rounded-full" />
        <div className="w-20 h-8 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
