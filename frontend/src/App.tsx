"use client";

import React, { useEffect, useState } from "react";
import SetsPage from "./pages/SetsPage";
import { PlayerProvider } from "./context/PlayerContext";
import AuthDialog from "./components/AuthDialog"; // Import AuthDialog component
import Header from "./components/Headers";
import { UserProvider } from "./context/UserContext";
import "./styles/fonts.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(false);

  useEffect(() => {
    const checkUserStatus = () => {
      console.log("document.cookie" + document.cookie);
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("UserID="));
      setIsLoggedIn(!!token);
    };
    checkUserStatus();
    console.log(isLoggedIn);
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
            <div className="flex justify-center items-center w-full mt-8">
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
