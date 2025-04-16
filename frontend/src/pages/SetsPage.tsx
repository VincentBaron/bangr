import { useState, useEffect, useRef } from "react";
import TrackList from "../components/TrackList";
import PlayerControls from "../components/PlayerControls";
import { fetchSets } from "@/api/api";
import { Track, Set } from "@/types/types";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export default function SetsPage() {
  const [selectedIndex, setSelectedIndex] = useState<number>(1);
  const [transitionDirection, setTransitionDirection] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [api, setApi] = useState<CarouselApi>();
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [playingTrack, setPlayingTrack] = useState<Track | null>(null);
  const [sets, setSets] = useState<Set[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const fetchSetsx = async () => {
      try {
        const response = await fetchSets({
          withCredentials: true,
        });
        const fetchedSets = response.data.sets as Set[];
        const dummySet = { id: "dummy", username: "", link: "", tracks: [] };
        setSets([...fetchedSets, dummySet]);
      } catch (error) {
        console.error("Failed to fetch sets", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSetsx();
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();

      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });

      audioRef.current.addEventListener("loadedmetadata", () => {
        setDuration(audioRef.current?.duration || 0);
      });

      audioRef.current.addEventListener("ended", handleNextTrack);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("timeupdate", () => {});
        audioRef.current.removeEventListener("loadedmetadata", () => {});
        audioRef.current.removeEventListener("ended", handleNextTrack);
      }
    };
  }, []);

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

  const playTrack = (track: Track) => {
    if (audioRef.current) {
      const trackPath = `/assets/tracks/${track.file_path}`;
      audioRef.current.src = trackPath;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => console.error("Error playing track:", error));
    }
  };

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
        setTransitionDirection("left");
      }
    } else {
      const prevTrack = sets[selectedIndex].tracks[currentTrackIndex - 1];
      setCurrentTrackIndex(currentTrackIndex - 1);
      setPlayingTrack(prevTrack);
      playTrack(prevTrack);
    }
  };

  const handleNextTrack = () => {
    if (!sets) return;

    if (currentTrackIndex === sets[selectedIndex].tracks.length - 1) {
      if (selectedIndex < sets.length - 2) {
        const nextSet = sets[selectedIndex + 1];
        setSelectedIndex(selectedIndex + 1);
        setCurrentTrackIndex(0);
        setPlayingTrack(nextSet.tracks[0]);
        playTrack(nextSet.tracks[0]);
        api?.scrollNext();
        setTransitionDirection("right");
      }
    } else {
      const nextTrack = sets[selectedIndex].tracks[currentTrackIndex + 1];
      setCurrentTrackIndex(currentTrackIndex + 1);
      setPlayingTrack(nextTrack);
      playTrack(nextTrack);
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
      setTransitionDirection("left");
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
      setTransitionDirection("right");
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
        <div className="flex w-full flex-col items-center">
          <div>
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
              }}
              className="w-full max-w-[100vw]"
            >
              <CarouselContent>
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
