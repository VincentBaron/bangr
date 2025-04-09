import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { activatePlayer } from "@/api/api";

interface PlayerContextProps {
  player: Spotify.Player | null;
  deviceId: string | null;
}

// Extend the Window interface to include onSpotifyWebPlaybackSDKReady and Spotify
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

const PlayerContext = createContext<PlayerContextProps>({
  player: null,
  deviceId: null,
});

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const playerRef = useRef<Spotify.Player | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.id = "spotify-player";
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const access_token: string = Cookies.get(
        "SpotifyAuthorization"
      ) as string;
      const player = new window.Spotify.Player({
        name: "Web Playback SDK Quick Start Player",
        getOAuthToken: (cb: (token: string) => void) => {
          cb(access_token);
        },
      });

      playerRef.current = player;

      const handleReady = async ({ device_id }: { device_id: string }) => {
        console.log("Ready with Device ID", device_id);
        setDeviceId(device_id);
        try {
          await activatePlayer(device_id, { withCredentials: true });
        } catch (error) {
          console.error("Failed to activate player", error);
        }
      };

      const handleNotReady = ({ device_id }: { device_id: string }) => {
        console.log("Device ID has gone offline", device_id);
      };

      player.addListener("ready", handleReady);
      player.addListener("not_ready", handleNotReady);

      player.connect();

      // Cleanup function to remove the event listeners and disconnect the player
      return () => {
        player.removeListener("ready", handleReady);
        player.removeListener("not_ready", handleNotReady);
        player.disconnect();
      };
    };

    // Cleanup function to remove the script element
    return () => {
      const scriptElement = document.getElementById("spotify-player");
      if (scriptElement) {
        document.body.removeChild(scriptElement);
      }
    };
  }, []);

  return (
    <PlayerContext.Provider value={{ player: playerRef.current, deviceId }}>
      {children}
    </PlayerContext.Provider>
  );
};
