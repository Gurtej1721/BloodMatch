import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar,
  Radio,
  Send,
  ShieldCheck,
  EyeOff,
  Navigation,
  Clock,
  Phone,
  MapPin,
  Filter,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAppToast } from '../layout/Layout';

const BLOOD_GROUPS = ['All', 'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const COMPATIBILITY_RULES = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

// Default tactical donors for radar if API is loading/offline
const DEFAULT_RADAR_DONORS = [
  {
    id: 'd1',
    name: 'Dr. Sarah Jenkins',
    bloodGroup: 'O-',
    distanceKm: 2.1,
    bearingDeg: 35,
    location: 'Metro Trauma Center, Downtown',
    phone: '+1 (555) 234-8901',
    verified: true,
    status: 'Available',
    isPrivate: false,
  },
  {
    id: 'd2',
    name: 'Anonymous Volunteer #304',
    bloodGroup: 'A+',
    distanceKm: 4.8,
    bearingDeg: 120,
    location: 'Westside Community Clinic',
    phone: '+1 (555) •••-3142',
    verified: true,
    status: 'Available',
    isPrivate: true,
  },
  {
    id: 'd4',
    name: 'Kofi Mensah',
    bloodGroup: 'B+',
    distanceKm: 3.5,
    bearingDeg: 290,
    location: 'St. Jude Memorial Hospital',
    phone: '+1 (555) 910-3324',
    verified: true,
    status: 'Available',
    isPrivate: false,
  },
  {
    id: 'd5',
    name: 'Hannah Abbott',
    bloodGroup: 'O+',
    distanceKm: 1.5,
    bearingDeg: 75,
    location: 'Riverside General Hospital',
    phone: '+1 (555) 602-8819',
    verified: true,
    status: 'Available',
    isPrivate: false,
  },
  {
    id: 'd6',
    name: 'Anonymous Lifeline #819',
    bloodGroup: 'O-',
    distanceKm: 3.8,
    bearingDeg: 165,
    location: 'Presbyterian Health Center',
    phone: '+1 (555) •••-8012',
    verified: true,
    status: 'Available',
    isPrivate: true,
  },
  {
    id: 'd8',
    name: 'Dr. Maya Lin',
    bloodGroup: 'B-',
    distanceKm: 4.2,
    bearingDeg: 245,
    location: 'University Health Pavilion',
    phone: '+1 (555) 381-9922',
    verified: true,
    status: 'Available',
    isPrivate: false,
  },
];

export default function NearbyDonorsRadar() {
  const { addToast } = useAppToast();
  const [donors, setDonors] = useState(DEFAULT_RADAR_DONORS);
  const [loading, setLoading] = useState(false);
  const [targetPatientBlood, setTargetPatientBlood] = useState('O-');
  const [maxRadiusKm, setMaxRadiusKm] = useState(30);
  const [selectedBlip, setSelectedBlip] = useState(null);

  // Fetch real donors from API
  const fetchDonors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/donors');
      if (res.ok) {
        const data = await res.json();
        // Ensure distanceKm and bearingDeg exist
        const enriched = data.map((d, i) => ({
          ...d,
          distanceKm: Number(d.distanceKm) || (i * 1.8 + 1.2),
          bearingDeg: d.bearingDeg !== undefined ? d.bearingDeg : (i * 55 + 25) % 360,
        }));
        setDonors(enriched);
      }
    } catch {
      // Keep defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  // Filter donors by radius and determine compatibility
  const filteredDonors = useMemo(() => {
    const compatibleTypes =
      targetPatientBlood === 'All'
        ? BLOOD_GROUPS
        : COMPATIBILITY_RULES[targetPatientBlood] || [targetPatientBlood];

    return donors.map((d) => {
      const isCompat = compatibleTypes.includes(d.bloodGroup);
      const isUniversal = d.bloodGroup === 'O-';
      const isWithinRadius = d.distanceKm <= maxRadiusKm;

      // Project polar coordinates (radius, angle) into SVG viewport (center at 200, 200; max radius = 170px)
      const maxPlotRadiusPx = 165;
      const r = Math.min(maxPlotRadiusPx, (d.distanceKm / maxRadiusKm) * maxPlotRadiusPx);
      const angleRad = ((d.bearingDeg - 90) * Math.PI) / 180;
      const x = 200 + r * Math.cos(angleRad);
      const y = 200 + r * Math.sin(angleRad);

      return {
        ...d,
        x,
        y,
        isCompatible: isCompat,
        isUniversal,
        isWithinRadius,
        etaMin: Math.max(4, Math.round(d.distanceKm * 2.5 + 3)),
      };
    });
  }, [donors, targetPatientBlood, maxRadiusKm]);

  const activeDonorsInScope = filteredDonors.filter((d) => d.isWithinRadius);
  const compatibleCount = activeDonorsInScope.filter((d) => d.isCompatible).length;

  const handleDispatchBlip = (donor) => {
    addToast({
      type: 'success',
      title: 'Tactical STAT Signal Routed',
      message: donor.isPrivate
        ? `Emergency alert dispatched to ${donor.name} via anonymous encrypted relay. Standby for ETA confirmation.`
        : `Immediate dispatch signal routed to ${donor.name} (${donor.bloodGroup}) at ${donor.location}. ETA: ~${donor.etaMin} mins.`,
    });
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-6 shadow-xl">
      {/* Header & Tactical Scope Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-wider">
            <Radio className="w-4 h-4 animate-pulse text-cyan-400" />
            <span>Tactical Telemetry Radar</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Live Nearby Standby Donors Radar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time 360° radar sweep pinpointing verified volunteer donors within emergency dispatch radius.
          </p>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-xs font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {activeDonorsInScope.length} Active in Radar
            </span>
            <span className="text-emerald-500 font-bold">
              ({compatibleCount} Compatible)
            </span>
          </div>

          <button
            onClick={fetchDonors}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh Radar Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Ribbon: Patient Blood Type Needed + Max Radar Radius Slider */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 text-xs">
        {/* Patient Blood Group Selector */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-rose-500" />
            <span>Target Patient Blood Group:</span>
          </label>
          <div className="flex flex-wrap gap-1">
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                onClick={() => setTargetPatientBlood(bg)}
                className={`px-2.5 py-1 rounded-lg font-black transition-all ${
                  targetPatientBlood === bg
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-400'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Radar Range Slider */}
        <div className="space-y-1.5 sm:col-span-1 lg:col-span-2">
          <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
            <span>Radar Sweep Range:</span>
            <span className="font-mono text-cyan-400 font-black">{maxRadiusKm} km</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={maxRadiusKm}
            onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>5 km (Local Immediate)</span>
            <span>25 km (Metro Hub)</span>
            <span>50 km (Regional STAT)</span>
          </div>
        </div>
      </div>

      {/* Main Radar Screen & Tactical HUD Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Radar Canvas / SVG Display (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px]">
            {/* SVG Radar Instrument */}
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full filter drop-shadow-[0_0_25px_rgba(6,182,212,0.18)]"
            >
              <defs>
                {/* Phosphor Scope Gradient */}
                <radialGradient id="tacticalRadarBg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.09" />
                  <stop offset="60%" stopColor="#0f172a" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="0.4" />
                </radialGradient>

                {/* Sweeping Beam Shader */}
                <linearGradient id="cyanBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Background Circular Scope */}
              <circle cx="200" cy="200" r="180" fill="url(#tacticalRadarBg)" />

              {/* Concentric Distance Rings */}
              {/* Ring 1 (Inner 25%) */}
              <circle cx="200" cy="200" r="45" fill="none" stroke="currentColor" strokeWidth="1" className="text-cyan-500/30" strokeDasharray="3 3" />
              {/* Ring 2 (Mid 50%) */}
              <circle cx="200" cy="200" r="90" fill="none" stroke="currentColor" strokeWidth="1" className="text-cyan-500/30" strokeDasharray="3 3" />
              {/* Ring 3 (Outer 75%) */}
              <circle cx="200" cy="200" r="135" fill="none" stroke="currentColor" strokeWidth="1" className="text-cyan-500/30" strokeDasharray="3 3" />
              {/* Ring 4 (Max Scope 100%) */}
              <circle cx="200" cy="200" r="175" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyan-500/50" />

              {/* Crosshair Axes */}
              <line x1="25" y1="200" x2="375" y2="200" stroke="currentColor" strokeWidth="1" className="text-cyan-500/30" />
              <line x1="200" y1="25" x2="200" y2="375" stroke="currentColor" strokeWidth="1" className="text-cyan-500/30" />

              {/* Diagonal 45deg Guide Lines */}
              <line x1="76" y1="76" x2="324" y2="324" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500/20" strokeDasharray="2 4" />
              <line x1="324" y1="76" x2="76" y2="324" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500/20" strokeDasharray="2 4" />

              {/* Center Hospital / Command Origin Point */}
              <circle cx="200" cy="200" r="12" fill="currentColor" className="text-rose-500/20 animate-pulse" />
              <circle cx="200" cy="200" r="4" fill="#f43f5e" />

              {/* Compass Cardinal Points & Ring Distance Marks */}
              <text x="200" y="18" textAnchor="middle" className="text-[9px] fill-cyan-400 font-mono font-black">N 000°</text>
              <text x="388" y="204" textAnchor="start" className="text-[9px] fill-cyan-400 font-mono font-black">E 090°</text>
              <text x="200" y="394" textAnchor="middle" className="text-[9px] fill-cyan-400 font-mono font-black">S 180°</text>
              <text x="12" y="204" textAnchor="end" className="text-[9px] fill-cyan-400 font-mono font-black">W 270°</text>

              <text x="204" y="152" className="text-[8px] fill-slate-400 font-mono font-bold">
                {Math.round(maxRadiusKm * 0.25)}km
              </text>
              <text x="204" y="107" className="text-[8px] fill-slate-400 font-mono font-bold">
                {Math.round(maxRadiusKm * 0.5)}km
              </text>
              <text x="204" y="62" className="text-[8px] fill-slate-400 font-mono font-bold">
                {Math.round(maxRadiusKm * 0.75)}km
              </text>
              <text x="204" y="22" className="text-[8px] fill-cyan-400 font-mono font-bold">
                {maxRadiusKm}km
              </text>

              {/* Sweeping 360-degree Radar Beam */}
              <g className="animate-spin" style={{ transformOrigin: '200px 200px', animationDuration: '4.5s' }}>
                <path
                  d="M 200 200 L 375 200 A 175 175 0 0 0 324 76 Z"
                  fill="url(#cyanBeam)"
                />
                <line x1="200" y1="200" x2="375" y2="200" stroke="#06b6d4" strokeWidth="2" strokeOpacity="0.8" />
              </g>

              {/* Dynamic Donor Blips plotted on the Radar */}
              {activeDonorsInScope.map((donor) => {
                const isSelected = selectedBlip?.id === donor.id;
                const isCompatible = donor.isCompatible;

                // Color tokens:
                // Compatible -> emerald / cyan
                // Universal (O-) -> bright gold / green
                // Incompatible -> subtle purple/gray
                const blipFill = isCompatible
                  ? donor.bloodGroup === 'O-'
                    ? '#10b981'
                    : '#06b6d4'
                  : '#64748b';

                return (
                  <g
                    key={donor.id}
                    onClick={() => setSelectedBlip(donor)}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing Sonar Ping Rings */}
                    <circle
                      cx={donor.x}
                      cy={donor.y}
                      r="16"
                      fill="none"
                      stroke={blipFill}
                      strokeWidth="1.5"
                      className="animate-ping opacity-35"
                    />

                    {/* Outer selected glow */}
                    {isSelected && (
                      <circle
                        cx={donor.x}
                        cy={donor.y}
                        r="18"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                    )}

                    {/* Blip Circle */}
                    <circle
                      cx={donor.x}
                      cy={donor.y}
                      r={isSelected ? '9' : '7'}
                      fill={blipFill}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="transition-all duration-200 group-hover:scale-125"
                      style={{ transformOrigin: `${donor.x}px ${donor.y}px` }}
                    />

                    {/* Donor Blood Type Label near Blip */}
                    <text
                      x={donor.x}
                      y={donor.y - 10}
                      textAnchor="middle"
                      className="text-[9px] font-mono font-black select-none pointer-events-none fill-slate-900 dark:fill-white font-bold"
                    >
                      {donor.bloodGroup}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <span className="text-[11px] font-mono text-slate-400 mt-2">
            Click any radar blip to inspect donor telemetry &amp; trigger dispatch
          </span>
        </div>

        {/* Right: Tactical HUD Card (5 Cols) */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {selectedBlip ? (
              <motion.div
                key={selectedBlip.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-6 rounded-3xl glass-panel border shadow-2xl space-y-5 ${
                  selectedBlip.isCompatible
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : 'border-slate-300 dark:border-white/10'
                }`}
              >
                {/* Header: Name, Verified Badge & Privacy Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                        selectedBlip.isCompatible
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {selectedBlip.bloodGroup}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {selectedBlip.name}
                        </h4>
                        {selectedBlip.verified && (
                          <ShieldCheck className="w-4 h-4 text-cyan-400" title="Verified Standby Volunteer" />
                        )}
                        {selectedBlip.isPrivate && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-400 border border-violet-500/30"
                            title="Private Profile - Contact Shielded via Dispatch Relay"
                          >
                            <EyeOff className="w-3 h-3" />
                            <span>Private</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        Bearing: {selectedBlip.bearingDeg}° | Status: {selectedBlip.status}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                      selectedBlip.isCompatible
                        ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                        : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                    }`}
                  >
                    {selectedBlip.isCompatible ? 'COMPATIBLE' : 'DIFFERENT GROUP'}
                  </span>
                </div>

                {/* Telemetry Metrics: Distance, ETA, Location */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-cyan-400" />
                      Distance
                    </span>
                    <p className="font-black text-sm text-slate-900 dark:text-white">
                      {selectedBlip.distanceKm} km
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      Estimated Transit
                    </span>
                    <p className="font-black text-sm text-emerald-500">
                      ~{selectedBlip.etaMin} mins
                    </p>
                  </div>
                </div>

                {/* Location & Contact Info */}
                <div className="space-y-2 text-xs bg-slate-100 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-white/5">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedBlip.location}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-cyan-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {selectedBlip.isPrivate
                        ? `${selectedBlip.phone} (Protected Relay)`
                        : selectedBlip.phone}
                    </span>
                  </div>
                </div>

                {/* Compatibility Explanatory Note */}
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedBlip.isCompatible ? (
                    <p className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                      Biologically compatible with target patient ({targetPatientBlood}). Cleared for immediate STAT dispatch.
                    </p>
                  ) : (
                    <p className="flex items-center gap-1.5 text-slate-500">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                      Not currently compatible with target patient {targetPatientBlood}, but available on standby for matching cases.
                    </p>
                  )}
                </div>

                {/* Direct Dispatch CTA */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleDispatchBlip(selectedBlip)}
                    className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Immediate STAT Signal</span>
                  </button>

                  <button
                    onClick={() => setSelectedBlip(null)}
                    className="px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Standby Prompt when no blip is clicked */
              <div className="p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 text-center space-y-4 shadow-lg">
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                  <Radar className="w-8 h-8 animate-spin-slow" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Select a Radar Blip to Inspect
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Click any pulsating blip on the radar scope to view real-time distance, bearing, verification status, and route a STAT dispatch alert.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 text-left text-xs space-y-2 border border-slate-200 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Radar Center:</span>
                    <span className="font-bold text-slate-900 dark:text-white">Emergency Trauma Base</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Current Scope:</span>
                    <span className="font-mono font-bold text-cyan-400">{maxRadiusKm} km radius</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Compatible Donors:</span>
                    <span className="font-bold text-emerald-500">{compatibleCount} available now</span>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
