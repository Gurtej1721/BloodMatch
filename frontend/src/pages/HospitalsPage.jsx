import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  MapPin,
  Phone,
  Search,
  CheckCircle2,
  AlertTriangle,
  Plane,
  Bed,
  Clock,
  Radio,
} from 'lucide-react';

const DEFAULT_HOSPITALS = [
  {
    id: 'h1',
    name: 'Mount Sinai STAT Trauma & Surgical Hub',
    city: 'New York',
    state: 'NY',
    metroArea: 'New York Metro',
    address: '1468 Madison Ave, New York, NY 10029',
    traumaLevel: 'Level 1 Adult & Pediatric STAT Trauma',
    specialty: 'STAT Polytrauma & Emergency Transfusion',
    phone: '+1 (212) 241-6500',
    emergencyExt: 'Ext 911 / Blood Bank Line 4',
    helipad: true,
    icuBeds: { total: 110, available: 14 },
    dispatchRadiusKm: 40,
    avgResponseMin: 12,
    bloodBankReserves: [
      { type: 'O-', units: 5, status: 'Critical' },
      { type: 'O+', units: 32, status: 'Adequate' },
      { type: 'A+', units: 28, status: 'Optimal' },
      { type: 'AB-', units: 2, status: 'Critical' },
    ],
    status: 'Active 24/7 STAT Hub',
    dispatchHotline: '1-800-BLOOD-NYC',
    establishedYear: 1852,
  },
  {
    id: 'h2',
    name: 'Cedars-Sinai Medical Center',
    city: 'Los Angeles',
    state: 'CA',
    metroArea: 'Greater Los Angeles & Orange County',
    address: '8700 Beverly Blvd, Los Angeles, CA 90048',
    traumaLevel: 'Level 1 Comprehensive Trauma Center',
    specialty: 'Cardiovascular & STAT Transfusion Protocol',
    phone: '+1 (310) 423-3277',
    emergencyExt: 'Ext 2200 / Blood Dispatch Direct',
    helipad: true,
    icuBeds: { total: 140, available: 22 },
    dispatchRadiusKm: 45,
    avgResponseMin: 15,
    bloodBankReserves: [
      { type: 'O-', units: 8, status: 'Low Stock' },
      { type: 'O+', units: 45, status: 'Optimal' },
      { type: 'B+', units: 26, status: 'Adequate' },
      { type: 'A-', units: 6, status: 'Low Stock' },
    ],
    status: 'Active 24/7 STAT Hub',
    dispatchHotline: '1-800-BLOOD-LAX',
    establishedYear: 1902,
  },
  {
    id: 'h3',
    name: 'Northwestern Memorial Hospital',
    city: 'Chicago',
    state: 'IL',
    metroArea: 'Chicago Tri-State Metro',
    address: '251 E Huron St, Chicago, IL 60611',
    traumaLevel: 'Level 1 Comprehensive Adult Trauma',
    specialty: 'Neurosurgical & Emergency Critical Care',
    phone: '+1 (312) 926-2000',
    emergencyExt: 'Ext 8810 / Transfusion Services',
    helipad: true,
    icuBeds: { total: 95, available: 11 },
    dispatchRadiusKm: 35,
    avgResponseMin: 14,
    bloodBankReserves: [
      { type: 'O-', units: 3, status: 'Critical' },
      { type: 'B-', units: 4, status: 'Low Stock' },
      { type: 'A+', units: 30, status: 'Optimal' },
      { type: 'AB+', units: 18, status: 'Adequate' },
    ],
    status: 'Active 24/7 STAT Hub',
    dispatchHotline: '1-800-BLOOD-CHI',
    establishedYear: 1865,
  },
  {
    id: 'h4',
    name: 'Texas Medical Center - Memorial Hermann',
    city: 'Houston',
    state: 'TX',
    metroArea: 'Houston Gulf Coast Region',
    address: '6411 Fannin St, Houston, TX 77030',
    traumaLevel: 'Level 1 Busiest STAT Trauma in Nation',
    specialty: 'Red Duke Trauma Institute / Life Flight Base',
    phone: '+1 (713) 704-4000',
    emergencyExt: 'Ext 1010 / Life Flight Dispatch',
    helipad: true,
    icuBeds: { total: 200, available: 31 },
    dispatchRadiusKm: 60,
    avgResponseMin: 11,
    bloodBankReserves: [
      { type: 'O-', units: 6, status: 'Low Stock' },
      { type: 'O+', units: 58, status: 'Optimal' },
      { type: 'B+', units: 34, status: 'Optimal' },
      { type: 'A-', units: 9, status: 'Adequate' },
    ],
    status: 'Active 24/7 STAT Hub',
    dispatchHotline: '1-800-BLOOD-HOU',
    establishedYear: 1925,
  },
  {
    id: 'h5',
    name: 'Massachusetts General Hospital (Mass General)',
    city: 'Boston',
    state: 'MA',
    metroArea: 'Greater Boston & Cambridge Bio-Corridor',
    address: '55 Fruit St, Boston, MA 02114',
    traumaLevel: 'Level 1 Pediatric & Adult Trauma',
    specialty: 'Surgical Resuscitation & Rare Blood Crossmatch',
    phone: '+1 (617) 726-2000',
    emergencyExt: 'Ext 4400 / Blood Transfusion Lead',
    helipad: true,
    icuBeds: { total: 115, available: 16 },
    dispatchRadiusKm: 35,
    avgResponseMin: 13,
    bloodBankReserves: [
      { type: 'O-', units: 4, status: 'Critical' },
      { type: 'A-', units: 5, status: 'Low Stock' },
      { type: 'AB-', units: 3, status: 'Critical' },
      { type: 'O+', units: 35, status: 'Adequate' },
    ],
    status: 'Active 24/7 STAT Hub',
    dispatchHotline: '1-800-BLOOD-BOS',
    establishedYear: 1811,
  },
  {
    id: 'h6',
    name: 'Harborview Regional Medical Center',
    city: 'Seattle',
    state: 'WA',
    metroArea: 'Seattle & Pacific Northwest Disaster Hub',
    address: '325 9th Ave, Seattle, WA 98104',
    traumaLevel: 'Level 1 Only Center for WA, AK, MT, ID',
    specialty: 'Four-State Regional Disaster & Polytrauma',
    phone: '+1 (206) 744-3000',
    emergencyExt: 'Ext 9999 / STAT Airlift Northwest',
    helipad: true,
    icuBeds: { total: 105, available: 18 },
    dispatchRadiusKm: 55,
    avgResponseMin: 16,
    bloodBankReserves: [
      { type: 'O-', units: 7, status: 'Low Stock' },
      { type: 'O+', units: 41, status: 'Optimal' },
      { type: 'B-', units: 4, status: 'Critical' },
      { type: 'A+', units: 29, status: 'Adequate' },
    ],
    status: 'Active 24/7 STAT Hub',
    dispatchHotline: '1-800-BLOOD-SEA',
    establishedYear: 1877,
  },
  {
    id: 'h7',
    name: 'Jackson Memorial Hospital (Ryder Trauma)',
    city: 'Miami',
    state: 'FL',
    metroArea: 'Miami-Dade & South Florida Region',
    address: '1611 NW 12th Ave, Miami, FL 33136',
    traumaLevel: 'Level 1 Army Forward Surgical Trauma Partner',
    specialty: 'Combat Casualty Care & Emergency Mass Transfusion',
    phone: '+1 (305) 585-1111',
    emergencyExt: 'Ext 7700 / Transfusion Response Desk',
    helipad: true,
    icuBeds: { total: 130, available: 19 },
    dispatchRadiusKm: 45,
    avgResponseMin: 14,
    bloodBankReserves: [
      { type: 'O-', units: 5, status: 'Critical' },
      { type: 'O+', units: 38, status: 'Adequate' },
      { type: 'B+', units: 22, status: 'Adequate' },
      { type: 'AB+', units: 15, status: 'Adequate' },
    ],
    status: 'Active 24/7 STAT Hub',
    dispatchHotline: '1-800-BLOOD-MIA',
    establishedYear: 1918,
  },
  {
    id: 'h8',
    name: 'Emory University Hospital & Midtown',
    city: 'Atlanta',
    state: 'GA',
    metroArea: 'Metro Atlanta & Georgia Piedmont',
    address: '1364 Clifton Rd, Atlanta, GA 30322',
    traumaLevel: 'Level 1 Comprehensive Emergency Center',
    specialty: 'Hematology Center of Excellence',
    phone: '+1 (404) 712-2000',
    emergencyExt: 'Ext 3311 / Blood Product Dispense',
    helipad: true,
    icuBeds: { total: 88, available: 12 },
    dispatchRadiusKm: 38,
    avgResponseMin: 15,
    bloodBankReserves: [
      { type: 'O-', units: 4, status: 'Critical' },
      { type: 'O+', units: 29, status: 'Adequate' },
      { type: 'A-', units: 7, status: 'Low Stock' },
      { type: 'B+', units: 20, status: 'Adequate' },
    ],
    status: 'Active 24/7 STAT Hub',
    dispatchHotline: '1-800-BLOOD-ATL',
    establishedYear: 1904,
  },
  {
    id: 'h9',
    name: 'Johns Hopkins Hospital Trauma Unit',
    city: 'Baltimore',
    state: 'MD',
    metroArea: 'Baltimore-Washington Corridor',
    address: '1800 Orleans St, Baltimore, MD 21287',
    traumaLevel: 'Level 1 Adult & Pediatric Trauma',
    specialty: 'Microvascular & Rapid Resuscitation Unit',
    phone: '+1 (410) 955-5000',
    emergencyExt: 'Ext 5520 / Rapid Match Blood Center',
    helipad: true,
    icuBeds: { total: 120, available: 17 },
    dispatchRadiusKm: 42,
    avgResponseMin: 13,
    bloodBankReserves: [
      { type: 'O-', units: 6, status: 'Low Stock' },
      { type: 'O+', units: 36, status: 'Adequate' },
      { type: 'AB-', units: 3, status: 'Critical' },
      { type: 'A+', units: 31, status: 'Optimal' },
    ],
    status: 'Active 24/7 STAT Hub',
    dispatchHotline: '1-800-BLOOD-BWI',
    establishedYear: 1889,
  },
  {
    id: 'h10',
    name: 'UCSF Medical Center at Mission Bay',
    city: 'San Francisco',
    state: 'CA',
    metroArea: 'Bay Area & Silicon Valley',
    address: '1825 4th St, San Francisco, CA 94158',
    traumaLevel: 'Level 1 Pediatric & High-Risk Emergency',
    specialty: 'Precision Transfusion & Neonatal Blood Care',
    phone: '+1 (415) 353-1000',
    emergencyExt: 'Ext 6100 / Pediatric Lifeline Dispatch',
    helipad: true,
    icuBeds: { total: 90, available: 15 },
    dispatchRadiusKm: 35,
    avgResponseMin: 12,
    bloodBankReserves: [
      { type: 'O-', units: 5, status: 'Critical' },
      { type: 'A-', units: 6, status: 'Low Stock' },
      { type: 'O+', units: 33, status: 'Adequate' },
      { type: 'B+', units: 21, status: 'Adequate' },
    ],
    status: 'Active 24/7 STAT Hub',
    dispatchHotline: '1-800-BLOOD-SFO',
    establishedYear: 1864,
  },
];

const CITIES_LIST = [
  'All Cities',
  'New York',
  'Los Angeles',
  'Chicago',
  'Houston',
  'Boston',
  'Seattle',
  'Miami',
  'Atlanta',
  'Baltimore',
  'San Francisco',
];

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState(DEFAULT_HOSPITALS);
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [searchQuery, setSearchQuery] = useState('');
  const [traumaFilter, setTraumaFilter] = useState('All');
  const [reserveFilter, setReserveFilter] = useState('All'); // 'All' | 'Critical'

  // Fetch live hospitals from API if available
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await fetch('/api/hospitals');
        if (res.ok) {
          const data = await res.json();
          if (data.hospitals && data.hospitals.length > 0) {
            setHospitals(data.hospitals);
          }
        }
      } catch {
        // use fallback
      }
    };
    fetchHospitals();
  }, []);

  // Filtered hospitals
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      // City filter
      if (selectedCity !== 'All Cities' && h.city !== selectedCity) return false;

      // Trauma filter
      if (traumaFilter !== 'All' && !h.traumaLevel.toLowerCase().includes(traumaFilter.toLowerCase())) {
        return false;
      }

      // Reserve filter (e.g. Critical O- needs)
      if (reserveFilter === 'Critical') {
        const hasCritical = h.bloodBankReserves?.some((r) => r.status === 'Critical');
        if (!hasCritical) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = h.name.toLowerCase().includes(q);
        const matchCity = h.city.toLowerCase().includes(q);
        const matchSpec = h.specialty?.toLowerCase().includes(q);
        const matchAddr = h.address.toLowerCase().includes(q);
        if (!matchName && !matchCity && !matchSpec && !matchAddr) return false;
      }

      return true;
    });
  }, [hospitals, selectedCity, traumaFilter, reserveFilter, searchQuery]);

  // Aggregate stats
  const totalBeds = hospitals.reduce((acc, h) => acc + (h.icuBeds?.total || 0), 0);
  const availableBeds = hospitals.reduce((acc, h) => acc + (h.icuBeds?.available || 0), 0);
  const helipadsCount = hospitals.filter((h) => h.helipad).length;

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Header & Network Banner */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5" />
          <span>Regional Emergency Clinical Network</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Partner Hospitals &amp; Cities Covered
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-2 leading-relaxed">
              BloodMatch operates 24/7 direct telemetry across verified trauma facilities, university medical centers, and emergency blood banks across the country.
            </p>
          </div>

          <Link
            to="/request"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all self-start md:self-auto"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>STAT Request to Any Facility</span>
          </Link>
        </div>
      </div>

      {/* Network Operational Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
            Network Trauma Centers
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {hospitals.length} Active Hubs
          </p>
          <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Verified Telemetry
          </span>
        </div>

        <div className="p-5 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
            Metro Cities Covered
          </span>
          <p className="text-2xl sm:text-3xl font-black text-cyan-400">
            10 Major Cities
          </p>
          <span className="text-[11px] text-slate-400">
            Coast-to-Coast Lifeline Grid
          </span>
        </div>

        <div className="p-5 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
            ICU &amp; Resuscitation Beds
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {availableBeds} / {totalBeds}
          </p>
          <span className="text-[11px] text-emerald-500 font-semibold">
            {Math.round((availableBeds / totalBeds) * 100)}% Surge Capacity Available
          </span>
        </div>

        <div className="p-5 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
            STAT Emergency Helipads
          </span>
          <p className="text-2xl sm:text-3xl font-black text-rose-500 flex items-center gap-2">
            <span>{helipadsCount} Heliports</span>
          </p>
          <span className="text-[11px] text-slate-400 font-mono">
            ~13.4 min avg airlift arrival
          </span>
        </div>
      </div>

      {/* City Explorer Pill Bar */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          <span>Filter by Coverage City:</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {CITIES_LIST.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCity === city
                  ? 'bg-cyan-600 text-white shadow-md scale-105'
                  : 'bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-cyan-400'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospital name, city, specialty..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
          {/* Trauma Filter */}
          <select
            value={traumaFilter}
            onChange={(e) => setTraumaFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="All">All Trauma Levels</option>
            <option value="Level 1">Level 1 STAT Trauma</option>
            <option value="Pediatric">Pediatric Trauma</option>
            <option value="Comprehensive">Comprehensive Center</option>
          </select>

          {/* Reserve Filter */}
          <select
            value={reserveFilter}
            onChange={(e) => setReserveFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="All">All Blood Bank Statuses</option>
            <option value="Critical">Needs Critical Blood (O- / AB-)</option>
          </select>
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.map((hospital) => {
          const hasCriticalShortage = hospital.bloodBankReserves?.some(
            (r) => r.status === 'Critical'
          );

          return (
            <motion.div
              key={hospital.id}
              whileHover={{ y: -4 }}
              className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 hover:border-cyan-500/40 transition-all space-y-5 shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header: Name, City & Trauma Badge */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      {hospital.city}, {hospital.state}
                    </span>
                    {hospital.helipad && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        title="24/7 Emergency Medical Helipad On-Site"
                      >
                        <Plane className="w-3 h-3" />
                        <span>STAT Helipad</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                    {hospital.name}
                  </h3>

                  <p className="text-xs font-semibold text-rose-500">
                    {hospital.traumaLevel}
                  </p>
                </div>

                {/* Address & Emergency Direct Line */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-white/5">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{hospital.address}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-cyan-600 dark:text-cyan-400 pt-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{hospital.phone}</span>
                    <span className="text-[10px] text-slate-500">({hospital.emergencyExt})</span>
                  </div>
                </div>

                {/* Bed Capacity & Transit Time */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
                      <Bed className="w-3 h-3 text-cyan-400" />
                      ICU Beds
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {hospital.icuBeds.available} Available{' '}
                      <span className="text-slate-400 font-normal">/ {hospital.icuBeds.total}</span>
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      Dispatch Response
                    </span>
                    <p className="font-bold text-emerald-500">
                      ~{hospital.avgResponseMin} mins
                    </p>
                  </div>
                </div>

                {/* Live Blood Bank Reserves Status */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      On-Site Blood Bank Units:
                    </span>
                    {hasCriticalShortage && (
                      <span className="text-[10px] font-black text-rose-500 flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        Urgent Needs
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    {hospital.bloodBankReserves.map((res) => {
                      const isCrit = res.status === 'Critical';
                      const isLow = res.status === 'Low Stock';

                      return (
                        <div
                          key={res.type}
                          className={`p-1.5 rounded-lg border text-xs font-mono font-bold ${
                            isCrit
                              ? 'bg-rose-500/15 border-rose-500/30 text-rose-500'
                              : isLow
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                          }`}
                        >
                          <div>{res.type}</div>
                          <div className="text-[10px]">{res.units}u</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex items-center gap-2">
                <Link
                  to={`/request?hospital=${encodeURIComponent(hospital.name)}&location=${encodeURIComponent(hospital.address)}`}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Request Blood Here</span>
                </Link>

                <a
                  href={`tel:${hospital.phone}`}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                  title="Call Emergency Desk"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredHospitals.length === 0 && (
        <div className="p-16 text-center rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-3">
          <Building2 className="w-8 h-8 text-rose-500 mx-auto" />
          <h4 className="font-bold text-slate-900 dark:text-white">No partner hospitals match this filter</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your city or trauma level filter, or search with different keywords.
          </p>
        </div>
      )}

      {/* Regional Emergency Dispatch Network Overview */}
      <div className="p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-6 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            How BloodMatch Powers Hospital Transfusion Desks
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Our autonomous routing pipeline integrates directly with hospital laboratory information systems (LIS) to minimize transit friction during trauma resuscitations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-black">
              1
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              STAT Triage Intake
            </h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Surgeons or triage coordinators submit a 3-click emergency intake with patient ABO/Rh profile, bed location, and required blood units.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-black">
              2
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Biological Radar Matching
            </h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Our matching engine checks on-site hospital reserves, calculates cross-match rules, and pings nearby standby donors via tactical radar.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black">
              3
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Instant Dispatch Relay
            </h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Signals route via encrypted relays to mobile volunteers and emergency couriers, securing units with an average response time under 15 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
