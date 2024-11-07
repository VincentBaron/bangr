import React, { useEffect, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { Set, Track } from "../pages/SetsPage";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Flame } from "lucide-react";

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
  const [tracks, setTracks] = useState<Track[]>(set.tracks);
  const { player } = usePlayer();
  useEffect(() => {
    console.log(tracks);
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
              likes: 0,
              imgURL: "",
            });
            setIsPlaying(!state.paused);
          }
        }
      );
    }
  }, [player]);

  const toggleLikeSong = (track: Track) => () => {
    console.log("yolo");
    axios.put(
      `http://localhost:8080/tracks/${track.id}/like?liked=${!track.liked}`,
      {},
      { withCredentials: true }
    );
    setTracks((prevTracks) =>
      prevTracks.map((t) => (t.id === track.id ? { ...t, liked: !t.liked } : t))
    );
  };

  return (
    <Card className="bg-gray text-primary border-purple w-full max-w-md mx-auto my-4 neon-shadow">
      <CardHeader>
        <CardTitle className="">{set.username}</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          {tracks?.map((track) => (
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
              <div className="flex justify-center items-center">
                <img
                  src={track.img_url}
                  alt={track.name}
                  className="w-10 h-10"
                />
              </div>
              <div>
                <p className="text-primary">{track.name}</p>
                <p className="text-secondary">{track.artist}</p>
              </div>
              <div className="flex row items-center">
                <button
                  onClick={toggleLikeSong(track)}
                  className={`p-2 rounded-full focus:outline-none ${
                    track.liked ? "bg-purple-500" : "bg-transparent"
                  } hover:bg-purple-200`}
                >
                  <Flame
                    color="#E105FB"
                    fill={`${track.liked ? "#E105FB" : ""}`}
                    size={24}
                  />
                </button>
                <p className="text-primary">{track.likes}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
