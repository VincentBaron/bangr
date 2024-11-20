import React, { useState, useEffect } from "react";
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

export default function SetsPage() {
  const [sets, setSets] = useState<Set[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(1);
  const { player, deviceId } = usePlayer();
  const [transitionDirection, setTransitionDirection] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [api, setApi] = useState<CarouselApi>();
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);

  useEffect(() => {
    axios
      .get("http://localhost:8080/sets", { withCredentials: true })
      .then((response: AxiosResponse<any>) => {
        const fetchedSets = response.data.sets as Set[];
        setSets([
          { id: "dummy", username: "", link: "", tracks: [] },
          ...fetchedSets,
          { id: "dummy", username: "", link: "", tracks: [] },
        ]);
      });
  }, []);

  useEffect(() => {
    if (player && deviceId && sets.length > 2) {
      const set = sets[selectedIndex];
      axios.get(
        `http://localhost:8080/player?action=play&device_id=${deviceId}&&link=${set.link}`,
        { withCredentials: true }
      );
    }
  }, [player, deviceId, selectedIndex, sets]);

  const handlePrevPlaylist = () => {
    api?.scrollPrev();
    setTransitionDirection("left");
    setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 1));
    setIsPlaying(true);
    setCurrentTrackIndex(0); // Reset track index to the first track of the new playlist
  };

  const handleNextPlaylist = () => {
    api?.scrollNext();
    setTransitionDirection("right");
    setSelectedIndex((prevIndex) => Math.min(prevIndex + 1, sets.length - 2));
    setIsPlaying(true);
    setCurrentTrackIndex(0); // Reset track index to the first track of the new playlist
  };

  const handlePrevTrack = () => {
    if (currentTrackIndex === 0) {
      handlePrevPlaylist();
    } else {
      if (player) {
        player.previousTrack().catch((error: any) => {
          console.error("Failed to play previous track", error);
        });
        setCurrentTrackIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      }
      setIsPlaying(true);
    }
  };

  const handleNextTrack = () => {
    if (currentTrackIndex === sets[selectedIndex].tracks.length - 1) {
      handleNextPlaylist();
    } else {
      if (player) {
        player.nextTrack().catch((error: any) => {
          console.error("Failed to play next track", error);
        });
        setCurrentTrackIndex((prevIndex) =>
          Math.min(prevIndex + 1, sets[selectedIndex].tracks.length - 1)
        );
      }
      setIsPlaying(true);
    }
  };

  return (
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
            {sets.map((set, index) => {
              return (
                <CarouselItem
                  key={index}
                  className="group basis-1/3 "
                  data-active={selectedIndex === index}
                >
                  <SpotifyPlaylist
                    set={set}
                    className="group-data-[active=false]:scale-[85%] transition-all duration-300 group-data-[active=false]:opacity-60"
                  />
                </CarouselItem>
              );
            })}
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
  );
}
