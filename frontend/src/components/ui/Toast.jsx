import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarn = toast.type === 'warn';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 ${
                isSuccess
                  ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-200'
                  : isError
                  ? 'bg-slate-900/95 border-rose-500/40 text-rose-200'
                  : isWarn
                  ? 'bg-slate-900/95 border-amber-500/40 text-amber-200'
                  : 'bg-slate-900/95 border-cyan-500/40 text-cyan-200'
              }`}
            >
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
              {isError && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
              {isWarn && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
              {!isSuccess && !isError && !isWarn && <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}

              <div className="flex-1 text-sm">
                {toast.title && <h5 className="font-semibold text-white mb-0.5">{toast.title}</h5>}
                <p className="text-slate-300 leading-snug">{toast.message}</p>
              </div>

              <button
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-white transition-colors p-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
