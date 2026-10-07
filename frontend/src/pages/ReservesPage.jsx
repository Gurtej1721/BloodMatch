import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Plus,
  Minus,
  Table,
  Radar,
  Radio,
  Layers,
} from 'lucide-react';
import { useAppToast } from '../components/layout/Layout';
import InteractiveCompatibilityTable from '../components/matrix/InteractiveCompatibilityTable';
import CompatibilityRadarMatrix from '../components/matrix/CompatibilityRadarMatrix';
import NearbyDonorsRadar from '../components/matrix/NearbyDonorsRadar';

export default function ReservesPage() {
  const { addToast } = useAppToast();
  const [activeTab, setActiveTab] = useState('matrix'); // 'inventory' | 'matrix' | 'radar'

  const [inventory, setInventory] = useState([
    { bloodGroup: 'O-', units: 4, status: 'Critical Shortage', maxCapacity: 30, minSafe: 15 },
    { bloodGroup: 'O+', units: 28, status: 'Adequate', maxCapacity: 40, minSafe: 20 },
    { bloodGroup: 'A-', units: 7, status: 'Low Stock', maxCapacity: 25, minSafe: 12 },
    { bloodGroup: 'A+', units: 34, status: 'Optimal', maxCapacity: 45, minSafe: 25 },
    { bloodGroup: 'B-', units: 5, status: 'Low Stock', maxCapacity: 20, minSafe: 10 },
    { bloodGroup: 'B+', units: 22, status: 'Adequate', maxCapacity: 35, minSafe: 18 },
    { bloodGroup: 'AB-', units: 3, status: 'Critical Shortage', maxCapacity: 15, minSafe: 8 },
    { bloodGroup: 'AB+', units: 19, status: 'Adequate', maxCapacity: 30, minSafe: 12 },
  ]);

  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        setInventory(
          data.map((item) => ({
            ...item,
            maxCapacity: item.maxCapacity || Math.max(item.units * 1.5, item.minSafe * 2),
          }))
        );
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleUpdateUnits = async (bloodGroup, change) => {
    try {
      const res = await fetch('/api/inventory/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bloodGroup, change }),
      });
      if (res.ok) {
        const data = await res.json();
        setInventory((prev) =>
          prev.map((i) =>
            i.bloodGroup === bloodGroup
              ? { ...i, units: data.item.units, status: data.item.status }
              : i
          )
        );
        addToast({
          type: 'info',
          title: 'Reserve Capacity Adjusted',
          message: `${bloodGroup} adjusted by ${change > 0 ? '+' + change : change}. Current: ${data.item.units} units.`,
        });
      }
    } catch {
      // Local fallback
      setInventory((prev) =>
        prev.map((i) => {
          if (i.bloodGroup === bloodGroup) {
            const nextUnits = Math.max(0, i.units + change);
            let nextStatus = 'Adequate';
            if (nextUnits < (i.maxCapacity || 30) * 0.25) nextStatus = 'Critical Shortage';
            else if (nextUnits < (i.maxCapacity || 30) * 0.5) nextStatus = 'Low Stock';
            return { ...i, units: nextUnits, status: nextStatus };
          }
          return i;
        })
      );
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 text-xs font-bold uppercase tracking-wider">
            <Database className="w-3.5 h-3.5" />
            <span>Regional Blood Reserve &amp; Compatibility Telemetry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Central Reserves &amp; Transfusion Radar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time monitoring of hospital blood bank capacity, interactive 8×8 compatibility tables, biological radar matrices, and live nearby donor radar tracking.
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'matrix'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Transfusion Matrix &amp; Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'radar'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Nearby Donors Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Reserve Cards ({inventory.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        /* TAB 1: Grid of Reserve Cards with Animated Radial Progress Rings */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {inventory.map((item) => {
            const maxCap = item.maxCapacity || 30;
            const pct = Math.min(100, Math.round((item.units / maxCap) * 100));

            // Threshold status
            const isCritical = pct < 25;
            const isLow = pct >= 25 && pct <= 50;
            const statusLabel = isCritical
              ? 'Critical Shortage'
              : isLow
              ? 'Low Stock'
              : 'Adequate';

            // Radial progress parameters
            const radius = 38;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (pct / 100) * circumference;

            return (
              <motion.div
                key={item.bloodGroup}
                whileHover={{ y: -5 }}
                className={`p-6 rounded-3xl glass-panel border transition-all duration-300 space-y-5 shadow-lg ${
                  isCritical
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : isLow
                    ? 'border-amber-500/40 bg-amber-950/10'
                    : 'border-slate-200 dark:border-white/10'
                }`}
              >
                {/* Header: Blood Group & Threshold Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {item.bloodGroup}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-500 border-rose-500/40 animate-pulse'
                        : isLow
                        ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>

                {/* Animated Radial SVG Progress Ring */}
                <div className="flex items-center justify-center py-2 relative">
                  <svg className="w-28 h-28 transform -rotate-90">
                    {/* Background ring */}
                    <circle
                      cx="56"
                      cy="56"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-slate-200 dark:text-slate-800"
                      fill="transparent"
                    />
                    {/* Foreground animated ring */}
                    <motion.circle
                      cx="56"
                      cy="56"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      strokeLinecap="round"
                      className={
                        isCritical
                          ? 'text-rose-500'
                          : isLow
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                      }
                      fill="transparent"
                    />
                  </svg>

                  {/* Centered Percentage & Units */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                      {item.units}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                      Units ({pct}%)
                    </span>
                  </div>
                </div>

                {/* Threshold Markers Legend */}
                <div className="flex justify-between text-[11px] text-slate-400 border-t border-slate-200 dark:border-white/5 pt-3">
                  <span>Capacity: {maxCap}</span>
                  <span>Safety: {item.minSafe || 15} units</span>
                </div>

                {/* Working Deposit & Dispense Controls */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleUpdateUnits(item.bloodGroup, -1)}
                    disabled={item.units <= 0}
                    className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors disabled:opacity-40"
                    title="Dispense blood unit for emergency"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Dispense</span>
                  </button>

                  <button
                    onClick={() => handleUpdateUnits(item.bloodGroup, 1)}
                    className="flex-1 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-600 dark:text-violet-300 hover:text-white border border-violet-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-all"
                    title="Deposit new donated blood unit"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Deposit</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : activeTab === 'radar' ? (
        /* TAB 2: Live Tactical Nearby Donors Radar */
        <div className="space-y-6">
          <NearbyDonorsRadar />
        </div>
      ) : (
        /* TAB 3: Transfusion Matrix & Compatibility Radar (Both Interactive Table and Circular Radar Matrix) */
        <div className="space-y-10">
          {/* Section A: Interactive Radial Compatibility Radar */}
          <CompatibilityRadarMatrix />

          {/* Section B: Full 8x8 Interactive Compatibility Table */}
          <div className="space-y-3">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Full 8×8 Cross-Match Diagnostic Table
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive cross-match grid allowing point-to-point inspection of any donor-recipient blood pairing with automated antigen and antibody agglutination diagnostics.
            </p>
            <InteractiveCompatibilityTable />
          </div>
        </div>
      )}
    </div>
  );
}
