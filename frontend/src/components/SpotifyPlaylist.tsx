import React, { useEffect, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { Set, Track } from "../pages/SetsPage";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import playerAnimation from "../../public/assets/playing_anim.json";
import Lottie from "react-lottie";
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
  const [currentSet, setCurrentSet] = useState(set);
  const { player } = usePlayer();
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: playerAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    setCurrentSet(set);
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
              img_url: "",
            });
            setIsPlaying(!state.paused);
          }
        }
      );
    }
  }, [player, set]);

  const toggleLikeSong = (track: Track) => async () => {
    try {
      await axios.put(
        `http://localhost:8080/tracks/${track.id}/like?liked=${!track.liked}`,
        {},
        { withCredentials: true }
      );
      setCurrentSet((prevSet) => ({
        ...prevSet,
        tracks: prevSet.tracks.map((t) =>
          t.id === track.id
            ? {
                ...t,
                liked: !t.liked,
                likes: t.liked ? t.likes - 1 : t.likes + 1,
              }
            : t
        ),
      }));
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  return (
    <Card className="bg-gray text-primary border-purple w-full max-w-md mx-auto my-4 neon-shadow">
      <CardHeader>
        <CardTitle className="">{currentSet.username}</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          {currentSet.tracks?.map((track) => (
            <div
              key={track.id}
              className={`grid grid-cols-[60px_270px_70px] rounded-lg transition-all`}
            >
              <div className="relative flex justify-center items-center">
                <img
                  src={track.img_url}
                  alt={track.name}
                  className={`w-10 h-10`}
                />
                {playingTrack &&
                  playingTrack.uri === track.uri &&
                  isPlaying && (
                    <div className="absolute inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
                      <Lottie options={defaultOptions} height={30} width={30} />
                    </div>
                  )}
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
