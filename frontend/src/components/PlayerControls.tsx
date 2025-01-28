import React, { useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronUp,
  ChevronDown,
  Space,
} from "lucide-react";
import ShortcutKey from "./ui/shortcutKeys";

interface PlayerControlsProps {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  handlePrevTrack: () => void;
  handleNextTrack: () => void;
  handlePlayPause: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  setIsPlaying,
  handlePrevTrack,
  handleNextTrack,
  handlePlayPause,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
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
  }, [handlePlayPause, handleNextTrack, handlePrevTrack, setIsPlaying]);

  return (
    <div className="flex items-center">
      <button
        onClick={() => {
          handlePrevTrack();
          setIsPlaying(true);
        }}
        className="mx-2 flex items-center"
      >
        <SkipBack className="text-purple fill-purple" size={24} />
      </button>
      <button
        onClick={handlePlayPause}
        className="mx-2 flex items-center justify-center w-12 h-12 rounded-full border-2 border-purple bg-purple"
      >
        {isPlaying ? (
          <Pause className="fill-black" size={24} />
        ) : (
          <Play className="fill-black" size={24} />
        )}
      </button>
      <button
        onClick={() => {
          handleNextTrack();
          setIsPlaying(true);
        }}
        className="mx-2 flex items-center"
      >
        <SkipForward className="text-purple fill-purple" size={24} />
      </button>
    </div>
  );
};

export default PlayerControls;
