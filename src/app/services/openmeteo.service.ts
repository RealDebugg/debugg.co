import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    temperature_2m: string;
    weather_code: string;
    interval: string;
    time: string;
  }
  current: {
    temperature_2m: number;
    weather_code: number;
    interval: number;
    time: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class OpenMeteoService {
  private readonly API_BASE = 'https://api.open-meteo.com/v1/forecast?latitude=58.2837&longitude=12.2886&current=temperature_2m,weather_code';

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly unit = signal<string>("°C");
  readonly temp = signal<number>(0);
  readonly weather = signal<string>("unpredictable skies");

  private readonly weatherTextByCode: Record<number, string> = {
    0: 'Clear skies',
    1: 'Mostly clear skies',
    2: 'Partly cloudy skies',
    3: 'Overcast skies',
    45: 'Foggy conditions',
    48: 'Icy fog',
    51: 'Light drizzle',
    53: 'Steady drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Light rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Light snowfall',
    73: 'Steady snowfall',
    75: 'Heavy snowfall',
    77: 'Snow grains',
    80: 'Light rain showers',
    81: 'Moderate rain showers',
    82: 'Intense rain showers',
    85: 'Light snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Hail thunderstorm',
    99: 'Severe hail thunderstorm',
  };

  constructor(private http: HttpClient) {}

  fetch(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<OpenMeteoResponse>(this.API_BASE, { })
      .subscribe({
        next: (res) => {
          if (!res) {
            this.loading.set(false);
            return;
          }

          this.unit.set(res.current_units.temperature_2m);
          this.temp.set(res.current.temperature_2m);
          this.weather.set(this.weatherTextByCode[res.current.weather_code] ?? 'unpredictable skies');

          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.message ?? 'Failed to fetch Last.fm data.');
          this.loading.set(false);
        },
      });
  }
}
