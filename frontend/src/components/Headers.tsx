import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/context/UserContext";
import { X } from "lucide-react";
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
    <div className="flex items-center justify-between p-6 w-full bg-gray-900">
      <div className="flex items-center">
        <img
          src="../public/assets/logo.svg"
          className="h-16 w-16"
          alt="Website Logo"
        />
        <h1 className="text-3xl font-bold ml-4 text-primary">Bangr</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-2 justify-center">
          {user.genres.map((genre) => (
            <Badge
              key={genre}
              variant="default"
              className="cursor-pointer text-primary flex items-center"
              onClick={() => handleGenreToggle(genre)}
            >
              {genre}
              <X className="ml-1" size={16} />
            </Badge>
          ))}
          <Select onValueChange={handleGenreToggle}>
            <SelectTrigger className="bg-purple text-primary">
              <SelectValue placeholder="Add genre"></SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-gray text-primary">
              {allGenres
                .filter((genre) => !user.genres.includes(genre))
                .map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center cursor-pointer">
              <Avatar className="w-10 h-10 rounded-full">
                <AvatarImage
                  src={user.profilePicURL}
                  alt={user.username}
                  className="rounded-full"
                />
                <AvatarFallback className="bg-orange-500 text-white flex items-center justify-center rounded-full">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="ml-2 text-primary text-lg">{user.username}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="bg-gray-800 text-white p-2 rounded"
                placeholder="New username"
              />
              <button
                onClick={handleUsernameChange}
                className="ml-2 bg-blue-500 text-white p-2 rounded"
              >
                Update
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Header;
