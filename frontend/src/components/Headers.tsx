import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Card } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import {
  fetchGenres,
  updateUserGenres,
  fetchLeaderboard,
  fetchPrizePool,
} from "@/api/api";
import { Menu, LogOut, CircleX, Check, ChevronDown } from "lucide-react";

interface PrizePoolData {
  current_month: number;
  next_month: number;
}

interface PrizePoolResponse {
  data: PrizePoolData;
}

const prizeGoal = 30; // Example goal
const currentPrize = 4; // Dynamic from backend or state

const donators = [
  { id: 1, name: "Alice", profilePhoto: "/avatars/alice.jpg" },
  { id: 2, name: "Bob", profilePhoto: "/avatars/bob.jpg" },
  { id: 3, name: "Charlie", profilePhoto: "/avatars/charlie.jpg" },
]; // Replace with real data

const Header: React.FC = () => {
  const { user, setUser } = useUser();
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    user?.genres || []
  );
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [prizePoolData, setPrizePoolData] = useState<PrizePoolData>({
    current_month: 0,
    next_month: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [genres, leaderboard, prizePool] = await Promise.all([
          fetchGenres({ withCredentials: true }),
          fetchLeaderboard(),
          fetchPrizePool(),
        ]);
        setAllGenres(genres.data);
        setLeaderboardData(leaderboard.data);
        setPrizePoolData(prizePool.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleCancelGenres = () => {
    // Revert to the original genres
    setSelectedGenres(user?.genres || []);
    setIsDropdownOpen(false);
  };

  // const handleUsernameChange = async () => {
  //   if (user) {
  //     try {
  //       const response = await axios.patch(
  //         `${import.meta.env.VITE_BACKEND_URL}/me`,
  //         {
  //           username: newUsername,
  //           genres: user.genres,
  //         },
  //         { withCredentials: true }
  //       );
  //       setUser({ ...user, username: newUsername });
  //       console.log("Username updated successfully", response.data);
  //     } catch (error) {
  //       console.error("Failed to update username", error);
  //     }
  //   }
  // };

  const handleLogout = () => {
    localStorage.removeItem("Authorization");
    localStorage.removeItem("SpotifyAuthorization");
    localStorage.removeItem("UserID");
    setUser(null);
    window.location.reload();
  };

  const handleSaveGenres = () => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return { ...prevUser, genres: selectedGenres };
    });

    // Update the backend
    updateUserGenres(selectedGenres, { withCredentials: true });

    // Close the dropdown
    setIsDropdownOpen(false);
  };

  useEffect(() => {}, [selectedGenres]);

  if (!user) {
    return null;
  }

  const handleDonate = () => {
    // redirect to your donate page / modal
    // redirect
    window.location.href = "https://buymeacoffee.com/vinnydapinny";
  };

  return (
    <div className="flex flex-col items-center justify-between">
      <Drawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        direction="left"
      >
        <DrawerTrigger asChild>
          <button className="absolute top-4 left-4 flex items-center justify-center rounded-full bg-gray hover:bg-gray-500/30 border border-white/10 p-2 transition-colors backdrop-blur-sm">
            <Menu className="text-white/70 hover:text-white/90" size={20} />
          </button>
        </DrawerTrigger>
        <DrawerContent className="h-full max-w-72 w-full bg-black/95 backdrop-blur-md text-white border-r border-white/5 p-3 shadow-lg flex flex-col justify-between [&>div:first-child]:hidden">
          <div className="space-y-6">
            {/* Filters Section */}
            <div>
              <h2 className="text-sm font-medium text-white/70 mb-3">
                Filters
              </h2>

              <div className="space-y-2">
                {/* Genres Button */}
                <button
                  className="flex items-center bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm transition-colors w-full"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  <span className="text-white/90">Genres</span>
                  <div className="flex items-center justify-center ml-2 bg-purple/20 text-purple border border-purple/20 rounded-md px-1.5 text-xs">
                    {selectedGenres.length}
                  </div>
                  <ChevronDown className="ml-auto text-white/50" size={16} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <Card className="absolute z-10 mt-1 left-3 right-3 bg-black/95 border border-white/10 text-white p-3 shadow-lg rounded-lg">
                    <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                      {allGenres.map((genre) => (
                        <button
                          key={genre}
                          className={`py-1.5 px-3 rounded-md text-xs transition-colors ${
                            selectedGenres.includes(genre)
                              ? "bg-purple/20 text-purple border border-purple/20"
                              : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white/90"
                          }`}
                          onClick={() => handleGenreToggle(genre)}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 mt-3 border-t border-white/5 pt-3">
                      <button
                        className="p-1.5 rounded-md hover:bg-white/5 text-white/70 hover:text-white/90 transition-colors"
                        onClick={handleCancelGenres}
                      >
                        <CircleX className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 rounded-md bg-purple/20 text-purple hover:bg-purple/30 transition-colors"
                        onClick={handleSaveGenres}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Leaderboard Section */}
            <div>
              <h2 className="text-sm font-medium text-white/70 mb-3">
                Leaderboard
              </h2>
              <div className="space-y-1.5">
                {leaderboardData.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-purple text-xs font-medium w-4">
                        {index + 1}
                      </span>
                      <img
                        src={
                          user.profilePhoto || "https://github.com/shadcn.png"
                        }
                        alt={user.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-white/90 text-sm font-medium truncate max-w-[120px]">
                        {user.name}
                      </span>
                    </div>
                    <span className="text-xs text-white/50">
                      {user.likes} {user.likes === 1 ? "like" : "likes"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prizepool Section */}
            <div>
              <h2 className="text-sm font-medium text-white/70 mb-3">
                Prize Pool
              </h2>

              <div className="space-y-4">
                {/* Current Month */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-white/50">Current Month</span>
                    <span className="text-sm font-medium text-white/90">
                      ${(prizePoolData?.current_month || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          ((prizePoolData?.current_month || 0) / prizeGoal) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Next Month */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-white/50">Next Month</span>
                    <span className="text-sm font-medium text-white/90">
                      ${(prizePoolData?.next_month || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          ((prizePoolData?.next_month || 0) / prizeGoal) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <Button
                  className="w-full bg-purple hover:bg-purple/90 text-white text-sm font-medium rounded-lg py-2"
                  onClick={handleDonate}
                >
                  🎉 Win a concert ticket
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Section */}
          <div className="border-t border-white/5 pt-3 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt={user.username}
                  />
                  <AvatarFallback className="bg-purple/20 text-purple">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-white/90">
                  {user.username}
                </span>
              </div>
              <Button
                variant="ghost"
                className="text-white/50 hover:text-white/70 p-1.5 hover:bg-white/5 rounded-md"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Header;
