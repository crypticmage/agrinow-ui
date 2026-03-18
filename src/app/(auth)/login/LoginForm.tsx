"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useLogin } from "@/hooks/queries/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";

// ── Validation ────────────────────────────────────────────────────────────────
const usernameRegex = /^[a-zA-Z0-9._-]{3,}$/;

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email or username is required")
    .refine(
      (val) =>
        val.includes("@")
          ? z.string().email().safeParse(val).success
          : usernameRegex.test(val),
      { message: "Enter a valid email or username (min 3 chars: letters, numbers, . _ -)" }
    ),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

// ── Phase state machine ───────────────────────────────────────────────────────
// idle → pending (API in flight) → success (1s animation) → navigates
// idle ← error  (toast shown by hook, auto-resets)
type Phase = "idle" | "pending" | "success";

// ── Button content variants ───────────────────────────────────────────────────
// Each slot slides up on enter, slides down on exit (slot-machine effect)
const slot = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const { mutate: login } = useLogin({
    onNavigate: () => {
      setPhase("success");
      // Allow success animation to play before navigation
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1100);
    },
  });

  const onSubmit = (values: LoginValues) => {
    if (phase !== "idle") return;
    setPhase("pending");
    login(
      { identifier: values.identifier, password: values.password },
      {
        // Per-call onError resets phase so user can retry
        onError: () => setPhase("idle"),
      }
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <motion.div
      animate={
        phase === "success"
          ? { boxShadow: "0 0 80px rgba(74,222,128,0.22), 0 32px 80px rgba(0,0,0,0.5)" }
          : { boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }
      }
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-white/8 bg-white/4 p-8 backdrop-blur-xl relative overflow-hidden"
    >
      {/* Success overlay — fades in on top when login succeeds */}
      <AnimatePresence>
        {phase === "success" && (
          <motion.div
            key="success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#0d1a0f]/80 backdrop-blur-sm rounded-2xl"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30"
            >
              <CheckCircle2 className="h-7 w-7 text-green-400" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="text-sm font-semibold text-white"
            >
              Welcome back!
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28 }}
              className="text-xs text-white/40"
            >
              Taking you to your dashboard…
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-7 select-none cursor-default">
        <h2 className="text-[18px] font-semibold text-white">Welcome Back</h2>
        <p className="mt-1 text-sm text-white/40">Sign in to your farm dashboard</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Identifier field */}
        <div className="space-y-1.5">
          <Label
            htmlFor="identifier"
            className="text-xs font-medium uppercase tracking-widest text-white/50 select-none cursor-default"
          >
            Email or Username
          </Label>
          <motion.div
            animate={
              focusedField === "identifier"
                ? { scale: 1.012 }
                : { scale: 1 }
            }
            transition={{ duration: 0.15 }}
          >
            <Input
              id="identifier"
              type="text"
              placeholder="you@seedsense.farm or username"
              autoComplete="username"
              {...register("identifier")}
              onFocus={() => setFocusedField("identifier")}
              onBlur={() => setFocusedField(null)}
              className="h-11 rounded-xl border-white/8 bg-white/5 px-4 text-sm text-white placeholder-white/20 caret-green-300 focus:border-green-500/60 focus:bg-white/[0.07] focus:ring-1 focus:ring-green-500/50 transition-all"
            />
          </motion.div>
          <AnimatePresence>
            {errors.identifier?.message && (
              <motion.p
                key="id-error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs text-red-400"
              >
                {errors.identifier.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Password field */}
        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-xs font-medium uppercase tracking-widest text-white/50 select-none cursor-default"
          >
            Password
          </Label>
          <motion.div
            animate={
              focusedField === "password"
                ? { scale: 1.012 }
                : { scale: 1 }
            }
            transition={{ duration: 0.15 }}
            className="relative"
          >
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              className="h-11 rounded-xl border-white/8 bg-white/5 px-4 pr-11 text-sm text-white placeholder-white/20 caret-green-300 focus:border-green-500/60 focus:bg-white/[0.07] focus:ring-1 focus:ring-green-500/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer focus:outline-none focus:text-white/60"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </motion.div>
          <AnimatePresence>
            {errors.password?.message && (
              <motion.p
                key="pw-error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs text-red-400"
              >
                {errors.password.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Submit button — slot-machine label transitions */}
        <motion.button
          type="submit"
          disabled={phase !== "idle"}
          whileHover={phase === "idle" ? { scale: 1.02, y: -1 } : {}}
          whileTap={phase === "idle" ? { scale: 0.97 } : {}}
          animate={
            phase === "success"
              ? { backgroundColor: "#22c55e" }
              : phase === "pending"
              ? { backgroundColor: "#16a34a" }
              : { backgroundColor: "#22c55e" }
          }
          transition={{ duration: 0.25 }}
          className="group relative w-full overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold text-[#0d1a0f] shadow-[0_8px_32px_rgba(74,222,128,0.25)] disabled:cursor-not-allowed"
          style={{ backgroundColor: "#22c55e" }}
        >
          {/* Shimmer sweep on hover */}
          <motion.span
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
            whileHover={{ translateX: "200%" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            aria-hidden="true"
          />

          {/* Slot-machine label */}
          <span className="relative flex items-center justify-center gap-2 h-5">
            <AnimatePresence mode="wait" initial={false}>
              {phase === "idle" && (
                <motion.span key="idle" variants={slot} initial="initial" animate="animate" exit="exit"
                  className="flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  Sign In
                </motion.span>
              )}
              {phase === "pending" && (
                <motion.span key="pending" variants={slot} initial="initial" animate="animate" exit="exit"
                  className="flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing In…
                </motion.span>
              )}
              {phase === "success" && (
                <motion.span key="success" variants={slot} initial="initial" animate="animate" exit="exit"
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Welcome Back!
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </motion.button>

        <div className="text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-green-400 hover:text-green-300 transition-colors focus:outline-none focus:underline"
          >
            Forgot password?
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
