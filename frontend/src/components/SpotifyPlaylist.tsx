import { cn } from "@/lib/utils";
import { Set, Track } from "@/types/types";
import { toggleTrackLike } from "@/api/api";
import { Heart, PlayCircle, PauseCircle } from "lucide-react";

interface TrackListProps extends React.HTMLAttributes<HTMLDivElement> {
  set: Set;
  playingTrack: Track | null;
  isPlaying: boolean;
  index: number;
}

export default function TrackList({
  className,
  set,
  playingTrack,
  isPlaying,
  index,
  ...props
}: TrackListProps) {
  const getTrackIdFromPath = (filePath: string): string | null => {
    const match = filePath.match(/___(.+)\.mp3$/);
    return match ? match[1] : null;
  };

  const isTrackPlaying = (track: Track) => {
    if (!playingTrack) return false;
    const currentTrackId = getTrackIdFromPath(playingTrack.file_path);
    const trackId = getTrackIdFromPath(track.file_path);
    return currentTrackId === trackId && isPlaying;
  };

  const handleLikeToggle = async (track: Track) => {
    try {
      await toggleTrackLike(track.id, !track.liked);
      // You might want to update the track's liked status in your state management here
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  // Don't render anything for dummy sets
  if (set.id === "dummy") {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-4 w-full max-w-[350px] rounded-xl bg-black/40 backdrop-blur-md border border-white/5",
        className
      )}
      {...props}
    >
      <h2 className="text-white text-xl font-bold">{set.username}</h2>
      <div className="flex flex-col gap-2">
        {set.tracks.map((track, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {isTrackPlaying(track) ? (
                <PauseCircle className="w-8 h-8 text-purple cursor-pointer flex-shrink-0" />
              ) : (
                <PlayCircle className="w-8 h-8 text-purple cursor-pointer flex-shrink-0" />
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-white font-medium truncate">
                  {track.name}
                </span>
                <span className="text-white/60 text-sm truncate">
                  {track.artist}
                </span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLikeToggle(track);
              }}
              className="flex items-center gap-1"
            >
              <Heart
                className={cn(
                  "w-5 h-5",
                  track.liked
                    ? "fill-purple text-purple"
                    : "text-white/60 group-hover:text-white/80"
                )}
              />
              <span className="text-white/60 text-sm">{track.likes}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
