"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Monitor,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Smartphone,
  Bell,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { useAppStore } from "@/stores/appStore";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosInstance";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const hideAppDownload = useAppStore((s) => s.hideAppDownload);
  const setHideAppDownload = useAppStore((s) => s.setHideAppDownload);

  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPw.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setSuccess(false);
    try {
      await axiosInstance.post("/auth/change-password", {
        current_password: current,
        new_password: newPw,
      });
      toast.success("Password changed successfully.");
      setCurrent("");
      setNewPw("");
      setConfirm("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ?? "Failed to change password.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Settings"
        subtitle="Manage your account preferences"
      />

      {/* App & Display */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-primary" />
            App &amp; Display
          </CardTitle>
          <CardDescription>
            Control how the app download link appears in the sidebar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Show &quot;Get the App&quot; in sidebar
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Displays a quick download link for the Android APK
              </p>
            </div>
            <button
              role="switch"
              aria-checked={!hideAppDownload}
              onClick={() => setHideAppDownload(!hideAppDownload)}
              className={`
                relative inline-flex h-5 w-9 shrink-0 items-center rounded-full
                border-2 border-transparent cursor-pointer
                transition-colors duration-200 ease-in-out
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                ${!hideAppDownload ? "bg-primary" : "bg-muted-foreground/30"}
              `}
            >
              <span
                className={`
                  pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm
                  transition-transform duration-200 ease-in-out
                  ${!hideAppDownload ? "translate-x-4" : "translate-x-0"}
                `}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance / Theme */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Monitor className="h-4 w-4 text-primary" />
            Appearance
          </CardTitle>
          <CardDescription>
            Choose how the interface looks to you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {THEMES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex flex-1 flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 transition-all duration-200 cursor-pointer
                  ${
                    theme === value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {`Using ${theme} mode.`}
          </p>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your account password. You&apos;ll need your current
            password to confirm.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Current Password
              </label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder="••••••••"
                  className="h-9 pr-10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="••••••••"
                  className="h-9 pr-10"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className={`h-9 pr-10 ${confirm && confirm !== newPw ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirm && confirm !== newPw && (
                <p className="text-xs text-destructive">
                  Passwords do not match.
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || !current || !newPw || newPw !== confirm}
              className="w-full h-9 gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {loading ? "Updating…" : success ? "Updated!" : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notifications placeholder */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>
            Notification preferences coming soon.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
