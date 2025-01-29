import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { User } from "../types/responses/login";

export type AuthStore = {
  token: string | null;
  setToken: (accessToken: string) => void;
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      setToken: (accessToken) => {
        set((state) => ({ ...state, token: accessToken }));
      },
      user: null,
      setUser: (user) => {
        set((state) => ({ ...state, user }));
      },
      logout: () => {
        set((state) => ({ ...state, token: null, user: null }));
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

useAuthStore.persist.rehydrate();
