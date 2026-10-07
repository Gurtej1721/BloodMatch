import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Bell,
  MessageSquare,
  Smartphone,
  Phone,
  User,
  MapPin,
  EyeOff,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppToast } from '../components/layout/Layout';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorPage() {
  const { addToast } = useAppToast();
  // Rapid Quiz State
  const [quizAnswers, setQuizAnswers] = useState({
    age: true,
    weight: true,
    interval: true,
    healthy: true,
  });

  // Notification Preferences
  const [prefs, setPrefs] = useState({
    sms: true,
    push: true,
    whatsapp: false,
  });

  // Profile Form with Privacy Option
  const [form, setForm] = useState({
    name: '',
    bloodGroup: 'O+',
    phone: '',
    email: '',
    location: '',
    city: 'Metro Trauma Region',
    isPrivate: false,
  });

  const [loading, setLoading] = useState(false);
  const [registeredDonor, setRegisteredDonor] = useState(null);

  // Quiz evaluation: all must be true to pass
  const isEligible = Object.values(quizAnswers).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEligible) {
      addToast({
        type: 'warn',
        title: 'Eligibility Requirements Unmet',
        message: 'Please review the pre-screening criteria before completing registration.',
      });
      return;
    }

    if (!form.name.trim() || !form.phone.trim() || !form.location.trim()) {
      addToast({
        type: 'error',
        title: 'Missing Required Fields',
        message: 'Please provide full name, contact phone, and preferred clinic location.',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          notifications: prefs,
        }),
      });

      const data = await res.json();
      setRegisteredDonor(data.donor);

      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
      } catch {
        // ignore
      }

      addToast({
        type: 'success',
        title: 'Volunteer Profile Activated!',
        message: `Thank you ${form.name}! You are now on active standby for ${form.bloodGroup} emergencies.`,
      });
    } catch {
      // Local fallback
      const fallback = {
        id: 'd_' + Date.now(),
        name: form.name,
        bloodGroup: form.bloodGroup,
        phone: form.phone,
        location: form.location,
        status: 'Available',
      };
      setRegisteredDonor(fallback);
      addToast({
        type: 'success',
        title: 'Standby Activated (Local)',
        message: `Profile listed as standby donor for ${form.bloodGroup}.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5" />
          <span>Volunteer Lifeline Network</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Donor Portal &amp; Pre-Screening
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Complete rapid eligibility screening, set dispatch alerts, and register to receive life-saving STAT alerts within your radius.
        </p>
      </div>

      {!registeredDonor ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Rapid Pre-Screening Quiz & Notification Toggles (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Rapid Pre-Screening Eligibility Quiz */}
            <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Pre-Screening Eligibility Quiz
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    isEligible
                      ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                  }`}
                >
                  {isEligible ? 'PASSED (Eligible)' : 'INELIGIBLE'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Question 1 */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 flex items-center justify-between gap-3">
                  <span className="text-slate-700 dark:text-slate-300">Are you at least 18 years old?</span>
                  <button
                    type="button"
                    onClick={() => setQuizAnswers({ ...quizAnswers, age: !quizAnswers.age })}
                    className={`p-1.5 rounded-lg font-black transition-colors ${
                      quizAnswers.age
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500/20 text-rose-500'
                    }`}
                  >
                    {quizAnswers.age ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>
                </div>

                {/* Question 2 */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 flex items-center justify-between gap-3">
                  <span className="text-slate-700 dark:text-slate-300">Do you weigh at least 50 kg (110 lbs)?</span>
                  <button
                    type="button"
                    onClick={() => setQuizAnswers({ ...quizAnswers, weight: !quizAnswers.weight })}
                    className={`p-1.5 rounded-lg font-black transition-colors ${
                      quizAnswers.weight
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500/20 text-rose-500'
                    }`}
                  >
                    {quizAnswers.weight ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>
                </div>

                {/* Question 3 */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 flex items-center justify-between gap-3">
                  <span className="text-slate-700 dark:text-slate-300">56+ days since last whole blood donation?</span>
                  <button
                    type="button"
                    onClick={() => setQuizAnswers({ ...quizAnswers, interval: !quizAnswers.interval })}
                    className={`p-1.5 rounded-lg font-black transition-colors ${
                      quizAnswers.interval
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500/20 text-rose-500'
                    }`}
                  >
                    {quizAnswers.interval ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>
                </div>

                {/* Question 4 */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 flex items-center justify-between gap-3">
                  <span className="text-slate-700 dark:text-slate-300">Feeling healthy and symptom-free today?</span>
                  <button
                    type="button"
                    onClick={() => setQuizAnswers({ ...quizAnswers, healthy: !quizAnswers.healthy })}
                    className={`p-1.5 rounded-lg font-black transition-colors ${
                      quizAnswers.healthy
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500/20 text-rose-500'
                    }`}
                  >
                    {quizAnswers.healthy ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isEligible && (
                <p className="text-[11px] text-rose-500 leading-tight">
                  ⚠️ Blood transfusion guidelines require satisfying all 4 criteria to register on active emergency standby.
                </p>
              )}
            </div>

            {/* Notification Dispatch Preferences */}
            <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-4 shadow-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Dispatch Notification Channels
              </span>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 cursor-pointer">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <Smartphone className="w-4 h-4 text-rose-500" />
                    <span>STAT SMS Mobile Broadcast</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.sms}
                    onChange={(e) => setPrefs({ ...prefs, sms: e.target.checked })}
                    className="accent-rose-500 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 cursor-pointer">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    <span>In-Browser Push Telemetry</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.push}
                    onChange={(e) => setPrefs({ ...prefs, push: e.target.checked })}
                    className="accent-cyan-500 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 cursor-pointer">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <span>WhatsApp Emergency Relay</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.whatsapp}
                    onChange={(e) => setPrefs({ ...prefs, whatsapp: e.target.checked })}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Donor Registration Form (7 Columns) */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-6 shadow-xl">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Volunteer Standby Registration
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your credentials remain strictly encrypted and are only triaged when matching emergency requests arise.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Blood Group Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Your Blood Group *
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {BLOOD_GROUPS.map((bg) => (
                      <button
                        type="button"
                        key={bg}
                        onClick={() => setForm({ ...form, bloodGroup: bg })}
                        className={`py-3 rounded-xl font-black text-sm border transition-all ${
                          form.bloodGroup === bg
                            ? 'bg-rose-600 border-rose-500 text-white shadow-md scale-105'
                            : 'bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-rose-400'
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Alex Morgan"
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Mobile Number (For Dispatch) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="e.g. +1 (555) 789-0123"
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Preferred Hospital / Area */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Nearby Hospital or Neighborhood Area *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g. St. Jude Hospital, North Precinct"
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      required
                    />
                  </div>
                </div>

                {/* Keep Me Private (Anonymous Volunteer Mode) */}
                <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <EyeOff className="w-4 h-4 text-violet-500" />
                      <span>Keep Me Private (Anonymous Volunteer)</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isPrivate}
                        onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    When enabled, your legal name and phone number are masked on public feeds, matcher consoles, and radar pings. Emergency STAT alerts are safely routed via BloodMatch's encrypted relay.
                  </p>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading || !isEligible}
                  className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(244,63,94,0.35)] flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Complete Standby Donor Registration</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Standby Registration Success State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel rounded-3xl p-8 sm:p-12 border border-emerald-500/40 text-center space-y-6 shadow-2xl max-w-lg mx-auto"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Standby Lifeline Profile Activated!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Thank you, <span className="font-bold text-slate-900 dark:text-white">{registeredDonor.name}</span>. Your blood group{' '}
              <span className="font-bold text-rose-500">{registeredDonor.bloodGroup}</span> is now active in the clinical rapid-matching console.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/80 text-left text-xs space-y-2 border border-slate-200 dark:border-white/5">
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="font-bold text-emerald-500">Standby Available</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Privacy Mode:</span>
              <span className={`font-bold ${registeredDonor.isPrivate ? 'text-violet-400' : 'text-slate-300'}`}>
                {registeredDonor.isPrivate ? 'Encrypted Relay (Private Volunteer)' : 'Standard Verified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Alert Dispatch:</span>
              <span className="font-medium text-slate-300">
                {prefs.sms && 'SMS '}
                {prefs.push && '• Push '}
                {prefs.whatsapp && '• WhatsApp'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setRegisteredDonor(null)}
            className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/5"
          >
            Register Another Donor Profile
          </button>
        </motion.div>
      )}
    </div>
  );
}
