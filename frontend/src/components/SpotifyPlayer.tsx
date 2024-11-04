import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Set, Track } from "../pages/SetsPage";
import { usePlayer } from "../context/PlayerContext";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface SpotifyPlayerProps {
  set: Set;
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
  const { player } = usePlayer();

  useEffect(() => {
    if (player) {
      (player as any).addListener(
        "player_state_changed",
        (state: PlayerState) => {
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
        }
      );
    }
  }, [player]);

  const togglePlayPause = useCallback(() => {
    if (player) {
      player
        .togglePlay()
        .then(() => {
          setIsPlaying((prev) => !prev);
        })
        .catch((error: any) => {
          console.error("Failed to toggle play/pause", error);
        });
    }
  }, [player]);

  const playNextTrack = useCallback(() => {
    if (player) {
      player.nextTrack().catch((error: any) => {
        console.error("Failed to play next track", error);
      });
    }
  }, [player]);

  const playPreviousTrack = useCallback(() => {
    if (player) {
      player.previousTrack().catch((error: any) => {
        console.error("Failed to play previous track", error);
      });
    }
  }, [player]);

  const likeSong = (trackID: string) => () => {
    axios.put(
      `http://localhost:8080/tracks/${trackID}/like`,
      {},
      { withCredentials: true }
    );
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        togglePlayPause();
      } else if (event.code === "ArrowDown") {
        event.preventDefault();
        playNextTrack();
      } else if (event.code === "ArrowUp") {
        event.preventDefault();
        playPreviousTrack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePlayPause, playNextTrack, playPreviousTrack]);

  return (
    <Card className="w-full max-w-md mx-auto my-4">
      <CardContent>
        {set.tracks?.map((track) => (
          <div
            key={track.id}
            className={`flex items-center justify-between py-2 px-4 rounded-lg transition-all ${
              playingTrack && playingTrack.uri === track.uri
                ? isPlaying
                  ? "bg-gray-100 shadow-md animate-pulse"
                  : "bg-gray-100 shadow-md"
                : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center">
              <div>
                <p className="text-blue-500">{track.name}</p>
                <p className="text-gray-500">{track.artist}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={likeSong(track.id)}>
              {track.liked ? "Liked" : "Like"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
