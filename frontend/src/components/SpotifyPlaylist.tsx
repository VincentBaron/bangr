import { Set } from "../pages/SetsPage";

interface SpotifyPlaylistProps {
  set: Set;
}

export default function SpotifyPlaylist({ set }: SpotifyPlaylistProps) {
  return (
    <div className="border flex flex-col inline-flex">
      {set &&
        set.tracks?.map((track) => (
          <div
            key={track.id}
            className="border flex justify-center inline-flex"
          >
            <span className="text-blue-500">{track.name}</span>
            <span> </span>
            <span className="text-black">{track.artist}</span>
          </div>
        ))}
    </div>
  );
}
