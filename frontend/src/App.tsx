"use client";

import React, { useEffect, useState } from "react";
import SetsPage from "./pages/SetsPage";
import { PlayerProvider } from "./context/PlayerContext";
import AuthDialog from "./components/AuthDialog"; // Import AuthDialog component
import Header from "./components/Headers";
import { UserProvider } from "./context/UserContext";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUserStatus = () => {
      console.log("document.cookie" + document.cookie);
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("SpotifyAuthorization="));
      setIsLoggedIn(!!token);
    };

    checkUserStatus();
  }, []);

  if (isLoggedIn === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      {isLoggedIn ? (
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
          isOpen={!isLoggedIn}
          onClose={() => setIsLoggedIn(true)}
          onSignUp={() => setIsLoggedIn(true)}
        />
      )}
    </div>
  );
}
