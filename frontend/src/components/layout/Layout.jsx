import React, { useState, createContext, useContext } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import CustomCursor from '../ui/CustomCursor';
import Toast from '../ui/Toast';

// Global Toast / Notification Context
const ToastContext = createContext({
  addToast: () => {},
});

export function useAppToast() {
  return useContext(ToastContext);
}

export default function Layout() {
  const location = useLocation();
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

  return (
    <ToastContext.Provider value={{ addToast }}>
      <div className="min-h-screen flex flex-col bg-slate-950 dark:bg-slate-950 bg-slate-50 text-slate-100 dark:text-slate-100 text-slate-900 transition-colors duration-300 relative selection:bg-rose-500 selection:text-white">
        {/* Dynamic Background Mesh Grid & Glows */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-950/20 via-slate-950 to-slate-950 dark:opacity-100 opacity-30" />
        <div className="fixed -top-40 right-0 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="fixed top-1/2 -left-40 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Global Interactive Cursor & Spotlight Aura */}
        <CustomCursor />

        {/* Global Floating Toasts */}
        <Toast toasts={toasts} onDismiss={removeToast} />

        {/* Sticky Frosted-Glass Navbar */}
        <Navbar />

        {/* Main Content with Route Isolation & Page Transitions */}
        <main className="flex-1 pt-16 z-10 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="flex-1 flex flex-col"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </ToastContext.Provider>
  );
}
