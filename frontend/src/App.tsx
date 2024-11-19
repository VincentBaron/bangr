"use client";

import React, { useEffect, useState } from "react";
import SetsPage from "./pages/SetsPage";
import { PlayerProvider } from "./context/PlayerContext";
import AuthDialog from "./components/AuthDialog"; // Import AuthDialog component
import Header from "./components/Headers";
import { UserProvider } from "./context/UserContext";

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
    <div className="flex min-h-screen w-full flex-col">
      {isSignedUp ? (
        <UserProvider>
          <PlayerProvider>
            <Header />
            <div className="flex justify-center items-center flex-grow w-full">
              <SetsPage />
            </div>
          </PlayerProvider>
        </UserProvider>
      ) : (
        <AuthDialog
          isOpen={!isSignedUp}
          onClose={() => setIsSignedUp(true)}
          onSignUp={() => setIsSignedUp(true)}
        />
      )}
    </div>
  );
}
