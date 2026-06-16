import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface LastfmTrack {
  name: string;
  artist: string;
  album: string;
  url: string;
  image: string; // extralarge image URL
  nowPlaying: boolean;
  playedAt: Date | null; // null if currently playing
}

interface LastfmImage {
  '#text': string;
  size: 'small' | 'medium' | 'large' | 'extralarge';
}

interface LastfmRawTrack {
  name: string;
  artist: { '#text': string };
  album: { '#text': string };
  url: string;
  image: LastfmImage[];
  date?: { uts: string; '#text': string };
  '@attr'?: { nowplaying: string };
}

interface LastfmRecentTracksResponse {
  recenttracks: {
    track: LastfmRawTrack[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class LastfmService {
  private readonly API_BASE = 'https://ws.audioscrobbler.com/2.0/';

  // Set these to your Last.fm credentials
  private readonly API_KEY = environment.lastFmApiKey;
  private readonly USERNAME = environment.lastFmUsername;

  readonly track = signal<LastfmTrack | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly nowPlaying = computed(() => this.track()?.nowPlaying ?? false);

  private pollInterval?: ReturnType<typeof setInterval>;

  constructor(private http: HttpClient) {}

  /**
   * Fetch the most recent (or currently playing) track once.
   */
  fetch(): void {
    if (!this.API_KEY || !this.USERNAME) {
      this.error.set('Last.fm API key and username are required.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const params = new HttpParams()
      .set('method', 'user.getRecentTracks')
      .set('user', this.USERNAME)
      .set('api_key', this.API_KEY)
      .set('limit', '1')
      .set('format', 'json');

    this.http
      .get<LastfmRecentTracksResponse>(this.API_BASE, { params })
      .subscribe({
        next: (res) => {
          const raw = res.recenttracks?.track?.[0];
          if (!raw) {
            this.track.set(null);
            this.loading.set(false);
            return;
          }

          const isNowPlaying = raw['@attr']?.nowplaying === 'true';
          const extraLarge = raw.image.find((i) => i.size === 'extralarge');
          const imageFallback = raw.image[raw.image.length - 1];

          this.track.set({
            name: raw.name,
            artist: raw.artist['#text'],
            album: raw.album['#text'],
            url: raw.url,
            image: extraLarge?.['#text'] ?? imageFallback?.['#text'] ?? '',
            nowPlaying: isNowPlaying,
            playedAt: raw.date ? new Date(Number(raw.date.uts) * 1000) : null,
          });

          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.message ?? 'Failed to fetch Last.fm data.');
          this.loading.set(false);
        },
      });
  }

  /**
   * Start polling every `intervalMs` milliseconds (default: 30s).
   * Fetches immediately, then on each interval.
   */
  startPolling(intervalMs = 30_000): void {
    this.fetch();
    this.pollInterval = setInterval(() => this.fetch(), intervalMs);
  }

  stopPolling(): void {
    if (this.pollInterval !== undefined) {
      clearInterval(this.pollInterval);
      this.pollInterval = undefined;
    }
  }
}
