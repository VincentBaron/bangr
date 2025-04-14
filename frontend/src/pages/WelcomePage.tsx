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
    <div className="relative min-h-screen w-full bg-black/95 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple/5 via-transparent to-purple/10" />
      <div className="absolute inset-0 bg-gradient-to-bl from-purple/10 via-transparent to-purple/5" />

      {/* Content Container */}
      <div className="relative">
        {/* Header */}
        <header className="flex justify-between items-center px-6 py-4 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple/20 via-purple/10 to-transparent rounded-xl blur-sm" />
              <img
                src="/assets/logo.svg"
                className="relative h-10 w-10"
                alt="Bangr Logo"
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
              Bangr
            </span>
          </div>
          <Button
            className="bg-purple/20 hover:bg-purple/30 text-purple border border-purple/20 h-9 px-6 rounded-lg text-sm font-medium transition-colors"
            onClick={onLoginClick}
          >
            Log in
          </Button>
        </header>
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mt-16 md:mt-24 space-y-8 px-4">
          <h1 className="relative">
            <div className="absolute -inset-x-8 -inset-y-4 bg-gradient-to-r from-purple/10 via-purple/5 to-transparent blur-xl rounded-3xl" />
            <span className="relative text-6xl md:text-8xl font-extrabold bg-gradient-to-b from-white via-white/90 to-white/80 bg-clip-text text-transparent leading-tight">
              Where
              <br />
              People
              <br />
              Share
              <br />
              Music
            </span>
          </h1>
          <Button
            className="relative bg-purple/20 hover:bg-purple/30 text-purple border border-purple/20 rounded-lg px-8 py-4 text-lg font-medium transition-colors group"
            onClick={onDiscoverMusicClick}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple/20 via-transparent to-purple/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative">Discover music</span>
          </Button>
        </div>
        <div className="relative mt-12 md:mt-16">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/95 to-transparent" />
          <img
            src="assets/bangrCover.png"
            alt="Bangr Cover"
            className="w-full max-w-5xl mx-auto"
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/95 to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
