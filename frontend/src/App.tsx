"use client";

import React, { useEffect, useState } from "react";
import SetsPage from "./pages/SetsPage";
import { PlayerProvider } from "./context/PlayerContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const musicGenres = [
  "Rock",
  "Pop",
  "Hip-Hop",
  "Jazz",
  "Classical",
  "Electronic",
  "R&B",
  "Country",
  "Reggae",
  "Metal",
  "Folk",
  "Blues",
  "Indie",
  "Latin",
  "Punk",
  "Soul",
];

export default function App() {
  const [isSignedUp, setIsSignedUp] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  useEffect(() => {
    const checkUserStatus = () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("Authorization="));
      setIsSignedUp(!!token);
    };

    checkUserStatus();
  }, []);

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send login request to your backend
    console.log("Login attempt with:", { username, password });
    // For demo purposes, we'll just set isSignedUp to true
    setIsSignedUp(true);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send signup request to your backend
    console.log("Signup attempt with:", {
      username,
      password,
      profilePicture,
      selectedGenres,
    });
    // For demo purposes, we'll just set isSignedUp to true
    setIsSignedUp(true);
  };

  if (isSignedUp === null) {
    return <div>Loading...</div>;
  }

  return (
    <PlayerProvider>
      <div className="flex min-h-screen w-full">
        <div className="flex items-center p-4 w-full flex-col relative">
          <div className="flex items-center absolute left-0">
            <img
              src="../public/assets/logo.svg"
              className="h-20 w-20"
              alt="Website Logo"
            />
            <h1 className="text-4xl font-bold ml-4 text-primary">Bangr</h1>
          </div>
          {isSignedUp ? (
            <div className="flex justify-center items-center flex-grow w-full">
              <SetsPage />
            </div>
          ) : (
            <Dialog open={!isSignedUp} onOpenChange={setIsSignedUp}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Welcome to Bangr</DialogTitle>
                  <DialogDescription>
                    Login or create your profile to start discovering music.
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="login-username">Username</Label>
                        <Input
                          id="login-username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Login
                      </Button>
                    </form>
                  </TabsContent>
                  <TabsContent value="signup">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="signup-username">Username</Label>
                        <Input
                          id="signup-username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="picture">Profile Picture</Label>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage
                              src={profilePicture || ""}
                              alt="Profile picture"
                            />
                            <AvatarFallback>
                              {username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <Input
                            id="picture"
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                          />
                        </div>
                      </div>
                      <div className="grid w-full gap-1.5">
                        <Label>Favorite Genres</Label>
                        <div className="flex flex-wrap gap-2">
                          {musicGenres.map((genre) => (
                            <Badge
                              key={genre}
                              variant={
                                selectedGenres.includes(genre)
                                  ? "default"
                                  : "outline"
                              }
                              className="cursor-pointer"
                              onClick={() => handleGenreToggle(genre)}
                            >
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button type="submit" className="w-full">
                        Sign Up
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </PlayerProvider>
  );
}
