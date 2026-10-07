import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Compass,
  AlertTriangle,
  Heart,
  Phone,
  MapPin,
  ShieldCheck,
  Send,
  RefreshCw,
  EyeOff,
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import ConnectModal from '../components/modals/ConnectModal';
import { CardSkeleton } from '../components/ui/SkeletonLoader';
import { useAppToast } from '../components/layout/Layout';

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DirectoryPage() {
  const { addToast } = useAppToast();
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'donors'
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlood, setSelectedBlood] = useState('All');
  const [selectedUrgency, setSelectedUrgency] = useState('All');
  const [connectItem, setConnectItem] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, donorRes] = await Promise.all([
        fetch('/api/requests'),
        fetch('/api/donors'),
      ]);

      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(
          reqData.map((r) => ({ ...r, type: 'Request', status: r.status || 'Urgent' }))
        );
      }
      if (donorRes.ok) {
        const donorData = await donorRes.json();
        setDonors(
          donorData.map((d) => ({
            ...d,
            type: 'Donor',
            status: d.status || 'Available',
            time: d.lastDonated ? `Last donated: ${d.lastDonated}` : 'Standby volunteer',
            contact: d.phone,
          }))
        );
      }
    } catch {
      // Fallback
    } finally {
      setTimeout(() => setLoading(false), 200);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const handleToggleDonorStatus = async (donorId) => {
    try {
      const res = await fetch(`/api/donors/${donorId}/status`, { method: 'PATCH' });
      if (res.ok) {
        const data = await res.json();
        setDonors((prev) =>
          prev.map((d) => (d.id === donorId ? { ...d, status: data.donor.status } : d))
        );
        addToast({
          type: 'info',
          title: 'Donor Availability Updated',
          message: `${data.donor.name} is now marked as ${data.donor.status}.`,
        });
      }
    } catch {
      // Local toggle
      setDonors((prev) =>
        prev.map((d) =>
          d.id === donorId
            ? { ...d, status: d.status === 'Available' ? 'Busy' : 'Available' }
            : d
        )
      );
    }
  };

  // Filtered lists
  const filteredRequests = requests.filter((r) => {
    if (selectedBlood !== 'All' && r.bloodGroup !== selectedBlood) return false;
    if (selectedUrgency !== 'All' && r.urgency !== selectedUrgency) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchP = r.patientName?.toLowerCase().includes(q);
      const matchL = r.location?.toLowerCase().includes(q);
      const matchB = r.bloodGroup?.toLowerCase().includes(q);
      if (!matchP && !matchL && !matchB) return false;
    }
    return true;
  });

  const filteredDonors = donors.filter((d) => {
    if (selectedBlood !== 'All' && d.bloodGroup !== selectedBlood) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchN = d.name?.toLowerCase().includes(q);
      const matchL = d.location?.toLowerCase().includes(q);
      const matchB = d.bloodGroup?.toLowerCase().includes(q);
      if (!matchN && !matchL && !matchB) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Directory Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Real-Time Clinical Telemetry Feed</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Emergency Distress Calls &amp; Standby Donors
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Monitor incoming hospital crisis broadcasts and contact nearby standby volunteers with verified profiles.
          </p>
        </div>

        {/* Tab Segment Controls */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Active Distress Calls ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('donors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'donors'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Standby Verified Donors ({donors.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hospital, donor name, patient, or city..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Urgency Filter (Only for Requests) */}
          {activeTab === 'requests' && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Urgency:</span>
              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="All">All Urgencies</option>
                <option value="Critical">Critical / STAT</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Routine">Routine</option>
              </select>
            </div>
          )}

          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Blood Group Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold uppercase text-slate-400 shrink-0 mr-1">Type:</span>
          {BLOOD_GROUPS.map((bg) => (
            <button
              key={bg}
              onClick={() => setSelectedBlood(bg)}
              className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all ${
                selectedBlood === bg
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:border-slate-400'
              }`}
            >
              {bg}
            </button>
          ))}
        </div>
      </div>

      {/* Content Feed */}
      {loading ? (
        /* Skeleton Loading State */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <CardSkeleton key={n} />
          ))}
        </div>
      ) : activeTab === 'requests' ? (
        /* TAB A: Active Emergency Distress Calls */
        filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredRequests.map((req) => (
              <GlassCard
                key={req.id}
                {...req}
                onAction={(item) => setConnectItem(item)}
              />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center rounded-3xl glass-panel border border-slate-200 dark:border-white/5 space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
            <h4 className="font-bold text-slate-900 dark:text-white">No active distress calls found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No matching distress calls found for the selected blood group and search filters.
            </p>
          </div>
        )
      ) : (
        /* TAB B: Standby Verified Donors */
        filteredDonors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDonors.map((donor) => {
              const isAvailable = donor.status === 'Available';

              return (
                <motion.div
                  key={donor.id}
                  whileHover={{ y: -4 }}
                  className="p-5 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 hover:border-cyan-500/40 transition-all space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center font-black text-cyan-500 text-lg">
                        {donor.bloodGroup}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{donor.name}</h4>
                          {donor.verified && <ShieldCheck className="w-4 h-4 text-cyan-400" title="Verified Standby Donor" />}
                          {donor.isPrivate && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-400 border border-violet-500/30">
                              <EyeOff className="w-3 h-3" />
                              <span>Private</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{donor.time}</span>
                      </div>
                    </div>

                    {/* Standby Availability Toggle */}
                    <button
                      onClick={() => handleToggleDonorStatus(donor.id)}
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full border transition-all ${
                        isAvailable
                          ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                      }`}
                      title="Click to toggle availability"
                    >
                      {donor.status}
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{donor.location}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-cyan-600 dark:text-cyan-400">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{donor.isPrivate ? `${donor.phone} (Protected Relay)` : donor.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setConnectItem(donor)}
                      className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{donor.isPrivate ? 'Alert via Secure Relay' : 'Alert Standby Donor'}</span>
                    </button>
                    <a
                      href={donor.isPrivate ? '#' : `tel:${donor.phone}`}
                      onClick={donor.isPrivate ? (e) => {
                        e.preventDefault();
                        addToast({
                          type: 'info',
                          title: 'Private Volunteer Relay',
                          message: 'Phone calls are routed through the automated dispatch coordinator to protect donor anonymity.',
                        });
                      } : undefined}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                      title={donor.isPrivate ? "Call Routed via Relay" : "Call Phone Directly"}
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center rounded-3xl glass-panel border border-slate-200 dark:border-white/5 space-y-3">
            <Heart className="w-8 h-8 text-cyan-400 mx-auto" />
            <h4 className="font-bold text-slate-900 dark:text-white">No standby donors match this query</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your blood type filter or register as a new verified volunteer donor.
            </p>
          </div>
        )
      )}

      {/* Connect & Offer Help Modal */}
      <ConnectModal
        item={connectItem}
        isOpen={!!connectItem}
        onClose={() => setConnectItem(null)}
        onNotify={addToast}
      />
    </div>
  );
}
