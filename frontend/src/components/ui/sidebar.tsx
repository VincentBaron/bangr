import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const TopBar: React.FC = () => {
  return (
    <aside className="w-1/4 p-4 space-y-4">
      {/* PrizePool Section */}
      <Card>
        <CardHeader>
          <CardTitle>PrizePool</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={50} className="mb-4" />
          <ul className="mb-4">
            <li>Contributor 1</li>
            <li>Contributor 2</li>
            <li>Contributor 3</li>
          </ul>
          <Button variant="outline">Join PrizePool</Button>
        </CardContent>
      </Card>

      {/* Leaderboard Section */}
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
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
      </Card>

      {/* Profile Section */}
      <Card>
        <CardContent className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/path/to/avatar.png" alt="Profile Avatar" />
          </Avatar>
          <div>
            <p className="text-lg font-semibold">User Name</p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
};

export default TopBar;
