import React, { useEffect, useState } from "react";
import SetsPage from "./pages/SetsPage";
import { PlayerProvider } from "./context/PlayerContext";
import WelcomePage from "./pages/WelcomePage"; // Import AuthDialog component
import Header from "./components/Headers";
import { UserProvider } from "./context/UserContext";
import "./styles/fonts.css";
import "./styles/background-animation.css"; // Import the background animation CSS

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(false);

  useEffect(() => {
    const checkUserStatus = () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("UserID="));
      setIsLoggedIn(!!token);
    };
    checkUserStatus();
  }, []);

  if (isLoggedIn === null) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="absolute w-100%">
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </div>
      <div className="flex min-h-screen w-full flex-col justify-center items-center">
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
          <WelcomePage />
        )}
        {/* <AuthDialog
            isOpen={!isLoggedIn}
            onClose={() => setIsLoggedIn(true)}
            onSignUp={() => setIsLoggedIn(true)}
          /> */}
      </div>
    </div>
  );
}
