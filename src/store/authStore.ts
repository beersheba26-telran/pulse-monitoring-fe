import { create } from "zustand";

import type { AuthResponse } from "../model/auth_types";

type AuthState = {
  authenticatedUser: AuthResponse | null;
  setAuthenticatedUser: (authenticatedUser: AuthResponse) => void;
  clearAuthenticatedUser: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  authenticatedUser: null,
  setAuthenticatedUser: (authenticatedUser) => set({ authenticatedUser }),
  clearAuthenticatedUser: () => set({ authenticatedUser: null }),
}));
