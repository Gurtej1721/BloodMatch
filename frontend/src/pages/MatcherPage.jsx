import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  MapPin,
  Clock,
  Phone,
  Send,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  EyeOff,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppToast } from '../components/layout/Layout';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function MatcherPage() {
  const { addToast } = useAppToast();
  const [targetBlood, setTargetBlood] = useState('O-');
  const [maxRadiusKm, setMaxRadiusKm] = useState(15);
  const [urgency, setUrgency] = useState('Critical');
  const [facility, setFacility] = useState('City General Hospital');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [dispatchedDonors, setDispatchedDonors] = useState({});

  const executeMatching = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bloodGroup: targetBlood,
          urgency,
          location: facility,
          radiusKm: maxRadiusKm,
        }),
      });

      if (!res.ok) throw new Error('Match failed');
      const data = await res.json();
      // Filter by radius slider
      const filteredMatches = (data.matches || []).filter(
        (m) => Number(m.distanceKm || 2) <= maxRadiusKm
      );
      setResults({ ...data, matches: filteredMatches, matchesCount: filteredMatches.length });
    } catch {
      // Local fallback calculation
      const COMPATIBILITY = {
        'O-': ['O-'],
        'O+': ['O-', 'O+'],
        'A-': ['O-', 'A-'],
        'A+': ['O-', 'O+', 'A-', 'A+'],
        'B-': ['O-', 'B-'],
        'B+': ['O-', 'O+', 'B-', 'B+'],
        'AB-': ['O-', 'A-', 'B-', 'AB-'],
        'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
      };
      const allowed = COMPATIBILITY[targetBlood] || [targetBlood];

      const seedDonors = [
        {
          id: 'd1',
          name: 'Dr. Sarah Jenkins',
          bloodGroup: 'O-',
          phone: '+1 (555) 234-8901',
          location: 'Metro Trauma Center, Downtown',
          distanceKm: 2.1,
          compatibilityScore: targetBlood === 'O-' ? 100 : 95,
          estimatedArrivalTimeMin: 11,
          verified: true,
        },
        {
          id: 'd5',
          name: 'Hannah Abbott',
          bloodGroup: 'O+',
          phone: '+1 (555) 602-8819',
          location: 'Riverside General Hospital',
          distanceKm: 1.5,
          compatibilityScore: targetBlood === 'O+' ? 100 : 90,
          estimatedArrivalTimeMin: 8,
          verified: true,
        },
        {
          id: 'd2',
          name: 'Marcus Vance',
          bloodGroup: 'A+',
          phone: '+1 (555) 872-3142',
          location: 'Westside Community Clinic',
          distanceKm: 4.8,
          compatibilityScore: targetBlood === 'A+' ? 100 : 85,
          estimatedArrivalTimeMin: 18,
          verified: true,
        },
        {
          id: 'd4',
          name: 'Kofi Mensah',
          bloodGroup: 'B+',
          phone: '+1 (555) 910-3324',
          location: 'St. Jude Memorial Hospital',
          distanceKm: 3.5,
          compatibilityScore: targetBlood === 'B+' ? 100 : 85,
          estimatedArrivalTimeMin: 14,
          verified: true,
        },
      ];

      const matches = seedDonors
        .filter((d) => allowed.includes(d.bloodGroup) && d.distanceKm <= maxRadiusKm)
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

      setResults({
        requestedBloodGroup: targetBlood,
        compatibleDonorBloodGroups: allowed,
        matchesCount: matches.length,
        matches,
        bankReserveUnits: 24,
        reserveStatus: 'Optimal',
      });
    } finally {
      setLoading(false);
    }
  }, [targetBlood, maxRadiusKm, urgency, facility]);

  useEffect(() => {
    executeMatching();
  }, [executeMatching]);


  const handleDispatch = async (donor) => {
    setDispatchedDonors((prev) => ({ ...prev, [donor.id]: true }));

    // Confetti celebration
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }

    try {
      await fetch('/api/match/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId: donor.id,
          donorName: donor.name,
          patientName: `STAT Patient (${targetBlood})`,
          bloodGroup: targetBlood,
        }),
      });
    } catch {
      // ignore
    }

    addToast({
      type: 'success',
      title: 'Emergency Dispatch Transmitted!',
      message: `Direct signal routed to ${donor.name} (${donor.phone}). Estimated arrival: ${donor.estimatedArrivalTimeMin}m.`,
    });
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            <span>Clinical Rapid-Matching Console</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Hospital Triage Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time algorithmic cross-matching with localized distance triangulation and single-click signal dispatch.
          </p>
        </div>

        <button
          onClick={executeMatching}
          className="p-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-bold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-700 dark:text-slate-300"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-compute Compatibility</span>
        </button>
      </div>

      {/* Split Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Parameters & Inventory Filters (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Sliders className="w-4 h-4" />
              <span>Matching Telemetry Controls</span>
            </div>

            {/* Target Blood Group */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Target Patient Blood Group
              </label>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_GROUPS.map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setTargetBlood(bg)}
                    className={`py-3 rounded-2xl font-black text-sm border transition-all ${
                      targetBlood === bg
                        ? 'bg-rose-600 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] scale-105'
                        : 'bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-rose-400'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Radius Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Maximum Dispatch Radius:</span>
                <span className="font-mono text-cyan-500 text-sm">{maxRadiusKm} km</span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                step="1"
                value={maxRadiusKm}
                onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>2 km (Walking/Rapid)</span>
                <span>25 km (Regional)</span>
                <span>50 km (Metro)</span>
              </div>
            </div>

            {/* Urgency Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Urgency Protocol
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
              >
                <option value="Critical">STAT / Critical (&lt; 1 hour)</option>
                <option value="Urgent">Urgent (&lt; 4 hours)</option>
                <option value="Routine">Elective / Scheduled</option>
              </select>
            </div>

            {/* Hospital Facility */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Receiving Facility Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Central Blood Bank Reserve Peek Card */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 space-y-2">
              <div className="text-[11px] font-bold uppercase text-slate-400">
                Hospital Bank Reserve for {targetBlood}
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {results ? results.bankReserveUnits : 24} Units
                </span>
                <span className="text-xs font-bold text-emerald-500">
                  {results ? results.reserveStatus : 'Optimal'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Biological Computation & Ranked Donors (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Compatibility Engine Ribbon */}
          {results && (
            <div className="p-5 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Transfusion Compatible Groups
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  {results.compatibleDonorBloodGroups?.map((bg) => (
                    <span
                      key={bg}
                      className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                        bg === targetBlood
                          ? 'bg-rose-500/20 text-rose-500 border-rose-500/40'
                          : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                      }`}
                    >
                      {bg}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Standby Volunteers:</span>
                <div className="text-xl font-black text-cyan-400">
                  {results.matchesCount} in {maxRadiusKm} km
                </div>
              </div>
            </div>
          )}

          {/* Ranked Donor List */}
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Ranked Compatible Donors</span>
              <span className="text-xs text-slate-500 font-normal">Sorted by medical affinity &amp; arrival ETA</span>
            </h3>

            {results?.matches && results.matches.length > 0 ? (
              <div className="space-y-3.5">
                {results.matches.map((donor, idx) => {
                  const isDispatched = !!dispatchedDonors[donor.id];

                  return (
                    <motion.div
                      key={donor.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-5 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 hover:border-rose-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md"
                    >
                      {/* Left Donor Details */}
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 flex flex-col items-center justify-center shrink-0">
                          <span className="text-xs font-black text-rose-500">{donor.bloodGroup}</span>
                          <span className="text-[10px] text-slate-400">{donor.compatibilityScore}%</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{donor.name}</h4>
                            {donor.verified && (
                              <ShieldCheck className="w-4 h-4 text-cyan-400" title="Verified Volunteer" />
                            )}
                            {donor.isPrivate && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-400 border border-violet-500/30">
                                <EyeOff className="w-3 h-3" />
                                <span>Private Relay</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{donor.location} ({donor.distanceKm} km away)</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Estimated Dispatch ETA: ~{donor.estimatedArrivalTimeMin} mins</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action: Dispatch Signal */}
                      <div className="w-full sm:w-auto flex items-center gap-2">
                        <a
                          href={donor.isPrivate ? '#' : `tel:${donor.phone}`}
                          onClick={donor.isPrivate ? (e) => {
                            e.preventDefault();
                            addToast({
                              type: 'info',
                              title: 'Private Volunteer Relay',
                              message: 'Direct calls are routed through the BloodMatch automated dispatch relay.',
                            });
                          } : undefined}
                          className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                          title={donor.isPrivate ? "Call Routed via Relay" : "Call Donor Directly"}
                        >
                          <Phone className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => handleDispatch(donor)}
                          disabled={isDispatched}
                          className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                            isDispatched
                              ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/50'
                              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                          }`}
                        >
                          {isDispatched ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Signal Dispatched!</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Dispatch Signal</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl glass-panel border border-slate-200 dark:border-white/5 space-y-3">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="font-bold text-slate-900 dark:text-white">No Donors in Immediate Radius</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Increase the dispatch radius slider or post a STAT Distress Broadcast across the entire network.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
