"use client";

import { motion } from "framer-motion";

/* ─── Particle seed that falls from above ─────────────────────────────── */
export function SeedParticle({
  x,
  delay,
  duration,
}: {
  x: number;
  delay: number;
  duration: number;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute top-0"
      style={{ left: `${x}%` }}
      initial={{ y: -20, opacity: 0, rotate: 0, scale: 0.6 }}
      animate={{
        y: "110vh",
        opacity: [0, 0.6, 0.6, 0],
        rotate: 360,
        scale: [0.6, 1, 0.8],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
        repeatDelay: Math.random() * 4,
      }}
    >
      <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
        <ellipse
          cx="5"
          cy="7"
          rx="4"
          ry="6"
          fill="hsl(var(--primary))"
          opacity="0.4"
        />
        <line
          x1="5"
          y1="13"
          x2="5"
          y2="8"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>
    </motion.div>
  );
}
