import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Database, Plus, Minus } from 'lucide-react';

const COMPATIBILITY_CHART = {
  'O-': { givesTo: 'All Types (Universal)', receivesFrom: 'O- only' },
  'O+': { givesTo: 'O+, A+, B+, AB+', receivesFrom: 'O-, O+' },
  'A-': { givesTo: 'A-, A+, AB-, AB+', receivesFrom: 'O-, A-' },
  'A+': { givesTo: 'A+, AB+', receivesFrom: 'O-, O+, A-, A+' },
  'B-': { givesTo: 'B-, B+, AB-, AB+', receivesFrom: 'O-, B-' },
  'B+': { givesTo: 'B+, AB+', receivesFrom: 'O-, O+, B-, B+' },
  'AB-': { givesTo: 'AB-, AB+', receivesFrom: 'O-, A-, B-, AB-' },
  'AB+': { givesTo: 'AB+ only', receivesFrom: 'All Types (Universal Recipient)' },
};

export default function BloodInventorySection({ onNotify }) {
  const [inventory, setInventory] = useState([
    { bloodGroup: 'O-', units: 4, status: 'Critical Shortage', minSafe: 15 },
    { bloodGroup: 'O+', units: 28, status: 'Adequate', minSafe: 20 },
    { bloodGroup: 'A-', units: 7, status: 'Low Stock', minSafe: 12 },
    { bloodGroup: 'A+', units: 34, status: 'Optimal', minSafe: 25 },
    { bloodGroup: 'B-', units: 5, status: 'Low Stock', minSafe: 10 },
    { bloodGroup: 'B+', units: 22, status: 'Adequate', minSafe: 18 },
    { bloodGroup: 'AB-', units: 3, status: 'Critical Shortage', minSafe: 8 },
    { bloodGroup: 'AB+', units: 19, status: 'Adequate', minSafe: 12 },
  ]);

  const [activeTab, setActiveTab] = useState('inventory');
  const [selectedGroup, setSelectedGroup] = useState('O-');
  const [updatingGroup, setUpdatingGroup] = useState(null);

  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setInventory(data);
        }
      }
    } catch {
      // Keep initial seed
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleUpdateUnits = async (bloodGroup, change) => {
    setUpdatingGroup(bloodGroup);
    try {
      const res = await fetch('/api/inventory/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bloodGroup, change }),
      });

      if (res.ok) {
        const data = await res.json();
        setInventory((prev) =>
          prev.map((item) => (item.bloodGroup === bloodGroup ? data.item : item))
        );
        if (onNotify) {
          onNotify({
            type: 'info',
            title: 'Inventory Updated',
            message: `${bloodGroup} units adjusted by ${change > 0 ? '+' + change : change}. Current: ${data.item.units} units.`,
          });
        }
      } else {
        throw new Error('Failed to update inventory');
      }
    } catch {
      // Local fallback
      setInventory((prev) =>
        prev.map((item) => {
          if (item.bloodGroup === bloodGroup) {
            const nextUnits = Math.max(0, item.units + change);
            let nextStatus = 'Optimal';
            if (nextUnits < item.minSafe * 0.5) nextStatus = 'Critical Shortage';
            else if (nextUnits < item.minSafe) nextStatus = 'Low Stock';
            return { ...item, units: nextUnits, status: nextStatus };
          }
          return item;
        })
      );
    } finally {
      setUpdatingGroup(null);
    }
  };

  return (
    <section id="inventory" className="my-20 z-10 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>Blood Bank &amp; Compatibility Telemetry</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Central Blood Reserves &amp; Matrix</h2>
          <p className="text-slate-400 mt-1 text-sm">
            Live tracked hospital blood bank capacity with biological donor-recipient compatibility rules.
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex bg-slate-900 border border-white/10 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'inventory'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Bank Stock
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'matrix'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Compatibility Matrix
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {inventory.map((item) => {
            const isCritical = item.status === 'Critical Shortage';
            const isLow = item.status === 'Low Stock';

            return (
              <motion.div
                key={item.bloodGroup}
                whileHover={{ y: -4 }}
                className={`p-5 rounded-2xl border backdrop-blur-xl transition-all ${
                  isCritical
                    ? 'bg-rose-950/25 border-rose-500/30 shadow-[0_4px_20px_rgba(244,63,94,0.1)]'
                    : isLow
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-slate-900/60 border-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl font-black text-white tracking-wider">
                    {item.bloodGroup}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : isLow
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">Available Units:</span>
                    <span className="text-2xl font-black text-white">{item.units}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, (item.units / (item.minSafe * 1.5)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Safe threshold: {item.minSafe} units</span>
                    <span>{Math.round((item.units / item.minSafe) * 100)}%</span>
                  </div>
                </div>

                {/* Stock Adjust Controls */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleUpdateUnits(item.bloodGroup, -1)}
                    disabled={updatingGroup === item.bloodGroup || item.units <= 0}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1 border border-white/5 disabled:opacity-40"
                    title="Dispense blood unit for emergency"
                  >
                    <Minus className="w-3 h-3" />
                    <span>Dispense</span>
                  </button>

                  <button
                    onClick={() => handleUpdateUnits(item.bloodGroup, 1)}
                    disabled={updatingGroup === item.bloodGroup}
                    className="flex-1 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1"
                    title="Deposit new donated blood unit"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Donate</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Compatibility Matrix View */
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-6 sm:p-8">
          <div className="max-w-2xl mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Interactive Compatibility Lookup</h3>
            <p className="text-sm text-slate-400">
              Click any blood group below to inspect who can receive its blood and who can safely donate to it.
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-8">
            {Object.keys(COMPATIBILITY_CHART).map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedGroup(bg)}
                className={`py-3 rounded-2xl font-black text-sm border transition-all ${
                  selectedGroup === bg
                    ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] scale-105'
                    : 'bg-slate-800/80 border-white/5 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800/40 p-6 rounded-2xl border border-white/5">
            <div className="p-5 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
              <div className="text-xs uppercase tracking-wider text-cyan-400 font-bold">
                Can Safely Donate Blood To:
              </div>
              <div className="text-xl font-bold text-white">
                {COMPATIBILITY_CHART[selectedGroup]?.givesTo}
              </div>
              <p className="text-xs text-slate-400">
                Individuals with this blood type are biologically compatible to transfuse their blood to these recipients.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/80 border border-rose-500/30 space-y-2">
              <div className="text-xs uppercase tracking-wider text-rose-400 font-bold">
                Can Safely Receive Blood From:
              </div>
              <div className="text-xl font-bold text-white">
                {COMPATIBILITY_CHART[selectedGroup]?.receivesFrom}
              </div>
              <p className="text-xs text-slate-400">
                Patients with {selectedGroup} can accept transfusions from donors carrying any of these blood profiles without immune rejection.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
