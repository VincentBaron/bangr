"use client";

import React, { useEffect, useState } from "react";
import SetsPage from "./pages/SetsPage";
import { PlayerProvider } from "./context/PlayerContext";
import AuthDialog from "./components/AuthDialog"; // Import AuthDialog component

export default function App() {
  const [isSignedUp, setIsSignedUp] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUserStatus = () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("SpotifyAuthorization="));
      setIsSignedUp(!!token);
    };

    checkUserStatus();
  }, []);

  if (isSignedUp === null) {
    return <div>Loading...</div>;
  }

  return (
    <PlayerProvider>
      <div className="flex min-h-screen w-full">
        <div className="flex items-center p-4 w-full flex-col relative">
          <div className="flex items-center absolute left-0">
            <img
              src="../public/assets/logo.svg"
              className="h-20 w-20"
              alt="Website Logo"
            />
            <h1 className="text-4xl font-bold ml-4 text-primary">Bangr</h1>
          </div>
          {isSignedUp ? (
            <div className="flex justify-center items-center flex-grow w-full">
              <SetsPage />
            </div>
          ) : (
            <AuthDialog
              isOpen={!isSignedUp}
              onClose={() => setIsSignedUp(true)}
              onSignUp={() => setIsSignedUp(true)}
            />
          )}
        </div>
      </div>
    </PlayerProvider>
  );
}
