import React, { useState } from "react";
import { Set, Track } from "@/types/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import playerAnimation from "../../public/assets/playing_anim.json";
import Lottie from "react-lottie";
import { Music2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { toggleTrackLike } from "@/api/api";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
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
      toast({
        title: track.liked
          ? "Removed from Liked Songs"
          : "Added to Liked Songs",
        duration: 1000,
      });
    } catch (error) {
      console.error("Failed to toggle like", error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
        duration: 1000,
      });
    }
  };

  if (currentSet.tracks.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex justify-center px-4">
      <Card
        className={cn(
          "relative bg-black/40 backdrop-blur-md overflow-hidden rounded-xl border border-white/5",
          "before:absolute before:inset-0 before:bg-gradient-to-tr before:from-purple/5 before:via-transparent before:to-purple/10",
          "after:absolute after:inset-0 after:bg-gradient-to-bl after:from-purple/5 after:via-transparent after:to-purple/10",
          "w-80 shrink-0",
          className
        )}
        {...props}
      >
        <div className="relative z-10">
          <CardHeader className="px-6 py-4 flex flex-row items-center gap-3 border-b border-white/5 bg-white/5">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple/20 to-transparent" />
            <Avatar className="h-8 w-8 ring-2 ring-purple/20">
              <AvatarImage
                src={currentSet.profilePicURL}
                alt={currentSet.username}
              />
              <AvatarFallback className="bg-purple/10 text-purple">
                {currentSet.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white/90 truncate">
                {currentSet.username}'s Bangers
              </h3>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-1">
            <div className="space-y-1">
              {currentSet.tracks?.map((track, _) => (
                <div
                  key={track.id}
                  className={cn(
                    "group flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-white/5"
                  )}
                >
                  <div className="shrink-0 w-8 h-8 relative rounded-md overflow-hidden bg-white/5 ring-1 ring-white/10">
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
                        <Lottie
                          options={defaultOptions}
                          height={24}
                          width={24}
                        />
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
                    <p className="text-xs text-white/50 truncate">
                      {track.artist}
                    </p>
                  </div>

                  <div className="flex items-center shrink-0 gap-1.5">
                    {/* <span className="text-xs text-white/50 w-4 text-right">
                      {track.likes}
                    </span> */}
                    <button
                      onClick={toggleLikeSong(track)}
                      className={cn(
                        "p-1.5 rounded-full transition-all",
                        track.liked
                          ? "text-purple"
                          : "text-white/50 hover:text-white"
                      )}
                    >
                      <img
                        src={
                          track.liked
                            ? "/assets/like-icon-liked.png"
                            : "/assets/like-icon-like.png"
                        }
                        alt="Like"
                        className={cn(
                          "w-4 h-4 transition-colors",
                          track.liked ? "text-purple" : ""
                        )}
                      />
                    </button>
                    <a
                      href={`https://open.spotify.com/track/${
                        track.uri.split(":")[2]
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <img
                        src="/assets/spotify_logo.png"
                        alt="Spotify"
                        className="w-4 h-4"
                      />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
