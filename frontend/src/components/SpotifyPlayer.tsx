import React, { useEffect, useState } from "react";
import axios from "axios";
import { Set, Track } from "../pages/SetsPage";
import { usePlayer } from "../context/PlayerContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
    <div>
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
            <Avatar className="mr-2">
              <AvatarImage
                src={`https://i.scdn.co/image/${track.id}`}
                alt={track.name}
              />
              <AvatarFallback>{track.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-primary">{track.name}</p>
              <p className="text-secondary">{track.artist}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={likeSong(track.id)}
            className="bg-purple border-divider-gray"
          >
            {track.liked ? "Liked" : "Like"}
          </Button>
        </div>
      ))}
    </div>
  );
}
