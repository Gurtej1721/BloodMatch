import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll } from 'framer-motion';
import {
  AlertTriangle,
  Heart,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Droplet,
  Activity,
  Database,
} from 'lucide-react';
import ScrollyCanvas from '../components/3d/ScrollyCanvas';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import MagneticButton from '../components/ui/MagneticButton';

export default function HomePage() {
  const [stats, setStats] = useState({
    activeDonors: 1253,
    successfulMatches: 8433,
    secondsToConnect: 38,
    totalBloodUnitsInReserve: 122,
  });

  const [scrollPercent, setScrollPercent] = useState(0);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      // Map the first 45% of page scroll to 0..1 for the scrollytelling canvas
      const normalized = Math.min(1, Math.max(0, latest / 0.45));
      setScrollPercent(normalized);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <div className="flex-1 space-y-24 pb-20">
      {/* Hero & 3D Scrollytelling Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Narrative Column */}
          <div className="lg:col-span-7 space-y-8 z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>Real-Time Clinical Telemetry &amp; Rapid Dispatch</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight">
                Match.<br />
                Connect.<br />
                <span className="text-gradient">Save Lives.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                The high-speed emergency blood matching lifeline. Mobilizing verified volunteer donors and central blood bank reserves for critical trauma and pediatric care in under 45 seconds.
              </p>
            </motion.div>

            {/* Dual Primary Magnetic CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
            >
              <MagneticButton>
                <Link
                  to="/request"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm sm:text-base transition-all shadow-[0_0_25px_rgba(244,63,94,0.4)] hover:shadow-[0_0_35px_rgba(244,63,94,0.6)] flex items-center justify-center gap-2 group"
                >
                  <AlertTriangle className="w-5 h-5 text-rose-200 group-hover:scale-110 transition-transform" />
                  <span>Emergency Request (STAT)</span>
                </Link>
              </MagneticButton>

              <MagneticButton>
                <Link
                  to="/donor"
                  className="w-full sm:w-auto px-8 py-4 rounded-full glass-panel hover:bg-white/10 dark:hover:bg-white/10 text-slate-900 dark:text-white font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-2 group border border-slate-300 dark:border-white/15"
                >
                  <Heart className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
                  <span>Join as Verified Donor</span>
                </Link>
              </MagneticButton>
            </motion.div>

            {/* Clinical Trust & Speed Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>HIPAA &amp; WHO Transfusion Protocols</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>&lt; 45s Average Dispatch Signal</span>
              </div>
            </div>
          </div>

          {/* Right 3D Scrollytelling Canvas Column */}
          <div className="lg:col-span-5 h-[480px] sm:h-[580px] w-full relative">
            <ScrollyCanvas scrollProgress={scrollPercent} />
          </div>
        </div>
      </section>

      {/* Live Impact Stats Ribbon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <AnimatedCounter value={stats.activeDonors} label="Standby Verified Donors" />
          <AnimatedCounter value={stats.successfulMatches} label="Emergency Saves" />
          <AnimatedCounter value={stats.secondsToConnect} label="Seconds to Dispatch" suffix="s" />
          <AnimatedCounter value={stats.totalBloodUnitsInReserve} label="Blood Units in Reserve" />
        </div>
      </section>

      {/* Interactive Platform Feature Modules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dedicated Clinical Workspaces</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Engineered for Instant Triage Decisions
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
            Navigate specialized workflows designed to eliminate friction between intensive care units and volunteer donors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Rapid Matcher */}
          <Link
            to="/matcher"
            className="group p-7 rounded-3xl glass-panel hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-lg hover:shadow-cyan-500/10"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors">
                Rapid-Matching Console
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Calculate medical biological cross-match compatibility for any recipient with distance radius triangulation and 1-click dispatch.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-500 group-hover:translate-x-1.5 transition-transform">
              <span>Launch Matcher</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 2: Live Feed */}
          <Link
            to="/directory"
            className="group p-7 rounded-3xl glass-panel hover:border-rose-500/50 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-lg hover:shadow-rose-500/10"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                <Droplet className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-rose-400 transition-colors">
                Live Emergency Feed
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Inspect real-time distress calls and verified standby donors with multi-parameter search, status toggles, and direct calling.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-500 group-hover:translate-x-1.5 transition-transform">
              <span>Open Emergency Feed</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 3: Bank Reserves */}
          <Link
            to="/reserves"
            className="group p-7 rounded-3xl glass-panel hover:border-violet-500/50 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-lg hover:shadow-violet-500/10"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-violet-400 transition-colors">
                Central Bank Reserves
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Monitor live unit levels across all 8 blood types with threshold alarms and an interactive biological transfusion matrix.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-violet-400 group-hover:translate-x-1.5 transition-transform">
              <span>Inspect Reserves &amp; Matrix</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </section>

      {/* Clinical How-It-Works Protocol Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-10">
          <div className="max-w-xl space-y-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              The Rapid Lifeline Protocol
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Every step is optimized to replace chaotic phone calls with deterministic, algorithmic coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500 text-white font-black text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">STAT Intake &amp; Triage</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Hospital trauma teams submit required blood group, units, and room identifier in 3 high-velocity steps.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500 text-slate-950 font-black text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Biological Cross-Match</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                The engine evaluates exact and universal donor compatibility, filtering nearby standby volunteers by real-time travel ETA.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Direct Signal Dispatch</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Volunteers receive an immediate telemetry notification with navigation guidance directly to the specified clinic ward.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
