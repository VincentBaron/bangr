import React, { createContext, useContext, useState } from "react";
import { Track } from "@/types/types";

interface PlayerContextType {
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  currentTrackId: string | null;
  setCurrentTrackId: (id: string | null) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        setCurrentTrack,
        isPlaying,
        setIsPlaying,
        currentTrackId,
        setCurrentTrackId,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
