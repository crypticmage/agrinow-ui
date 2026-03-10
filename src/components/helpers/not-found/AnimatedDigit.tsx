"use client";

import { motion } from "framer-motion";

/* ─── Digit component with slot-machine animation ─────────────────────── */
export function AnimatedDigit({
  digit,
  delay,
}: {
  digit: string;
  delay: number;
}) {
  return (
    <div className="relative overflow-hidden" style={{ height: "1.1em" }}>
      <motion.span
        className="block font-black"
        initial={{ y: "-120%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14, delay }}
      >
        {digit}
      </motion.span>
    </div>
  );
}
