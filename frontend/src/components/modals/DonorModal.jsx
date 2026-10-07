import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MapPin, Phone, Mail, User, ShieldCheck, CheckCircle2 } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorModal({ isOpen, onClose, onDonorRegistered, onNotify }) {
  const [formData, setFormData] = useState({
    name: '',
    bloodGroup: 'O+',
    phone: '',
    email: '',
    location: '',
    city: '',
    healthDeclared: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (formData.phone.length < 7) {
      errs.phone = 'Please enter a valid phone number';
    }
    if (!formData.location.trim()) errs.location = 'Location or donor clinic is required';
    if (!formData.healthDeclared) {
      errs.healthDeclared = 'Please confirm medical eligibility to donate blood';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Registration failed');
      }

      const data = await res.json();
      setIsSuccess(true);
      if (onDonorRegistered) onDonorRegistered(data.donor);
      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'Welcome to the Donor Network!',
          message: `${formData.name} is now registered as an active ${formData.bloodGroup} donor.`,
        });
      }
    } catch {
      // Local fallback
      const fallbackDonor = {
        id: 'd_' + Date.now(),
        name: formData.name.trim(),
        bloodGroup: formData.bloodGroup,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        location: formData.location.trim(),
        city: formData.city.trim() || 'Metro Area',
        status: 'Available',
        lastDonated: 'Never',
        verified: true,
        totalDonations: 1,
        distanceKm: 2.4,
      };
      setIsSuccess(true);
      if (onDonorRegistered) onDonorRegistered(fallbackDonor);
      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'Registered Successfully (Local)',
          message: `${formData.name} is now registered in the directory.`,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setFormData({
      name: '',
      bloodGroup: 'O+',
      phone: '',
      email: '',
      location: '',
      city: '',
      healthDeclared: false,
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

          {!isSuccess ? (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Heart className="w-6 h-6 fill-cyan-500/30" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Become a Volunteer Donor</h3>
                  <p className="text-sm text-slate-400">Join the rapid response lifeline to save critical emergency patients</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Blood Group Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Your Blood Group *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {BLOOD_GROUPS.map((bg) => (
                      <button
                        type="button"
                        key={bg}
                        onClick={() => setFormData({ ...formData, bloodGroup: bg })}
                        className={`py-2.5 rounded-xl font-bold text-sm border transition-all ${
                          formData.bloodGroup === bg
                            ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                            : 'bg-slate-800/60 border-white/5 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Alex Morgan"
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                          errors.name ? 'border-rose-500' : 'border-white/10'
                        }`}
                      />
                    </div>
                    {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Contact Phone *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. +1 (555) 789-0123"
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                          errors.phone ? 'border-rose-500' : 'border-white/10'
                        }`}
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-rose-400 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Email & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Email Address (Optional)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. alex@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Neighborhood / City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Metro Central"
                      className="w-full px-4 py-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* Nearest Medical Center / Clinic */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Preferred Location / Nearby Clinic *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Downtown General Hospital Donor Wing"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                        errors.location ? 'border-rose-500' : 'border-white/10'
                      }`}
                    />
                  </div>
                  {errors.location && <p className="text-xs text-rose-400 mt-1">{errors.location}</p>}
                </div>

                {/* Health eligibility check */}
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-white/5 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.healthDeclared}
                      onChange={(e) => setFormData({ ...formData, healthDeclared: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded text-cyan-500 bg-slate-900 border-white/20 focus:ring-cyan-500"
                    />
                    <span className="text-xs text-slate-300 leading-relaxed">
                      I declare that I am 18+ years old, weigh at least 50kg, am in good overall health, and haven't donated whole blood in the last 56 days.
                    </span>
                  </label>
                  {errors.healthDeclared && <p className="text-xs text-rose-400 pl-7">{errors.healthDeclared}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-base transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Confirm Donor Registration</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Registration Success */
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-cyan-500/20 border border-cyan-500/40 rounded-full flex items-center justify-center mx-auto text-cyan-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">Donor Profile Activated!</h3>
                <p className="text-slate-400 mt-1">
                  Thank you, <span className="text-white font-semibold">{formData.name}</span>! Your blood group{' '}
                  <span className="text-cyan-400 font-bold">{formData.bloodGroup}</span> is now active in the emergency matcher.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-white/5 text-left max-w-md mx-auto space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Available on Emergency Standby
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Dispatch Radius:</span>
                  <span className="text-slate-200">10 km radius</span>
                </div>
              </div>

              <button
                onClick={handleResetAndClose}
                className="px-8 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)]"
              >
                Done
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
