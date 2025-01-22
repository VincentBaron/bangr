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
  const [sets, setSets] = useState<Set[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(1);
  const { player, deviceId } = usePlayer();
  const [transitionDirection, setTransitionDirection] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [api, setApi] = useState<CarouselApi>();
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [playingTrack, setPlayingTrack] = useState<Track | null>(null);

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

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response: AxiosResponse<any> = await axios.get(
          "http://localhost:8080/sets",
          { withCredentials: true }
        );
        const fetchedSets = response.data.sets as Set[];
        setSets(fetchedSets);
        setSelectedIndex(1);
      } catch (error) {
        console.error("Failed to fetch sets", error);
      }
    };

    fetchSets();
  }, []);

  useEffect(() => {
    if (player && deviceId && sets.length > 2) {
      console.log("deviceId: ", deviceId);
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
    setCurrentTrackIndex(0); // Reset track index to the first track of the new playlist
  };

  const handleNextPlaylist = () => {
    api?.scrollNext();
    setTransitionDirection("right");
    setSelectedIndex((prevIndex) => Math.min(prevIndex + 1, sets.length - 2));
    setCurrentTrackIndex(0); // Reset track index to the first track of the new playlist
    debugger;
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
