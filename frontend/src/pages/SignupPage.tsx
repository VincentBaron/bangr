import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const allGenres = [
  "Rock",
  "Pop",
  "Jazz",
  "Hip-Hop",
  "Classical",
  "Electronic",
  "Country",
  "Reggae",
  "Blues",
  "Metal",
  "Folk",
  "Soul",
  "R&B",
  "Punk",
  "Disco",
];

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleGenreToggle = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/signup", {
        username,
        password,
      });
      const userId = response.data.id;
      await axios.patch(`http://localhost:8080/user/${userId}`, {
        genres: selectedGenres,
      });
      navigate("/sets");
    } catch (error) {
      console.error("Failed to sign up", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark text-primary">
      <Card className="w-full max-w-md mx-auto my-4 bg-dark text-primary">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-secondary">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-divider-gray bg-dark text-primary placeholder-secondary"
              />
            </div>
            <div>
              <label className="block text-secondary">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-divider-gray bg-dark text-primary placeholder-secondary"
              />
            </div>
            <div>
              <label className="block text-secondary">Select Genres</label>
              <div className="flex flex-wrap">
                {allGenres.map((genre) => (
                  <Button
                    key={genre}
                    type="button"
                    variant={
                      selectedGenres.includes(genre) ? "primary" : "outline"
                    }
                    onClick={() => handleGenreToggle(genre)}
                    className={`mr-2 mb-2 ${
                      selectedGenres.includes(genre)
                        ? "bg-pink text-primary hover:bg-hover-pink"
                        : "bg-divider-gray text-primary hover:bg-divider-gray"
                    }`}
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-pink text-primary hover:bg-hover-pink"
            >
              Sign Up
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
