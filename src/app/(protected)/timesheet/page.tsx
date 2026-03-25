"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  differenceInMinutes,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isToday,
  parseISO,
  startOfMonth,
} from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LogIn,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  Timer,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useTeamMonthAttendance } from "@/hooks/queries/useAttendance";
import type { AttendanceRecord } from "@/hooks/queries/useAttendance";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dur(checkIn: string, checkOut: string | null) {
  const mins = differenceInMinutes(
    checkOut ? parseISO(checkOut) : new Date(),
    parseISO(checkIn),
  );
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getAttendanceTone(rate: number) {
  if (rate >= 0.8) {
    return {
      badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-500/20",
      glow: "from-emerald-500/22 via-emerald-400/10 to-transparent",
      dot: "bg-emerald-500",
      text: "text-emerald-700 dark:text-emerald-300",
      label: "Strong turnout",
    };
  }

  if (rate >= 0.5) {
    return {
      badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
      border: "border-amber-500/20",
      glow: "from-amber-500/18 via-orange-400/8 to-transparent",
      dot: "bg-amber-500",
      text: "text-amber-700 dark:text-amber-300",
      label: "Mixed turnout",
    };
  }

  return {
    badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    border: "border-rose-500/20",
    glow: "from-rose-500/18 via-red-400/8 to-transparent",
    dot: "bg-rose-500",
    text: "text-rose-700 dark:text-rose-300",
    label: "Thin turnout",
  };
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    const start = previous.current;
    const diff = value - start;

    if (diff === 0) {
      setDisplay(value);
      return;
    }

    const duration = 700;
    const startedAt = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(start + diff * eased);
      setDisplay(next);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        previous.current = value;
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  return <>{display}</>;
}

function PresenceSparkline({
  points,
  strokeClassName,
}: {
  points: number[];
  strokeClassName: string;
}) {
  const max = Math.max(...points, 1);
  const path = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100;
      const y = 100 - (point / max) * 100;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="h-10 w-24 overflow-visible">
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={strokeClassName}
      />
    </svg>
  );
}

export default function TimesheetPage() {
  const reduceMotion = useReducedMotion();
  const now = new Date();
  const [viewDate, setViewDate] = useState(now);
  const [selectedDay, setSelectedDay] = useState(format(now, "yyyy-MM-dd"));
  const [direction, setDirection] = useState(0);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;

  const { data: records = [], isLoading } = useTeamMonthAttendance(year, month);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const leadingBlanks = (getDay(monthStart) + 6) % 7;

  const byDate = useMemo(() => {
    const map: Record<string, AttendanceRecord[]> = {};
    for (const record of records) {
      if (!map[record.date]) map[record.date] = [];
      map[record.date].push(record);
    }
    return map;
  }, [records]);

  const teamMembers = useMemo(() => {
    const seen = new Set<string>();
    const list: { user_id: number; username: string }[] = [];

    for (const record of records) {
      const key = String(record.user_id);
      if (!seen.has(key)) {
        seen.add(key);
        list.push({
          user_id: record.user_id,
          username: record.username ?? `#${record.user_id}`,
        });
      }
    }

    return list.sort((a, b) => a.username.localeCompare(b.username));
  }, [records]);

  const selectedRecords = selectedDay ? (byDate[selectedDay] ?? []) : [];
  const totalTeam = teamMembers.length;
  const activeDays = Object.keys(byDate).length;

  const avgDuration = useMemo(() => {
    const completed = records.filter(
      (record) => record.check_in && record.check_out,
    );
    if (!completed.length) return null;

    const totalMinutes = completed.reduce(
      (sum, record) =>
        sum +
        differenceInMinutes(
          parseISO(record.check_out!),
          parseISO(record.check_in!),
        ),
      0,
    );

    const avg = Math.round(totalMinutes / completed.length);
    return `${Math.floor(avg / 60)}h ${avg % 60}m`;
  }, [records]);

  const complianceRate = useMemo(() => {
    const compliant = records.filter(
      (record) => record.site_compliance === "compliant",
    ).length;
    return records.length ? Math.round((compliant / records.length) * 100) : 0;
  }, [records]);

  const liveWorkers = records.filter(
    (record) => record.check_in && !record.check_out,
  ).length;
  const todayKey = format(now, "yyyy-MM-dd");
  const todayPresence = byDate[todayKey]?.length ?? 0;

  const busiestDay = useMemo(() => {
    let best: { date: string; count: number } | null = null;
    for (const [date, dayRecords] of Object.entries(byDate)) {
      if (!best || dayRecords.length > best.count) {
        best = { date, count: dayRecords.length };
      }
    }
    return best;
  }, [byDate]);

  const attendanceCurve = days.map((day) => {
    const key = format(day, "yyyy-MM-dd");
    return byDate[key]?.length ?? 0;
  });

  const absentMembers = useMemo(() => {
    const present = new Set(selectedRecords.map((record) => record.user_id));
    return teamMembers.filter((member) => !present.has(member.user_id));
  }, [selectedRecords, teamMembers]);

  const selectedDateAttendanceRate =
    totalTeam > 0 ? selectedRecords.length / totalTeam : 0;
  const selectedTone = getAttendanceTone(selectedDateAttendanceRate);

  const stats = [
    {
      label: "Team members",
      value: totalTeam,
      eyebrow: "Roster",
      icon: Users,
      iconWrap: "bg-sky-500/15 text-sky-700 ring-sky-500/25 dark:text-sky-300",
      accent: "from-sky-500/25 via-cyan-400/10 to-transparent",
      spark: "text-sky-500/70",
      helper: todayPresence
        ? `${todayPresence} checked in today`
        : "No check-ins yet today",
    },
    {
      label: "Recorded days",
      value: activeDays,
      eyebrow: "Coverage",
      icon: CalendarDays,
      iconWrap:
        "bg-emerald-500/15 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300",
      accent: "from-emerald-500/25 via-teal-400/10 to-transparent",
      spark: "text-emerald-500/75",
      helper: busiestDay
        ? `Peak was ${format(parseISO(busiestDay.date), "MMM d")}`
        : "Waiting for first attendance day",
    },
    {
      label: "Shift average",
      value: avgDuration ?? "--",
      eyebrow: "Time on site",
      icon: Timer,
      iconWrap:
        "bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-300",
      accent: "from-amber-500/25 via-orange-400/10 to-transparent",
      spark: "text-amber-500/75",
      helper: records.length
        ? `${records.length} total activity records`
        : "No completed shifts this month",
    },
    {
      label: "On-site compliance",
      value: `${complianceRate}%`,
      eyebrow: "Accuracy",
      icon: ShieldCheck,
      iconWrap:
        "bg-violet-500/15 text-violet-700 ring-violet-500/25 dark:text-violet-300",
      accent: "from-violet-500/25 via-fuchsia-400/10 to-transparent",
      spark: "text-violet-500/75",
      helper: liveWorkers
        ? `${liveWorkers} currently clocked in`
        : "No one currently clocked in",
    },
  ];

  const prevMonth = () => {
    setDirection(-1);
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setDirection(1);
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Timesheet"
          subtitle={`Team attendance rhythm for ${format(viewDate, "MMMM yyyy")}`}
        />

        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-[28px] border border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.22),transparent_32%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(241,247,242,0.9))] p-4 shadow-[0_24px_80px_-32px_rgba(28,48,30,0.45)] sm:p-6 dark:bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_22%),linear-gradient(135deg,rgba(16,24,20,0.94),rgba(16,24,20,0.84))]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.12),transparent)] opacity-60" />
          <div className="relative grid gap-4 xl:grid-cols-[1.45fr_0.95fr] xl:gap-6">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/65 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Attendance Atlas
              </div>

              <div className="space-y-3">
                <h2 className="max-w-2xl text-2xl font-semibold leading-tight text-foreground md:text-[2rem]">
                  A more cinematic month view for your team&apos;s check-ins, gaps, and live activity.
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-[15px]">
                  The calendar now surfaces turnout patterns at a glance while the side rail
                  turns each selected day into a quick operations briefing.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "Today",
                    value: format(now, "EEE, MMM d"),
                    note: `${todayPresence} present right now`,
                  },
                  {
                    label: "Best day",
                    value: busiestDay
                      ? format(parseISO(busiestDay.date), "MMM d")
                      : "--",
                    note: busiestDay ? `${busiestDay.count} check-ins` : "No records yet",
                  },
                  {
                    label: "Coverage",
                    value: days.length ? `${Math.round((activeDays / days.length) * 100)}%` : "0%",
                    note: `${activeDays} active dates this month`,
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * index + 0.1 }}
                    className="rounded-2xl border border-white/55 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/6"
                  >
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{item.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.45 }}
              className="relative overflow-hidden rounded-[26px] border border-white/55 bg-slate-950/92 p-5 text-white shadow-[0_26px_70px_-36px_rgba(15,23,42,0.85)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.32),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.28),transparent_28%)]" />
              <div className="relative space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/55">
                      Monthly pulse
                    </p>
                    <p className="mt-2 text-3xl font-semibold">
                      {todayPresence}
                      <span className="ml-2 text-sm font-normal text-white/60">present today</span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/6 p-3">
                    <PresenceSparkline
                      points={attendanceCurve.length ? attendanceCurve : [0, 0]}
                      strokeClassName="text-emerald-300"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      label: "Live now",
                      value: liveWorkers,
                      icon: UserCheck,
                      color: "text-emerald-300",
                    },
                    {
                      label: "Month records",
                      value: records.length,
                      icon: TrendingUp,
                      color: "text-cyan-300",
                    },
                    {
                      label: "Compliance",
                      value: `${complianceRate}%`,
                      icon: ShieldCheck,
                      color: "text-fuchsia-300",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18 + index * 0.06 }}
                      className="rounded-2xl border border-white/10 bg-white/6 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <item.icon className={cn("h-4 w-4", item.color)} />
                        <span className="text-lg font-semibold">{item.value}</span>
                      </div>
                      <p className="mt-2 text-xs text-white/58">{item.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {!isLoading && (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.div
                  key={stat.label}
                  initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * index + 0.08, duration: 0.35 }}
                >
                  <Card className="group relative h-full overflow-hidden rounded-[24px] border border-border/60 bg-card/85 shadow-[0_22px_48px_-34px_rgba(15,23,42,0.45)] backdrop-blur">
                    <div
                      className={cn(
                        "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90 transition-opacity duration-300 group-hover:opacity-100",
                        stat.accent,
                      )}
                    />
                    <motion.div
                      aria-hidden
                      animate={reduceMotion ? {} : { x: ["-120%", "120%"] }}
                      transition={
                        reduceMotion
                          ? undefined
                          : {
                              duration: 3.8,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }
                      }
                      className="pointer-events-none absolute inset-y-0 w-24 -skew-x-12 bg-white/20 blur-xl"
                    />
                    <CardContent className="relative p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                            {stat.eyebrow}
                          </p>
                          <p className="mt-3 text-sm text-muted-foreground">
                            {stat.label}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-2xl ring-1",
                            stat.iconWrap,
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="mt-7 flex items-end justify-between gap-4">
                        <p className="text-3xl font-semibold tracking-tight text-foreground">
                          {typeof stat.value === "number" ? (
                            <AnimatedNumber value={stat.value} />
                          ) : (
                            stat.value
                          )}
                        </p>
                        <PresenceSparkline
                          points={
                            attendanceCurve.length
                              ? attendanceCurve.slice(-7)
                              : [0, 0]
                          }
                          strokeClassName={stat.spark}
                        />
                      </div>

                      <p className="mt-4 text-xs text-muted-foreground">
                        {stat.helper}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </section>
        )}

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_380px]">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.35 }}
            className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/90 shadow-[0_28px_70px_-40px_rgba(15,23,42,0.42)]"
          >
            <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.2),transparent_52%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_42%)]" />
            <div className="relative p-5 md:p-6">
              <div className="flex flex-col gap-4 border-b border-border/50 pb-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Calendar view
                  </div>
                  <div>
                    <AnimatePresence mode="wait">
                      <motion.h2
                        key={`${year}-${month}`}
                        initial={
                          reduceMotion
                            ? false
                            : { opacity: 0, x: direction * 18 }
                        }
                        animate={{ opacity: 1, x: 0 }}
                        exit={
                          reduceMotion
                            ? undefined
                            : { opacity: 0, x: direction * -18 }
                        }
                        transition={{ duration: 0.22 }}
                        className="text-2xl font-semibold text-foreground"
                      >
                        {format(viewDate, "MMMM yyyy")}
                      </motion.h2>
                    </AnimatePresence>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Select any day to inspect check-ins, shift length,
                      absences, and GPS compliance.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-muted/35 px-3 py-2 text-xs text-muted-foreground md:inline-flex">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    {activeDays} active days
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/80 p-1 shadow-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={prevMonth}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full px-4"
                      onClick={() => {
                        setDirection(0);
                        setViewDate(new Date());
                        setSelectedDay(format(new Date(), "yyyy-MM-dd"));
                      }}
                    >
                      Today
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={nextMonth}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div>
                  <div className="pb-2">
                    <div>
                      <div className="mb-3 grid grid-cols-7 gap-1.5 sm:gap-2">
                        {WEEKDAYS.map((day, index) => (
                          <motion.div
                            key={day}
                            initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.03 * index + 0.1 }}
                            className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
                          >
                            {day}
                          </motion.div>
                        ))}
                      </div>

                      {isLoading ? (
                        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                          {Array.from({ length: 35 }).map((_, index) => (
                            <div
                              key={index}
                              className="h-[72px] rounded-[18px] border border-border/40 bg-muted/35 animate-pulse sm:h-[108px] sm:rounded-[22px]"
                            />
                          ))}
                        </div>
                      ) : (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`${year}-${month}`}
                            initial={
                              reduceMotion
                                ? false
                                : { opacity: 0, x: direction * 40 }
                            }
                            animate={{ opacity: 1, x: 0 }}
                            exit={
                              reduceMotion
                                ? undefined
                                : { opacity: 0, x: direction * -40 }
                            }
                            transition={{ duration: 0.28, ease: "easeInOut" }}
                            className="grid grid-cols-7 gap-1.5 sm:gap-2"
                          >
                        {Array.from({ length: leadingBlanks }).map(
                          (_, index) => (
                            <div key={`blank-${index}`} />
                          ),
                        )}

                        {days.map((day, index) => {
                          const dateStr = format(day, "yyyy-MM-dd");
                          const dayRecords = byDate[dateStr] ?? [];
                          const rate =
                            totalTeam > 0 ? dayRecords.length / totalTeam : 0;
                          const tone = getAttendanceTone(rate);
                          const selected = selectedDay === dateStr;
                          const today = isToday(day);
                          const empty = dayRecords.length === 0;

                          return (
                            <motion.button
                              key={dateStr}
                              initial={
                                reduceMotion
                                  ? false
                                  : { opacity: 0, scale: 0.92 }
                              }
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                delay: index * 0.01,
                                duration: 0.22,
                              }}
                              whileHover={
                                reduceMotion
                                  ? undefined
                                  : { y: -3, scale: 1.01 }
                              }
                              whileTap={
                                reduceMotion ? undefined : { scale: 0.985 }
                              }
                              onClick={() => setSelectedDay(dateStr)}
                              className={cn(
                                "group relative min-h-[58px] overflow-hidden rounded-[16px] border p-1.5 text-left transition-all duration-200 sm:min-h-[108px] sm:rounded-[22px] sm:p-3",
                                selected
                                  ? "border-primary/45 bg-primary/[0.08] shadow-[0_14px_40px_-28px_rgba(34,197,94,0.8)] ring-1 ring-primary/35"
                                  : empty
                                    ? "border-border/45 bg-background/75 hover:border-border hover:bg-muted/25"
                                    : cn(
                                        "bg-background/90 hover:border-border/80",
                                        tone.border,
                                      ),
                              )}
                            >
                              <div
                                className={cn(
                                  "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90 transition-opacity duration-200 group-hover:opacity-100",
                                  empty
                                    ? "from-transparent to-transparent"
                                    : tone.glow,
                                )}
                              />

                                <div className="relative flex h-full flex-col">
                                  <div className="flex items-start justify-between gap-2">
                                    <div
                                      className={cn(
                                      "flex h-6 w-6 items-center justify-center rounded-xl text-[11px] font-semibold sm:h-9 sm:w-9 sm:rounded-2xl sm:text-sm",
                                      today
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "bg-muted/80 text-foreground",
                                    )}
                                  >
                                    {format(day, "d")}
                                  </div>

                                  {!empty && (
                                    <div
                                      className={cn(
                                        "rounded-full px-1.5 py-0.5 text-[8px] font-semibold sm:px-2.5 sm:py-1 sm:text-[10px]",
                                        tone.badge,
                                      )}
                                    >
                                      {dayRecords.length}
                                    </div>
                                  )}
                                </div>

                                <div className="mt-1.5 flex-1 sm:mt-3">
                                  {empty ? (
                                    <div className="flex h-full items-end sm:hidden">
                                      <div className="h-1.5 w-full rounded-full bg-foreground/6" />
                                    </div>
                                  ) : (
                                    <>
                                      <div className="sm:hidden">
                                        <div className="flex h-full flex-col justify-end gap-1">
                                          <div className="flex items-center gap-1">
                                            <span
                                              className={cn(
                                                "inline-flex h-1.5 w-1.5 rounded-full",
                                                tone.dot,
                                              )}
                                            />
                                            <span className={cn("text-[8px] font-semibold", tone.text)}>
                                              {dayRecords.length}
                                            </span>
                                          </div>
                                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/8">
                                            <div
                                              className={cn("h-full rounded-full", tone.dot)}
                                              style={{
                                                width: `${Math.max(
                                                  18,
                                                  Math.min(100, rate * 100),
                                                )}%`,
                                              }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="hidden sm:block">
                                        <div className="space-y-3">
                                          <div className="flex items-center gap-1.5">
                                            <span
                                              className={cn(
                                                "inline-flex h-2 w-2 rounded-full",
                                                tone.dot,
                                              )}
                                            />
                                            <p
                                              className={cn(
                                                "text-[11px] font-medium",
                                                tone.text,
                                              )}
                                            >
                                              {tone.label}
                                            </p>
                                          </div>

                                          <div className="flex -space-x-2">
                                            {dayRecords
                                              .slice(0, 2)
                                              .map((record) => (
                                                <div
                                                  key={record.id}
                                                  className="flex h-8 w-8 items-center justify-center rounded-full border border-background bg-foreground/5 text-[10px] font-semibold text-foreground backdrop-blur"
                                                  title={
                                                    record.username ??
                                                    `#${record.user_id}`
                                                  }
                                                >
                                                  {getInitials(
                                                    record.username ??
                                                      `#${record.user_id}`,
                                                  )}
                                                </div>
                                              ))}
                                            {dayRecords.length > 2 && (
                                              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-background bg-primary/10 text-[10px] font-semibold text-primary">
                                                +{dayRecords.length - 2}
                                              </div>
                                            )}
                                          </div>

                                          <p className="line-clamp-2 text-[11px] leading-4 text-muted-foreground">
                                            {dayRecords
                                              .slice(0, 2)
                                              .map(
                                                (record) =>
                                                  record.username ??
                                                  `#${record.user_id}`,
                                              )
                                              .join(", ")}
                                          </p>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 self-start">
                  {[
                    {
                      label: "Today turnout",
                      value: totalTeam
                        ? `${Math.round((todayPresence / totalTeam) * 100)}%`
                        : "0%",
                      note: `${todayPresence} of ${totalTeam || 0} team members`,
                    },
                    {
                      label: "Busiest day",
                      value: busiestDay ? busiestDay.count : 0,
                      note: busiestDay
                        ? format(parseISO(busiestDay.date), "EEE, MMM d")
                        : "No data yet",
                    },
                    {
                      label: "Clocked in",
                      value: liveWorkers,
                      note: liveWorkers
                        ? "Live shifts still open"
                        : "No open shifts",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.18 + index * 0.06 }}
                      className="rounded-[22px] border border-border/60 bg-muted/25 p-4"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">
                        {item.value}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.note}
                      </p>
                    </motion.div>
                  ))}

                  <div className="rounded-[22px] border border-border/60 bg-background/70 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Legend
                    </p>
                    <div className="mt-4 space-y-3">
                      {[
                        { label: "Strong turnout", color: "bg-emerald-500" },
                        { label: "Mixed turnout", color: "bg-amber-500" },
                        { label: "Thin turnout", color: "bg-rose-500" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-3"
                        >
                          <span
                            className={cn(
                              "h-2.5 w-2.5 rounded-full",
                              item.color,
                            )}
                          />
                          <span className="text-sm text-muted-foreground">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.aside
            initial={reduceMotion ? false : { opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28, duration: 0.35 }}
            className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/95 shadow-[0_26px_72px_-42px_rgba(15,23,42,0.45)]"
          >
            <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),transparent_48%)]" />
            <div className="relative p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Day briefing
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-foreground">
                    {selectedDay
                      ? format(parseISO(selectedDay), "EEE, MMM d")
                      : "Select a day"}
                  </h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Clock3 className="h-5 w-5" />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {!selectedDay ? (
                  <motion.div
                    key="empty"
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                    className="flex min-h-[420px] flex-col items-center justify-center text-center"
                  >
                    <CalendarDays className="h-12 w-12 text-muted-foreground/25" />
                    <p className="mt-4 text-sm font-medium text-foreground">
                      Pick a date from the calendar
                    </p>
                    <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                      We&apos;ll summarize everyone who checked in, who stayed
                      absent, and how compliant the day looked.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={selectedDay}
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                    className="mt-5 space-y-4"
                  >
                    <div
                      className={cn(
                        "rounded-[24px] border p-4",
                        selectedRecords.length
                          ? cn(
                              "bg-gradient-to-br",
                              selectedTone.glow,
                              selectedTone.border,
                            )
                          : "border-border/60 bg-muted/20",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                            Present today
                          </p>
                          <p className="mt-2 text-3xl font-semibold text-foreground">
                            {selectedRecords.length}
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                              / {totalTeam || 0}
                            </span>
                          </p>
                        </div>
                        <div
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            selectedTone.badge,
                          )}
                        >
                          {selectedRecords.length
                            ? selectedTone.label
                            : "No turnout"}
                        </div>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-foreground/8">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={reduceMotion ? false : { width: 0 }}
                          animate={{
                            width: `${Math.max(0, Math.min(100, selectedDateAttendanceRate * 100))}%`,
                          }}
                          transition={{ duration: 0.55, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {selectedRecords.length === 0 ? (
                      <div className="rounded-[24px] border border-dashed border-border/70 bg-muted/15 px-5 py-10 text-center">
                        <UserX className="mx-auto h-10 w-10 text-muted-foreground/25" />
                        <p className="mt-4 text-sm font-medium text-foreground">
                          No attendance records for this day
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Try another date to inspect shift details and
                          compliance.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedRecords.map((record, index) => {
                          const complete = Boolean(
                            record.check_in && record.check_out,
                          );
                          const live = Boolean(
                            record.check_in && !record.check_out,
                          );
                          const name = record.username ?? `#${record.user_id}`;

                          return (
                            <motion.div
                              key={record.id}
                              initial={
                                reduceMotion ? false : { opacity: 0, x: 14 }
                              }
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.03 * index }}
                              whileHover={reduceMotion ? undefined : { y: -2 }}
                              className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-semibold text-primary ring-1 ring-primary/15">
                                    {getInitials(name)}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-foreground">
                                      {name}
                                    </p>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                      {live && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                                          <motion.span
                                            className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                                            animate={
                                              reduceMotion
                                                ? undefined
                                                : { opacity: [1, 0.35, 1] }
                                            }
                                            transition={{
                                              duration: 1.4,
                                              repeat: Infinity,
                                            }}
                                          />
                                          Active shift
                                        </span>
                                      )}
                                      {complete && (
                                        <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-700 dark:text-sky-300">
                                          {dur(
                                            record.check_in!,
                                            record.check_out,
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                {record.check_in && (
                                  <div className="rounded-2xl border border-border/50 bg-muted/20 p-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <LogIn className="h-3.5 w-3.5 text-emerald-500" />
                                      Check-in
                                    </div>
                                    <p className="mt-2 text-sm font-semibold text-foreground">
                                      {format(
                                        parseISO(record.check_in),
                                        "HH:mm",
                                      )}
                                    </p>
                                  </div>
                                )}

                                <div className="rounded-2xl border border-border/50 bg-muted/20 p-3">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <LogOut className="h-3.5 w-3.5 text-amber-500" />
                                    Check-out
                                  </div>
                                  <p className="mt-2 text-sm font-semibold text-foreground">
                                    {record.check_out
                                      ? format(
                                          parseISO(record.check_out),
                                          "HH:mm",
                                        )
                                      : "Still working"}
                                  </p>
                                </div>
                              </div>

                              {record.notes && (
                                <div className="mt-3 rounded-2xl bg-primary/6 px-3 py-2 text-xs leading-5 text-muted-foreground">
                                  &ldquo;{record.notes}&rdquo;
                                </div>
                              )}

                              {record.site_compliance &&
                                record.site_compliance !== "no_site" && (
                                  <div className="mt-3">
                                    {record.site_compliance === "compliant" && (
                                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/12 px-3 py-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        Near site
                                        {record.site_distance_km != null
                                          ? ` · ${record.site_distance_km} km`
                                          : ""}
                                      </div>
                                    )}

                                    {record.site_compliance ===
                                      "non_compliant" && (
                                      <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/12 px-3 py-1.5 text-[11px] font-medium text-rose-700 dark:text-rose-300">
                                        <ShieldAlert className="h-3.5 w-3.5" />
                                        Far from site
                                        {record.site_distance_km != null
                                          ? ` · ${record.site_distance_km} km`
                                          : ""}
                                      </div>
                                    )}

                                    {record.site_compliance ===
                                      "no_location" && (
                                      <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/12 px-3 py-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                                        <ShieldOff className="h-3.5 w-3.5" />
                                        GPS unavailable
                                      </div>
                                    )}
                                  </div>
                                )}
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    {absentMembers.length > 0 && (
                      <div className="rounded-[24px] border border-border/60 bg-muted/20 p-4">
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                          <UserX className="h-3.5 w-3.5" />
                          Absent team
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {absentMembers.map((member) => (
                            <span
                              key={member.user_id}
                              className="rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground"
                            >
                              {member.username}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        </section>
      </div>
    </PageTransition>
  );
}
