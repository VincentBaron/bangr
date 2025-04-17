import React, { useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  handlePrevTrack: () => void;
  handleNextTrack: () => void;
  handlePlayPause: () => void;
  handlePrevPlaylist?: () => void;
  handleNextPlaylist?: () => void;
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
  handlePrevPlaylist,
  handleNextPlaylist,
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
    <div className="fixed bottom-0 left-0 w-full">
      <div className="relative bg-black/95 backdrop-blur-md border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-purple/5 via-transparent to-purple/5" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple/20 to-transparent" />

        <div className="relative z-10 max-w-screen-xl mx-auto p-4">
          {/* Progress Bar */}
          <div className="mb-4 px-4">
            <div className="flex items-center">
              <span className="text-[0.6875rem] text-white/70 tabular-nums w-[40px] text-center shrink-0">
                {formatTime(currentTime)}
              </span>
              <div
                className="relative flex-grow h-1 group cursor-pointer mx-2"
                onClick={handleProgressClick}
              >
                <div className="absolute inset-0 rounded-full bg-white/10">
                  <div
                    className="absolute inset-y-0 bg-purple rounded-full transition-all duration-200"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-[0.6875rem] text-white/70 tabular-nums w-[40px] text-center shrink-0">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex justify-center items-center gap-6">
            {handlePrevPlaylist && (
              <button
                onClick={handlePrevPlaylist}
                className="text-white/50 hover:text-white transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft
                  className="w-6 h-6 fill-transparent"
                  strokeWidth={1.5}
                />
              </button>
            )}

            <button
              onClick={() => {
                handlePrevTrack();
                setIsPlaying(true);
              }}
              className="text-white/70 hover:text-white transition-all duration-200 hover:scale-105"
            >
              <SkipBack
                className="w-5 h-5 fill-transparent"
                strokeWidth={1.5}
              />
            </button>

            <button
              onClick={handlePlayPause}
              className="w-12 h-12 flex items-center justify-center rounded-full border border-purple/20 bg-purple/20 transition-all duration-200 hover:scale-105"
            >
              {isPlaying ? (
                <Pause
                  className="text-white w-5 h-5 fill-transparent"
                  strokeWidth={2}
                />
              ) : (
                <Play
                  className="text-white w-5 h-5 ml-0.5 fill-transparent"
                  strokeWidth={2}
                />
              )}
            </button>

            <button
              onClick={() => {
                handleNextTrack();
                setIsPlaying(true);
              }}
              className="text-white/70 hover:text-white transition-all duration-200 hover:scale-105"
            >
              <SkipForward
                className="w-5 h-5 fill-transparent"
                strokeWidth={1.5}
              />
            </button>

            {handleNextPlaylist && (
              <button
                onClick={handleNextPlaylist}
                className="text-white/50 hover:text-white transition-all duration-200 hover:scale-105"
              >
                <ArrowRight
                  className="w-6 h-6 fill-transparent"
                  strokeWidth={1.5}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
