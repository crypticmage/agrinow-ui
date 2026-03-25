"use client";
import { useState, useEffect } from "react";
import { format, parseISO, differenceInMinutes } from "date-fns";
import {
  MapPin,
  Clock,
  LogIn,
  LogOut,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wind,
  Droplets,
  ThermometerSun,
  ShieldCheck,
  ShieldX,
  ShieldOff,
  Users,
  CalendarDays,
  Timer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";
import {
  useTodayAttendance,
  useMyAttendanceHistory,
  useCheckIn,
  useCheckOut,
} from "@/hooks/queries/useAttendance";
import { useAllAttendance } from "@/hooks/queries/useAttendance";
import { useAppStore } from "@/stores/appStore";
import { toast } from "sonner";
import { LocationMapModal } from "@/components/features/attendance/LocationMapModal";

function wmoIcon(code: number) {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌦️";
  if (code <= 99) return "⛈️";
  return "🌤️";
}

function duration(checkIn: string, checkOut: string | null) {
  const mins = differenceInMinutes(
    checkOut ? parseISO(checkOut) : new Date(),
    parseISO(checkIn),
  );
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="text-center">
      <p className="text-4xl font-bold text-foreground tracking-tight tabular-nums">
        {format(now, "HH:mm:ss")}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {format(now, "EEEE, MMM d")}
      </p>
    </div>
  );
}

export default function AttendancePage() {
  const { currentUser } = useAppStore();
  const isAdminOrManager =
    currentUser?.role === "admin" || currentUser?.role === "manager";

  const {
    position,
    error: geoError,
    loading: geoLoading,
    refresh: refreshGeo,
  } = useGeolocation();
  const { data: weather } = useWeather(
    position?.lat ?? null,
    position?.lng ?? null,
  );

  const { data: today, isLoading: todayLoading } = useTodayAttendance();
  const { data: history = [], isLoading: histLoading } =
    useMyAttendanceHistory();
  const { data: allToday = [], isLoading: allLoading } = useAllAttendance();

  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const [notes, setNotes] = useState("");
  const [mapModal, setMapModal] = useState<{
    lat: number;
    lng: number;
    label?: string;
  } | null>(null);
  const [punchFlash, setPunchFlash] = useState(false);

  const handleCheckIn = async () => {
    try {
      await checkIn.mutateAsync({
        latitude: position?.lat,
        longitude: position?.lng,
        notes: notes.trim() || undefined,
      });
      setNotes("");
      setPunchFlash(true);
      setTimeout(() => setPunchFlash(false), 900);
      toast.success("Checked in successfully!");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Check-in failed.");
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut.mutateAsync({ notes: notes.trim() || undefined });
      setNotes("");
      toast.success("Checked out successfully!");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Check-out failed.");
    }
  };

  const hasCheckedIn = !!today?.check_in;
  const hasCheckedOut = !!today?.check_out;
  const isWorking = hasCheckedIn && !hasCheckedOut;

  const totalCheckedIn = allToday.filter((r) => r.check_in).length;
  const totalCheckedOut = allToday.filter((r) => r.check_out).length;
  const stillWorking = totalCheckedIn - totalCheckedOut;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        subtitle={format(new Date(), "EEEE, MMMM d, yyyy")}
      />

      {/* ── Row 1: 4-column dashboard grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* Card 1: Clock + Status */}
        <Card className="border border-border shadow-sm overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Timer className="h-3.5 w-3.5" />
              Current Time
            </div>
            <LiveClock />
            {/* Status pill */}
            <div
              className={`rounded-lg px-3 py-2 flex items-center gap-2 text-sm ${
                hasCheckedOut
                  ? "bg-muted/50 text-muted-foreground"
                  : isWorking
                    ? "bg-success/10 text-success"
                    : "bg-muted/30 text-muted-foreground"
              }`}
            >
              {hasCheckedOut ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : isWorking ? (
                <div className="w-2 h-2 rounded-full bg-success animate-pulse shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span className="font-medium text-xs">
                {hasCheckedOut
                  ? "Day complete"
                  : isWorking
                    ? "Working"
                    : "Not checked in"}
              </span>
              {today?.check_in && (
                <span className="ml-auto text-xs font-mono opacity-70">
                  {duration(today.check_in, today.check_out)}
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Card 2: Check In / Check Out action */}
        <Card className="border border-border shadow-sm overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5" />
              Punch Clock
            </div>

            {/* Time display */}
            {today?.check_in && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-success/10 flex items-center justify-center">
                    <LogIn className="h-3 w-3 text-success" />
                  </div>
                  <span className="font-mono font-medium">
                    {format(parseISO(today.check_in), "HH:mm")}
                  </span>
                </div>
                {today.check_out && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-warning/10 flex items-center justify-center">
                      <LogOut className="h-3 w-3 text-warning" />
                    </div>
                    <span className="font-mono font-medium">
                      {format(parseISO(today.check_out), "HH:mm")}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* GPS */}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              {geoLoading ? (
                <span>Getting location...</span>
              ) : geoError ? (
                <span className="text-destructive">{geoError}</span>
              ) : position ? (
                <span>
                  {position.lat.toFixed(4)}, {position.lng.toFixed(4)} (±
                  {Math.round(position.accuracy)}m)
                </span>
              ) : (
                <button
                  onClick={refreshGeo}
                  className="underline underline-offset-2"
                >
                  Enable location
                </button>
              )}
            </div>

            {/* Notes */}
            {!hasCheckedOut && (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Note (optional)..."
                rows={1}
                className="w-full resize-none rounded-md border bg-muted/50 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            )}

            {/* Action */}
            {!hasCheckedIn && (
              <motion.button
                onClick={handleCheckIn}
                disabled={checkIn.isPending}
                whileTap={{ scale: 0.94 }}
                animate={
                  punchFlash
                    ? {
                        scale: [1, 1.07, 0.98, 1],
                        transition: {
                          duration: 0.45,
                          times: [0, 0.3, 0.7, 1],
                        },
                      }
                    : { scale: 1 }
                }
                className="relative w-full overflow-hidden h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <AnimatePresence>
                  {punchFlash && (
                    <motion.span
                      key="ripple"
                      initial={{ scale: 0, opacity: 0.5 }}
                      animate={{ scale: 3.5, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="pointer-events-none absolute inset-0 m-auto h-full aspect-square rounded-full bg-white"
                      aria-hidden="true"
                    />
                  )}
                </AnimatePresence>
                <span className="relative flex items-center gap-2">
                  {checkIn.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : punchFlash ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )}
                  {checkIn.isPending
                    ? "Checking In..."
                    : punchFlash
                      ? "Checked In!"
                      : "Check In"}
                </span>
              </motion.button>
            )}
            {isWorking && (
              <Button
                onClick={handleCheckOut}
                disabled={checkOut.isPending}
                variant="outline"
                className="w-full h-10 border-warning text-warning hover:bg-warning/10"
              >
                {checkOut.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Check Out
              </Button>
            )}
            {hasCheckedOut && (
              <div className="flex items-center justify-center gap-2 py-2 rounded-lg bg-muted/30 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                Done for today
              </div>
            )}
          </div>
        </Card>

        {/* Card 3: Weather */}
        <Card className="border border-border shadow-sm overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span className="text-sm">
                {weather ? wmoIcon(weather.conditionCode) : "🌤️"}
              </span>
              Weather
            </div>
            {!weather ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <ThermometerSun className="h-8 w-8 text-muted-foreground/20 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {geoLoading
                    ? "Detecting location..."
                    : geoError
                      ? "Location unavailable"
                      : "Loading..."}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-baseline justify-between">
                  <p className="text-4xl font-bold text-foreground tracking-tight">
                    {weather.temp}°
                  </p>
                  <div className="text-right text-[11px] text-muted-foreground leading-relaxed">
                    <p>H {weather.high}° / L {weather.low}°</p>
                    <p>Feels {weather.feelsLike}°</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {weather.city}
                  {weather.country ? `, ${weather.country}` : ""} ·{" "}
                  {weather.condition}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-muted/40 p-2 text-center">
                    <Droplets className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-0.5" />
                    <p className="text-xs font-semibold">{weather.humidity}%</p>
                    <p className="text-[10px] text-muted-foreground">
                      Humidity
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-2 text-center">
                    <Wind className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-0.5" />
                    <p className="text-xs font-semibold">
                      {weather.windSpeed}
                    </p>
                    <p className="text-[10px] text-muted-foreground">km/h</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Card 4: Quick Stats (admin) or My Summary */}
        <Card className="border border-border shadow-sm overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Users className="h-3.5 w-3.5" />
              {isAdminOrManager ? "Team Summary" : "My Summary"}
            </div>
            {isAdminOrManager && !allLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Checked In",
                    value: totalCheckedIn,
                    color: "text-success",
                    bg: "bg-success/10",
                  },
                  {
                    label: "Checked Out",
                    value: totalCheckedOut,
                    color: "text-muted-foreground",
                    bg: "bg-muted",
                  },
                  {
                    label: "Working",
                    value: stillWorking,
                    color: "text-primary",
                    bg: "bg-primary/10",
                  },
                  {
                    label: "My Time",
                    value: today?.check_in
                      ? duration(today.check_in, today.check_out)
                      : "—",
                    color: "text-warning",
                    bg: "bg-warning/10",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`rounded-lg ${s.bg} p-3 text-center`}
                  >
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg bg-muted/40 p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {today?.check_in
                      ? duration(today.check_in, today.check_out)
                      : "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Today&apos;s Duration
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-muted/40 p-2">
                    <p className="text-sm font-semibold">
                      {today?.check_in
                        ? format(parseISO(today.check_in), "HH:mm")
                        : "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">In</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-2">
                    <p className="text-sm font-semibold">
                      {today?.check_out
                        ? format(parseISO(today.check_out), "HH:mm")
                        : "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Out</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Row 2: History + Team Attendance ── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* My Recent History */}
        <Card className="border border-border shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
              <CalendarDays className="h-3.5 w-3.5" />
              My History
            </div>
            {histLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CalendarDays className="h-8 w-8 text-muted-foreground/20 mb-2" />
                <p className="text-xs text-muted-foreground">
                  No history yet.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {history.slice(0, 8).map((rec) => {
                  const complete = !!rec.check_in && !!rec.check_out;
                  return (
                    <div
                      key={rec.id}
                      className="flex items-center gap-2.5 rounded-md px-2 py-2 hover:bg-muted/40 transition-colors"
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${complete ? "bg-success" : "bg-warning"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground leading-none">
                          {format(parseISO(rec.date), "EEE, MMM d")}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {rec.check_in
                            ? format(parseISO(rec.check_in), "HH:mm")
                            : "—"}{" "}
                          →{" "}
                          {rec.check_out
                            ? format(parseISO(rec.check_out), "HH:mm")
                            : "—"}
                        </p>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                        {rec.check_in && rec.check_out
                          ? duration(rec.check_in, rec.check_out)
                          : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Team Attendance Table — spans 3 cols */}
        {isAdminOrManager ? (
          <Card className="xl:col-span-3 border border-border shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <Users className="h-3.5 w-3.5" />
                  Team Attendance — Today
                </div>
                {!allLoading && allToday.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {totalCheckedIn} in · {stillWorking} working
                  </span>
                )}
              </div>
              {allLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : allToday.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Users className="h-10 w-10 text-muted-foreground/15 mb-3" />
                  <p className="text-sm font-medium text-foreground">
                    No check-ins yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Team attendance will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-5">
                  <div className="min-w-[650px] px-5">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground text-xs">
                          <th className="pb-2.5 font-medium">User</th>
                          <th className="pb-2.5 font-medium">Check In</th>
                          <th className="pb-2.5 font-medium">Check Out</th>
                          <th className="pb-2.5 font-medium">Duration</th>
                          <th className="pb-2.5 font-medium">Location</th>
                          <th className="pb-2.5 font-medium">Compliance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allToday.map((rec) => (
                          <tr
                            key={rec.id}
                            className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                                  {(rec.username ?? `#${rec.user_id}`)
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                                <span className="font-medium text-sm">
                                  {rec.username ?? `#${rec.user_id}`}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 font-mono text-sm">
                              {rec.check_in
                                ? format(parseISO(rec.check_in), "HH:mm")
                                : "—"}
                            </td>
                            <td className="py-3">
                              {rec.check_out ? (
                                <span className="font-mono text-sm">
                                  {format(parseISO(rec.check_out), "HH:mm")}
                                </span>
                              ) : rec.check_in ? (
                                <span className="inline-flex items-center gap-1.5 text-success text-xs font-medium">
                                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                  Working
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="py-3 text-muted-foreground text-xs font-mono">
                              {rec.check_in
                                ? duration(rec.check_in, rec.check_out)
                                : "—"}
                            </td>
                            <td className="py-3">
                              {rec.latitude ? (
                                <button
                                  onClick={() =>
                                    setMapModal({
                                      lat: rec.latitude!,
                                      lng: rec.longitude!,
                                      label: `${rec.username} · ${format(parseISO(rec.date), "MMM d")}`,
                                    })
                                  }
                                  className="flex items-center gap-1 text-xs text-success hover:underline underline-offset-2 font-mono"
                                >
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  {rec.latitude.toFixed(4)},{" "}
                                  {rec.longitude?.toFixed(4)}
                                </button>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="py-3">
                              {rec.site_compliance === "compliant" && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  OK
                                  {rec.site_distance_km != null
                                    ? ` (${rec.site_distance_km}km)`
                                    : ""}
                                </span>
                              )}
                              {rec.site_compliance === "non_compliant" && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                                  <ShieldX className="h-3.5 w-3.5" />
                                  Far
                                  {rec.site_distance_km != null
                                    ? ` (${rec.site_distance_km}km)`
                                    : ""}
                                </span>
                              )}
                              {rec.site_compliance === "no_location" && (
                                <span className="inline-flex items-center gap-1 text-xs text-warning">
                                  <ShieldOff className="h-3.5 w-3.5" />
                                  No GPS
                                </span>
                              )}
                              {(rec.site_compliance === "no_site" ||
                                rec.site_compliance == null) && (
                                <span className="text-xs text-muted-foreground">
                                  —
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <div className="xl:col-span-3" />
        )}
      </div>

      {mapModal && (
        <LocationMapModal
          open={!!mapModal}
          onOpenChange={(open) => {
            if (!open) setMapModal(null);
          }}
          lat={mapModal.lat}
          lng={mapModal.lng}
          label={mapModal.label}
        />
      )}
    </div>
  );
}
