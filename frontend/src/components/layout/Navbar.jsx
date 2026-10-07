import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplet,
  Menu,
  X,
  PhoneCall,
  Sun,
  Moon,
  Activity,
  Compass,
  Database,
  Heart,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import MagneticButton from '../ui/MagneticButton';

const NAV_LINKS = [
  { path: '/', label: 'Overview', icon: Droplet },
  { path: '/request', label: 'STAT Triage', icon: AlertTriangle, highlight: true },
  { path: '/matcher', label: 'Rapid Matcher', icon: Activity },
  { path: '/directory', label: 'Live Feed', icon: Compass },
  { path: '/reserves', label: 'Reserves & Radar', icon: Database },
  { path: '/hospitals', label: 'Hospitals & Cities', icon: Building2 },
  { path: '/donor', label: 'Donor Portal', icon: Heart },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300 backdrop-blur-md bg-slate-950/75 dark:bg-slate-950/75 bg-white/80 border-b border-slate-800/60 dark:border-slate-800/60 border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-cyan-500 p-0.5 shadow-[0_0_15px_rgba(244,63,94,0.35)] group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 dark:bg-slate-950 bg-white rounded-[10px] flex items-center justify-center">
              <Droplet className="text-rose-500 fill-rose-500/80 h-5 w-5" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight leading-none text-slate-900 dark:text-white">
              Blood<span className="text-rose-500">Match</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-500 dark:text-slate-400">
              Emergency Lifeline
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links with Active Pill Highlight */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className={`absolute inset-0 rounded-full ${
                      link.highlight
                        ? 'bg-gradient-to-r from-rose-600 to-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                        : 'bg-slate-800 dark:bg-slate-800 text-white shadow-sm'
                    }`}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${link.highlight && !isActive ? 'text-rose-500' : ''}`} />
                  {link.label}
                </span>
              </NavLink>
            );
          })}
        </div>

        {/* Right Utility Actions */}
        <div className="flex items-center gap-3">
          {/* Emergency Hotline Quick-Dial */}
          <a
            href="tel:18002566378"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
            title="Emergency Blood Dispatch Hotline"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-mono">STAT: 1-800-BLOOD</span>
          </a>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 transition-colors"
            aria-label="Toggle dark/light theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Primary CTA (Magnetic Button) */}
          <MagneticButton>
            <Link
              to="/request"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:shadow-[0_0_20px_rgba(244,63,94,0.6)]"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>STAT Request</span>
            </Link>
          </MagneticButton>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10"
            aria-label="Toggle navigation drawer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile-Responsive Sliding Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="lg:hidden border-t border-slate-200 dark:border-white/10 px-4 pt-3 pb-5 space-y-2 bg-slate-950/95 dark:bg-slate-950/95 bg-white/95 backdrop-blur-xl"
          >
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-rose-600 text-white font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </span>
                  {link.highlight && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                      Emergency
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2">
              <a
                href="tel:18002566378"
                className="w-full py-2.5 rounded-xl bg-rose-600/10 text-rose-500 text-center text-xs font-bold border border-rose-500/30 flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Emergency Dispatch Hotline: 1-800-BLOOD</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}