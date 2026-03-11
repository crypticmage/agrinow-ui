import { Sprout } from "lucide-react";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Login",
  description: "Sign in to your farm dashboard",
};

export default function LoginPage() {
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

        <LoginForm />

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-white/20 select-none cursor-default">
          © {new Date().getFullYear()} Cryptic Mage · All rights reserved
        </p>
      </div>
    </div>
  );
}
