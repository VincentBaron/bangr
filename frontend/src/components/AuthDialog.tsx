import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: () => void;
}

const AuthDialog: React.FC<AuthDialogProps> = ({
  isOpen,
  onClose,
  onSignUp,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    axios
      .post(
        "http://localhost:8080/login",
        { username: username, password },
        { withCredentials: true }
      )
      .then((response) => {
        console.log("response data: ", response.data);
      })
      .catch((error) => {
        console.log("error response data:", error.response.data);
      });
    console.log("Login attempt with:", { username, password });
    onSignUp();
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    axios
      .post("http://localhost:8080/signup", {
        username: username,
        password,
        genres: selectedGenres,
      })
      .then((response) => {
        window.location.href = response.data.url;
      })
      .catch((error) => {
        console.log("error response data:", error.response.data);
      });
    console.log("Signup attempt with:", {
      username,
      password,
      selectedGenres,
    });
    onSignUp();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              <div className="grid w-full gap-1.5">
                <Label>Favorite Genres</Label>
                <div className="flex flex-wrap gap-2">
                  {musicGenres.map((genre) => (
                    <Badge
                      key={genre}
                      variant={
                        selectedGenres.includes(genre) ? "default" : "outline"
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
  );
};

export default AuthDialog;
