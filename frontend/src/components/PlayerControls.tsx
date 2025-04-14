import React, { useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  handlePrevTrack: () => void;
  handleNextTrack: () => void;
  handlePlayPause: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  setIsPlaying,
  handlePrevTrack,
  handleNextTrack,
  handlePlayPause,
  currentTime,
  duration,
  onSeek,
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

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    onSeek(newTime);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black p-4">
      <div className="max-w-screen-xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-4 px-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70 min-w-[40px]">
              {formatTime(currentTime)}
            </span>
            <div
              className="relative flex-grow h-1 group cursor-pointer"
              onClick={handleProgressClick}
            >
              <div className="absolute inset-y-0 w-full -inset-x-2 group-hover:inset-x-0 transition-all">
                <div className="absolute inset-y-0 w-full bg-white/10 rounded-full">
                  <div
                    className="absolute inset-y-0 bg-white/70 rounded-full group-hover:bg-green-500 transition-colors"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </div>
            <span className="text-xs text-white/70 min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => {
              handlePrevTrack();
              setIsPlaying(true);
            }}
            className="text-white/70 hover:text-white transition-colors"
          >
            <SkipBack size={28} />
          </button>

          <button
            onClick={handlePlayPause}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="text-black" size={20} />
            ) : (
              <Play className="text-black ml-0.5" size={20} />
            )}
          </button>

          <button
            onClick={() => {
              handleNextTrack();
              setIsPlaying(true);
            }}
            className="text-white/70 hover:text-white transition-colors"
          >
            <SkipForward size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
