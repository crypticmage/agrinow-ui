"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";

/* ─── Animated plant SVG ──────────────────────────────────────────────── */
export function PlantIllustration() {
  const stemCtrl = useAnimationControls();
  const leaf1Ctrl = useAnimationControls();
  const leaf2Ctrl = useAnimationControls();
  const budCtrl = useAnimationControls();

  useEffect(() => {
    // Stagger the plant growing in
    setTimeout(
      () =>
        stemCtrl.start({
          pathLength: 1,
          opacity: 1,
          transition: { duration: 1.2, ease: "easeOut" },
        }),
      200,
    );
    setTimeout(
      () =>
        leaf1Ctrl.start({
          scale: 1,
          opacity: 0.85,
          rotate: 0,
          transition: { duration: 0.8, ease: "backOut" },
        }),
      900,
    );
    setTimeout(
      () =>
        leaf2Ctrl.start({
          scale: 1,
          opacity: 0.75,
          rotate: 0,
          transition: { duration: 0.8, ease: "backOut" },
        }),
      1100,
    );
    setTimeout(
      () =>
        budCtrl.start({
          scale: 1,
          opacity: 0.9,
          transition: { duration: 0.6, ease: "backOut" },
        }),
      1400,
    );

    // Then set up idle loop
    const interval = setInterval(() => {
      leaf1Ctrl.start({
        rotate: [0, -6, 0],
        transition: { duration: 3.5, ease: "easeInOut" },
      });
      leaf2Ctrl.start({
        rotate: [0, 5, 0],
        transition: { duration: 3.5, ease: "easeInOut", delay: 0.4 },
      });
      budCtrl.start({
        rotate: [0, 10, 0],
        transition: { duration: 4, ease: "easeInOut", delay: 0.2 },
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg
      width="140"
      height="150"
      viewBox="0 0 120 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pot */}
      <motion.g
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <path
          d="M38 110 L44 130 H76 L82 110 Z"
          fill="hsl(var(--accent))"
          opacity="0.75"
        />
        <rect
          x="34"
          y="103"
          width="52"
          height="10"
          rx="3"
          fill="hsl(var(--accent))"
        />
        <ellipse
          cx="60"
          cy="103"
          rx="24"
          ry="5"
          fill="hsl(var(--accent))"
          opacity="0.45"
        />
        {/* Pot shine */}
        <path
          d="M42 112 Q44 108 48 108"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
        />
      </motion.g>

      {/* Stem */}
      <motion.path
        d="M60 103 Q59 86 58 70 Q57 58 58 45"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={stemCtrl}
      />

      {/* Left leaf */}
      <motion.g
        style={{ transformOrigin: "58px 80px" }}
        initial={{ scale: 0, opacity: 0, rotate: -30 }}
        animate={leaf1Ctrl}
      >
        <path
          d="M58 80 Q38 68 28 52 Q42 50 57 72 Z"
          fill="hsl(var(--secondary))"
        />
        <path
          d="M58 80 Q43 66 28 52"
          stroke="hsl(var(--primary))"
          strokeWidth="0.8"
          fill="none"
          opacity="0.5"
        />
      </motion.g>

      {/* Right leaf */}
      <motion.g
        style={{ transformOrigin: "57px 68px" }}
        initial={{ scale: 0, opacity: 0, rotate: 30 }}
        animate={leaf2Ctrl}
      >
        <path
          d="M57 68 Q78 55 90 42 Q76 40 60 62 Z"
          fill="hsl(var(--secondary))"
        />
        <path
          d="M57 68 Q74 56 90 42"
          stroke="hsl(var(--primary))"
          strokeWidth="0.8"
          fill="none"
          opacity="0.5"
        />
      </motion.g>

      {/* Bud / top */}
      <motion.g
        style={{ transformOrigin: "58px 52px" }}
        initial={{ scale: 0, opacity: 0 }}
        animate={budCtrl}
      >
        <path
          d="M58 52 Q50 36 54 24 Q62 32 62 48 Z"
          fill="hsl(var(--primary))"
          opacity="0.9"
        />
        <text
          x="51"
          y="28"
          fontSize="13"
          fontWeight="bold"
          fill="hsl(var(--primary-foreground))"
          opacity="0.8"
          fontFamily="serif"
        >
          ?
        </text>
      </motion.g>

      {/* Small sprout on soil */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <path
          d="M44 103 Q42 98 38 96 Q43 95 46 100 Z"
          fill="hsl(var(--secondary))"
          opacity="0.5"
        />
        <path
          d="M74 103 Q76 97 80 96 Q76 94 72 100 Z"
          fill="hsl(var(--secondary))"
          opacity="0.4"
        />
      </motion.g>
    </svg>
  );
}
