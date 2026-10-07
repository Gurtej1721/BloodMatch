import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, HeartHandshake, AlertCircle, Phone, ShieldCheck } from 'lucide-react';

export default function GlassCard({
  id,
  type = 'Request',
  bloodGroup = 'O+',
  location = 'General Hospital',
  time = 'Just now',
  status = 'Urgent',
  contact = '+1 (555) 234-5678',
  patientName,
  unitsNeeded = 1,
  onAction,
}) {
  const isRequest = type === 'Request';
  const isUrgent = status === 'Urgent' || status === 'Critical';

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 backdrop-blur-xl ${
        isRequest
          ? isUrgent
            ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60 shadow-[0_4px_25px_rgba(244,63,94,0.15)]'
            : 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60 shadow-[0_4px_25px_rgba(245,158,11,0.1)]'
          : 'bg-cyan-950/20 border-cyan-500/30 hover:border-cyan-500/60 shadow-[0_4px_25px_rgba(6,182,212,0.15)]'
      }`}
    >
      {/* Glow highlight */}
      <div
        className={`absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-40 ${
          isRequest ? (isUrgent ? 'bg-rose-500' : 'bg-amber-500') : 'bg-cyan-500'
        }`}
      />

      {/* Top Header: Blood Group & Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl tracking-wider shadow-inner ${
              isRequest
                ? isUrgent
                  ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                  : 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                : 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
            }`}
          >
            {bloodGroup}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isRequest
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {type}
              </span>
              {unitsNeeded > 1 && (
                <span className="text-xs text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                  {unitsNeeded} Units
                </span>
              )}
            </div>
            {patientName && (
              <h4 className="text-sm font-medium text-slate-200 mt-1 line-clamp-1">{patientName}</h4>
            )}
          </div>
        </div>

        {/* Status Pill */}
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
            isUrgent
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
              : status === 'Available'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
          }`}
        >
          {isUrgent ? (
            <AlertCircle className="w-3 h-3" />
          ) : (
            <ShieldCheck className="w-3 h-3" />
          )}
          {status}
        </span>
      </div>

      {/* Meta Information */}
      <div className="space-y-2 mb-5 text-sm text-slate-300">
        <div className="flex items-center gap-2 text-slate-300">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{time}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
        <button
          onClick={() => onAction && onAction({ id, type, bloodGroup, location, status, contact })}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all shadow-sm ${
            isRequest
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30 hover:shadow-rose-600/40'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-cyan-900/30 hover:shadow-cyan-400/40'
          }`}
        >
          {isRequest ? (
            <>
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Offer Help</span>
            </>
          ) : (
            <>
              <Phone className="w-3.5 h-3.5" />
              <span>Contact Donor</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
