import { useState, useEffect, useRef } from "react";
import { usePlayer } from "../context/PlayerContext";
import SpotifyPlaylist from "../components/SpotifyPlaylist";
import PlayerControls from "../components/PlayerControls";
import { playTrack, fetchSets } from "@/api/api";
import { Track, Set, PlayerState } from "@/types/types";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export default function SetsPage() {
  const [selectedIndex, setSelectedIndex] = useState<number>(1);
  const { player, deviceId } = usePlayer();
  const [transitionDirection, setTransitionDirection] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [api, setApi] = useState<CarouselApi>();
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [playingTrack, setPlayingTrack] = useState<Track | null>(null);
  const [sets, setSets] = useState<Set[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const playerIsSet = useRef(false);
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
    const handleMediaQuery = () => {
      const isBelowMd = window.matchMedia("(max-width: 768px)").matches;
      if (isBelowMd && api) {
        api.scrollNext();
      }
    };

    handleMediaQuery();

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    mediaQuery.addEventListener("change", handleMediaQuery);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQuery);
    };
  }, [api]);

  useEffect(() => {
    if (!playerIsSet.current && deviceId && sets && sets.length > 2) {
      const uris: string[] = [];
      sets.slice(1).forEach((set) => {
        set.tracks.forEach((track) => {
          uris.push(track.uri);
        });
      });
      const urisx = Array.from(uris).join("&uris=");
      const play = async () => {
        const response = await playTrack(deviceId, urisx);
      };
      play();
      playerIsSet.current = true;
    }
  }, [deviceId, sets]);

  useEffect(() => {
    const handlePlayerStateChanged = (state: PlayerState) => {
      if (state) {
        setPlayingTrack({
          id: state.track_window.current_track.id,
          name: state.track_window.current_track.name,
          artist: state.track_window.current_track.artists[0].name,
          uri: "spotify:track:" + state.track_window.current_track.id,
          liked: false,
          likes: 0,
          img_url: "",
        });
        setIsPlaying(!state.paused);
        setCurrentTime(state.position / 1000); // Convert milliseconds to seconds
        setDuration(state.duration / 1000); // Convert milliseconds to seconds
      }
    };

    if (player) {
      (player as any).addListener(
        "player_state_changed",
        handlePlayerStateChanged
      );
    }

    return () => {
      if (player) {
        (player as any).removeListener(
          "player_state_changed",
          handlePlayerStateChanged
        );
      }
    };
  }, [player]);

  // Add progress update interval
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    if (isPlaying) {
      progressInterval = setInterval(() => {
        setCurrentTime((prevTime) => {
          if (prevTime >= duration) {
            clearInterval(progressInterval);
            return duration;
          }
          return prevTime + 1;
        });
      }, 1000);
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [isPlaying, duration]);

  useEffect(() => {
    const handlePlayerStateChanged = (state: PlayerState) => {
      if (state && playerIsSet.current) {
        setSelectedIndex((prevIndex) => {
          const urisMap = new Map<string, boolean>();
          sets![prevIndex].tracks.forEach((track) => {
            urisMap.set(track.uri.split(":")[2], true);
          });

          if (!urisMap.has(state.track_window.current_track.id)) {
            api?.scrollNext();
            setTransitionDirection("right");
            setCurrentTrackIndex(0);
            return Math.min(prevIndex + 1, sets!.length - 1);
          } else {
            return prevIndex;
          }
        });
      }
    };

    if (player && playerIsSet.current) {
      (player as any).addListener(
        "player_state_changed",
        handlePlayerStateChanged
      );
    }

    return () => {
      if (player) {
        (player as any).removeListener(
          "player_state_changed",
          handlePlayerStateChanged
        );
      }
    };
  }, [player, sets, api, playerIsSet.current]);

  const handlePrevTrack = () => {
    if (player) {
      player.previousTrack().catch((error: any) => {
        console.error("Failed to play previous track", error);
      });
      if (currentTrackIndex === 0 && selectedIndex > 1) {
        setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        api?.scrollPrev();
        setTransitionDirection("left");
        setCurrentTrackIndex(2);
      } else {
        setCurrentTrackIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      }
    }
  };

  const handleNextTrack = () => {
    if (
      player &&
      !(currentTrackIndex === 2 && selectedIndex === sets!.length - 2)
    ) {
      player.nextTrack().catch((error: any) => {
        console.error("Failed to play next track", error);
      });
      setCurrentTrackIndex((prevIndex) => prevIndex + 1);
    }
  };

  const HandlePlayPause = () => {
    if (player) {
      player.togglePlay().catch((error: any) => {
        console.error("Failed to pause player", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = async (time: number) => {
    if (player) {
      try {
        await player.seek(time * 1000); // Convert seconds to milliseconds
        setCurrentTime(time);
      } catch (error) {
        console.error("Failed to seek", error);
      }
    }
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
                    <SpotifyPlaylist
                      set={set}
                      index={index}
                      playingTrack={playingTrack}
                      isPlaying={isPlaying}
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
