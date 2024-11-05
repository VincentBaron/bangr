import React from "react";
import { Set } from "../pages/SetsPage";
import SpotifyPlayer from "./SpotifyPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface SpotifyPlaylistProps {
  set: Set;
}

export default function SpotifyPlaylist({ set }: SpotifyPlaylistProps) {
  return (
    <Card className="bg-gray text-primary border-purple w-full max-w-md mx-auto my-4 neon-shadow">
      <CardHeader>
        <CardTitle className="">{set.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {set.active ? (
          <SpotifyPlayer set={set} />
        ) : (
          set.tracks?.map((track) => (
            <div
              key={track.id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center">
                <Avatar className="mr-2">
                  <AvatarImage
                    src={`https://i.scdn.co/image/${track.id}`}
                    alt={track.name}
                  />
                  <AvatarFallback>{track.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-primary">{track.name}</p>
                  <p className="text-secondary">{track.artist}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-primary bg-purple "
              >
                {track.liked ? "Liked" : "Like"}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
