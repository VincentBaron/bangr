import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Toggle } from "@/components/ui/toggle";
import { useUser } from "@/context/UserContext";
import { fetchGenres, updateUserGenres } from "@/api/api";
import { Menu, LogOut } from "lucide-react";

const Header: React.FC = () => {
  const { user, setUser } = useUser();
  const [allGenres, setAllGenres] = useState<string[]>([]);
  // @ts-ignore
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // State to control the drawer

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
    if (user) {
      const updatedGenres = user.genres?.includes(genre)
        ? user.genres.filter((g) => g !== genre)
        : [...(user.genres || []), genre];
      setUser({ ...user, genres: updatedGenres });
      updateUserGenres(updatedGenres, { withCredentials: true });
    }
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

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-between">
      <img
        src="../public/assets/logo.svg"
        className="h-24 w-24"
        alt="Website Logo"
      />
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
        <DrawerContent className=" h-full max-w-[20vw] w-full bg-black text-white border-purple p-4 shadow-lg flex flex-col justify-between [&>div:first-child]:hidden">
          <div>
            <h2 className="text-lg font-bold text-primary mb-4">Genres</h2>
            <div className="flex flex-wrap gap-2">
              {allGenres.map((genre) => (
                <Toggle
                  key={genre}
                  pressed={user.genres.includes(genre)}
                  onPressedChange={() => handleGenreToggle(genre)}
                  className={`cursor-pointer text-primary flex items-center px-4 py-2 rounded-md ${
                    user.genres.includes(genre)
                      ? "bg-purple text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {genre}
                </Toggle>
              ))}
            </div>
          </div>
          {/* Profile Section */}
          <div className="mt-6">
            <h2 className="text-lg font-bold text-primary mb-4">Profile</h2>
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
