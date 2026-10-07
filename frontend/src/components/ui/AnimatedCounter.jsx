import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

export default function AnimatedCounter({ value, label, suffix = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseInt(value, 10);
      const duration = 2000;
      const increment = end / (duration / 16); 

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.ceil(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [value, isInView]);

  return (
    <div ref={ref} className="text-center p-6 glass-panel rounded-2xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        className="text-4xl md:text-5xl font-bold text-gradient mb-2"
      >
        {count}{suffix}
      </motion.div>
      <div className="text-slate-400 font-medium uppercase tracking-wider text-sm">{label}</div>
    </div>
  );
}