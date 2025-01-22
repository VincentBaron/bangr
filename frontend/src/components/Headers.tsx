import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toggle } from "@/components/ui/toggle";
import { useUser } from "@/context/UserContext";
import axios from "axios";

const Header: React.FC = () => {
  const { user, setUser } = useUser();
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [newUsername, setNewUsername] = useState(user?.username || "");

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get("http://localhost:8080/genres", {
          withCredentials: true,
        });
        setAllGenres(response.data);
      } catch (error) {
        console.error("Failed to fetch genres", error);
      }
    };
    fetchGenres();
  }, []);

  const handleGenreToggle = (genre: string) => {
    if (user) {
      const updatedGenres = user.genres?.includes(genre)
        ? user.genres.filter((g) => g !== genre)
        : [...(user.genres || []), genre];
      setUser({ ...user, genres: updatedGenres });
      axios.patch(
        `http://localhost:8080/me`,
        {
          genres: updatedGenres,
        },
        { withCredentials: true }
      );
    }
  };

  const handleUsernameChange = async () => {
    if (user) {
      try {
        const response = await axios.patch(
          `http://localhost:8080/me`,
          {
            username: newUsername,
            genres: user.genres,
          },
          { withCredentials: true }
        );
        setUser({ ...user, username: newUsername });
        console.log("Username updated successfully", response.data);
      } catch (error) {
        console.error("Failed to update username", error);
      }
    }
  };

  const handleLogout = () => {
    document.cookie = "Authorization=; Max-Age=0; path=/;";
    document.cookie = "SpotifyAuthorization=; Max-Age=0; path=/;";
    document.cookie = "UserID=; Max-Age=0; path=/;";
    setUser(null);
    window.location.reload();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-between mx-[40rem] mt-[10rem]">
      <div className="flex items-center mb-10">
        <img
          src="../public/assets/logo.svg"
          className="h-20 w-20"
          alt="Website Logo"
        />
      </div>
      <div className="flex gap-2 justify-center">
        {allGenres.map((genre) => (
          <Toggle
            key={genre}
            pressed={user.genres.includes(genre)}
            onPressedChange={() => handleGenreToggle(genre)}
            className={`cursor-pointer text-primary flex items-center font-custom ${
              user.genres.includes(genre) ? "bg-purple" : ""
            }`}
          >
            {genre}
          </Toggle>
        ))}
      </div>
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center cursor-pointer">
              <Avatar className="w-10 h-10 rounded-full">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt={user.username}
                  className="rounded-full"
                />
                <AvatarFallback className="bg-orange-500 text-white flex items-center justify-center rounded-full">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray text-primary border-purple mt-4 shadow-lg shadow-purple hover:purple hover:bg-gray mr-4">
            <DropdownMenuItem onClick={handleLogout} className="hover:bg-gray">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Header;
