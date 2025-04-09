import { useEffect, useState } from "react";
import SetsPage from "./pages/SetsPage";
import { PlayerProvider } from "./context/PlayerContext";
import Header from "./components/Headers";
import { UserProvider } from "./context/UserContext";
import WelcomePage from "./pages/WelcomePage";
import AuthDialog from "./components/AuthDialog";
import "./styles/fonts.css";
import "./styles/background-animation.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    const checkUserStatus = () => {
      const spotifyAuthorization = localStorage.getItem("SpotifyAuthorization"); // Retrieve UserID from localStorage
      if (!spotifyAuthorization) {
        localStorage.removeItem("UserID"); // Remove UserID from localStorage if it doesn't exist
        localStorage.removeItem("SpotifyAuthorization"); // Remove SpotifyAuthorization from localStorage if it doesn't exist
        localStorage.removeItem("Authorization"); // Remove Authorization from localStorage if it doesn't exist
      }
      setIsLoggedIn(!!spotifyAuthorization); // Set isLoggedIn to true if UserID exists
    };

    checkUserStatus();
  }, []);

  useEffect(() => {
    console.log("isAuthDialogOpen", isAuthDialogOpen);
  }, [isAuthDialogOpen]);

  useEffect(() => {
    console.log("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  const handleDiscoverMusicClick = () => {
    setAuthMode("signup");
    setIsAuthDialogOpen(true);
  };

  const handleLoginClick = () => {
    setAuthMode("login");
    setIsAuthDialogOpen(true);
  };

  const handleSignupClick = () => {
    setAuthMode("login");
    setIsAuthDialogOpen(true);
  };

  const handleCloseAuthDialog = () => {
    setIsAuthDialogOpen(false);
  };

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
        ) : !isAuthDialogOpen ? (
          <WelcomePage
            onDiscoverMusicClick={handleDiscoverMusicClick}
            onLoginClick={handleLoginClick}
          />
        ) : (
          <AuthDialog
            onClose={handleCloseAuthDialog}
            onSignUp={() => handleSignupClick()}
            authMode={authMode}
          />
        )}
      </div>
    </div>
  );
}
