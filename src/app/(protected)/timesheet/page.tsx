'use client'
import { useState, useMemo } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, parseISO, differenceInMinutes, isToday, isSameMonth,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Clock, LogIn, LogOut, Users, CalendarDays, ShieldCheck, ShieldX, ShieldOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { useTeamMonthAttendance } from '@/hooks/queries/useAttendance'
import type { AttendanceRecord } from '@/hooks/queries/useAttendance'

function dur(checkIn: string, checkOut: string | null) {
  const mins = differenceInMinutes(
    checkOut ? parseISO(checkOut) : new Date(),
    parseISO(checkIn)
  )
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function TimesheetPage() {
  const now = new Date()
  const [viewDate, setViewDate] = useState(now)
  const [selectedDay, setSelectedDay] = useState<string | null>(
    format(now, 'yyyy-MM-dd')
  )

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth() + 1

  const { data: records = [], isLoading } = useTeamMonthAttendance(year, month)

  // Group records by date
  const byDate = useMemo(() => {
    const map: Record<string, AttendanceRecord[]> = {}
    for (const r of records) {
      if (!map[r.date]) map[r.date] = []
      map[r.date].push(r)
    }
    return map
  }, [records])

  // Build calendar grid (ISO week: Mon = 0)
  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Leading empty cells: getDay returns 0=Sun; convert to Mon-start (Mon=0)
  const leadingBlanks = (getDay(monthStart) + 6) % 7

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  // Unique team members in this month
  const teamMembers = useMemo(() => {
    const seen = new Set<string>()
    const list: { user_id: number; username: string }[] = []
    for (const r of records) {
      const key = String(r.user_id)
      if (!seen.has(key)) {
        seen.add(key)
        list.push({ user_id: r.user_id, username: r.username ?? `#${r.user_id}` })
      }
    }
    return list.sort((a, b) => a.username.localeCompare(b.username))
  }, [records])

  const selectedRecords = selectedDay ? (byDate[selectedDay] ?? []) : []

  // Summary stats for the month
  const totalPresent = Object.keys(byDate).length
  const totalTeam = teamMembers.length
  const avgDuration = useMemo(() => {
    const completed = records.filter(r => r.check_in && r.check_out)
    if (!completed.length) return null
    const totalMins = completed.reduce((sum, r) =>
      sum + differenceInMinutes(parseISO(r.check_out!), parseISO(r.check_in!)), 0
    )
    const avg = Math.round(totalMins / completed.length)
    return `${Math.floor(avg / 60)}h ${avg % 60}m`
  }, [records])

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <PageHeader
        title="Timesheet"
        subtitle={`Team attendance calendar — ${format(viewDate, 'MMMM yyyy')}`}
      />

      {/* Summary stats */}
      {!isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Team Members', value: totalTeam, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Days with Records', value: totalPresent, icon: CalendarDays, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Total Check-Ins', value: records.length, icon: LogIn, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
            { label: 'Avg Shift Length', value: avgDuration ?? '—', icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          ].map(stat => (
            <Card key={stat.label} className="border border-border shadow-sm">
              <CardContent className="px-4 py-3 flex items-center gap-3">
                <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xl font-bold text-foreground leading-tight">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="xl:col-span-2 border border-border shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              {format(viewDate, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setViewDate(new Date())}>
                Today
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {isLoading ? (
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-lg bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {/* Leading blanks */}
                {Array.from({ length: leadingBlanks }).map((_, i) => (
                  <div key={`blank-${i}`} />
                ))}
                {/* Day cells */}
                {days.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const dayRecords = byDate[dateStr] ?? []
                  const hasData = dayRecords.length > 0
                  const isSelected = selectedDay === dateStr
                  const today = isToday(day)
                  const isCurrentMonth = isSameMonth(day, viewDate)

                  // Attendance rate colour
                  const rate = totalTeam > 0 ? dayRecords.length / totalTeam : 0
                  const bgClass = !hasData
                    ? ''
                    : rate >= 0.8
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                    : rate >= 0.5
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDay(dateStr)}
                      className={`relative min-h-16 rounded-lg border p-1.5 text-left transition-all hover:shadow-sm
                        ${isSelected ? 'ring-2 ring-primary border-primary' : 'border-border'}
                        ${hasData ? bgClass : 'border-transparent hover:border-border'}
                        ${today ? 'ring-1 ring-primary/40' : ''}
                        ${!isCurrentMonth ? 'opacity-30' : ''}
                      `}
                    >
                      <span className={`block text-xs font-semibold mb-1 w-5 h-5 rounded-full flex items-center justify-center
                        ${today ? 'bg-primary text-primary-foreground' : 'text-foreground'}
                      `}>
                        {format(day, 'd')}
                      </span>
                      {hasData && (
                        <div className="space-y-0.5">
                          {dayRecords.slice(0, 3).map(r => (
                            <div
                              key={r.id}
                              className="text-[9px] leading-tight truncate text-foreground/70 font-medium"
                            >
                              {r.username ?? `#${r.user_id}`}
                            </div>
                          ))}
                          {dayRecords.length > 3 && (
                            <div className="text-[9px] text-muted-foreground">
                              +{dayRecords.length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t">
              {[
                { color: 'bg-emerald-200 dark:bg-emerald-800', label: '≥80% present' },
                { color: 'bg-amber-200 dark:bg-amber-800', label: '50–79%' },
                { color: 'bg-rose-200 dark:bg-rose-800', label: '<50%' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                  <span className="text-xs text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Day detail panel */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {selectedDay ? format(parseISO(selectedDay), 'EEE, MMM d') : 'Select a day'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDay ? (
              <p className="text-sm text-muted-foreground">Click a day on the calendar to see details.</p>
            ) : selectedRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attendance recorded for this day.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-3">
                  {selectedRecords.length} of {totalTeam} team member{totalTeam !== 1 ? 's' : ''} present
                </p>
                {selectedRecords.map(rec => {
                  const complete = !!rec.check_in && !!rec.check_out
                  const working = !!rec.check_in && !rec.check_out
                  return (
                    <div
                      key={rec.id}
                      className={`rounded-lg p-2.5 border text-xs space-y-1.5 ${
                        complete
                          ? 'bg-muted/30 border-border'
                          : working
                          ? 'bg-emerald-50 dark:bg-emerald-900/15 border-emerald-200 dark:border-emerald-800'
                          : 'bg-muted/20 border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{rec.username ?? `#${rec.user_id}`}</span>
                        {working && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Working
                          </span>
                        )}
                        {complete && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {dur(rec.check_in!, rec.check_out)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        {rec.check_in && (
                          <span className="flex items-center gap-1">
                            <LogIn className="h-3 w-3 text-emerald-500" />
                            {format(parseISO(rec.check_in), 'HH:mm')}
                          </span>
                        )}
                        {rec.check_out && (
                          <span className="flex items-center gap-1">
                            <LogOut className="h-3 w-3 text-amber-500" />
                            {format(parseISO(rec.check_out), 'HH:mm')}
                          </span>
                        )}
                      </div>
                      {rec.notes && (
                        <p className="text-[10px] text-muted-foreground italic truncate">"{rec.notes}"</p>
                      )}
                      {rec.site_compliance === 'compliant' && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <ShieldCheck className="h-3 w-3" />
                          Near site {rec.site_distance_km != null ? `· ${rec.site_distance_km} km` : ''}
                        </span>
                      )}
                      {rec.site_compliance === 'non_compliant' && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                          <ShieldX className="h-3 w-3" />
                          Far from site {rec.site_distance_km != null ? `· ${rec.site_distance_km} km` : ''}
                        </span>
                      )}
                      {rec.site_compliance === 'no_location' && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                          <ShieldOff className="h-3 w-3" />
                          No GPS data
                        </span>
                      )}
                    </div>
                  )
                })}

                {/* Absent members */}
                {(() => {
                  const presentIds = new Set(selectedRecords.map(r => r.user_id))
                  const absent = teamMembers.filter(m => !presentIds.has(m.user_id))
                  if (!absent.length) return null
                  return (
                    <div className="pt-2 border-t mt-3">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                        Absent ({absent.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {absent.map(m => (
                          <span
                            key={m.user_id}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                          >
                            {m.username}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
