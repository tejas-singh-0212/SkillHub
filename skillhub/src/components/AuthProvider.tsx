"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "firebase/auth";
import { onAuthChange, getUserProfile } from "@/lib/auth";
import type { UserProfile, AuthContextType } from "@/types";

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (firebaseUser: User | null): Promise<UserProfile | null> => {
    if (!firebaseUser) {
      setProfile(null);
      return null;
    }
    const p = await getUserProfile(firebaseUser.uid);
    setProfile(p);
    return p;
  };

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      await fetchProfile(user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
