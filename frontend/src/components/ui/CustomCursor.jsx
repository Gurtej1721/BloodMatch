import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Smooth spring physics for trailing cursor
  const springConfig = { damping: 25, stiffness: 350, mass: 0.5 };
  const cursorX = useSpring(-100, springConfig);
  const cursorY = useSpring(-100, springConfig);

  // Faster spring for spotlight aura
  const auraConfig = { damping: 40, stiffness: 200 };
  const auraX = useSpring(-300, auraConfig);
  const auraY = useSpring(-300, auraConfig);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e) => {
      setIsVisible(true);
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      auraX.set(e.clientX);
      auraY.set(e.clientY);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleOver = (e) => {
      const target = e.target;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('[role="button"]')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseover', handleOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseover', handleOver);
    };
  }, [cursorX, cursorY, auraX, auraY]);

  if (isTouchDevice) return null;

  return (
    <>
      {/* 600px Ambient Gradient Cursor Spotlight Aura */}
      <motion.div
        className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none z-0 opacity-40 dark:opacity-60 transition-opacity duration-300"
        style={{
          x: auraX,
          y: auraY,
          translateX: '-50%',
          translateY: '-50%',
          background: 'radial-gradient(circle, rgba(244, 63, 94, 0.12) 0%, rgba(6, 182, 212, 0.05) 40%, transparent 70%)',
        }}
      />

      {/* Trailing Inertia Outer Ring */}
      {isVisible && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[999] rounded-full border border-rose-500/50 dark:border-rose-400/60 transition-colors"
          style={{
            x: cursorX,
            y: cursorY,
            translateX: '-50%',
            translateY: '-50%',
            width: isHovered ? 48 : 28,
            height: isHovered ? 48 : 28,
            backgroundColor: isHovered ? 'rgba(244, 63, 94, 0.15)' : 'transparent',
            transition: 'width 0.2s ease, height 0.2s ease, background-color 0.2s ease',
          }}
        />
      )}

      {/* Instant Central Dot */}
      {isVisible && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[1000] w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
          style={{
            x: cursorX,
            y: cursorY,
            translateX: '-50%',
            translateY: '-50%',
            scale: isHovered ? 1.5 : 1,
            transition: 'scale 0.15s ease',
          }}
        />
      )}
    </>
  );
}
