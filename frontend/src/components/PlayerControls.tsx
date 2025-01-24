import React, { useEffect, useCallback } from "react";
import axios from "axios";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { CommandShortcut } from "@/components/ui/command";

interface PlayerControlsProps {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  handlePrevPlaylist: () => void;
  handleNextPlaylist: () => void;
  handlePrevTrack: () => void;
  handleNextTrack: () => void;
  handlePlayPause: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  setIsPlaying,
  handlePrevPlaylist,
  handleNextPlaylist,
  handlePrevTrack,
  handleNextTrack,
  handlePlayPause,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "ArrowLeft") {
        handlePrevPlaylist();
        setIsPlaying(false);
      } else if (event.code === "ArrowRight") {
        handleNextPlaylist();
        setIsPlaying(false);
      } else if (event.code === "Space") {
        event.preventDefault();
        handlePlayPause();
      } else if (event.code === "ArrowDown") {
        event.preventDefault();
        handleNextTrack();
        setIsPlaying(false);
      } else if (event.code === "ArrowUp") {
        event.preventDefault();
        handlePrevTrack();
        setIsPlaying(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    handlePrevPlaylist,
    handleNextPlaylist,
    handlePlayPause,
    handleNextTrack,
    handlePrevTrack,
    setIsPlaying,
  ]);

  return (
    // <Card className="flex justify-center items-center mt-4 bg-gray p-3 neon-shadow-orange border-purple">
    <div>
      <button
        onClick={() => {
          handlePrevPlaylist();
          setIsPlaying(true);
        }}
        className="mx-2"
      >
        <ChevronLeft className="text-purple" size={24} />
      </button>
      <button
        onClick={() => {
          handlePrevTrack();
          setIsPlaying(true);
        }}
        className="mx-2"
      >
        <SkipBack className="text-purple" size={24} />
      </button>
      <button onClick={handlePlayPause} className="mx-2">
        {isPlaying ? (
          <Pause className="text-purple" size={24} />
        ) : (
          <Play className="text-purple" size={24} />
        )}
      </button>
      <button
        onClick={() => {
          handleNextTrack();
          setIsPlaying(true);
        }}
        className="mx-2"
      >
        <SkipForward className="text-purple" size={24} />
      </button>
      <button
        onClick={() => {
          handleNextPlaylist();
          setIsPlaying(true);
        }}
        className="mx-2"
      >
        <ChevronRight className="text-purple" size={24} />
      </button>
    </div>
    // </Card>
  );
};

export default PlayerControls;
