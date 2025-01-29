import React, { useEffect, useRef, useState } from "react";
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

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
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const [tooltipStep, setTooltipStep] = useState(1);
  const [hasOpenedTooltip, setHasOpenedTooltip] = useState(false);

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
        window.location.href = response.data.url;
        console.log("response data: ", response.data);
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
      setIsTooltipOpen(true);
      setTooltipStep(1);
      setHasOpenedTooltip(true);
    } else {
      setIsTooltipOpen(false);
      setHasOpenedTooltip(false);
    }
  };

  const handleNextTooltipStep = () => {
    setTooltipStep((prevStep) => prevStep + 1);
  };

  const handlePrevTooltipStep = () => {
    setTooltipStep((prevStep) => prevStep - 1);
  };

  const handleTooltipClose = () => {
    setIsTooltipOpen(false);
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col justify-center items-center">
        <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
          <TooltipTrigger asChild>
            <button className="absolute top-4 left-4 p-2 rounded-full bg-purple-500 text-white">
              ?
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            align="start"
            className="w-[400px] bg-gray border-2 border-purple text-primary font-custom p-6 rounded-lg shadow-lg"
          >
            {tooltipStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-2xl text-purple font-bold">
                  Welcome to Bangr !
                </h3>
                <p className="text-primary">
                  For all the music lovers, the diggers, the ones who can't stop
                  searching new emotions throughout music, I created Bangr.
                </p>
                <p className="text-primary">
                  From the relaisation that conventional streaming plateforms
                  did not give me the opportunity to showcase the bangers I
                  discovered and be able to listen to other peoples music
                  discoveries....
                </p>
                <Button
                  onClick={handleNextTooltipStep}
                  className="w-full bg-purple hover:bg-hoverPurple transition-colors"
                >
                  Continue
                </Button>
              </div>
            )}
            {tooltipStep === 2 && (
              <div className="space-y-4">
                <p className="text-primary">
                  Upon signing up, a playlist will automatically be created on
                  your spotify account. You can put up to 3 bangers you discover
                  during the week inside it.
                </p>
                <div className="rounded-lg overflow-hidden border border-purple">
                  <img
                    src="../public/assets/bangr1.png"
                    className="w-full object-cover"
                    alt="Website Logo"
                  />
                </div>
                <div className="flex justify-between gap-2">
                  <Button
                    onClick={handlePrevTooltipStep}
                    className="flex-1 bg-gray hover:bg-purple/20 border-2 border-purple text-purple transition-colors"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setIsTooltipOpen(false)}
                    className="flex-1 bg-purple hover:bg-hoverPurple transition-colors"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
            {tooltipStep === 3 && (
              <div className="space-y-4">
                <p className="text-primary">
                  Each monday, you will be able to listen to everyone's bangers
                  from the past week in a story like format ! 🔥
                </p>
                <div className="rounded-lg overflow-hidden border border-purple">
                  <img
                    src="../public/assets/bangr1.png"
                    className="w-full object-cover"
                    alt="Website Logo"
                  />
                </div>
                <div className="flex justify-between gap-2">
                  <Button
                    onClick={handlePrevTooltipStep}
                    className="flex-1 bg-gray hover:bg-purple/20 border-2 border-purple text-purple transition-colors"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => handleTooltipClose}
                    className="flex-1 bg-purple hover:bg-hoverPurple transition-colors"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </TooltipContent>
        </Tooltip>
        <div className="flex items-center space-x-4">
          <img
            src="../public/assets/logo.svg"
            className="h-20 w-20"
            alt="Website Logo"
          />
          <h1 className="font-custom text-7xl text-purple">Bangr</h1>
        </div>
        <div className="text-center mb-10">
          <h2 className="text-primary text-left text-3xl font-custom">
            Banger
          </h2>
          <p className="font-custom text-xl mt-2 text-primary text-left">
            /bang·uh/
          </p>
          <p className="font-custom text-xl mt-2 text-primary text-left">
            A song that makes you feel the need to headbang to the beat.
          </p>
        </div>
        <Card className="bg-gray text-primary border-purple w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="font-custom">Welcome to Bangr</CardTitle>
            <CardDescription className="font-custom">
              Login or create your profile to start discovering music.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="login"
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
                    <Label htmlFor="login-username" className="font-custom">
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
                    <Label htmlFor="login-password" className="font-custom">
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
                    className="w-full bg-purple hover:bg-hoverPurple font-custom"
                  >
                    Login
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="signup-username" className="font-custom">
                      Username
                    </Label>
                    <Input
                      id="signup-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="text-black font-custom"
                    />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="signup-password" className="font-custom">
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
                            selectedGenres.includes(genre)
                              ? "default"
                              : "outline"
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
      </div>
    </TooltipProvider>
  );
};

export default AuthDialog;
