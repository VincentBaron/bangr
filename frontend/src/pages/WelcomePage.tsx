import React from "react";
import { Button } from "@/components/ui/button";

interface WelcomePageProps {
  onDiscoverMusicClick: () => void;
  onLoginClick: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({
  onDiscoverMusicClick,
  onLoginClick,
}) => {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div>
        <header className="flex justify-between items-center pt-8 pb-8 pl-28 pr-28 bg-gray-900 text-white">
          <div className="flex items-center space-x-4">
            <img
              src="../public/assets/logo.svg"
              className="h-10 w-10"
              alt="Bangr Logo"
            />
            <span className="text-2xl font-bold">Bangr</span>
          </div>
          <Button
            className="bg-purple hover:bg-hoverPurple"
            onClick={onLoginClick}
          >
            Log in
          </Button>
        </header>
        <div className="flex flex-col justify-center items-center w-full mt-20">
          <div className="flex items-center space-x-4 mb-5">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-9xl text-purple">Where</h1>
              <h1 className="text-9xl text-purple">People</h1>
              <h1 className="text-9xl text-purple">Share</h1>
              <h1 className="text-9xl text-purple">Music</h1>
            </div>
          </div>
          <Button
            className="bg-purple hover:bg-hoverPurple"
            onClick={onDiscoverMusicClick}
          >
            Discover music
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
