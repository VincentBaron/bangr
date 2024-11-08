import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/UserContext";
import { X } from "lucide-react";

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

const Header: React.FC = () => {
  const { user, setUser } = useUser();

  const handleGenreToggle = (genre: string) => {
    if (user) {
      const updatedGenres = user.genres?.includes(genre)
        ? user.genres.filter((g) => g !== genre)
        : [...(user.genres || []), genre];
      setUser({ ...user, genres: updatedGenres });
    }
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
        <div className="flex flex-wrap gap-2 justify-center">
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
            <SelectTrigger className="ml-2 h-8">
              <SelectValue placeholder="Add Genre" />
            </SelectTrigger>
            <SelectContent>
              {musicGenres
                .filter((genre) => !user.genres.includes(genre))
                .map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
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
      </div>
    </div>
  );
};

export default Header;
