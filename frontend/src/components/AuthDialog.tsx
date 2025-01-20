import React, { useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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

const AuthDialog: React.FC<AuthDialogProps> = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null); // Reset error state before attempting login
    axios
      .post(
        "http://localhost:8080/login",
        { username: username, password },
        { withCredentials: true }
      )
      .then((response) => {
        console.log("response data: ", response.data);
        window.location.reload();
      })
      .catch((error) => {
        console.log("error response data:", error.response.data);
        setLoginError(
          error.response.data.message || "Login failed. Please try again."
        );
      });
    console.log("Login attempt with:", { username, password });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null); // Reset error state before attempting signup
    axios
      .post("http://localhost:8080/signup", {
        username: username,
        password,
        genres: selectedGenres,
      })
      .then((response) => {
        console.log("response data: ", response.data);
        window.location.reload();
      })
      .catch((error) => {
        console.log("error response data:", error.response.data);
        setSignupError(
          error.response.data.message || "Failed to signup. Please try again."
        );
      });
    console.log("Signup attempt with:", {
      username,
      password,
      selectedGenres,
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col justify-center items-center">
      <div className="flex items-center mb-10">
        <img
          src="../public/assets/logo.svg"
          className="h-20 w-20"
          alt="Website Logo"
        />
      </div>
      <Card className="bg-gray text-primary border-purple w-full max-w-md mx-auto my-4">
        <CardHeader>
          <CardTitle>Welcome to Bangr</CardTitle>
          <CardDescription>
            Login or create your profile to start discovering music.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                    className="text-black"
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-black"
                  />
                </div>
                {loginError && (
                  <div className="text-red-500 text-sm">{loginError}</div>
                )}
                <Button type="submit" className="w-full bg-purple">
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
                    className="text-black"
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-black"
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
                        className={`cursor-pointer ${
                          selectedGenres.includes(genre)
                            ? "bg-purple"
                            : "border-purple text-primary"
                        }`}
                        onClick={() => handleGenreToggle(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
                {signupError && (
                  <div className="text-red text-sm">{signupError}</div>
                )}
                <Button type="submit" className="w-full bg-purple">
                  Sign Up
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthDialog;
