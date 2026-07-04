"use client";

import { createContext, useContext, useState, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api-client";
import { queryKeys } from "./query-keys";
import type { Role } from "./types";

type UserOption = { id: number; name: string; role: Role };

type CurrentUserContextValue = {
  users: UserOption[];
  currentUser: UserOption | null;
  setCurrentUserId: (id: number) => void;
  isLoading: boolean;
};

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

const STORAGE_KEY = "saved-posts:current-user-id";

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getStoredUserId() {
  return localStorage.getItem(STORAGE_KEY);
}

function getServerStoredUserId() {
  return null;
}

// Stands in for a real login: picks one of the seeded accounts and attaches
// its id/role as headers on every API call. See lib/auth.ts on the server
// side for where this gets read back out.
export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.users(),
    queryFn: api.getUsers,
  });

  const users = data?.users ?? [];

  // useSyncExternalStore (not an effect) is what safely reads a
  // browser-only external store like localStorage without a
  // server/client hydration mismatch.
  const storedId = useSyncExternalStore(
    subscribeToStorage,
    getStoredUserId,
    getServerStoredUserId,
  );

  const [explicitId, setExplicitId] = useState<number | null>(null);

  const currentUser =
    users.find((u) => u.id === explicitId) ??
    users.find((u) => u.id === Number(storedId)) ??
    users[0] ??
    null;

  const setCurrentUserId = (id: number) => {
    setExplicitId(id);
    localStorage.setItem(STORAGE_KEY, String(id));
  };

  return (
    <CurrentUserContext.Provider value={{ users, currentUser, setCurrentUserId, isLoading }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("useCurrentUser must be used within CurrentUserProvider");
  return ctx;
}
