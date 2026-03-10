"use client";

import { useState } from "react";
import { Sprout, LogIn, Eye, EyeOff, Loader2 } from "lucide-react";
import { useLogin } from "@/hooks/queries/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";
import { zodResolver } from "@hookform/resolvers/zod";

const usernameRegex = /^[a-zA-Z0-9._-]{3,}$/;

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email or username is required")
    .refine(
      (val) => {
        if (val.includes("@")) {
          return z.string().email().safeParse(val).success;
        }
        return usernameRegex.test(val);
      },
      {
        message:
          "Enter a valid email, or a username (min 3 chars: letters, numbers, . _ -)",
      },
    ),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const { mutate: login, isPending } = useLogin();

  const onSubmit = (values: LoginValues) => {
    login({ identifier: values.identifier, password: values.password });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0d1a0f]">
      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 -left-32 h-120 w-120 rounded-full bg-[#1a3d1f] opacity-60 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-100 w-100 rounded-full bg-[#0f2d14] opacity-70 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-75 w-150 rounded-full bg-[#163a1b] opacity-40 blur-[80px]" />

        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Decorative seed/leaf outlines */}
        <svg
          className="absolute top-8 right-10 opacity-[0.07]"
          width="220"
          height="220"
          viewBox="0 0 220 220"
          fill="none"
        >
          <circle cx="110" cy="110" r="100" stroke="#4ade80" strokeWidth="1" />
          <circle
            cx="110"
            cy="110"
            r="70"
            stroke="#4ade80"
            strokeWidth="0.5"
            strokeDasharray="4 6"
          />
          <circle cx="110" cy="110" r="40" stroke="#4ade80" strokeWidth="0.5" />
          <line
            x1="10"
            y1="110"
            x2="210"
            y2="110"
            stroke="#4ade80"
            strokeWidth="0.5"
            strokeDasharray="3 5"
          />
          <line
            x1="110"
            y1="10"
            x2="110"
            y2="210"
            stroke="#4ade80"
            strokeWidth="0.5"
            strokeDasharray="3 5"
          />
        </svg>

        <svg
          className="absolute bottom-10 left-8 opacity-[0.06]"
          width="160"
          height="160"
          viewBox="0 0 160 160"
          fill="none"
        >
          <path
            d="M80 10 C80 10 140 40 140 90 C140 130 110 150 80 150 C50 150 20 130 20 90 C20 40 80 10 80 10Z"
            stroke="#4ade80"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M80 30 C80 30 120 55 120 90 C120 118 104 135 80 135 C56 135 40 118 40 90 C40 55 80 30 80 30Z"
            stroke="#4ade80"
            strokeWidth="0.6"
            strokeDasharray="3 4"
            fill="none"
          />
        </svg>
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-105 px-4">
        {/* Logo lockup */}
        <div className="mb-10 flex flex-col items-center text-center select-none cursor-default">
          <div className="mb-5 flex h-18 w-18 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/10 shadow-[0_0_40px_rgba(74,222,128,0.15)] backdrop-blur-sm">
            <Sprout className="h-9 w-9 text-green-400" strokeWidth={1.5} />
          </div>
          <h1
            className="text-[28px] font-semibold tracking-tight text-white"
            style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}
          >
            SeedSense
          </h1>
          <p className="mt-1 text-sm font-medium tracking-[0.18em] uppercase text-green-500/70">
            Seed production tracking & analytics
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/8 bg-white/4 p-8 shadow-[0_32px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="mb-7 select-none cursor-default">
            <h2 className="text-[18px] font-semibold text-white">
              Welcome Back{" "}
            </h2>
            <p className="mt-1 text-sm text-white/40">
              Sign in to your farm dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="identifier"
                className="text-xs font-medium uppercase tracking-widest text-white/50 select-none cursor-default"
              >
                Email or Username
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="you@seedsense.farm or username"
                autoComplete="off"
                {...register("identifier")}
                className="h-11 rounded-xl border-white/8 bg-white/5 px-4 text-sm text-white placeholder-white/20 caret-green-300 focus:border-green-500/60 focus:bg-white/[0.07] focus:ring-0"
              />
              {errors.identifier?.message ? (
                <p className="text-xs text-red-400">
                  {errors.identifier.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-xs font-medium uppercase tracking-widest text-white/50 select-none cursor-default"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="off"
                  {...register("password")}
                  className="h-11 rounded-xl border-white/8 bg-white/5 px-4 pr-11 text-sm text-white placeholder-white/20 caret-green-300 focus:border-green-500/60 focus:bg-white/[0.07] focus:ring-0"
                />
                {errors.password?.message ? (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.password.message}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowPassword((v: boolean) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="group relative w-full overflow-hidden rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-[#0d1a0f] transition-all hover:bg-green-400 active:scale-[0.98] shadow-[0_8px_32px_rgba(74,222,128,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-500"
            >
              <span className="relative flex items-center justify-center gap-2 cursor-pointer">
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                )}
                {isPending ? "Signing In..." : "Sign In"}
              </span>
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-white/20 select-none cursor-default">
          © {new Date().getFullYear()} Cryptic Mage · All rights reserved
        </p>
      </div>
    </div>
  );
};

export default Login;
