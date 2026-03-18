"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sprout, LogIn, Eye, EyeOff, Loader2 } from "lucide-react";
import { useLogin } from "@/hooks/queries/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppStore } from "@/stores/appStore";

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
      }
    ),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const { mutate: login, isPending } = useLogin();
  const logout = useAppStore((s) => s.logout);

  useEffect(() => {
    logout();
  }, [logout]);

  const onSubmit = (values: LoginValues) => {
    login({ identifier: values.identifier, password: values.password });
  };

  return (
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
            className="h-11 rounded-xl border-white/8 bg-white/5 px-4 text-sm text-white placeholder-white/20 caret-green-300 focus:border-green-500/60 focus:bg-white/[0.07] focus:ring-1 focus:ring-green-500/50"
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
              className="h-11 rounded-xl border-white/8 bg-white/5 px-4 pr-11 text-sm text-white placeholder-white/20 caret-green-300 focus:border-green-500/60 focus:bg-white/[0.07] focus:ring-1 focus:ring-green-500/50"
            />
            {errors.password?.message ? (
              <p className="mt-1 text-xs text-red-400">
                {errors.password.message}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => setShowPassword((v: boolean) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
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
        <div className="text-center text-sm">
          <Link href="/forgot-password" className="text-green-400 hover:text-green-300 transition-colors">
            Forgot password?
          </Link>
        </div>
      </form>
    </div>
  );
}
