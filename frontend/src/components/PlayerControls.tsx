import React, { useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

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
    <div className="md:flex md:items-center bottom-0 left-0 w-full bg-black bg-opacity-80 p-4 flex justify-center items-center z-50">
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
