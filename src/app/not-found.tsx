"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sprout } from "lucide-react";
import { SeedParticle } from "@/components/helpers/not-found/SeedParticle";
import { FloatingLeaf } from "@/components/helpers/not-found/FloatingLeaf";
import { PlantIllustration } from "@/components/helpers/not-found/PlantIllustration";
import { AnimatedDigit } from "@/components/helpers/not-found/AnimatedDigit";
import { usePathname } from "next/navigation";

const SEEDS = Array.from({ length: 14 }, (_, i) => ({
  x: 5 + i * 7,
  delay: Math.random() * 6,
  duration: 6 + Math.random() * 6,
}));

const LEAVES = [
  { x: "8%", y: "14%", size: 32, rotate: -20, delay: 0.0 },
  { x: "76%", y: "10%", size: 20, rotate: 25, delay: 0.7 },
  { x: "86%", y: "52%", size: 26, rotate: -12, delay: 1.3 },
  { x: "6%", y: "65%", size: 18, rotate: 42, delay: 0.4 },
  { x: "52%", y: "80%", size: 22, rotate: -30, delay: 1.0 },
  { x: "38%", y: "6%", size: 14, rotate: 15, delay: 0.2 },
  { x: "62%", y: "88%", size: 16, rotate: -50, delay: 1.6 },
];

export default function NotFound() {
  const pathname = usePathname();
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* ── Background layers ── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Radial glow blobs */}
        <motion.div
          className="absolute -left-48 -top-48 h-125 w-125 rounded-full"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
            opacity: 0.12,
          }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 h-100 w-100 rounded-full"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--secondary)) 0%, transparent 70%)",
            opacity: 0.1,
          }}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        {/* Grid */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.035]">
          <defs>
            <pattern
              id="grid"
              width="44"
              height="44"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 44 0 L 0 0 0 44"
                fill="none"
                stroke="hsl(var(--foreground))"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Falling seeds */}
        {SEEDS.map((s, i) => (
          <SeedParticle key={i} {...s} />
        ))}
        {/* Floating leaves */}
        {LEAVES.map((l, i) => (
          <FloatingLeaf key={i} {...l} />
        ))}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 mx-4 w-full max-w-md text-center">
        {/* Plant */}
        <motion.div
          className="mx-auto mb-6 flex justify-center"
          animate={shake ? { x: [-6, 6, -4, 4, -2, 2, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <PlantIllustration />
        </motion.div>

        {/* Ghost + real 404 layered */}
        <div
          className="relative mb-1 flex items-center justify-center"
          style={{ height: "7rem" }}
        >
          <motion.span
            className="absolute select-none text-[8rem] font-black tracking-tighter"
            style={{ lineHeight: 1, color: "hsl(var(--foreground) / 0.04)" }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            aria-hidden
          >
            404
          </motion.span>
          <div
            className="relative flex text-[4.5rem] font-black tracking-tight text-foreground"
            style={{ lineHeight: 1 }}
          >
            <AnimatedDigit digit="4" delay={0.3} />
            <AnimatedDigit digit="0" delay={0.45} />
            <AnimatedDigit digit="4" delay={0.6} />
          </div>
        </div>

        {/* Headline */}
        <motion.h1
          className="mb-2 text-2xl font-bold text-foreground"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.85 }}
        >
          This field doesn't exist
        </motion.h1>

        {/* Subtext */}
        <motion.p
          className="mb-2 text-sm leading-relaxed text-muted-foreground"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          Looks like you've wandered off the farm.
        </motion.p>

        {/* Path badge */}
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.15 }}
          onClick={triggerShake}
        >
          <code className="cursor-pointer rounded-lg border border-border bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive">
            {pathname}
          </code>
        </motion.div>

        {/* CTA */}
        <motion.button
          onClick={() => window.history.back()}
          className="group inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-md cursor-pointer"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          whileHover={{
            scale: 1.04,
            y: -2,
            boxShadow: "0 8px 24px hsl(var(--primary) / 0.35)",
          }}
          whileTap={{ scale: 0.97 }}
        >
          <motion.span
            animate={{ x: [0, -3, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1,
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </motion.span>
          Go Back
        </motion.button>

        {/* Footer */}
        <motion.div
          className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        >
          <Sprout className="h-3 w-3" />
          <span>
            © {new Date().getFullYear()} Cryptic Mage · All rights reserved
          </span>
        </motion.div>
      </div>
    </div>
  );
}
