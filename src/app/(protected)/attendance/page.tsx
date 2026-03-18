'use client'
import { useState } from 'react'
import { format, parseISO, differenceInMinutes } from 'date-fns'
import { MapPin, Clock, LogIn, LogOut, Loader2, CheckCircle2, AlertCircle, Wind, Droplets, ThermometerSun, ShieldCheck, ShieldX, ShieldOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useWeather } from '@/hooks/useWeather'
import { useTodayAttendance, useMyAttendanceHistory, useCheckIn, useCheckOut } from '@/hooks/queries/useAttendance'
import { useAllAttendance } from '@/hooks/queries/useAttendance'
import { useAppStore } from '@/stores/appStore'
import { toast } from 'sonner'
import { LocationMapModal } from '@/components/features/attendance/LocationMapModal'

function wmoIcon(code: number) {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌦️'
  if (code <= 99) return '⛈️'
  return '🌤️'
}

function duration(checkIn: string, checkOut: string | null) {
  const mins = differenceInMinutes(
    checkOut ? parseISO(checkOut) : new Date(),
    parseISO(checkIn)
  )
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function AttendancePage() {
  const { currentUser } = useAppStore()
  const isAdminOrManager = currentUser?.role === 'admin' || currentUser?.role === 'manager'

  const { position, error: geoError, loading: geoLoading, refresh: refreshGeo } = useGeolocation()
  const { data: weather } = useWeather(position?.lat ?? null, position?.lng ?? null)

  const { data: today, isLoading: todayLoading } = useTodayAttendance()
  const { data: history = [], isLoading: histLoading } = useMyAttendanceHistory()
  const { data: allToday = [], isLoading: allLoading } = useAllAttendance()

  const checkIn = useCheckIn()
  const checkOut = useCheckOut()
  const [notes, setNotes] = useState('')
  const [mapModal, setMapModal] = useState<{ lat: number; lng: number; label?: string } | null>(null)

  const handleCheckIn = async () => {
    try {
      await checkIn.mutateAsync({
        latitude: position?.lat,
        longitude: position?.lng,
        notes: notes.trim() || undefined,
      })
      setNotes('')
      toast.success('Checked in successfully!')
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'Check-in failed.')
    }
  }

  const handleCheckOut = async () => {
    try {
      await checkOut.mutateAsync({ notes: notes.trim() || undefined })
      setNotes('')
      toast.success('Checked out successfully!')
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'Check-out failed.')
    }
  }

  const hasCheckedIn = !!today?.check_in
  const hasCheckedOut = !!today?.check_out
  const isWorking = hasCheckedIn && !hasCheckedOut

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <PageHeader title="Attendance" subtitle={format(new Date(), "EEEE, MMMM d, yyyy")} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Check-in card */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status */}
            <div className={`rounded-xl p-3 flex items-center gap-3 ${
              hasCheckedOut
                ? 'bg-muted/50 border border-border'
                : isWorking
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                : 'bg-muted/30 border border-dashed border-border'
            }`}>
              {hasCheckedOut ? (
                <CheckCircle2 className="h-5 w-5 text-muted-foreground shrink-0" />
              ) : isWorking ? (
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0 ml-1" />
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {hasCheckedOut ? 'Work day complete' : isWorking ? 'Currently working' : 'Not checked in'}
                </p>
                {today?.check_in && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    In: {format(parseISO(today.check_in), 'HH:mm')}
                    {today.check_out && ` · Out: ${format(parseISO(today.check_out), 'HH:mm')}`}
                    {today.check_in && ` · ${duration(today.check_in, today.check_out)}`}
                  </p>
                )}
              </div>
            </div>

            {/* GPS status */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {geoLoading ? (
                <span>Getting location...</span>
              ) : geoError ? (
                <span className="text-destructive">{geoError}</span>
              ) : position ? (
                <span>{position.lat.toFixed(4)}, {position.lng.toFixed(4)} (±{Math.round(position.accuracy)}m)</span>
              ) : (
                <button onClick={refreshGeo} className="underline underline-offset-2">Enable location</button>
              )}
            </div>

            {/* Notes */}
            {!hasCheckedOut && (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note (optional)..."
                rows={2}
                className="w-full resize-none rounded-lg border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            )}

            {/* Action buttons */}
            {!hasCheckedIn && (
              <Button
                onClick={handleCheckIn}
                disabled={checkIn.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {checkIn.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
                Check In
              </Button>
            )}
            {isWorking && (
              <Button
                onClick={handleCheckOut}
                disabled={checkOut.isPending}
                variant="outline"
                className="w-full border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                {checkOut.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
                Check Out
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Weather card */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-lg">{weather ? wmoIcon(weather.conditionCode) : '🌤️'}</span>
              Current Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!weather ? (
              <div className="text-sm text-muted-foreground">
                {geoLoading ? 'Detecting location...' : geoError ? 'Location unavailable' : 'Loading weather...'}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-4xl font-bold text-foreground">{weather.temp}°C</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{weather.condition}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {weather.city}{weather.country ? `, ${weather.country}` : ''}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: ThermometerSun, label: 'Feels like', value: `${weather.feelsLike}°C` },
                    { icon: Droplets, label: 'Humidity', value: `${weather.humidity}%` },
                    { icon: Wind, label: 'Wind', value: `${weather.windSpeed} km/h` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-lg bg-muted/40 p-2.5 text-center">
                      <Icon className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-semibold mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  H: {weather.high}°C &nbsp;·&nbsp; L: {weather.low}°C
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin/Manager: today's team attendance */}
      {isAdminOrManager && (
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Team Attendance — Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : allToday.length === 0 ? (
              <p className="text-sm text-muted-foreground">No check-ins recorded yet today.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">User</th>
                      <th className="pb-2 font-medium">Check In</th>
                      <th className="pb-2 font-medium">Check Out</th>
                      <th className="pb-2 font-medium">Duration</th>
                      <th className="pb-2 font-medium">Location</th>
                      <th className="pb-2 font-medium">Site Compliance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allToday.map((rec) => (
                      <tr key={rec.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="py-2.5 font-medium">{rec.username ?? `#${rec.user_id}`}</td>
                        <td className="py-2.5">{rec.check_in ? format(parseISO(rec.check_in), 'HH:mm') : '—'}</td>
                        <td className="py-2.5">{rec.check_out ? format(parseISO(rec.check_out), 'HH:mm') : (rec.check_in ? <span className="text-emerald-500 text-xs">Working</span> : '—')}</td>
                        <td className="py-2.5 text-muted-foreground text-xs">{rec.check_in ? duration(rec.check_in, rec.check_out) : '—'}</td>
                        <td className="py-2.5">
                          {rec.latitude ? (
                            <button
                              onClick={() => setMapModal({ lat: rec.latitude!, lng: rec.longitude!, label: `${rec.username} · ${format(parseISO(rec.date), 'MMM d')}` })}
                              className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-2 font-mono"
                            >
                              <MapPin className="h-3 w-3 shrink-0" />
                              {rec.latitude.toFixed(4)}, {rec.longitude?.toFixed(4)}
                            </button>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="py-2.5">
                          {rec.site_compliance === 'compliant' && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Compliant {rec.site_distance_km != null ? `(${rec.site_distance_km} km)` : ''}
                            </span>
                          )}
                          {rec.site_compliance === 'non_compliant' && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                              <ShieldX className="h-3.5 w-3.5" />
                              Far from site {rec.site_distance_km != null ? `(${rec.site_distance_km} km)` : ''}
                            </span>
                          )}
                          {rec.site_compliance === 'no_location' && (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                              <ShieldOff className="h-3.5 w-3.5" />
                              No GPS
                            </span>
                          )}
                          {(rec.site_compliance === 'no_site' || rec.site_compliance == null) && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* My history */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            My Recent History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {histLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attendance history yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Check In</th>
                    <th className="pb-2 font-medium">Check Out</th>
                    <th className="pb-2 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 14).map((rec) => (
                    <tr key={rec.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="py-2.5 font-medium">{format(parseISO(rec.date), 'EEE, MMM d')}</td>
                      <td className="py-2.5">{rec.check_in ? format(parseISO(rec.check_in), 'HH:mm') : '—'}</td>
                      <td className="py-2.5">{rec.check_out ? format(parseISO(rec.check_out), 'HH:mm') : '—'}</td>
                      <td className="py-2.5 text-muted-foreground">
                        {rec.check_in && rec.check_out ? duration(rec.check_in, rec.check_out) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {mapModal && (
        <LocationMapModal
          open={!!mapModal}
          onOpenChange={(open) => { if (!open) setMapModal(null) }}
          lat={mapModal.lat}
          lng={mapModal.lng}
          label={mapModal.label}
        />
      )}
    </div>
  )
}
