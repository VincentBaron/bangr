import SpotifyPlayer from "../components/SpotifyPlayer";
import SpotifyPlaylist from "../components/SpotifyPlaylist";
import { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";

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
}

export default function SetsPage() {
  const [sets, setSets] = useState<Set[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(1);

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

  const handlePrev = () => {
    setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 1));
  };

  const handleNext = () => {
    setSelectedIndex((prevIndex) => Math.min(prevIndex + 1, sets.length - 2));
  };

  const getVisibleSets = () => {
    if (sets.length < 3) return sets;
    return sets.slice(selectedIndex - 1, selectedIndex + 2);
  };

  return (
    <div className="w-5/6 border">
      <div className="flex justify-center transition-transform duration-300 border border-green-500 items-center">
        {getVisibleSets().map((set, index) => (
          <div
            key={index}
            className="w-1/3 border border-red-500 inline-flex m-4 justify-center"
          >
            {index === 1 ? (
              <SpotifyPlaylist set={set} />
            ) : (
              <SpotifyPlaylist set={set} />
            )}
          </div>
        ))}
      </div>
      <button
        className="absolute left-0 top-1/2 transform -translate-y-1/2 ml-4 bg-gray-800 text-white px-4 py-2 rounded"
        onClick={handlePrev}
        disabled={selectedIndex === 1}
      >
        &#9664; {/* Left arrow */}
      </button>
      <button
        className="absolute right-0 top-1/2 transform -translate-y-1/2 mr-4 bg-gray-800 text-white px-4 py-2 rounded"
        onClick={handleNext}
        disabled={selectedIndex === sets.length - 2}
      >
        &#9654; {/* Right arrow */}
      </button>
    </div>
  );
}
