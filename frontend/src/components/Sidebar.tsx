import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X } from "lucide-react";

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

const thresholds = [
  { amount: 50, winners: 1 },
  { amount: 100, winners: 5 },
  { amount: 200, winners: 10 },
  { amount: 400, winners: 20 },
  { amount: 800, winners: 40 },
  { amount: 1200, winners: 80 },
  { amount: 1600, winners: 120 },
];

const Sidebar: React.FC = () => {
  const [activeGenres, setActiveGenres] = useState<string[]>([
    "Rock",
    "Pop",
    "Jazz",
  ]);
  const [prizePool, setPrizePool] = useState<number>(75); // Example prize pool amount

  const toggleGenre = (genre: string) => {
    if (activeGenres.includes(genre)) {
      setActiveGenres(activeGenres.filter((g) => g !== genre));
    } else {
      setActiveGenres([...activeGenres, genre]);
    }
  };

  const currentThreshold = thresholds.find(
    (threshold) => prizePool <= threshold.amount
  ) || { amount: 0, winners: 0 };

  return (
    <div className="w-1/4 p-4 box-border">
      <Card className="h-full flex flex-col bg-white shadow-lg">
        <CardContent className="flex flex-col h-full overflow-hidden">
          {/* PrizePool Section */}
          <div className="mb-4">
            <CardHeader>
              <CardTitle>PrizePool</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full mb-2">
                <Progress
                  value={(prizePool / currentThreshold.amount) * 100}
                  className="w-full"
                />
              </div>
              <p className="text-sm mb-2">Current Prize Pool: €{prizePool}</p>
              <p className="text-sm mb-2">
                Winners: {currentThreshold.winners}
              </p>
              <div className="flex items-center space-x-1 mb-2">
                <ul className="text-sm flex -space-x-2">
                  <li>
                    <Avatar className="h-6 w-6 border-2 border-white">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="Profile Avatar"
                      />
                    </Avatar>
                  </li>
                  <li>
                    <Avatar className="h-6 w-6 border-2 border-white">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="Profile Avatar"
                      />
                    </Avatar>
                  </li>
                  <li>
                    <Avatar className="h-6 w-6 border-2 border-white">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="Profile Avatar"
                      />
                    </Avatar>
                  </li>
                </ul>
                <Button variant="outline" size="sm">
                  Join PrizePool
                </Button>
              </div>
            </CardContent>
          </div>

          {/* Leaderboard Section */}
          <div className="flex-grow overflow-y-auto mb-4">
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="text-sm w-full">
                <thead>
                  <tr>
                    <th className="text-left">Rank</th>
                    <th className="text-left">Profile</th>
                    <th className="text-left">Genres</th>
                    <th className="text-left">Points</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Profile 1</td>
                    <td>Genre 1</td>
                    <td>1000</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Profile 2</td>
                    <td>Genre 2</td>
                    <td>900</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>Profile 3</td>
                    <td>Genre 3</td>
                    <td>800</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </div>

          {/* Profile Section */}
          <div className="mt-auto bg-white p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="Profile Avatar"
                />
              </Avatar>
              <div>
                <p className="text-lg font-semibold">User Name</p>
                <div className="flex flex-wrap items-center space-x-1 mt-1">
                  {allGenres.map((genre) => (
                    <span
                      key={genre}
                      className={`px-2 py-1 rounded-full text-xs cursor-pointer ${
                        activeGenres.includes(genre)
                          ? "bg-green-500 text-white"
                          : "bg-transparent border border-gray-300 text-gray-500"
                      }`}
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                      {activeGenres.includes(genre) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sidebar;
