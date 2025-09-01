import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  projectId: string;
  uid: string;
  name: string;
  email: string;
  createdTime: number;
  lastLoginTime: number;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      login: (user: User) =>
        set({
          user,
          isLoggedIn: true,
        }),
      logout: () =>
        set({
          user: null,
          isLoggedIn: false,
        }),
    }),
    {
      name: 'forecasting-auth',
    }
  )
);