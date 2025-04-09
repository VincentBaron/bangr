import React, { useState } from "react";
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
import { login, signup } from "@/api/api";

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
  onClose: () => void;
  onSignUp: () => void;
  authMode: "login" | "signup";
}

const AuthDialog: React.FC<AuthDialogProps> = ({ authMode }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [hasOpenedTooltip, setHasOpenedTooltip] = useState(false);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null); // Reset error state before attempting login
    login(username, password)
      .then(() => {
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
    signup(username, password, selectedGenres)
      .then((response) => {
        login(username, password)
          .then(() => {
            window.location.reload();
            window.location.href = response.data.url;
          })
          .catch((error) => {
            console.log("error response data:", error.response.data);
            setLoginError(
              error.response.data.message || "Login failed. Please try again."
            );
          });
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

  const handleTabChange = (value: string) => {
    if (value === "signup" && !hasOpenedTooltip) {
      setHasOpenedTooltip(true);
    } else {
      setHasOpenedTooltip(false);
    }
  };

  return (
    <Card className="bg-gray text-primary border-purple w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="">Welcome to Bangr</CardTitle>
        <CardDescription className="">
          Login or create your profile to start discovering music.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={authMode}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="login-username" className="">
                  Username
                </Label>
                <Input
                  id="login-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-black"
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="login-password" className="">
                  Password
                </Label>
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
              <Button
                type="submit"
                className="w-full bg-purple hover:bg-hoverPurple "
              >
                Login
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="signup-username" className="">
                  Username
                </Label>
                <Input
                  id="signup-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-black"
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="signup-password" className="">
                  Password
                </Label>
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
                      className={`cursor-pointer border text-primary border-purple hover:bg-purple hover:bg-opacity-30 hover:border-white ${
                        selectedGenres.includes(genre) ? "bg-purple" : null
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
              <Button
                type="submit"
                className="w-full bg-purple bg-opacity-100 hover:bg-hoverPurple"
              >
                Sign Up
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AuthDialog;
