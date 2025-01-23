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
  const isFirstRender = useRef(true);
  const playerIsSet = useRef(false);

  const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response: AxiosResponse<any> = await axios.get(
          "http://localhost:8080/sets",
          { withCredentials: true }
        );
        const fetchedSets: Set[] = response.data.sets;
        setSets(fetchedSets);
      } catch (error) {
        console.error("Failed to fetch sets", error);
      }
    };

    fetchSets();
  }, []);

  useEffect(() => {
    if (!playerIsSet.current && deviceId && sets && sets.length > 2) {
      console.log("Setting player");
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
  }),
    [deviceId, sets];

  // useEffect(() => {
  //   if (isFirstRender.current && playerIsSet.current && player) {
  //     console.log("First render playlist switch");
  //     // for (let i = 0; i < 3; i++) {
  //     // console.log("next track: ", i);
  //     player.nextTrack().catch((error: any) => {
  //       console.error("Failed to play next track", error);
  //     });
  //     // }
  //     setSelectedIndex(1);
  //     isFirstRender.current = false;
  //   }
  // }, [player]);

  useEffect(() => {
    if (player) {
      (player as any).addListener(
        "player_state_changed",
        (state: PlayerState) => {
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
        }
      );
    }
  }, [player]);

  // TO implement automatic playlist switching
  // useEffect(() => {
  //   if (player) {
  //     (player as any).addListener(
  //       "player_state_changed",
  //       (state: PlayerState) => {
  //         if (state) {
  //           const urisMap = new Map<string, boolean>();
  //           sets![selectedIndex].tracks.forEach((track) => {
  //             urisMap.set(track.uri, true);
  //           });
  //           if (!urisMap.has(state.track_window.current_track.id)) {
  //             console.log("Switching playlist");
  //             api?.scrollNext();
  //             setTransitionDirection("right");
  //             setSelectedIndex((prevIndex) =>
  //               Math.min(prevIndex + 1, sets!.length - 1)
  //             );
  //             setCurrentTrackIndex(0); // Reset track index to the first track of the new playlist
  //           }
  //         }
  //       }
  //     );
  //   }
  // }, [player]);

  const handlePrevPlaylist = () => {
    if (player) {
      for (let i = 0; i < currentTrackIndex + 1; i++) {
        player.previousTrack().catch((error: any) => {
          console.error("Failed to play previous track", error);
        });
      }
    }
    api?.scrollPrev();
    setTransitionDirection("left");
    setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 1));
    setCurrentTrackIndex(0); // Reset track index to the first track of the new playlist
  };

  const handleNextPlaylist = () => {
    if (player) {
      for (let i = 0; i < 3 - currentTrackIndex; i++) {
        player.nextTrack().catch((error: any) => {
          console.error("Failed to play next track", error);
        });
      }
    }
    api?.scrollNext();
    setTransitionDirection("right");
    setSelectedIndex((prevIndex) => Math.min(prevIndex + 1, sets!.length - 1));
    setCurrentTrackIndex(0); // Reset track index to the first track of the new playlist
    console.log("selectedIndex", selectedIndex);
  };

  const handlePrevTrack = () => {
    console.log("currentTrackIndex: ", currentTrackIndex);
    if (currentTrackIndex === 0) {
      handlePrevPlaylist();
    } else {
      if (player) {
        player.previousTrack().catch((error: any) => {
          console.error("Failed to play previous track", error);
        });
        setCurrentTrackIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      }
    }
  };

  const handleNextTrack = () => {
    if (currentTrackIndex === sets![selectedIndex].tracks.length - 1) {
      handleNextPlaylist();
    } else {
      if (player) {
        player.nextTrack().catch((error: any) => {
          console.error("Failed to play next track", error);
        });
        setCurrentTrackIndex((prevIndex) =>
          Math.min(prevIndex + 1, sets![selectedIndex].tracks.length - 1)
        );
      }
    }
  };

  return (
    <>
      {sets && sets.length > 0 ? (
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
            handlePrevPlaylist={handlePrevPlaylist}
            handleNextPlaylist={handleNextPlaylist}
            handlePrevTrack={handlePrevTrack}
            handleNextTrack={handleNextTrack}
          />
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}
