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

interface PlayerControlsProps {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  handlePrevPlaylist: () => void;
  handleNextPlaylist: () => void;
  handlePrevTrack: () => void;
  handleNextTrack: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  setIsPlaying,
  handlePrevPlaylist,
  handleNextPlaylist,
  handlePrevTrack,
  handleNextTrack,
}) => {
  const { player, deviceId } = usePlayer();

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      axios.get(
        `http://localhost:8080/player?action=pause&device_id=${deviceId}`,
        { withCredentials: true }
      );
    } else {
      axios.get(
        `http://localhost:8080/player?action=play&device_id=${deviceId}`,
        { withCredentials: true }
      );
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, deviceId, setIsPlaying]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "ArrowLeft") {
        handlePrevPlaylist();
        setIsPlaying(true);
      } else if (event.code === "ArrowRight") {
        handleNextPlaylist();
        setIsPlaying(true);
      } else if (event.code === "Space") {
        event.preventDefault();
        handlePlayPause();
      } else if (event.code === "ArrowDown") {
        event.preventDefault();
        handleNextTrack();
        setIsPlaying(true);
      } else if (event.code === "ArrowUp") {
        event.preventDefault();
        handlePrevTrack();
        setIsPlaying(true);
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
    <div className="flex justify-center items-center mt-4">
      <button
        onClick={() => {
          handlePrevPlaylist();
          setIsPlaying(true);
        }}
        className="mx-2"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={() => {
          handlePrevTrack();
          setIsPlaying(true);
        }}
        className="mx-2"
      >
        <SkipBack size={24} />
      </button>
      <button onClick={handlePlayPause} className="mx-2">
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>
      <button
        onClick={() => {
          handleNextTrack();
          setIsPlaying(true);
        }}
        className="mx-2"
      >
        <SkipForward size={24} />
      </button>
      <button
        onClick={() => {
          handleNextPlaylist();
          setIsPlaying(true);
        }}
        className="mx-2"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default PlayerControls;
