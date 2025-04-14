// spotify-web-playback.d.ts

declare namespace Spotify {
  interface Error {
    message: string;
  }

  interface PlayerInit {
    name: string;
    getOAuthToken: (cb: (token: string) => void) => void;
    volume?: number;
  }

  interface PlayerState {
    // Define properties based on Spotify Web Playback SDK documentation
  }

  interface Player {
    addListener(
      event: "initialization_error",
      callback: (err: Error) => void
    ): void;
    addListener(
      event: "authentication_error",
      callback: (err: Error) => void
    ): void;
    addListener(event: "account_error", callback: (err: Error) => void): void;
    addListener(event: "playback_error", callback: (err: Error) => void): void;
    addListener(
      event: "player_state_changed",
      callback: (state: PlayerState) => void
    ): void;
    addListener(
      event: "ready",
      callback: ({ device_id }: { device_id: string }) => void
    ): void;
    addListener(
      event: "not_ready",
      callback: ({ device_id }: { device_id: string }) => void
    ): void;
    connect(): Promise<boolean>;
    disconnect(): void;
    togglePlay(): Promise<void>;
    nextTrack(): Promise<void>;
    previousTrack(): Promise<void>;
    seek(position_ms: number): Promise<void>;
  }
}
