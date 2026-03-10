"use client";

import { motion } from "framer-motion";

/* ─── Animated floating leaf ──────────────────────────────────────────── */
export function FloatingLeaf({
  x,
  y,
  size,
  rotate,
  delay,
}: {
  x: string;
  y: string;
  size: number;
  rotate: number;
  delay: number;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{ left: x, top: y }}
      animate={{ y: [0, -14, 0], rotate: [rotate, rotate + 8, rotate] }}
      transition={{
        duration: 5 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        opacity={0.18}
      >
        <path
          d="M12 2C12 2 4 8 4 14a8 8 0 0 0 16 0C20 8 12 2 12 2z"
          fill="hsl(var(--primary))"
        />
        <line
          x1="12"
          y1="22"
          x2="12"
          y2="10"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}
