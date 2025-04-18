import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Card } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import {
  fetchGenres,
  updateUserGenres,
  fetchLeaderboard,
  fetchPrizePool,
  fetchUserGroups,
  createGroup,
  joinGroup,
} from "@/api/api";
import {
  Menu,
  LogOut,
  CircleX,
  Check,
  ChevronDown,
  Plus,
  Copy,
  Share2,
} from "lucide-react";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { PricingModal } from "@/components/PricingModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "react-router-dom";

interface Group {
  id: string;
  name: string;
  invite_code: string;
}

interface BackendGroup {
  ID?: string;
  id?: string;
  Name?: string;
  name?: string;
  InviteCode?: string;
  invite_code?: string;
}

interface PrizePoolData {
  current_month: number;
  next_month: number;
}

const prizeGoal = 30; // Example goal Replace with real data

const Header: React.FC = () => {
  const { user, setUser } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isGenresDropdownOpen, setIsGenresDropdownOpen] = useState(false);
  const [isGroupsDropdownOpen, setIsGroupsDropdownOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [isShareGroupDialogOpen, setIsShareGroupDialogOpen] = useState(false);
  const [selectedGroupForShare, setSelectedGroupForShare] =
    useState<Group | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [prizePoolData, setPrizePoolData] = useState<PrizePoolData>({
    current_month: 25,
    next_month: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [joinGroupError, setJoinGroupError] = useState<string | null>(null);
  const [isJoinErrorDialogOpen, setIsJoinErrorDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedGenres(user.genres || []);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [genres, leaderboard, prizePool, userGroups] = await Promise.all([
          fetchGenres({ withCredentials: true }),
          fetchLeaderboard(),
          fetchPrizePool(),
          fetchUserGroups(),
        ]);
        console.log("Initial groups fetch:", userGroups.data);
        setAllGenres(genres.data);
        setLeaderboardData(leaderboard.data);
        setPrizePoolData(prizePool.data);
        const mappedGroups = userGroups.data.map(
          (group: BackendGroup): Group => ({
            id: group.id || group.ID || "",
            name: group.name || group.Name || "",
            invite_code: group.invite_code || group.InviteCode || "",
          })
        );
        console.log("Mapped initial groups:", mappedGroups);
        setGroups(mappedGroups);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const inviteCode = searchParams.get("invite");
    if (inviteCode && user) {
      handleJoinGroup(inviteCode);
      searchParams.delete("invite");
      setSearchParams(searchParams);
    }
  }, [searchParams, user]);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleGroupSelect = (groupId: string | null) => {
    setSelectedGroup(groupId);
    // Trigger refetch of sets with new group filter
    // This should be handled by your data fetching logic
  };

  const handleCreateGroup = async () => {
    try {
      const response = await createGroup(newGroupName);
      setGroups((prev) => [...prev, response.data]);
      setNewGroupName("");
      setIsCreateGroupDialogOpen(false);
      setSelectedGroupForShare(response.data);
      setIsShareGroupDialogOpen(true);
    } catch (error) {
      console.error("Failed to create group", error);
    }
  };

  const handleJoinGroup = async (inviteCode: string) => {
    try {
      const response = await joinGroup(inviteCode);
      console.log("Join group response:", response.data);
      const backendGroup: BackendGroup = response.data;
      const newGroup: Group = {
        id: backendGroup.id || backendGroup.ID || "",
        name: backendGroup.name || backendGroup.Name || "",
        invite_code: backendGroup.invite_code || backendGroup.InviteCode || "",
      };
      console.log("Mapped group:", newGroup);
      setGroups((prev) => {
        console.log("Previous groups:", prev);
        return [...prev, newGroup];
      });
      setSelectedGroup(newGroup.id);
      setSelectedGroupForShare(newGroup);
      setIsShareGroupDialogOpen(true);
    } catch (error) {
      console.error("Failed to join group", error);
      setJoinGroupError(
        "The invite link might be invalid or you're already a member"
      );
      setIsJoinErrorDialogOpen(true);
    }
  };

  const handleShareGroup = (group: Group) => {
    setSelectedGroupForShare(group);
    setIsShareGroupDialogOpen(true);
  };

  const copyInviteLink = (inviteCode: string) => {
    const inviteLink = `${window.location.origin}?invite=${inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
  };

  const handleCancelGenres = () => {
    // Revert to the original genres
    setSelectedGenres(user?.genres || []);
    setIsGenresDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("Authorization");
    localStorage.removeItem("SpotifyAuthorization");
    localStorage.removeItem("UserID");
    setUser(null);
    window.location.reload();
  };

  const handleSaveGenres = () => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return { ...prevUser, genres: selectedGenres };
    });

    // Update the backend
    updateUserGenres(selectedGenres, { withCredentials: true });

    // Close the dropdown
    setIsGenresDropdownOpen(false);
  };

  useEffect(() => {}, [selectedGenres]);

  if (!user || isLoading) {
    return null;
  }

  const handleDonate = () => {
    setIsPricingModalOpen(true);
  };

  return (
    <div className="flex flex-col items-center justify-between">
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />
      <Drawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        direction="left"
      >
        <DrawerTrigger asChild>
          <button className="absolute top-4 left-4 group">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple/30 via-purple/20 to-transparent rounded-full blur-[2px]" />
              <div className="absolute inset-0 bg-gradient-to-bl from-purple/20 via-transparent to-purple/10 rounded-full blur-[2px]" />
              <div className="relative flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-purple/20 p-2 transition-all hover:bg-purple/20">
                <Menu className="w-5 h-5 text-purple" />
              </div>
            </div>
          </button>
        </DrawerTrigger>
        <DrawerContent className="h-full max-w-72 w-full bg-black/95 backdrop-blur-md text-white border-r border-white/5 p-3 shadow-lg flex flex-col justify-between [&>div:first-child]:hidden">
          <div className="space-y-6">
            {/* Filters Section */}
            <div>
              <h2 className="text-sm font-medium text-white/70 mb-3">
                Filters
              </h2>
              <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-3" />
              <div className="space-y-2">
                {/* Genres Button */}
                <button
                  className="flex items-center bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm transition-colors w-full group"
                  onClick={() => setIsGenresDropdownOpen((prev) => !prev)}
                >
                  <span className="text-white/90">Genres</span>
                  <div className="flex items-center justify-center ml-2 bg-purple/20 text-purple border border-purple/20 rounded-md px-1.5 text-xs">
                    {selectedGenres.length}
                  </div>
                  <ChevronDown
                    className="ml-auto text-white/50 group-hover:text-white/70"
                    size={16}
                  />
                </button>

                {/* Groups Button */}
                <button
                  className="flex items-center bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm transition-colors w-full group"
                  onClick={() => setIsGroupsDropdownOpen((prev) => !prev)}
                >
                  <span className="text-white/90">Groups</span>
                  <div className="flex items-center justify-center ml-2 bg-purple/20 text-purple border border-purple/20 rounded-md px-1.5 text-xs">
                    {groups.length}
                  </div>
                  <ChevronDown
                    className="ml-auto text-white/50 group-hover:text-white/70"
                    size={16}
                  />
                </button>

                {/* Genres Dropdown */}
                {isGenresDropdownOpen && (
                  <Card className="absolute z-10 mt-1 left-3 right-3 bg-black/95 backdrop-blur-md border border-white/10 text-white p-3 shadow-lg rounded-lg">
                    <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                      {allGenres.map((genre) => (
                        <button
                          key={genre}
                          className={`py-1.5 px-3 rounded-md text-xs transition-colors ${
                            selectedGenres.includes(genre)
                              ? "bg-purple/20 text-purple border border-purple/20"
                              : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white/90"
                          }`}
                          onClick={() => handleGenreToggle(genre)}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 mt-3 border-t border-white/5 pt-3">
                      <button
                        className="p-1.5 rounded-md hover:bg-white/5 text-white/70 hover:text-white/90 transition-colors"
                        onClick={handleCancelGenres}
                      >
                        <CircleX className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 rounded-md bg-purple/20 text-purple hover:bg-purple/30 transition-colors"
                        onClick={handleSaveGenres}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                )}

                {/* Groups Dropdown */}
                {isGroupsDropdownOpen && (
                  <Card className="absolute z-10 mt-1 left-3 right-3 bg-black/95 backdrop-blur-md border border-white/10 text-white p-3 shadow-lg rounded-lg">
                    <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                      <button
                        className={`py-1.5 px-3 rounded-md text-xs transition-colors ${
                          selectedGroup === null
                            ? "bg-purple/20 text-purple border border-purple/20"
                            : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white/90"
                        }`}
                        onClick={() => handleGroupSelect(null)}
                      >
                        All Users
                      </button>
                      {groups.map((group) => {
                        console.log("Rendering group:", group);
                        return (
                          <div
                            key={group.id}
                            className="flex items-center justify-between gap-2"
                          >
                            <button
                              className={`flex-1 py-1.5 px-3 rounded-md text-xs transition-colors ${
                                selectedGroup === group.id
                                  ? "bg-purple/20 text-purple border border-purple/20"
                                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white/90"
                              }`}
                              onClick={() => handleGroupSelect(group.id)}
                            >
                              {group.name || `Group ${group.id.slice(0, 8)}`}
                            </button>
                            <button
                              className="p-1.5 rounded-md hover:bg-white/5 text-white/50 hover:text-white/70 transition-colors"
                              onClick={() => handleShareGroup(group)}
                            >
                              <Share2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between items-center mt-3 border-t border-white/5 pt-3">
                      <Dialog
                        open={isCreateGroupDialogOpen}
                        onOpenChange={setIsCreateGroupDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <button className="flex items-center gap-2 py-1.5 px-3 rounded-md text-xs bg-purple/20 text-purple hover:bg-purple/30 transition-colors">
                            <Plus className="w-4 h-4" />
                            Create Group
                          </button>
                        </DialogTrigger>
                        <DialogContent className="bg-black/95 backdrop-blur-md border border-white/10 text-white">
                          <DialogHeader>
                            <DialogTitle>Create New Group</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <Input
                              placeholder="Group Name"
                              value={newGroupName}
                              onChange={(e) => setNewGroupName(e.target.value)}
                              className="bg-white/5 border-white/10 text-white"
                            />
                            <Button
                              onClick={handleCreateGroup}
                              className="w-full bg-purple/20 text-purple hover:bg-purple/30"
                            >
                              Create
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Leaderboard Section */}
            <div>
              <h2 className="text-sm font-medium text-white/70 mb-3">
                Leaderboard
              </h2>
              <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-3" />
              <div className="space-y-1.5">
                {leaderboardData.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-purple text-xs font-medium w-4">
                        {index + 1}
                      </span>
                      <img
                        src={
                          user.profile_pic_url ||
                          "https://github.com/shadcn.png"
                        }
                        alt={user.username}
                        className="w-6 h-6 rounded-full ring-1 ring-white/10"
                      />
                      <span className="text-white/90 text-sm font-medium truncate max-w-[120px]">
                        {user.username}
                      </span>
                    </div>
                    <span className="text-xs text-white/50">
                      {user.likes} {user.likes === 1 ? "like" : "likes"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prizepool Section */}
            <div>
              <h2 className="text-sm font-medium text-white/70 mb-3">
                Prize Pool
              </h2>
              <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-3" />
              <div className="space-y-4">
                {/* Current Month */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-white/50">Current Month</span>
                    <span className="text-sm font-medium text-white/90">
                      ${(25).toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple rounded-full transition-all duration-300"
                      style={{
                        width: `${(25 / prizeGoal) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Next Month */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-white/50">Next Month</span>
                    <span className="text-sm font-medium text-white/90">
                      ${(prizePoolData?.next_month || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          ((prizePoolData?.next_month || 0) / prizeGoal) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <Button
                  className="w-full bg-purple/20 hover:bg-purple/30 text-purple text-sm font-medium rounded-lg py-2 transition-colors border border-purple/20"
                  onClick={handleDonate}
                >
                  🎉 Win a concert ticket
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Section */}
          <div className="border-t border-white/5 pt-3 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8 ring-2 ring-purple/20">
                  <AvatarImage
                    src={
                      user.profile_pic_url || "https://github.com/shadcn.png"
                    }
                    alt={user.username}
                  />
                  <AvatarFallback className="bg-purple/10 text-purple">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-white/90">
                  {user.username}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FeedbackDialog />
                <Button
                  variant="ghost"
                  className="text-white/50 hover:text-white/70 p-1.5 hover:bg-white/5 rounded-md transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Error Dialog */}
      <Dialog
        open={isJoinErrorDialogOpen}
        onOpenChange={setIsJoinErrorDialogOpen}
      >
        <DialogContent className="bg-black/95 backdrop-blur-md border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Failed to Join Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="text-sm text-white/70">{joinGroupError}</div>
            <Button
              onClick={() => setIsJoinErrorDialogOpen(false)}
              className="w-full bg-purple/20 text-purple hover:bg-purple/30"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Group Dialog */}
      <Dialog
        open={isShareGroupDialogOpen}
        onOpenChange={setIsShareGroupDialogOpen}
      >
        <DialogContent className="bg-black/95 backdrop-blur-md border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>
              {selectedGroup
                ? "Share Group"
                : `Joined ${selectedGroupForShare?.name}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="text-sm text-white/70">
              {selectedGroup
                ? "Share this invite link with others to join your group:"
                : "You've successfully joined the group. Share it with others:"}
            </div>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={`${window.location.origin}?invite=${selectedGroupForShare?.invite_code}`}
                className="bg-white/5 border-white/10 text-white"
              />
              <Button
                onClick={() =>
                  selectedGroupForShare &&
                  copyInviteLink(selectedGroupForShare.invite_code)
                }
                className="bg-purple/20 text-purple hover:bg-purple/30"
              >
                <Copy size={16} />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Header;
