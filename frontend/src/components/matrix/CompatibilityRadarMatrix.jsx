import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Activity,
  Sparkles,
} from 'lucide-react';

const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const COMPATIBILITY = {
  'O-': { givesTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], receivesFrom: ['O-'] },
  'O+': { givesTo: ['O+', 'A+', 'B+', 'AB+'], receivesFrom: ['O-', 'O+'] },
  'A-': { givesTo: ['A-', 'A+', 'AB-', 'AB+'], receivesFrom: ['O-', 'A-'] },
  'A+': { givesTo: ['A+', 'AB+'], receivesFrom: ['O-', 'O+', 'A-', 'A+'] },
  'B-': { givesTo: ['B-', 'B+', 'AB-', 'AB+'], receivesFrom: ['O-', 'B-'] },
  'B+': { givesTo: ['B+', 'AB+'], receivesFrom: ['O-', 'O+', 'B-', 'B+'] },
  'AB-': { givesTo: ['AB-', 'AB+'], receivesFrom: ['O-', 'A-', 'B-', 'AB-'] },
  'AB+': { givesTo: ['AB+'], receivesFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] },
};

// 8 angles evenly spaced in a circle (starts at top -90deg)
const NODE_COORDINATES = {
  'O-': { angle: -90, x: 200, y: 50 },
  'O+': { angle: -45, x: 306, y: 94 },
  'A-': { angle: 0, x: 350, y: 200 },
  'A+': { angle: 45, x: 306, y: 306 },
  'B-': { angle: 90, x: 200, y: 350 },
  'B+': { angle: 135, x: 94, y: 306 },
  'AB-': { angle: 180, x: 50, y: 200 },
  'AB+': { angle: 225, x: 94, y: 94 },
};

export default function CompatibilityRadarMatrix() {
  const [mode, setMode] = useState('donate'); // 'donate' | 'receive' | 'simulator'
  const [selectedType, setSelectedType] = useState('O-');
  const [simDonor, setSimDonor] = useState('O-');
  const [simRecipient, setSimRecipient] = useState('A+');

  // Computed sets based on mode
  const activeConnections = useMemo(() => {
    if (mode === 'donate') {
      const targets = COMPATIBILITY[selectedType]?.givesTo || [];
      return targets.map((target) => ({
        from: selectedType,
        to: target,
        color: '#f43f5e', // rose
      }));
    } else if (mode === 'receive') {
      const sources = COMPATIBILITY[selectedType]?.receivesFrom || [];
      return sources.map((source) => ({
        from: source,
        to: selectedType,
        color: '#06b6d4', // cyan
      }));
    } else {
      // Simulator pair
      const isCompat = COMPATIBILITY[simDonor]?.givesTo.includes(simRecipient);
      return [
        {
          from: simDonor,
          to: simRecipient,
          color: isCompat ? '#10b981' : '#f43f5e',
          compatible: isCompat,
        },
      ];
    }
  }, [mode, selectedType, simDonor, simRecipient]);

  const isSimulatorCompatible = COMPATIBILITY[simDonor]?.givesTo.includes(simRecipient);

  return (
    <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-8 shadow-xl">
      {/* Header & Modes */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-500 text-xs font-black uppercase tracking-wider">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>Radial Compatibility Radar</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Biological Transfusion Radar Matrix
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time circular radar telemetry mapping viable ABO/Rh blood flows and immunological pathways.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10">
          <button
            onClick={() => setMode('donate')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'donate'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Who Can Donate To</span>
          </button>

          <button
            onClick={() => setMode('receive')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'receive'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Who Can Receive From</span>
          </button>

          <button
            onClick={() => setMode('simulator')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'simulator'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Pair Simulator</span>
          </button>
        </div>
      </div>

      {/* Main Radar Display + Controls Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: The Circular Radar Visualizer Canvas / SVG (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="relative w-[340px] h-[340px] sm:w-[400px] sm:h-[400px]">
            {/* SVG Radar Graphic */}
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full filter drop-shadow-[0_0_20px_rgba(244,63,94,0.15)]"
            >
              <defs>
                {/* Radial Glow Gradient */}
                <radialGradient id="radarScopeBg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.08" />
                  <stop offset="70%" stopColor="#0f172a" stopOpacity="0.03" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="0.2" />
                </radialGradient>

                {/* Sweeping Beam Shader */}
                <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Background Circular Scope */}
              <circle cx="200" cy="200" r="180" fill="url(#radarScopeBg)" />

              {/* Concentric Radar Distance Rings */}
              <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-800" strokeDasharray="3 3" />
              <circle cx="200" cy="200" r="105" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-800" strokeDasharray="3 3" />
              <circle cx="200" cy="200" r="60" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-800" strokeDasharray="3 3" />
              <circle cx="200" cy="200" r="15" fill="currentColor" className="text-rose-500/20" />
              <circle cx="200" cy="200" r="4" fill="currentColor" className="text-rose-500" />

              {/* Crosshair Axes */}
              <line x1="20" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="1" className="text-slate-300/60 dark:text-slate-800/80" />
              <line x1="200" y1="20" x2="200" y2="380" stroke="currentColor" strokeWidth="1" className="text-slate-300/60 dark:text-slate-800/80" />

              {/* Radar Degree Marks */}
              <text x="200" y="14" textAnchor="middle" className="text-[9px] fill-slate-400 font-mono font-bold">0° / N</text>
              <text x="390" y="204" textAnchor="start" className="text-[9px] fill-slate-400 font-mono font-bold">90° / E</text>
              <text x="200" y="396" textAnchor="middle" className="text-[9px] fill-slate-400 font-mono font-bold">180° / S</text>
              <text x="10" y="204" textAnchor="end" className="text-[9px] fill-slate-400 font-mono font-bold">270° / W</text>

              {/* Animated Continuous Sweeping Radar Beam */}
              <g className="animate-spin" style={{ transformOrigin: '200px 200px', animationDuration: '6s' }}>
                <path
                  d="M 200 200 L 380 200 A 180 180 0 0 0 327 73 Z"
                  fill="url(#beamGradient)"
                />
                <line x1="200" y1="200" x2="380" y2="200" stroke="#f43f5e" strokeWidth="2" strokeOpacity="0.8" />
              </g>

              {/* Active Animated Laser Conduit Lines */}
              {activeConnections.map((conn, idx) => {
                const start = NODE_COORDINATES[conn.from];
                const end = NODE_COORDINATES[conn.to];
                if (!start || !end) return null;

                // If identical node (self-donation), draw a halo ring around it
                if (conn.from === conn.to) {
                  return (
                    <circle
                      key={`self-${conn.from}-${idx}`}
                      cx={start.x}
                      cy={start.y}
                      r="26"
                      fill="none"
                      stroke={conn.color}
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      className="animate-spin-slow"
                      style={{ transformOrigin: `${start.x}px ${start.y}px` }}
                    />
                  );
                }

                return (
                  <g key={`${conn.from}-${conn.to}-${idx}`}>
                    {/* Outer Glow Line */}
                    <line
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke={conn.color}
                      strokeWidth="4"
                      strokeOpacity="0.25"
                      strokeLinecap="round"
                    />
                    {/* Animated Pulsing Laser Stream */}
                    <motion.line
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke={conn.color}
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      initial={{ strokeDashoffset: 50 }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}

              {/* 8 Perimeter Blood Group Nodes */}
              {BLOOD_GROUPS.map((bg) => {
                const coord = NODE_COORDINATES[bg];
                const isSelected =
                  mode === 'simulator'
                    ? simDonor === bg || simRecipient === bg
                    : selectedType === bg;
                const isDonorInSim = mode === 'simulator' && simDonor === bg;
                const isRecipInSim = mode === 'simulator' && simRecipient === bg;

                const isConnectedTarget =
                  mode === 'donate'
                    ? COMPATIBILITY[selectedType]?.givesTo.includes(bg)
                    : mode === 'receive'
                    ? COMPATIBILITY[selectedType]?.receivesFrom.includes(bg)
                    : false;

                let nodeFill = '#1e293b';
                let strokeColor = '#475569';
                let textColor = '#cbd5e1';

                if (isSelected) {
                  nodeFill = isDonorInSim ? '#f43f5e' : isRecipInSim ? '#06b6d4' : '#f43f5e';
                  strokeColor = '#ffffff';
                  textColor = '#ffffff';
                } else if (isConnectedTarget) {
                  nodeFill = mode === 'donate' ? '#f43f5e22' : '#06b6d422';
                  strokeColor = mode === 'donate' ? '#f43f5e' : '#06b6d4';
                  textColor = mode === 'donate' ? '#f43f5e' : '#06b6d4';
                }

                return (
                  <g
                    key={bg}
                    onClick={() => {
                      if (mode === 'simulator') {
                        // alternate selection
                        if (simDonor !== bg) setSimRecipient(bg);
                      } else {
                        setSelectedType(bg);
                      }
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing ring for selected node */}
                    {isSelected && (
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r="24"
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="2"
                        className="animate-ping opacity-30"
                      />
                    )}

                    {/* Node Circle */}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r="19"
                      fill={nodeFill}
                      stroke={strokeColor}
                      strokeWidth="2"
                      className="transition-all duration-200 group-hover:scale-110"
                      style={{ transformOrigin: `${coord.x}px ${coord.y}px` }}
                    />

                    {/* Blood Group Label */}
                    <text
                      x={coord.x}
                      y={coord.y + 5}
                      textAnchor="middle"
                      fill={textColor}
                      className="text-xs font-black font-mono select-none pointer-events-none"
                    >
                      {bg}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <span className="text-[11px] font-mono text-slate-400 mt-2">
            Click any peripheral node to illuminate biological conduits
          </span>
        </div>

        {/* Right: Interactive Controls & Biological Telemetry (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {mode === 'simulator' ? (
            /* Simulator Controls */
            <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-violet-500">
                  Pairwise Transfusion Cross-Match
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    isSimulatorCompatible
                      ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-500 border-rose-500/30'
                  }`}
                >
                  {isSimulatorCompatible ? 'CLEAR TO TRANSFUSE' : 'CONTRAINDICATED'}
                </span>
              </div>

              {/* Donor Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-rose-500 block">
                  Select Donor Blood Group
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {BLOOD_GROUPS.map((bg) => (
                    <button
                      key={`sim-d-${bg}`}
                      onClick={() => setSimDonor(bg)}
                      className={`py-2 rounded-xl text-xs font-black border transition-all ${
                        simDonor === bg
                          ? 'bg-rose-600 border-rose-500 text-white shadow-md'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
                  Select Recipient Blood Group
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {BLOOD_GROUPS.map((bg) => (
                    <button
                      key={`sim-r-${bg}`}
                      onClick={() => setSimRecipient(bg)}
                      className={`py-2 rounded-xl text-xs font-black border transition-all ${
                        simRecipient === bg
                          ? 'bg-cyan-600 border-cyan-500 text-white shadow-md'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verdict Summary Box */}
              <div
                className={`p-4 rounded-xl border space-y-2 text-xs ${
                  isSimulatorCompatible
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {isSimulatorCompatible ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  )}
                  <span>
                    Donor {simDonor} → Recipient {simRecipient}:{' '}
                    {isSimulatorCompatible ? 'Safe Transfusion' : 'Agglutination Hazard'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {isSimulatorCompatible
                    ? `Recipient plasma does not attack antigens present on donor ${simDonor} red blood cells. Safe for rapid infusion.`
                    : `Recipient ${simRecipient} carries antibodies that attack donor ${simDonor} cells. Transfusion triggers severe hemolysis.`}
                </p>
              </div>
            </div>
          ) : (
            /* Donate / Receive Mode Inspection */
            <div className="space-y-5">
              {/* Blood Group Quick Switcher */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Select Focal Blood Group
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_GROUPS.map((bg) => (
                    <button
                      key={bg}
                      onClick={() => setSelectedType(bg)}
                      className={`py-2.5 rounded-xl text-xs font-black border transition-all ${
                        selectedType === bg
                          ? mode === 'donate'
                            ? 'bg-rose-600 border-rose-500 text-white shadow-md'
                            : 'bg-cyan-600 border-cyan-500 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flow Telemetry Card */}
              <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-black uppercase tracking-wider ${
                      mode === 'donate' ? 'text-rose-500' : 'text-cyan-400'
                    }`}
                  >
                    {mode === 'donate'
                      ? `Blood Group ${selectedType} Can Donate To:`
                      : `Blood Group ${selectedType} Can Receive From:`}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {mode === 'donate'
                      ? `${COMPATIBILITY[selectedType]?.givesTo.length} Recipient Groups`
                      : `${COMPATIBILITY[selectedType]?.receivesFrom.length} Donor Groups`}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(mode === 'donate'
                    ? COMPATIBILITY[selectedType]?.givesTo
                    : COMPATIBILITY[selectedType]?.receivesFrom
                  )?.map((type) => (
                    <span
                      key={type}
                      className={`px-3.5 py-1.5 rounded-xl font-black text-sm border ${
                        mode === 'donate'
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}
                    >
                      {type}
                    </span>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedType === 'O-' && mode === 'donate' && (
                    <p className="flex items-center gap-1.5 text-rose-400 font-bold">
                      <Sparkles className="w-4 h-4 text-rose-400" />
                      Universal Packed Red Blood Cell Donor: Safe for all emergency resuscitations.
                    </p>
                  )}
                  {selectedType === 'AB+' && mode === 'receive' && (
                    <p className="flex items-center gap-1.5 text-cyan-400 font-bold">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Universal Red Blood Cell Recipient: Compatible with all 8 donor groups.
                    </p>
                  )}
                  {!(selectedType === 'O-' && mode === 'donate') &&
                    !(selectedType === 'AB+' && mode === 'receive') && (
                      <p>
                        {mode === 'donate'
                          ? `Donating to any group outside this list would trigger an acute hemolytic transfusion reaction due to ABO/Rh incompatibility.`
                          : `Infusing erythrocytes from non-listed donors would risk immunological rejection by circulating host isohemagglutinins.`}
                      </p>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
