import { useState, useEffect, useRef, useCallback } from "react";
import TrackList from "../components/TrackList";
import PlayerControls from "../components/PlayerControls";
import { fetchSets } from "@/api/api";
import { Track, Set } from "@/types/types";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export default function SetsPage() {
  const isMobile = useIsMobile();
  const [selectedIndex, setSelectedIndex] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [api, setApi] = useState<CarouselApi>();
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [playingTrack, setPlayingTrack] = useState<Track | null>(null);
  const [sets, setSets] = useState<Set[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const fetchSetsx = async () => {
      try {
        const response = await fetchSets({
          withCredentials: true,
        });
        const fetchedSets = response.data.sets as Set[];
        const dummySet = { id: "dummy", username: "", link: "", tracks: [] };
        setSets([...fetchedSets, dummySet]);
        const emptyUserSet = {
          id: "user-empty",
          username: "",
          link: "",
          tracks: [],
          profilePicURL: "",
        };

        const hasUserSet = fetchedSets.some(
          (set) => set.username === "Your Bangrs 🔥"
        );
        if (!hasUserSet) {
          setSets([emptyUserSet, ...fetchedSets, dummySet]);
        }
        setTimeout(() => setFadeIn(true), 100);
      } catch (error) {
        console.error("Failed to fetch sets", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSetsx();
  }, []);

  // First effect to initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  const playTrack = useCallback((track: Track) => {
    if (audioRef.current) {
      const trackPath = `/assets/tracks/${track.file_path}`;
      audioRef.current.src = trackPath;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => console.error("Error playing track:", error));
    }
  }, []);

  const handleNextTrack = useCallback(() => {
    if (!sets) return;

    if (currentTrackIndex === sets[selectedIndex].tracks.length - 1) {
      if (selectedIndex < sets.length - 2) {
        const nextSet = sets[selectedIndex + 1];
        setSelectedIndex(selectedIndex + 1);
        setCurrentTrackIndex(0);
        setPlayingTrack(nextSet.tracks[0]);
        playTrack(nextSet.tracks[0]);
        api?.scrollNext();
      }
    } else {
      const nextTrack = sets[selectedIndex].tracks[currentTrackIndex + 1];
      setCurrentTrackIndex(currentTrackIndex + 1);
      setPlayingTrack(nextTrack);
      playTrack(nextTrack);
    }
  }, [sets, currentTrackIndex, selectedIndex, api, playTrack]);

  // Separate effect for event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleNextTrack);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleNextTrack);
    };
  }, [handleNextTrack]);

  useEffect(() => {
    if (sets && sets.length > 2 && !playingTrack) {
      // Start playing the first track of the first set
      const firstTrack = sets[1].tracks[0];
      if (firstTrack) {
        setPlayingTrack(firstTrack);
        playTrack(firstTrack);
      }
    }
  }, [sets]);

  useEffect(() => {
    if (api && isMobile && sets && sets.length > 2) {
      // Scroll to the first set after a small delay to ensure the carousel is ready
      setTimeout(() => {
        api.scrollTo(1);
      }, 100);
    }
  }, [api, sets, isMobile]);

  const handlePrevTrack = () => {
    if (!sets) return;

    if (currentTrackIndex === 0) {
      if (selectedIndex > 1) {
        const prevSet = sets[selectedIndex - 1];
        const lastTrackIndex = prevSet.tracks.length - 1;
        setSelectedIndex(selectedIndex - 1);
        setCurrentTrackIndex(lastTrackIndex);
        setPlayingTrack(prevSet.tracks[lastTrackIndex]);
        playTrack(prevSet.tracks[lastTrackIndex]);
        api?.scrollPrev();
      }
    } else {
      const prevTrack = sets[selectedIndex].tracks[currentTrackIndex - 1];
      setCurrentTrackIndex(currentTrackIndex - 1);
      setPlayingTrack(prevTrack);
      playTrack(prevTrack);
    }
  };

  const HandlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handlePrevPlaylist = () => {
    if (api && selectedIndex > 1) {
      api.scrollPrev();
      setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 1));
      setCurrentTrackIndex(0);

      const prevSet = sets![selectedIndex - 1];
      if (prevSet.tracks.length > 0) {
        setPlayingTrack(prevSet.tracks[0]);
        playTrack(prevSet.tracks[0]);
      }
    }
  };

  const handleNextPlaylist = () => {
    if (api && sets && selectedIndex < sets.length - 2) {
      api.scrollNext();
      setSelectedIndex((prevIndex) => Math.min(prevIndex + 1, sets.length - 2));
      setCurrentTrackIndex(0);

      const nextSet = sets[selectedIndex + 1];
      if (nextSet.tracks.length > 0) {
        setPlayingTrack(nextSet.tracks[0]);
        playTrack(nextSet.tracks[0]);
      }
    }
  };

  const handleTrackSelect = (track: Track) => {
    const trackIndex = sets![selectedIndex].tracks.findIndex(
      (t) => t.id === track.id
    );
    setCurrentTrackIndex(trackIndex);
    setPlayingTrack(track);
    playTrack(track);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <img
          src="assets/logo.svg"
          alt="Loading..."
          className="w-20 h-20 animate-pulse-custom"
        />
      </div>
    );
  }

  return (
    <>
      {sets && sets.length > 1 ? (
        <div className="flex w-full flex-col items-center pb-32">
          <div
            className={`mb-20 transition-opacity duration-10000 ease-in-out ${
              fadeIn ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src="assets/logo.svg"
              alt="Bangr"
              className="w-24 h-24 opacity-80"
            />
          </div>
          <div
            className={`transition-opacity duration-10000 ease-in-out ${
              fadeIn ? "opacity-100" : "opacity-0"
            }`}
          >
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
              }}
              className="w-full max-w-[100vw]"
            >
              <CarouselContent className="pb-4">
                {sets.map((set, index) => (
                  <CarouselItem
                    key={index}
                    className="group basis-full md:basis-1/3 flex justify-center"
                    data-active={selectedIndex === index}
                  >
                    <TrackList
                      set={set}
                      index={index}
                      playingTrack={playingTrack}
                      isPlaying={isPlaying}
                      onTrackSelect={handleTrackSelect}
                      className="group-data-[active=false]:scale-[85%] transition-all duration-300 group-data-[active=false]:opacity-60"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
          <PlayerControls
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            handlePrevTrack={handlePrevTrack}
            handleNextTrack={handleNextTrack}
            handlePlayPause={HandlePlayPause}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            handlePrevPlaylist={handlePrevPlaylist}
            handleNextPlaylist={handleNextPlaylist}
          />
        </div>
      ) : (
        <div className="text-primary text-3xl">
          No one uploaded anything last week... ☹️
        </div>
      )}
    </>
  );
}
