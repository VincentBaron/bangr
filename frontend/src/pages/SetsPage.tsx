import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { usePlayer } from "../context/PlayerContext";
import SpotifyPlaylist from "../components/SpotifyPlaylist";

export interface Track {
  id: string;
  uri: string;
  name: string;
  artist: string;
  liked: boolean;
}
export interface Set {
  id: string;
  name: string;
  link: string;
  tracks: Track[];
  active?: boolean;
}

export default function SetsPage() {
  const [sets, setSets] = useState<Set[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(1);
  const { player, deviceId } = usePlayer();
  const [transitionDirection, setTransitionDirection] = useState<string>("");

  useEffect(() => {
    axios
      .get("http://localhost:8080/sets", { withCredentials: true })
      .then((response: AxiosResponse<any>) => {
        const fetchedSets = response.data.sets as Set[];
        setSets([
          { id: "dummy", name: "", link: "", tracks: [] },
          ...fetchedSets,
          { id: "dummy", name: "", link: "", tracks: [] },
        ]);
      });
  }, []);

  useEffect(() => {
    console.log("player: " + player);
    console.log("deviceId:" + deviceId);
    console.log("sets:" + sets);
    if (player && deviceId && sets.length > 0) {
      const set = sets[selectedIndex];
      console.log(set.link);
      axios.get(
        `http://localhost:8080/player?action=play&device_id=${deviceId}&&link=${set.link}`,
        { withCredentials: true }
      );
    }
  }, [player, deviceId, selectedIndex, sets]);

  const handlePrev = () => {
    setTransitionDirection("left");
    setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 1));
  };

  const handleNext = () => {
    setTransitionDirection("right");
    setSelectedIndex((prevIndex) => Math.min(prevIndex + 1, sets.length - 2));
  };

  const getVisibleSets = () => {
    if (sets.length < 3) return sets;
    return sets
      .slice(selectedIndex - 1, selectedIndex + 2)
      .map((set, index) => ({
        ...set,
        active: index === 1, // Set the active key for the middle set
      }));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "ArrowLeft") {
        handlePrev();
      } else if (event.code === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handlePrev, handleNext]);

  return (
    <div className="overflow-hidden  w-full">
      <div
        className={`flex justify-center transition-transform duration-300 items-center ${
          transitionDirection === "left"
            ? "animate-slide-left"
            : transitionDirection === "right"
            ? "animate-slide-right"
            : ""
        }`}
      >
        {getVisibleSets().map((set, index) => (
          <div key={index} className="w-1/3 inline-flex m-4 justify-center">
            <SpotifyPlaylist set={set} />
          </div>
        ))}
      </div>
    </div>
  );
}
