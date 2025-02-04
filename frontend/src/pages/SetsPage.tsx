import React, { useState, useEffect, useRef } from "react";
import axios, { AxiosResponse } from "axios";
import { usePlayer } from "../context/PlayerContext";
import SpotifyPlaylist from "../components/SpotifyPlaylist";
import PlayerControls from "../components/PlayerControls";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export interface Track {
  id: string;
  uri: string;
  name: string;
  artist: string;
  liked: boolean;
  likes: number;
  img_url: string;
}
export interface Set {
  id: string;
  link: string;
  tracks: Track[];
  active?: boolean;
  username: string;
  profilePicURL?: string;
}

interface PlayerState {
  track_window: {
    current_track: {
      id: string;
      name: string;
      artists: { name: string }[];
    };
  };
  paused: boolean;
}

export default function SetsPage() {
  const [sets, setSets] = useState<Set[] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(1);
  const { player, deviceId } = usePlayer();
  const [transitionDirection, setTransitionDirection] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [api, setApi] = useState<CarouselApi>();
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [playingTrack, setPlayingTrack] = useState<Track | null>(null);
  const playerIsSet = useRef(false);
  const reload = useRef(false);

  // useEffect(() => {
  //   if (!reload.current) {
  //     window.location.reload();
  //     reload.current = true;
  //   }
  // }, []);

  useEffect(() => {
    console.log("useEffect1");
    const fetchSets = async () => {
      try {
        const response: AxiosResponse<any> = await axios.get(
          "http://localhost:8080/sets",
          { withCredentials: true }
        );
        const fetchedSets = response.data.sets as Set[];
        const dummySet = { id: "dummy", username: "", link: "", tracks: [] };

        // Tailwind's sm breakpoint is 640px
        setSets([...fetchedSets, dummySet]);
      } catch (error) {
        console.error("Failed to fetch sets", error);
      }
    };

    fetchSets();
  }, []);

  useEffect(() => {
    console.log("useEffect2 deviceId", deviceId);
    if (!playerIsSet.current && deviceId && sets && sets.length > 2) {
      console.log("useEffect2 if check");
      const uris: string[] = [];
      sets.slice(1).forEach((set) => {
        set.tracks.forEach((track) => {
          uris.push(track.uri);
        });
      });
      const urisx = Array.from(uris).join("&uris=");
      const play = async () => {
        const response: AxiosResponse<any> = await axios.get(
          `http://localhost:8080/player?action=play&device_id=${deviceId}&uris=${urisx}`,
          { withCredentials: true }
        );
      };
      play();
      playerIsSet.current = true;
    }
  }, [deviceId, sets]); // Corrected dependency array

  useEffect(() => {
    console.log("useEffect3");
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
      }
    };

    if (player) {
      (player as any).addListener(
        "player_state_changed",
        handlePlayerStateChanged
      );
    }

    // Cleanup function to remove the event listener
    return () => {
      if (player) {
        (player as any).removeListener(
          "player_state_changed",
          handlePlayerStateChanged
        );
      }
    };
  }, [player]);

  // TO implement automatic playlist switching
  useEffect(() => {
    console.log("useEffect4");
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

    if (player) {
      (player as any).addListener(
        "player_state_changed",
        handlePlayerStateChanged
      );
    }

    // Cleanup function to remove the event listener
    return () => {
      if (player) {
        (player as any).removeListener(
          "player_state_changed",
          handlePlayerStateChanged
        );
      }
    };
  }, [player]);

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

  useEffect(() => {}, [selectedIndex]);

  return (
    <>
      {sets && sets.length > 1 ? (
        <div className="flex w-full flex-col items-center">
          <div className="">
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
                    className="group basis-full sm:basis-1/3 flex justify-center"
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
          />
        </div>
      ) : (
        <div className="text-primary font-custom text-3xl">
          No one uploaded anything last week... ☹️
        </div>
      )}
    </>
  );
}
