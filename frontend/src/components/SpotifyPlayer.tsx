import React, { useEffect, useState } from "react";
import axios from "axios";
import { Set, Track } from "../pages/SetsPage";
import { usePlayer } from "../context/PlayerContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PlayerControls from "./PlayerControls";

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

  const likeSong = (trackID: string) => () => {
    axios.put(
      `http://localhost:8080/tracks/${trackID}/like`,
      {},
      { withCredentials: true }
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto my-4 bg-dark text-primary">
      <CardContent>
        {set.tracks?.map((track) => (
          <div
            key={track.id}
            className={`flex items-center justify-between py-2 px-4 rounded-lg transition-all ${
              playingTrack && playingTrack.uri === track.uri
                ? isPlaying
                  ? "bg-gray shadow-md animate-pulse"
                  : "bg-gray shadow-md"
                : "hover:bg-divider-gray"
            }`}
          >
            <div className="flex items-center">
              <div>
                <p className="text-pink">{track.name}</p>
                <p className="text-secondary">{track.artist}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={likeSong(track.id)}
              className="text-primary border-divider-gray"
            >
              {track.liked ? "Liked" : "Like"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
