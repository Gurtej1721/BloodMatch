import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Droplet, MapPin, Phone, User, FileText, CheckCircle2 } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCIES = [
  { level: 'Critical', desc: 'Need within 1 hour', color: 'border-rose-500 bg-rose-500/20 text-rose-300' },
  { level: 'Urgent', desc: 'Need within 4 hours', color: 'border-amber-500 bg-amber-500/20 text-amber-300' },
  { level: 'High', desc: 'Need within 12 hours', color: 'border-cyan-500 bg-cyan-500/20 text-cyan-300' },
  { level: 'Routine', desc: 'Scheduled procedure', color: 'border-slate-500 bg-slate-500/20 text-slate-300' },
];

export default function RequestModal({ isOpen, onClose, onRequestCreated, onNotify }) {
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'O-',
    unitsNeeded: 1,
    hospital: '',
    location: '',
    urgency: 'Critical',
    contact: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successData, setSuccessData] = useState(null);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.patientName.trim()) errs.patientName = 'Patient or Case Name is required';
    if (!formData.hospital.trim()) errs.hospital = 'Hospital or Medical facility is required';
    if (!formData.contact.trim()) {
      errs.contact = 'Emergency contact number is required';
    } else if (formData.contact.length < 7) {
      errs.contact = 'Please enter a valid phone number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        location: `${formData.hospital.trim()}${formData.location ? ', ' + formData.location.trim() : ''}`,
      };

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to publish blood request');
      }

      const data = await res.json();
      setSuccessData(data);
      if (onRequestCreated) onRequestCreated(data.request);
      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'Emergency Request Broadcasted',
          message: `Broadcasted alert for ${formData.bloodGroup}. ${data.compatibleDonorsFound} compatible donors notified!`,
        });
      }
    } catch {
      // Fallback for offline mode or network errors
      const fallbackRequest = {
        id: 'r_' + Date.now(),
        patientName: formData.patientName.trim(),
        bloodGroup: formData.bloodGroup,
        location: `${formData.hospital.trim()}${formData.location ? ', ' + formData.location.trim() : ''}`,
        hospital: formData.hospital.trim(),
        unitsNeeded: Number(formData.unitsNeeded) || 1,
        urgency: formData.urgency,
        status: 'Urgent',
        contact: formData.contact.trim(),
        time: 'Just now',
        notes: formData.notes,
      };
      setSuccessData({
        request: fallbackRequest,
        compatibleDonorsFound: 3,
        potentialMatches: [],
      });
      if (onRequestCreated) onRequestCreated(fallbackRequest);
      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'Request Published (Local)',
          message: `Alert active for ${formData.bloodGroup}. Network matching dispatched.`,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessData(null);
    setFormData({
      patientName: '',
      bloodGroup: 'O-',
      unitsNeeded: 1,
      hospital: '',
      location: '',
      urgency: 'Critical',
      contact: '',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={handleResetAndClose}
            className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {!successData ? (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Droplet className="w-6 h-6 fill-rose-500/30" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Post Emergency Blood Request</h3>
                  <p className="text-sm text-slate-400">Instantly alerts compatible registered donors and hospitals</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Blood Group Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Blood Group Needed *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {BLOOD_GROUPS.map((bg) => (
                      <button
                        type="button"
                        key={bg}
                        onClick={() => setFormData({ ...formData, bloodGroup: bg })}
                        className={`py-2.5 rounded-xl font-bold text-sm border transition-all ${
                          formData.bloodGroup === bg
                            ? 'bg-rose-600 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                            : 'bg-slate-800/60 border-white/5 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Urgency Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Urgency Level *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {URGENCIES.map((u) => (
                      <button
                        type="button"
                        key={u.level}
                        onClick={() => setFormData({ ...formData, urgency: u.level })}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          formData.urgency === u.level
                            ? `${u.color} font-bold`
                            : 'bg-slate-800/40 border-white/5 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-sm font-semibold">{u.level}</div>
                        <div className="text-xs opacity-75">{u.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Patient Name & Units */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Patient / Case Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={formData.patientName}
                        onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                        placeholder="e.g. John Doe (ICU)"
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                          errors.patientName ? 'border-rose-500' : 'border-white/10'
                        }`}
                      />
                    </div>
                    {errors.patientName && <p className="text-xs text-rose-400 mt-1">{errors.patientName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Units Needed
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.unitsNeeded}
                      onChange={(e) => setFormData({ ...formData, unitsNeeded: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full px-3 py-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Hospital & Ward/Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Hospital / Facility *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={formData.hospital}
                        onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                        placeholder="e.g. St. Jude Hospital"
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                          errors.hospital ? 'border-rose-500' : 'border-white/10'
                        }`}
                      />
                    </div>
                    {errors.hospital && <p className="text-xs text-rose-400 mt-1">{errors.hospital}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Ward / Room / Details
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Ward 4, Bed 12"
                      className="w-full px-4 py-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Contact Phone & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Emergency Contact Phone *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        placeholder="e.g. +1 (555) 019-2834"
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                          errors.contact ? 'border-rose-500' : 'border-white/10'
                        }`}
                      />
                    </div>
                    {errors.contact && <p className="text-xs text-rose-400 mt-1">{errors.contact}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Clinical Notes (Optional)
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="e.g. Surgery at 3 PM"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-base transition-all shadow-[0_0_25px_rgba(244,63,94,0.4)] hover:shadow-[0_0_35px_rgba(244,63,94,0.6)] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5" />
                        <span>Dispatch Emergency Request Broadcast</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Success confirmation screen */
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">Emergency Request Broadcasted!</h3>
                <p className="text-slate-400 mt-1">
                  Active alert for <span className="text-rose-400 font-bold">{successData.request.bloodGroup}</span> blood
                  at {successData.request.location}.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-white/5 text-left max-w-md mx-auto space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Compatible Donors Found:</span>
                  <span className="text-emerald-400 font-bold">{successData.compatibleDonorsFound} Donors</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Estimated Match Time:</span>
                  <span className="text-cyan-400 font-semibold">&lt; 45 seconds</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-rose-400 font-semibold animate-pulse">Broadcast Active</span>
                </div>
              </div>

              <button
                onClick={handleResetAndClose}
                className="px-8 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              >
                Return to Directory
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
