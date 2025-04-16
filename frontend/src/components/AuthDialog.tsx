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
import { ArrowLeft } from "lucide-react";

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
  const [signupStep, setSignupStep] = useState<"credentials" | "genres">(
    "credentials"
  );

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
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
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupStep === "credentials") {
      if (!username || !password) {
        setSignupError("Please fill in all fields");
        return;
      }
      setSignupError(null);
      setSignupStep("genres");
    } else {
      if (selectedGenres.length === 0) {
        setSignupError("Please select at least one genre");
        return;
      }
      handleSignup();
    }
  };

  const handleSignup = () => {
    setSignupError(null);
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
        if (
          error.response.data.error === "Spotify Premium subscription required"
        ) {
          setSignupError(
            "A Spotify Premium subscription is required to use this app. Please upgrade your account and try again."
          );
        } else {
          setSignupError(
            error.response.data.message || "Failed to signup. Please try again."
          );
        }
      });
  };

  const handleTabChange = (value: string) => {
    if (value === "signup") {
      setSignupStep("credentials");
      if (!hasOpenedTooltip) {
        setHasOpenedTooltip(true);
      }
    } else {
      setHasOpenedTooltip(false);
    }
  };

  return (
    <Card className="relative bg-black/95 backdrop-blur-md border border-white/10 text-white w-80 max-w-md mx-auto overflow-hidden rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple/5 via-transparent to-purple/10" />
      <div className="absolute inset-0 bg-gradient-to-bl from-purple/10 via-transparent to-purple/5" />

      <div className="relative">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
            Welcome to Bangr
          </CardTitle>
          <CardDescription className="text-white/70">
            Login or create your profile to start discovering music.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs
            defaultValue={authMode}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 rounded-lg">
              <TabsTrigger
                value="login"
                className="rounded-md data-[state=active]:bg-purple/20 data-[state=active]:text-purple data-[state=active]:border data-[state=active]:border-purple/20 text-white/70 hover:text-white/90"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-md data-[state=active]:bg-purple/20 data-[state=active]:text-purple data-[state=active]:border data-[state=active]:border-purple/20 text-white/70 hover:text-white/90"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="login-username"
                    className="text-white/70 text-sm"
                  >
                    Username
                  </Label>
                  <Input
                    id="login-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple/30 focus:ring-purple/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="login-password"
                    className="text-white/70 text-sm"
                  >
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple/30 focus:ring-purple/20"
                  />
                </div>
                {loginError && (
                  <div className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">
                    {loginError}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-purple/20 hover:bg-purple/30 text-purple border border-purple/20 rounded-lg py-2 text-sm font-medium transition-colors"
                >
                  Login
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignupSubmit} className="space-y-4 mt-4">
                {signupStep === "credentials" ? (
                  <>
                    <div className="space-y-2">
                      <Label
                        htmlFor="signup-username"
                        className="text-white/70 text-sm"
                      >
                        Username
                      </Label>
                      <Input
                        id="signup-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple/30 focus:ring-purple/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="signup-password"
                        className="text-white/70 text-sm"
                      >
                        Password
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple/30 focus:ring-purple/20"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-purple/20 hover:bg-purple/30 text-purple border border-purple/20 rounded-lg py-2 text-sm font-medium transition-colors"
                    >
                      Next
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-1 mb-4">
                      <h3 className="text-lg font-medium text-white">
                        Select your favorite genres
                      </h3>
                      <p className="text-sm text-white/60">
                        Choose at least one genre to help us personalize your
                        experience
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {musicGenres.map((genre) => (
                        <Badge
                          key={genre}
                          variant={
                            selectedGenres.includes(genre)
                              ? "default"
                              : "outline"
                          }
                          className={`cursor-pointer transition-colors ${
                            selectedGenres.includes(genre)
                              ? "bg-purple/20 text-purple border-purple/20"
                              : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white/90 border-white/10"
                          }`}
                          onClick={() => handleGenreToggle(genre)}
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:text-white/90 p-2"
                        onClick={() => setSignupStep("credentials")}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-purple/20 hover:bg-purple/30 text-purple border border-purple/20 rounded-lg py-2 text-sm font-medium transition-colors"
                      >
                        Sign Up
                      </Button>
                    </div>
                  </>
                )}
                {signupError && (
                  <div className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">
                    {signupError}
                  </div>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </div>
    </Card>
  );
};

export default AuthDialog;
