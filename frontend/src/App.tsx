import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import SetsPage from "./pages/SetsPage";
import SignupPage from "./pages/SignupPage";
import axios from "axios";
import { PlayerProvider } from "./context/PlayerContext";
import Sidebar from "./components/Sidebar";

function App() {
  const [isSignedUp, setIsSignedUp] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await axios.get("http://localhost:8080/user/status", {
          withCredentials: true,
        });
        setIsSignedUp(response.data.isSignedUp);
      } catch (error) {
        console.error("Failed to check user status", error);
        setIsSignedUp(false);
      }
    };

    checkUserStatus();
  }, []);

  if (isSignedUp === null) {
    return <div>Loading...</div>;
  }

  return (
    // <Router>
    //   <Routes>
    //     <Route path="/signup" element={<SignupPage />} />
    //     <Route path="/sets" element={<SetsPage />} />
    //     <Route
    //       path="/"
    //       element={isSignedUp ? <Navigate to="/sets" /> : <Navigate to="/signup" />}
    //     />
    //   </Routes>
    // </Router>
    <PlayerProvider>
      <div className="flex min-h-screen w-full">
        <div className="flex items-center p-4 w-full flex-col relative">
          <div className="flex items-center absolute left-0">
            <img
              src="../public/assets/logo.svg" // Ensure this path is correct
              className="h-20 w-20" // Increased size
              alt="Website Logo"
            />
            <h1 className="text-4xl font-bold ml-4">Bangr</h1>
          </div>
          <div className="flex justify-center items-center flex-grow w-full">
            <SetsPage />
          </div>
        </div>
        {/* <Sidebar /> */}
      </div>
    </PlayerProvider>
  );
}

export default App;
