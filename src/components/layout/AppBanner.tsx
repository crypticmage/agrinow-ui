"use client";

import { useState, useEffect } from "react";
import { Smartphone, X, Download, Sprout } from "lucide-react";
import { useAppStore } from "@/stores/appStore";

export function AppBanner() {
  const appBannerDismissed = useAppStore((s) => s.appBannerDismissed);
  const dismissAppBanner = useAppStore((s) => s.dismissAppBanner);
  const [visible, setVisible] = useState(false);

  // Wait for hydration before showing
  useEffect(() => {
    if (!appBannerDismissed) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, [appBannerDismissed]);

  if (appBannerDismissed || !visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => dismissAppBanner(), 300);
  };

  return (
    <div
      className={`
        mx-4 md:mx-6 mb-4 md:mb-6
        rounded-xl border border-primary/20 bg-linear-to-r
        from-primary/10 via-secondary/5 to-primary/10
        backdrop-blur-sm shadow-sm
        transition-all duration-300 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
      `}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Icon */}
        <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
          <Smartphone className="h-5 w-5 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Sprout className="h-3.5 w-3.5 text-primary shrink-0" />
            <p className="text-sm font-semibold text-foreground">
              SeedSense is on Android!
            </p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Manage your fields, track crop stages, and monitor attendance right
            from your phone.
          </p>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex items-center gap-2">
          <a
            href="/SeedSense.apk"
            download="SeedSense.apk"
            onClick={handleDismiss}
            className="
              inline-flex items-center gap-1.5 px-3 py-1.5
              rounded-lg bg-primary text-primary-foreground
              text-xs font-medium
              hover:bg-primary/90 active:scale-95
              transition-all duration-150 shadow-sm
            "
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download</span>
          </a>
          <button
            onClick={handleDismiss}
            className="
              flex h-7 w-7 items-center justify-center rounded-lg
              text-muted-foreground hover:text-foreground
              hover:bg-foreground/8
              transition-colors duration-150
            "
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
