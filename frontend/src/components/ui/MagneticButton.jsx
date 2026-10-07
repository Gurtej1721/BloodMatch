import React, { useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function MagneticButton({ children, className = '', onClick, type = 'button', disabled = false, ...props }) {
  const ref = useRef(null);

  const springConfig = { stiffness: 200, damping: 15, mass: 0.2 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handleMouseMove = (e) => {
    if (!ref.current || disabled) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    // Subtle magnetic attraction within bounding range
    const maxDistance = 50;
    const pullFactor = 0.28;

    if (Math.abs(distanceX) < maxDistance && Math.abs(distanceY) < maxDistance) {
      x.set(distanceX * pullFactor);
      y.set(distanceY * pullFactor);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={className}
        {...props}
      >
        {children}
      </button>
    </motion.div>
  );
}
