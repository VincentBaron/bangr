import React, { useState } from "react";
import { Set, Track } from "@/types/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import playerAnimation from "../../public/assets/playing_anim.json";
import Lottie from "react-lottie";
import { Flame, Music2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { toggleTrackLike } from "@/api/api";

interface SpotifyPlaylistProps extends React.HTMLAttributes<HTMLDivElement> {
  set: Set;
  playingTrack: Track | null;
  isPlaying: boolean;
  index: number;
}

export default function SpotifyPlaylist({
  set,
  className,
  playingTrack,
  isPlaying,
  index,
  ...props
}: SpotifyPlaylistProps) {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: playerAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const [currentSet, setCurrentSet] = useState(set);

  const toggleLikeSong = (track: Track) => async () => {
    try {
      await toggleTrackLike(track.id, !track.liked, { withCredentials: true });
      const updatedTracks = currentSet.tracks.map((t) =>
        t.id === track.id
          ? {
              ...t,
              liked: !t.liked,
              likes: t.liked ? t.likes - 1 : t.likes + 1,
            }
          : t
      );
      setCurrentSet({ ...currentSet, tracks: updatedTracks });
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  if (currentSet.tracks.length === 0) {
    return null;
  }

  return (
    <Card
      className={cn(
        "bg-black/40 backdrop-blur-sm border-white/5 w-full overflow-hidden p-4",
        className
      )}
      {...props}
    >
      <CardHeader className="px-6 py-3 flex flex-row items-center gap-3 border-b border-white/5">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={currentSet.profilePicURL}
            alt={currentSet.username}
          />
          <AvatarFallback className="bg-white/10 text-white/70">
            {currentSet.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white/90 truncate">
            {currentSet.username}'s Mix
          </h3>
          <p className="text-xs text-white/50">
            {currentSet.tracks.length} tracks
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {currentSet.tracks?.map((track, idx) => (
            <div
              key={track.id}
              className={cn(
                "group flex items-center gap-3 p-2 rounded-md transition-all"
              )}
            >
              <div className="shrink-0 w-8 h-8 relative rounded overflow-hidden bg-white/5">
                {track.img_url ? (
                  <img
                    src={track.img_url}
                    alt={track.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music2 className="w-4 h-4 text-white/30" />
                  </div>
                )}
                {playingTrack?.uri === track.uri && isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <Lottie options={defaultOptions} height={24} width={24} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium truncate",
                    playingTrack?.uri === track.uri
                      ? "text-purple"
                      : "text-white/90"
                  )}
                >
                  {track.name}
                </p>
                <p className="text-xs text-white/50 truncate">{track.artist}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={toggleLikeSong(track)}
                  className={cn("p-1.5 rounded-full transition-all")}
                >
                  <Flame
                    className={cn(
                      "w-4 h-4 transition-colors",
                      track.liked
                        ? "text-purple fill-purple"
                        : "text-white/50 hover:text-white"
                    )}
                  />
                </button>
                <span className="text-xs text-white/50 w-8 text-right">
                  {track.likes}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
