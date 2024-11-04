import React from "react";
import SetsPage from "./pages/SetsPage";
import { PlayerProvider } from "./context/PlayerContext";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <PlayerProvider>
      <div className="flex flex-col min-h-screen">
        <header className="flex justify-start p-4">
          <img
            src="../public/assets/logo.svg" // Ensure this path is correct
            className="h-20 w-20 absolute" // Increased size
          />
        </header>
        <main className="flex-grow flex overflow-hidden">
          <div className="flex-grow flex items-center justify-center">
            <SetsPage />
          </div>
          <Sidebar />
        </main>
      </div>
    </PlayerProvider>
  );
}

export default App;
