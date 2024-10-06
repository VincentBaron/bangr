import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Set } from "../pages/SetsPage";
import { Track } from "../pages/SetsPage";

interface SpotifyPlayerProps {
  set: Set;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

interface PlayerState {
  track_window: {
    current_track: {
      id: string;
      name: string;
      artists: { name: string }[];
    };
  };
  paused: boolean;
}

export default function SpotifyPlayer({ set }: SpotifyPlayerProps) {
  const [playingTrack, setPlayingTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.id = "spotify-player";
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      if (!playerRef.current) {
        const access_token: string = Cookies.get(
          "SpotifyAuthorization"
        ) as string;
        const player = new window.Spotify.Player({
          name: "Web Playback SDK Quick Start Player",
          getOAuthToken: (cb: (token: string) => void) => {
            cb(access_token);
          },
        });

        playerRef.current = player;

        player.addListener("ready", ({ device_id }: { device_id: string }) => {
          console.log("Ready with Device ID", device_id);
          axios.get(
            `http://localhost:8080/player?action=activate&device_id=${device_id}&&playlist_link=${set.link}`,
            { withCredentials: true }
          );
        });

        player.addListener(
          "not_ready",
          ({ device_id }: { device_id: string }) => {
            console.log("Device ID has gone offline", device_id);
          }
        );

        player.addListener("player_state_changed", (state: PlayerState) => {
          if (state) {
            setPlayingTrack({
              id: state.track_window.current_track.id,
              name: state.track_window.current_track.name,
              artist: state.track_window.current_track.artists[0].name,
              uri: "spotify:track:" + state.track_window.current_track.id,
              liked: false,
            });
            setIsPlaying(!state.paused);
          }
        });

        player.connect();
      }
    };
  }, [set]);

  const togglePlayPause = () => {
    console.log("playing track uri" + playingTrack?.uri);
    console.log("set track uri" + set.tracks[0].uri);
    const player = playerRef.current;
    if (player) {
      player
        .togglePlay()
        .then(() => {
          setIsPlaying(!isPlaying);
        })
        .catch((error: any) => {
          console.error("Failed to toggle play/pause", error);
        });
    }
  };

  const playNextTrack = () => {
    const player = playerRef.current;
    if (player) {
      player.nextTrack().catch((error: any) => {
        console.error("Failed to play next track", error);
      });
    }
  };

  const playPreviousTrack = () => {
    const player = playerRef.current;
    if (player) {
      player.previousTrack().catch((error: any) => {
        console.error("Failed to play previous track", error);
      });
    }
  };

  const likeSong = (trackID: string) => () => {
    axios.put(
      `http://localhost:8080/tracks/${trackID}/like`,
      {},
      { withCredentials: true }
    );
  };

  return (
    <div className="flex flex-col items-center">
      {playingTrack && (
        <div className="border border-gray-300 p-4 mb-10 my-2 w-full max-w-md bg-purple-200">
          <div className="flex justify-between items-center">
            <div className="flex-1 truncate">
              <span className="text-blue-500">{playingTrack.name}</span>
              <span className="mx-2">-</span>
              <span className="text-black">{playingTrack.artist}</span>
            </div>
            <div>
              {playingTrack.uri !== set?.tracks?.[0]?.uri && (
                <button className="btn-spotify" onClick={playPreviousTrack}>
                  PREV
                </button>
              )}
              <button className="btn-spotify mx-2" onClick={togglePlayPause}>
                {isPlaying ? "PAUSE" : "PLAY"}
              </button>
              {playingTrack.uri !==
                set?.tracks?.[set.tracks.length - 1]?.uri && (
                <button className="btn-spotify" onClick={playNextTrack}>
                  NEXT
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {set &&
        set.tracks?.map((track) => (
          <div
            key={track.id}
            className={`border border-gray-300 p-4 my-2 w-full max-w-md flex justify-between items-center ${
              playingTrack && playingTrack.uri === track.uri
                ? "bg-yellow-200"
                : ""
            }`}
          >
            <div className="flex-1 truncate">
              <span className="text-blue-500">{track.name}</span>
              <span className="mx-2">-</span>
              <span className="text-black">{track.artist}</span>
            </div>
            {track.liked ? (
              <p className="text-green-500">Liked</p>
            ) : (
              <button className="btn-spotify" onClick={likeSong(track.id)}>
                Like
              </button>
            )}
          </div>
        ))}
    </div>
  );
}
