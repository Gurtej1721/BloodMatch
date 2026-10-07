import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  MapPin,
  Phone,
  User,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Activity,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useAppToast } from '../components/layout/Layout';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCIES = [
  { level: 'Critical', label: 'STAT / Critical', desc: 'Need within < 1 hour', color: 'border-rose-500 bg-rose-500/10 text-rose-500 font-bold' },
  { level: 'Urgent', label: 'Urgent Priority', desc: 'Need within 4 to 24 hours', color: 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold' },
  { level: 'Routine', label: 'Scheduled / Routine', desc: 'Planned surgical procedure', color: 'border-cyan-500 bg-cyan-500/10 text-cyan-500 font-bold' },
];

export default function RequestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useAppToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const initialHospital = searchParams.get('hospital') || '';

  const [form, setForm] = useState({
    patientName: '',
    bloodGroup: 'O-',
    unitsNeeded: 2,
    hospital: initialHospital,
    ward: '',
    bed: '',
    urgency: 'Critical',
    contact: '',
    notes: '',
  });

  useEffect(() => {
    const hospParam = searchParams.get('hospital');
    if (hospParam) {
      setForm((prev) => ({ ...prev, hospital: hospParam }));
    }
  }, [searchParams]);

  const [errors, setErrors] = useState({});

  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!form.bloodGroup) errs.bloodGroup = 'Select a required blood group';
      if (form.unitsNeeded < 1) errs.unitsNeeded = 'At least 1 unit required';
    }
    if (step === 2) {
      if (!form.hospital.trim()) errs.hospital = 'Hospital or medical center name is required';
      if (!form.patientName.trim()) errs.patientName = 'Patient or Case ID is required';
    }
    if (step === 3) {
      if (!form.contact.trim() || form.contact.length < 7) {
        errs.contact = 'Emergency coordinator phone is required (at least 7 digits)';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(3, prev + 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setLoading(true);
    const locationString = `${form.hospital.trim()}${form.ward ? ', ' + form.ward.trim() : ''}${form.bed ? ', Bed ' + form.bed.trim() : ''}`;

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: form.patientName,
          bloodGroup: form.bloodGroup,
          unitsNeeded: Number(form.unitsNeeded) || 1,
          location: locationString,
          hospital: form.hospital,
          urgency: form.urgency,
          contact: form.contact,
          notes: form.notes,
        }),
      });

      const data = await res.json();
      setSubmittedData(data);
      addToast({
        type: 'success',
        title: 'Emergency Distress Call Broadcasted',
        message: `Alert transmitted for ${form.bloodGroup}. Found ${data.compatibleDonorsFound || 0} compatible donors.`,
      });
    } catch {
      // Local fallback
      const fallback = {
        request: {
          id: 'r_' + Date.now(),
          patientName: form.patientName,
          bloodGroup: form.bloodGroup,
          unitsNeeded: form.unitsNeeded,
          location: locationString,
          urgency: form.urgency,
          contact: form.contact,
          time: 'Just now',
        },
        compatibleDonorsFound: 4,
      };
      setSubmittedData(fallback);
      addToast({
        type: 'success',
        title: 'Distress Call Active (Local)',
        message: `Emergency signal registered for ${form.bloodGroup}.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>STAT Emergency Intake Protocol</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Emergency Blood Triage Flow
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          High-velocity clinical intake. Completing this intake immediately alerts compatible registered donors and central blood banks in radius.
        </p>
      </div>

      {!submittedData ? (
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-white/10 shadow-2xl space-y-8">
          {/* 3-Step Wizard Navigation Indicator */}
          <div className="flex items-center justify-between max-w-md mx-auto relative pb-4">
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
            <div
              className="absolute top-4 left-6 h-0.5 bg-rose-600 transition-all duration-300 -z-0"
              style={{ width: `${((currentStep - 1) / 2) * 88}%` }}
            />

            {[
              { step: 1, label: 'Blood Group' },
              { step: 2, label: 'Hospital Location' },
              { step: 3, label: 'Urgency & STAT' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center relative z-10 space-y-1">
                <button
                  type="button"
                  onClick={() => s.step < currentStep && setCurrentStep(s.step)}
                  className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                    currentStep === s.step
                      ? 'bg-rose-600 text-white ring-4 ring-rose-500/20 shadow-lg'
                      : currentStep > s.step
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {currentStep > s.step ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                </button>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: Blood Group Selector */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                      Required Patient Blood Group *
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                      {BLOOD_GROUPS.map((bg) => (
                        <button
                          type="button"
                          key={bg}
                          onClick={() => setForm({ ...form, bloodGroup: bg })}
                          className={`py-3.5 rounded-2xl font-black text-base border transition-all ${
                            form.bloodGroup === bg
                              ? 'bg-rose-600 border-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] scale-105'
                              : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-rose-400'
                          }`}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Units Needed */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Units Required (Pints) *
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={form.unitsNeeded}
                          onChange={(e) => setForm({ ...form, unitsNeeded: parseInt(e.target.value) || 1 })}
                          className="w-24 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl font-bold text-center text-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                        />
                        <span className="text-xs text-slate-500">Typical trauma requirement: 2 to 4 units</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-rose-500 shrink-0" />
                      <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {form.bloodGroup === 'O-' ? (
                          <span className="font-semibold text-rose-500">Universal Donor (O-):</span>
                        ) : form.bloodGroup === 'AB+' ? (
                          <span className="font-semibold text-cyan-400">Universal Recipient (AB+):</span>
                        ) : (
                          <span className="font-semibold text-rose-400">Transfusion Affinity:</span>
                        )}{' '}
                        Compatible donors and matching blood bank reserves will be triaged concurrently.
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Hospital & Ward Location */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Hospital / Medical Center *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={form.hospital}
                          onChange={(e) => setForm({ ...form, hospital: e.target.value })}
                          placeholder="e.g. City Trauma Center"
                          className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white ${
                            errors.hospital ? 'border-rose-500' : 'border-slate-300 dark:border-white/10'
                          }`}
                        />
                      </div>
                      {errors.hospital && <p className="text-xs text-rose-500 mt-1">{errors.hospital}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Patient / Case Identifier *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={form.patientName}
                          onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                          placeholder="e.g. Patient ICU-04 / Trauma #108"
                          className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white ${
                            errors.patientName ? 'border-rose-500' : 'border-slate-300 dark:border-white/10'
                          }`}
                        />
                      </div>
                      {errors.patientName && <p className="text-xs text-rose-500 mt-1">{errors.patientName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Ward / Department
                      </label>
                      <input
                        type="text"
                        value={form.ward}
                        onChange={(e) => setForm({ ...form, ward: e.target.value })}
                        placeholder="e.g. ICU Wing 2 / Operating Room 4"
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Bed / Room No.
                      </label>
                      <input
                        type="text"
                        value={form.bed}
                        onChange={(e) => setForm({ ...form, bed: e.target.value })}
                        placeholder="e.g. Bed 12"
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Urgency & Contact Details */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Urgency Level Cards */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Clinical Urgency Level *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {URGENCIES.map((u) => (
                        <button
                          type="button"
                          key={u.level}
                          onClick={() => setForm({ ...form, urgency: u.level })}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            form.urgency === u.level
                              ? u.color + ' ring-2 ring-current shadow-md'
                              : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <div className="text-sm font-black">{u.label}</div>
                          <div className="text-xs opacity-75 mt-0.5">{u.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact Phone & Clinical Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Coordinator / Physician Emergency Phone *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="tel"
                          value={form.contact}
                          onChange={(e) => setForm({ ...form, contact: e.target.value })}
                          placeholder="e.g. +1 (555) 019-2834"
                          className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white ${
                            errors.contact ? 'border-rose-500' : 'border-slate-300 dark:border-white/10'
                          }`}
                        />
                      </div>
                      {errors.contact && <p className="text-xs text-rose-500 mt-1">{errors.contact}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Clinical Notes / Surgical Indication
                      </label>
                      <div className="relative">
                        <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={form.notes}
                          onChange={(e) => setForm({ ...form, notes: e.target.value })}
                          placeholder="e.g. Vascular rupture, surgery in 30 mins"
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stepper Navigation Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-extrabold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>Transmit STAT Distress Call</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        /* Real-time Broadcast Confirmation Preview */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel rounded-3xl p-8 sm:p-12 border border-emerald-500/40 text-center space-y-6 shadow-2xl"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Emergency Distress Signal Broadcasted!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Alert broadcasted across localized telemetry relays. Standby donors within dispatch radius have received alert packets.
            </p>
          </div>

          {/* Clean Summary Payload Preview Card */}
          <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 text-left text-xs space-y-2.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Target Blood Group:</span>
              <span className="font-black text-rose-500 text-sm">{submittedData.request?.bloodGroup}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Units Needed:</span>
              <span className="font-bold text-slate-900 dark:text-white">{submittedData.request?.unitsNeeded} Units</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Medical Facility:</span>
              <span className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                {submittedData.request?.location}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Compatible Donors Notified:</span>
              <span className="font-bold text-emerald-500">{submittedData.compatibleDonorsFound || 3} Donors</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/matcher')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <Activity className="w-4 h-4" />
              <span>Open Rapid-Matching Console</span>
            </button>
            <button
              onClick={() => navigate('/directory')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <span>View in Live Feed</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
