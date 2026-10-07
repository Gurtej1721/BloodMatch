import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  PlusCircle,
  Heart,
  Droplet,
  ShieldCheck,
  Clock,
  Sparkles,
  RefreshCw,
  ArrowUpDown,
} from 'lucide-react';

import HeroMesh from '../components/3d/HeroMesh';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import GlassCard from '../components/ui/GlassCard';
import EmergencyMatcherSection from '../components/features/EmergencyMatcherSection';
import BloodInventorySection from '../components/features/BloodInventorySection';
import RequestModal from '../components/modals/RequestModal';
import DonorModal from '../components/modals/DonorModal';
import ConnectModal from '../components/modals/ConnectModal';
import Toast from '../components/ui/Toast';

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CURRENT_YEAR = 2026;

const defaultDirectoryData = [
  {
    id: 'r1',
    type: 'Request',
    bloodGroup: 'O-',
    location: 'City Hospital, Ward A, ICU-04',
    time: '10 mins ago',
    status: 'Urgent',
    urgency: 'Critical',
    patientName: 'David Miller (ICU)',
    contact: '+1 (555) 901-2244',
    unitsNeeded: 3,
  },
  {
    id: 'd1',
    type: 'Donor',
    name: 'Dr. Sarah Jenkins',
    bloodGroup: 'O-',
    location: 'Metro Trauma Center, Downtown',
    time: 'Available now',
    status: 'Available',
    contact: '+1 (555) 234-8901',
    distanceKm: 2.1,
  },
  {
    id: 'r2',
    type: 'Request',
    bloodGroup: 'B+',
    location: 'Mercy Care Center, Emergency Dept',
    time: '1 hour ago',
    status: 'Urgent',
    urgency: 'Urgent',
    patientName: 'Sophia Zhang',
    contact: '+1 (555) 890-1122',
    unitsNeeded: 2,
  },
  {
    id: 'd2',
    type: 'Donor',
    name: 'Marcus Vance',
    bloodGroup: 'A+',
    location: 'Westside Community Clinic',
    time: 'Available now',
    status: 'Available',
    contact: '+1 (555) 872-3142',
    distanceKm: 4.8,
  },
  {
    id: 'd3',
    type: 'Donor',
    name: 'Elena Rostova',
    bloodGroup: 'AB-',
    location: 'Northside Blood Bank Hub',
    time: 'Available now',
    status: 'Available',
    contact: '+1 (555) 431-7721',
    distanceKm: 6.3,
  },
  {
    id: 'r3',
    type: 'Request',
    bloodGroup: 'A-',
    location: "Central Children's Hospital",
    time: '3 hours ago',
    status: 'In Progress',
    urgency: 'High',
    patientName: 'Carlos Mendez',
    contact: '+1 (555) 778-9900',
    unitsNeeded: 1,
  },
];

export default function Dashboard({ requestModalOpen, setRequestModalOpen, donorModalOpen, setDonorModalOpen }) {
  // Directory & Data States
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All'); // 'All' | 'Request' | 'Donor'
  const [sortBy, setSortBy] = useState('urgency'); // 'urgency' | 'distance' | 'all'

  // Live Stats State
  const [stats, setStats] = useState({
    activeDonors: 1253,
    successfulMatches: 8433,
    secondsToConnect: 38,
    criticalPending: 2,
    totalBloodUnitsInReserve: 122,
  });

  // Emergency Alerts
  const [alerts, setAlerts] = useState([]);

  // Connect Modal State
  const [connectItem, setConnectItem] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = ({ type = 'info', title, message }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Keep initial stats
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch {
      // fallback
    }
  }, []);

  const fetchDirectoryData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, donorRes] = await Promise.all([
        fetch('/api/requests'),
        fetch('/api/donors'),
      ]);

      let formattedRequests = [];
      let formattedDonors = [];

      if (reqRes.ok) {
        const reqData = await reqRes.json();
        formattedRequests = reqData.map((r) => ({
          ...r,
          type: 'Request',
          status: r.status || 'Urgent',
        }));
      }

      if (donorRes.ok) {
        const donorData = await donorRes.json();
        formattedDonors = donorData.map((d) => ({
          ...d,
          type: 'Donor',
          status: d.status || 'Available',
          time: d.lastDonated ? `Last donated: ${d.lastDonated}` : 'New volunteer',
          contact: d.phone,
        }));
      }

      const combined = [...formattedRequests, ...formattedDonors];
      setItems(combined.length > 0 ? combined : defaultDirectoryData);
    } catch {
      setItems(defaultDirectoryData);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Fetch
  useEffect(() => {
    fetchDirectoryData();
    fetchStats();
    fetchAlerts();
  }, [fetchDirectoryData, fetchStats, fetchAlerts]);

  const handleRequestCreated = (newReq) => {
    setItems((prev) => [
      {
        ...newReq,
        type: 'Request',
        status: newReq.status || 'Urgent',
      },
      ...prev,
    ]);
    fetchStats();
    fetchAlerts();
  };

  const handleDonorRegistered = (newDonor) => {
    setItems((prev) => [
      {
        ...newDonor,
        type: 'Donor',
        status: 'Available',
        time: 'Just registered',
        contact: newDonor.phone,
      },
      ...prev,
    ]);
    fetchStats();
  };

  const handleCardAction = (item) => {
    setConnectItem(item);
  };

  // Filter & Search Logic
  const filteredItems = items.filter((item) => {
    // Type Filter
    if (typeFilter !== 'All' && item.type !== typeFilter) return false;

    // Blood Group Filter
    if (selectedBloodGroup !== 'All' && item.bloodGroup !== selectedBloodGroup) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchLoc = item.location?.toLowerCase().includes(q);
      const matchBlood = item.bloodGroup?.toLowerCase().includes(q);
      const matchPatient = item.patientName?.toLowerCase().includes(q);
      const matchDonor = item.name?.toLowerCase().includes(q);
      if (!matchLoc && !matchBlood && !matchPatient && !matchDonor) return false;
    }

    return true;
  });

  // Sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'urgency') {
      const isAUrgent = a.status === 'Urgent' || a.urgency === 'Critical';
      const isBUrgent = b.status === 'Urgent' || b.urgency === 'Critical';
      if (isAUrgent && !isBUrgent) return -1;
      if (!isAUrgent && isBUrgent) return 1;
      return 0;
    }
    if (sortBy === 'distance') {
      const distA = a.distanceKm ? Number(a.distanceKm) : 99;
      const distB = b.distanceKm ? Number(b.distanceKm) : 99;
      return distA - distB;
    }
    return 0;
  });

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-16">
      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Emergency Active Broadcast Ticker (If any urgent requests) */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 backdrop-blur-xl flex items-center justify-between gap-4 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 shrink-0">
              Active Emergency Alert:
            </span>
            <p className="text-xs sm:text-sm text-slate-200 truncate">
              {alerts[0].title} — {alerts[0].message}
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedBloodGroup(alerts[0].bloodGroup || 'All');
              const el = document.getElementById('directory');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs font-bold text-rose-300 hover:text-white underline underline-offset-4 shrink-0 transition-colors"
          >
            Respond Now &rarr;
          </button>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between min-h-[70vh] gap-8">
        <div className="lg:w-1/2 z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Next-Gen Emergency Dispatch Platform</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight tracking-tight mb-5">
              Match.<br />
              Connect.<br />
              <span className="text-gradient">Save Lives.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-lg leading-relaxed">
              The real-time, dynamic emergency blood matching platform. Connecting volunteer donors and hospital emergency units with critical patients in seconds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <button
              onClick={() => setRequestModalOpen(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-3.5 rounded-full font-bold text-base transition-all shadow-[0_0_25px_rgba(244,63,94,0.4)] hover:shadow-[0_0_35px_rgba(244,63,94,0.6)] flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Request Blood Now</span>
            </button>

            <button
              onClick={() => setDonorModalOpen(true)}
              className="glass-panel hover:bg-white/10 text-white border-white/20 px-8 py-3.5 rounded-full font-bold text-base transition-all flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5 text-cyan-400" />
              <span>Become a Donor</span>
            </button>
          </motion.div>

          {/* Real-time badges */}
          <div className="flex items-center gap-6 pt-4 border-t border-white/10 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Medical HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>&lt; 45s Rapid Telemetry</span>
            </div>
          </div>
        </div>

        {/* 3D Interactive Canvas */}
        <div className="lg:w-1/2 w-full relative">
          <HeroMesh />
        </div>
      </section>

      {/* Dynamic Stats Ribbon */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 my-16 z-10 relative">
        <AnimatedCounter value={stats.activeDonors} label="Active Donors" />
        <AnimatedCounter value={stats.successfulMatches} label="Matches Saved" />
        <AnimatedCounter value={stats.secondsToConnect} label="Seconds to Connect" suffix="s" />
        <AnimatedCounter value={stats.totalBloodUnitsInReserve} label="Blood Units in Reserve" />
      </section>

      {/* Emergency Rapid Matcher Feature */}
      <EmergencyMatcherSection
        onNotify={addToast}
        onOpenRequestModal={() => setRequestModalOpen(true)}
      />

      {/* Live Directory & Filter Section */}
      <section id="directory" className="z-10 relative space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Emergency Directory</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Urgent Calls &amp; Available Donors</h2>
            <p className="text-slate-400 mt-1 text-sm">
              Real-time feed of urgent blood requests and verified volunteer donors currently on standby.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={fetchDirectoryData}
              className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition-all"
              title="Refresh Directory"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setRequestModalOpen(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Request</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Live Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by hospital, donor name, patient, or city..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Type Filter Buttons */}
            <div className="flex bg-slate-800/80 p-1 rounded-xl border border-white/5 w-full md:w-auto">
              <button
                onClick={() => setTypeFilter('All')}
                className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  typeFilter === 'All' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Feed ({items.length})
              </button>
              <button
                onClick={() => setTypeFilter('Request')}
                className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  typeFilter === 'Request' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Urgent Requests
              </button>
              <button
                onClick={() => setTypeFilter('Donor')}
                className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  typeFilter === 'Donor' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Available Donors
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-white/5 w-full md:w-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-slate-300 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="urgency" className="bg-slate-900 text-white">Sort: Urgency</option>
                <option value="distance" className="bg-slate-900 text-white">Sort: Proximity</option>
                <option value="all" className="bg-slate-900 text-white">Sort: Default</option>
              </select>
            </div>
          </div>

          {/* Blood Group Quick Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            <span className="text-xs font-semibold uppercase text-slate-400 shrink-0 mr-1">Blood Type:</span>
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedBloodGroup(bg)}
                className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all ${
                  selectedBloodGroup === bg
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Cards Grid */}
        {sortedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sortedItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.4) }}
              >
                <GlassCard {...item} onAction={handleCardAction} />
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="text-center py-16 rounded-3xl bg-slate-900/40 border border-white/5 space-y-4">
            <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">No active matches found</h4>
              <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
                No entries match &quot;{searchQuery || selectedBloodGroup}&quot;. Post a new emergency blood request to alert volunteer donors immediately.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBloodGroup('All');
                  setTypeFilter('All');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setRequestModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Post Emergency Alert
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Blood Bank Reserves & Compatibility Matrix */}
      <BloodInventorySection onNotify={addToast} />

      {/* Mission / How It Works Section */}
      <section id="about" className="rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-8 sm:p-12 space-y-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>How Emergency Blood Match Works</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Minutes Matter in Critical Trauma</h2>
          <p className="text-slate-400 mt-2 text-sm sm:text-base leading-relaxed">
            Our platform cuts response times from hours to seconds by pairing automated biological compatibility mapping with localized volunteer donor mobilization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center font-bold text-rose-400 text-lg">
              1
            </div>
            <h4 className="text-base font-bold text-white">Instant Hospital Broadcast</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Medical staff or relatives publish an emergency request specifying patient blood group, required units, and clinic location.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/40 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 text-lg">
            2
          </div>
          <h4 className="text-base font-bold text-white">Algorithmic Compatibility</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            The matching algorithm verifies exact matches and universal donor eligibility (O-), ranking available donors by travel ETA.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/40 border border-white/5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-400 text-lg">
            3
          </div>
          <h4 className="text-base font-bold text-white">Direct Rapid Dispatch</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Donors receive immediate telemetry alerts with hospital routing, cutting coordination time down to under 45 seconds.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Droplet className="w-4 h-4 text-rose-500" />
          <span className="font-semibold text-slate-400">BloodMatch Dynamic Lifeline Platform</span>
          <span>&copy; {CURRENT_YEAR}</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => setRequestModalOpen(true)} className="hover:text-slate-300 transition-colors">
            Post Request
          </button>
          <button onClick={() => setDonorModalOpen(true)} className="hover:text-slate-300 transition-colors">
            Register Donor
          </button>
          <a href="#matcher" className="hover:text-slate-300 transition-colors">
            Matcher
          </a>
          <a href="#inventory" className="hover:text-slate-300 transition-colors">
            Blood Bank
          </a>
        </div>
      </footer>

      {/* Modals */}
      <RequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        onRequestCreated={handleRequestCreated}
        onNotify={addToast}
      />

      <DonorModal
        isOpen={donorModalOpen}
        onClose={() => setDonorModalOpen(false)}
        onDonorRegistered={handleDonorRegistered}
        onNotify={addToast}
      />

      <ConnectModal
        item={connectItem}
        isOpen={!!connectItem}
        onClose={() => setConnectItem(null)}
        onNotify={addToast}
      />
    </main>
  );
}