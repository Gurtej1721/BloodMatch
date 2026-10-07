import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, PhoneCall, ShieldCheck, Heart, Sparkles, Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/60 dark:border-slate-800/60 border-slate-200 bg-slate-950/40 dark:bg-slate-950/40 bg-slate-100/50 backdrop-blur-md pt-12 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-cyan-500 p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                  <Droplet className="text-rose-500 fill-rose-500/80 h-4 w-4" />
                </div>
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                Blood<span className="text-rose-500">Match</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Real-time, dynamic emergency blood matching platform. Connecting volunteer donors and trauma teams with critical patients in seconds.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Matching Engine Live • HIPAA Compliant</span>
            </div>
          </div>

          {/* Emergency Lifeline Hotline Dial */}
          <div className="space-y-3 md:col-span-1">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Immediate Crisis Response
            </h5>
            <div className="p-3.5 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 space-y-2">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                <PhoneCall className="w-4 h-4 animate-bounce" />
                <span>24/7 STAT Hotline</span>
              </div>
              <a
                href="tel:18002566378"
                className="block text-lg font-black font-mono text-slate-900 dark:text-white hover:text-rose-500 transition-colors"
              >
                1-800-256-6378
              </a>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Direct coordinator hotline for ICU, operating theatres, and ambulance triage.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2 text-xs">
            <h5 className="font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-2">
              Platform Modules
            </h5>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/request" className="hover:text-rose-500 transition-colors flex items-center gap-1.5">
                  <span>STAT Triage Flow</span>
                </Link>
              </li>
              <li>
                <Link to="/matcher" className="hover:text-cyan-500 transition-colors flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span>Rapid-Matching Console</span>
                </Link>
              </li>
              <li>
                <Link to="/directory" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Live Emergency Feed
                </Link>
              </li>
              <li>
                <Link to="/reserves" className="hover:text-violet-400 transition-colors">
                  Central Reserves &amp; Radar
                </Link>
              </li>
              <li>
                <Link to="/hospitals" className="hover:text-cyan-400 transition-colors">
                  Hospitals &amp; Cities Covered
                </Link>
              </li>
              <li>
                <Link to="/donor" className="hover:text-rose-400 transition-colors flex items-center gap-1.5">
                  <Heart className="w-3 h-3 text-rose-500" />
                  <span>Donor Portal &amp; Screening</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Medical Trust & Security */}
          <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <h5 className="font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-2">
              Clinical Integrity
            </h5>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Biomedical compatibility computation verified against WHO &amp; AABB blood transfusion guidelines.
              </p>
            </div>
            <div className="flex items-start gap-2 pt-1">
              <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Automated geographic distance triangulation with donor alert dispatch under 45 seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-slate-500">
          <div>
            &copy; 2026 BloodMatch Emergency Technologies Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">HIPAA Notice</span>
            <span className="hover:text-slate-400 cursor-pointer">Clinical Protocols</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy &amp; Encryption</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
