import React from "react";
import { Set } from "../pages/SetsPage";
import SpotifyPlayer from "./SpotifyPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface SpotifyPlaylistProps {
  set: Set;
}

export default function SpotifyPlaylist({ set }: SpotifyPlaylistProps) {
  return set.active ? (
    <SpotifyPlayer set={set} />
  ) : (
    <Card className="w-full max-w-md mx-auto my-4">
      <CardContent>
        {set.tracks?.map((track) => (
          <div
            key={track.id}
            className="flex items-center justify-between py-2"
          >
            <div className="flex items-center">
              <div>
                <p className="text-blue-500">{track.name}</p>
                <p className="text-gray-500">{track.artist}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              {track.liked ? "Liked" : "Like"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
