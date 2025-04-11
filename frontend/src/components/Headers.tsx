import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Card } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { fetchGenres, updateUserGenres } from "@/api/api";
import { Menu, LogOut, CircleX, Check, ChevronDown } from "lucide-react";

const leaderboardData = [
  {
    id: 1,
    profilePhoto: "https://github.com/shadcn.png",
    name: "Alice",
    likes: 120,
  },
  {
    id: 2,
    profilePhoto: "https://github.com/shadcn.png",
    name: "Bob",
    likes: 95,
  },
  {
    id: 3,
    profilePhoto: "https://github.com/shadcn.png",
    name: "Charlie",
    likes: 80,
  },
];

const Header: React.FC = () => {
  const { user, setUser } = useUser();
  const [allGenres, setAllGenres] = useState<string[]>([]);
  // @ts-ignore
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // State to control the drawer
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to control the dropdown
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    user?.genres || []
  ); // Local state for genres

  useEffect(() => {
    const fetchGenresx = async () => {
      try {
        const response = await fetchGenres({ withCredentials: true });
        setAllGenres(response.data);
      } catch (error) {
        console.error("Failed to fetch genres", error);
      }
    };
    fetchGenresx();
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

  useEffect(() => {
    console.log("Selected genres:", selectedGenres);
  }, [selectedGenres]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-between">
      <Drawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        direction="left"
      >
        <DrawerTrigger asChild>
          <button className="absolute top-4 left-4 flex items-center justify-center rounded-full bg-purple border-2 border-purple p-2">
            <Menu className="text-black" size={20} />
          </button>
        </DrawerTrigger>
        <DrawerContent className="h-full max-w-72 w-full bg-gray text-white border-transparent p-4 shadow-lg flex flex-col justify-between [&>div:first-child]:hidden">
          <div>
            <h2 className="text-lg font-bold text-primary mb-1">Filters</h2>
            <div className="h-1 bg-gradient-to-r from-purple to-transparent mb-4"></div>

            <div>
              {/* Genres Section */}
              <div className="relative">
                {/* Genres Button */}
                <button
                  className="flex items-center bg-purple px-2 py-2 rounded-3xl text-white"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  <span>Genres</span>
                  <div className="flex items-center justify-center ml-2 bg-white text-purple border-2 border-gray-300 rounded-full w-6 h-6 text-xs font-bold">
                    {selectedGenres.length}
                  </div>
                  <ChevronDown className="ml-1 text-white" size={18} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <Card className="absolute z-10 mt-2 left-0 bg-black border-purple text-white p-4 shadow-lg">
                    <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                      {/* All Genres */}
                      {allGenres.map((genre) => (
                        <button
                          key={genre}
                          className={` py-1 px-0 rounded-md ${
                            selectedGenres.includes(genre)
                              ? "bg-purple text-white text-xs hover:bg-hoverPurple"
                              : "bg-gray-700 text-white text-xs hover:bg-purple"
                          }`}
                          onClick={() => handleGenreToggle(genre)}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>

                    {/* Save/Cancel Buttons */}
                    <div className="flex justify-end mt-4">
                      <button
                        className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                        onClick={handleCancelGenres}
                      >
                        <CircleX className="w-4 h-4 mr-1" />
                      </button>
                      <button
                        className="bg-purple text-white px-4 py-2 rounded-md hover:bg-hoverPurple"
                        onClick={handleSaveGenres}
                      >
                        <Check className="w-4 h-4 mr-1" />
                      </button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
            {/* Leaderboard Section */}
            <div className="mt-6">
              <h2 className="text-lg font-bold text-primary mb-1">
                Leaderboard
              </h2>
              <div className="h-1 bg-gradient-to-r from-purple to-transparent mb-4" />

              <div className="flex flex-col">
                {leaderboardData.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between bg-gray-800 px-1 py-1 rounded-lg shadow-sm"
                  >
                    {/* Left side: Rank, Avatar, Name */}
                    <div className="flex items-center gap-3">
                      <span className="text-purple font-bold">{index + 1}</span>
                      <img
                        src={user.profilePhoto}
                        alt={user.name}
                        className="w-7 rounded-full"
                      />
                      <span className="text-white font-medium truncate max-w-[120px] sm:max-w-[200px]">
                        {user.name}
                      </span>
                    </div>

                    {/* Right side: Likes */}
                    <div className="text-sm text-gray-300">
                      {user.likes} {user.likes === 1 ? "like" : "likes"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Section */}
          <div className="mt-6">
            <h2 className="text-lg font-bold text-primary mb-1">Profile</h2>
            <div className="h-1 bg-gradient-to-r from-purple to-transparent mb-4"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 rounded-full">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt={user.username}
                    className="rounded-full"
                  />
                  <AvatarFallback className="bg-orange-500 text-white flex items-center justify-center rounded-full">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="text-primary font-semibold text-base">
                  {user.username}
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 p-2"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Header;
