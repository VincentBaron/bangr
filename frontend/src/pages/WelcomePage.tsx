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
    <div className="flex min-h-screen w-full flex-col bg-gray-950 text-white">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-3">
          <img src="/assets/logo.svg" className="h-10 w-10" alt="Bangr Logo" />
          <span className="text-2xl font-bold">Bangr</span>
        </div>
        <Button
          className="bg-purple hover:bg-hoverPurple h-8 w-24 rounded-xl text-sm"
          onClick={onLoginClick}
        >
          Log in
        </Button>
      </header>

      {/* Hero Section */}
      <div className="flex flex-col items-center text-center mt-20 space-y-4">
        <h1 className="text-6xl md:text-8xl font-extrabold text-purple leading-tight">
          Where
          <br />
          People
          <br />
          Share
          <br />
          Music
        </h1>
        <Button
          className="mt-6 bg-purple hover:bg-hoverPurple rounded-xl px-6 py-3 text-lg z-10"
          onClick={onDiscoverMusicClick}
        >
          Discover music
        </Button>
      </div>

      {/* Video Snippet + Shading */}
      <div className="relative mt-2 flex justify-center">
        <video
          className="rounded-xl shadow-2xl w-full max-w-5xl"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="public/assets/bangrCover.png" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Overlay SVG shadow effect */}
        <img
          src="public/assets/bangrCover.png"
          alt="Shading Effect"
          className="absolute bottom-4 pointer-events-none z-4 w-2xl"
        />
      </div>
    </div>
  );
};

export default WelcomePage;
