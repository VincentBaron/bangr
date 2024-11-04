import React from "react";
import SetsPage from "./pages/SetsPage";
import { PlayerProvider } from "./context/PlayerContext";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <PlayerProvider>
      <div className="grid grid-cols-[1fr_400px] min-h-screen w-full">
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
        <Sidebar />
      </div>
    </PlayerProvider>
  );
}

export default App;
