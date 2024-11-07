import React, { useEffect, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { Set, Track } from "../pages/SetsPage";
import axios from "axios";
import SpotifyPlayer from "./SpotifyPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface SpotifyPlaylistProps {
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

export default function SpotifyPlaylist({ set }: SpotifyPlaylistProps) {
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
    console.log("yolo");
    axios.put(
      `http://localhost:8080/tracks/${trackID}/like`,
      {},
      { withCredentials: true }
    );
  };

  return (
    <Card className="bg-gray text-primary border-purple w-full max-w-md mx-auto my-4 neon-shadow">
      <CardHeader>
        <CardTitle className="">{set.username}</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          {set.tracks?.map((track) => (
            <div
              key={track.id}
              className={`grid grid-cols-[50px_150px_70px] rounded-lg transition-all ${
                playingTrack && playingTrack.uri === track.uri
                  ? isPlaying
                    ? "bg-gray shadow-md animate-pulse"
                    : "bg-gray shadow-md"
                  : "hover:bg-divider-gray"
              }`}
            >
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
      </CardContent>
    </Card>
  );
}
