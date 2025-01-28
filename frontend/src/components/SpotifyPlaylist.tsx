import React, { useEffect, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { Set, Track } from "../pages/SetsPage";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import playerAnimation from "../../public/assets/playing_anim.json";
import Lottie from "react-lottie";
import { Flame } from "lucide-react";
import { Avatar } from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { AvatarFallback, AvatarImage } from "./ui/avatar";

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

  const toggleLikeSong = (track: Track) => async () => {
    try {
      await axios.put(
        `http://localhost:8080/tracks/${track.id}/like?liked=${!track.liked}`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  if (set.tracks.length === 0) {
    return <div></div>;
  }

  return (
    <Card
      className={cn(
        "bg-black bg-opacity-70 text-primary w-full mx-auto my-4 border-purple",
        index === 0 ? "bg-purple bg-opacity-50" : "",
        className
      )}
      {...props}
    >
      <CardHeader className="flex-row gap-3">
        <Avatar>
          <AvatarImage
            src={set.profilePicURL}
            alt={set.username}
            className="rounded-full w-10"
          />
          <AvatarFallback className="avatar-fallback text-white flex items-center justify-center">
            {set.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="flex justify-center align-items font-custom">
          {set.username}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`flex flex-col gap-4`}>
          {set.tracks?.map((track) => (
            <div
              key={track.id}
              className={`grid grid-cols-[1fr_3fr_1fr] rounded-lg transition-all hover:bg-purple-200`}
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
                <p
                  className={`text-primary font-custom ${
                    playingTrack && playingTrack.uri === track.uri
                      ? "text-purple"
                      : ""
                  }`}
                >
                  {track.name}
                </p>
                <p className="text-secondary font-custom">{track.artist}</p>
              </div>
              <div className="flex row items-center">
                <button
                  onClick={toggleLikeSong(track)}
                  className={`p-2 rounded-full focus:outline-none transition-transform transform hover:scale-125 active:scale-100 ${
                    track.liked ? "bg-purple-500" : "bg-transparent"
                  } hover:bg-purple-200`}
                >
                  <Flame
                    className={`transition-colors text-purple ${
                      track.liked ? " fill-purple" : ""
                    }`}
                    size={24}
                  />
                </button>
                <p className="text-primary font-custom">{track.likes}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
