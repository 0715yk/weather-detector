export interface CurrentWeather {
  /** 위치 기준 로컬 시각 (ISO, 예: "2026-07-28T15:30") */
  time: string
  temperature: number
  uvIndex: number
  windSpeed: number
  windGusts: number
  humidity: number
}

export interface HourlyWeather {
  /** 위치 기준 로컬 시각 배열 (48시간) */
  time: string[]
  uvIndex: number[]
  windSpeed: number[]
  windGusts: number[]
  humidity: number[]
  cloudCover: number[]
  temperature: number[]
}

export interface DailyWeather {
  date: string[]
  sunrise: string[]
  sunset: string[]
}

export interface WeatherData {
  current: CurrentWeather
  hourly: HourlyWeather
  daily: DailyWeather
  timezone: string
}

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,uv_index,wind_speed_10m,wind_gusts_10m,relative_humidity_2m',
    hourly:
      'uv_index,wind_speed_10m,wind_gusts_10m,relative_humidity_2m,cloud_cover,temperature_2m',
    daily: 'sunrise,sunset',
    timezone: 'auto',
    forecast_days: '2',
  })

  const res = await fetch(`${FORECAST_URL}?${params}`)
  if (!res.ok) {
    throw new Error(`날씨 데이터를 불러오지 못했어요 (${res.status})`)
  }
  const json = await res.json()

  return {
    current: {
      time: json.current.time,
      temperature: json.current.temperature_2m,
      uvIndex: json.current.uv_index ?? 0,
      windSpeed: json.current.wind_speed_10m,
      windGusts: json.current.wind_gusts_10m,
      humidity: json.current.relative_humidity_2m,
    },
    hourly: {
      time: json.hourly.time,
      uvIndex: (json.hourly.uv_index as (number | null)[]).map((v) => v ?? 0),
      windSpeed: json.hourly.wind_speed_10m,
      windGusts: json.hourly.wind_gusts_10m,
      humidity: json.hourly.relative_humidity_2m,
      cloudCover: json.hourly.cloud_cover,
      temperature: json.hourly.temperature_2m,
    },
    daily: {
      date: json.daily.time,
      sunrise: json.daily.sunrise,
      sunset: json.daily.sunset,
    },
    timezone: json.timezone,
  }
}
