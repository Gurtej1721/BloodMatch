import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  Filter,
} from 'lucide-react';

const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

// Transfusion Compatibility Map
// [donor][recipient] => boolean
const COMPATIBILITY_GRID = {
  'O-': { 'O-': true, 'O+': true, 'A-': true, 'A+': true, 'B-': true, 'B+': true, 'AB-': true, 'AB+': true },
  'O+': { 'O-': false, 'O+': true, 'A-': false, 'A+': true, 'B-': false, 'B+': true, 'AB-': false, 'AB+': true },
  'A-': { 'O-': false, 'O+': false, 'A-': true, 'A+': true, 'B-': false, 'B+': false, 'AB-': true, 'AB+': true },
  'A+': { 'O-': false, 'O+': false, 'A-': false, 'A+': true, 'B-': false, 'B+': false, 'AB-': false, 'AB+': true },
  'B-': { 'O-': false, 'O+': false, 'A-': false, 'A+': false, 'B-': true, 'B+': true, 'AB-': true, 'AB+': true },
  'B+': { 'O-': false, 'O+': false, 'A-': false, 'A+': false, 'B-': false, 'B+': true, 'AB-': false, 'AB+': true },
  'AB-': { 'O-': false, 'O+': false, 'A-': false, 'A+': false, 'B-': false, 'B+': false, 'AB-': true, 'AB+': true },
  'AB+': { 'O-': false, 'O+': false, 'A-': false, 'A+': false, 'B-': false, 'B+': false, 'AB-': false, 'AB+': true },
};

const MEDICAL_NOTES = {
  'O-': {
    antigens: 'None (Universal Red Blood Cell Donor)',
    antibodies: 'Anti-A, Anti-B',
    summary: 'Universal donor for packed red blood cells. Safe for all recipients in emergency trauma resuscitations before crossmatch completion.',
  },
  'O+': {
    antigens: 'Rh(D) Antigen',
    antibodies: 'Anti-A, Anti-B',
    summary: 'Can safely donate to all Rh-positive recipients (O+, A+, B+, AB+), covering over 85% of the general population.',
  },
  'A-': {
    antigens: 'A Antigen',
    antibodies: 'Anti-B',
    summary: 'Can donate red blood cells to A-, A+, AB-, and AB+ recipients.',
  },
  'A+': {
    antigens: 'A Antigen, Rh(D) Antigen',
    antibodies: 'Anti-B',
    summary: 'Can donate to A+ and AB+ recipients. Second most common blood type.',
  },
  'B-': {
    antigens: 'B Antigen',
    antibodies: 'Anti-A',
    summary: 'Can donate to B-, B+, AB-, and AB+ recipients. Relatively rare in standard reserves.',
  },
  'B+': {
    antigens: 'B Antigen, Rh(D) Antigen',
    antibodies: 'Anti-A',
    summary: 'Can donate to B+ and AB+ recipients.',
  },
  'AB-': {
    antigens: 'A & B Antigens',
    antibodies: 'None',
    summary: 'Can donate red blood cells to AB- and AB+. Universal platelet and plasma donor.',
  },
  'AB+': {
    antigens: 'A, B & Rh(D) Antigens',
    antibodies: 'None (Universal Recipient)',
    summary: 'Universal recipient for red blood cells. Patients can receive red blood cells from any of the 8 blood types without acute hemolytic reaction.',
  },
};

export default function InteractiveCompatibilityTable({ onSelectType }) {
  const [selectedDonor, setSelectedDonor] = useState('O-');
  const [selectedRecipient, setSelectedRecipient] = useState('A+');
  const [hoveredCell, setHoveredCell] = useState(null); // { donor, recipient }
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'compatibleOnly' | 'universal'

  const activeDonor = hoveredCell ? hoveredCell.donor : selectedDonor;
  const activeRecipient = hoveredCell ? hoveredCell.recipient : selectedRecipient;
  const isCurrentlyCompatible = COMPATIBILITY_GRID[activeDonor]?.[activeRecipient] ?? false;

  const handleCellClick = (donor, recipient) => {
    setSelectedDonor(donor);
    setSelectedRecipient(recipient);
    if (onSelectType) onSelectType(donor);
  };

  return (
    <div className="space-y-6">
      {/* Controls & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Interactive Cross-Match Matrix
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Full 8×8 Matrix
          </button>
          <button
            onClick={() => setFilterMode('compatibleOnly')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterMode === 'compatibleOnly'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Show Compatible Only
          </button>
          <button
            onClick={() => {
              setFilterMode('universal');
              setSelectedDonor('O-');
              setSelectedRecipient('AB+');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterMode === 'universal'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Universal Donors / Recipients
          </button>
        </div>
      </div>

      {/* Main Interactive 8x8 Table Container */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl bg-white dark:bg-slate-950/80 backdrop-blur-md">
        <table className="w-full text-center border-collapse">
          {/* Column Header: Recipient Blood Types */}
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/90">
              <th className="p-3 sm:p-4 text-left border-r border-slate-200 dark:border-white/10 min-w-[120px]">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-rose-500 font-bold">
                    DONOR ↓
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold">
                    RECIPIENT →
                  </span>
                </div>
              </th>
              {BLOOD_GROUPS.map((recipient) => {
                const isSelectedCol = activeRecipient === recipient;
                const isUniversalRecipient = recipient === 'AB+';

                return (
                  <th
                    key={recipient}
                    onClick={() => setSelectedRecipient(recipient)}
                    className={`p-2.5 sm:p-3.5 cursor-pointer transition-colors ${
                      isSelectedCol
                        ? 'bg-cyan-500/20 text-cyan-400 font-black'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-sm sm:text-base font-extrabold">{recipient}</span>
                      {isUniversalRecipient && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 uppercase tracking-tighter">
                          Univ Recip
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body: Donor Rows */}
          <tbody>
            {BLOOD_GROUPS.map((donor, rIndex) => {
              const isSelectedRow = activeDonor === donor;
              const isUniversalDonor = donor === 'O-';

              return (
                <tr
                  key={donor}
                  className={`border-b border-slate-200/60 dark:border-white/5 transition-colors ${
                    isSelectedRow
                      ? 'bg-rose-500/10'
                      : rIndex % 2 === 0
                      ? 'bg-transparent'
                      : 'bg-slate-50/50 dark:bg-slate-900/30'
                  }`}
                >
                  {/* Row Header (Donor) */}
                  <th
                    onClick={() => setSelectedDonor(donor)}
                    className={`p-3 sm:p-4 text-left border-r border-slate-200 dark:border-white/10 cursor-pointer transition-colors ${
                      isSelectedRow
                        ? 'bg-rose-500/20 text-rose-500 font-black'
                        : 'text-slate-900 dark:text-white hover:bg-rose-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm sm:text-base font-black">{donor}</span>
                      {isUniversalDonor && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 uppercase tracking-tighter">
                          Univ Donor
                        </span>
                      )}
                    </div>
                  </th>

                  {/* 8 Compatibility Cells */}
                  {BLOOD_GROUPS.map((recipient) => {
                    const isCompatible = COMPATIBILITY_GRID[donor][recipient];
                    const isCellActive = activeDonor === donor && activeRecipient === recipient;
                    const isRowActive = activeDonor === donor;
                    const isColActive = activeRecipient === recipient;

                    // Filtering visibility
                    const isDimmed =
                      (filterMode === 'compatibleOnly' && !isCompatible) ||
                      (filterMode === 'universal' && donor !== 'O-' && recipient !== 'AB+');

                    return (
                      <td
                        key={recipient}
                        onMouseEnter={() => setHoveredCell({ donor, recipient })}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => handleCellClick(donor, recipient)}
                        className={`p-2 sm:p-3 cursor-pointer transition-all duration-150 relative ${
                          isCellActive
                            ? 'ring-2 ring-rose-500 bg-rose-500/30 scale-105 z-10 rounded-lg shadow-md'
                            : isRowActive || isColActive
                            ? 'bg-slate-200/60 dark:bg-slate-800/60'
                            : 'hover:bg-slate-100 dark:hover:bg-white/5'
                        } ${isDimmed ? 'opacity-20' : 'opacity-100'}`}
                      >
                        <div className="flex items-center justify-center">
                          {isCompatible ? (
                            <span
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all ${
                                isCellActive
                                  ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)] scale-110'
                                  : 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white'
                              }`}
                              title={`Donor ${donor} can donate to Recipient ${recipient}`}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </span>
                          ) : (
                            <span
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all ${
                                isCellActive
                                  ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)] scale-110'
                                  : 'bg-slate-200 dark:bg-slate-800/80 text-slate-400 dark:text-slate-600 hover:text-rose-500'
                              }`}
                              title={`Donor ${donor} cannot donate to Recipient ${recipient}`}
                            >
                              <X className="w-3.5 h-3.5 stroke-[2.5]" />
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Clinical Cross-Match Diagnostic Inspection Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeDonor}->${activeRecipient}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={`p-6 rounded-3xl glass-panel border shadow-xl space-y-4 ${
            isCurrentlyCompatible
              ? 'border-emerald-500/40 bg-emerald-950/10'
              : 'border-rose-500/40 bg-rose-950/10'
          }`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${
                  isCurrentlyCompatible
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                    : 'bg-rose-600 text-white shadow-rose-600/30'
                }`}
              >
                {isCurrentlyCompatible ? <Check className="w-6 h-6 stroke-[3]" /> : <X className="w-6 h-6 stroke-[3]" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    Donor <span className="text-rose-500 font-mono">{activeDonor}</span>
                    {' → '}
                    Recipient <span className="text-cyan-400 font-mono">{activeRecipient}</span>
                  </span>
                  <span
                    className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      isCurrentlyCompatible
                        ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-500 border-rose-500/30'
                    }`}
                  >
                    {isCurrentlyCompatible ? 'Medically Compatible' : 'Incompatible (Hemolytic Risk)'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isCurrentlyCompatible
                    ? 'Transfusion is clinically safe. Recipient plasma does not possess agglutinating antibodies against donor erythrocytes.'
                    : 'Transfusion contraindicated! Recipient anti-ABO or anti-Rh antibodies will induce acute intravascular hemolysis.'}
                </p>
              </div>
            </div>

            {/* Quick action: Match Now */}
            <div className="flex items-center gap-2 self-stretch md:self-auto">
              <span className="text-xs font-mono font-bold text-slate-400">
                Rule ID: TX-{activeDonor}-{activeRecipient}
              </span>
            </div>
          </div>

          {/* Biological Antigen & Antibody Immunology Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-white/5 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">
                Donor Profile ({activeDonor})
              </span>
              <p className="font-semibold text-slate-900 dark:text-slate-200">
                Erythrocyte Antigens: {MEDICAL_NOTES[activeDonor]?.antigens}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                {MEDICAL_NOTES[activeDonor]?.summary}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                Recipient Profile ({activeRecipient})
              </span>
              <p className="font-semibold text-slate-900 dark:text-slate-200">
                Plasma Antibodies: {MEDICAL_NOTES[activeRecipient]?.antibodies}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                {MEDICAL_NOTES[activeRecipient]?.summary}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
