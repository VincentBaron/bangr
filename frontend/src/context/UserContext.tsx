import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchUser } from "@/api/api";

interface User {
  id: string;
  username: string;
  profile_pic_url: string;
  genres: string[];
}

interface UserContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserx = async () => {
      try {
        const response = await fetchUser({ withCredentials: true });
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };

    fetchUserx();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
