'use client'
import { useQuery } from '@tanstack/react-query'

export interface WeatherData {
  temp: number
  feelsLike: number
  humidity: number
  windSpeed: number
  condition: string
  conditionCode: number
  city: string
  country: string
  high: number
  low: number
}

// WMO weather code → human label
function wmoLabel(code: number): string {
  if (code === 0) return 'Clear Sky'
  if (code <= 3) return 'Partly Cloudy'
  if (code <= 48) return 'Foggy'
  if (code <= 57) return 'Drizzle'
  if (code <= 67) return 'Rain'
  if (code <= 77) return 'Snow'
  if (code <= 82) return 'Rain Showers'
  if (code <= 86) return 'Snow Showers'
  if (code <= 99) return 'Thunderstorm'
  return 'Unknown'
}

async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
  const [weatherRes, geoRes] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,relativehumidity_2m` +
      `&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`
    ),
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`,
      { headers: { 'Accept-Language': 'en' } }
    ),
  ])

  const weather = await weatherRes.json()
  const geo = await geoRes.json()

  const current = weather.current
  const daily = weather.daily

  const city =
    geo.address?.city ||
    geo.address?.town ||
    geo.address?.village ||
    geo.address?.county ||
    'Unknown'
  const country = geo.address?.country_code?.toUpperCase() || ''

  return {
    temp: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: current.relativehumidity_2m,
    windSpeed: Math.round(current.windspeed_10m),
    condition: wmoLabel(current.weathercode),
    conditionCode: current.weathercode,
    city,
    country,
    high: Math.round(daily.temperature_2m_max[0]),
    low: Math.round(daily.temperature_2m_min[0]),
  }
}

export function useWeather(lat: number | null, lng: number | null) {
  return useQuery({
    queryKey: ['weather', lat, lng],
    queryFn: () => fetchWeather(lat!, lng!),
    enabled: lat != null && lng != null,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  })
}
