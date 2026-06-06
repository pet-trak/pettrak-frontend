// frontend/src/store/auth.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* =========================
   Roles
========================= */
export type UserRole = 'owner';

/* ---- Pet ---- */
export interface Pet {
  id: string;
  userId?: string;
  name: string;
  species?: string;
  breed?: string | null;
  age?: number | null;
  gender?: 'Male' | 'Female' | 'Unknown';
  weight?: number | null;
  photo?: string;
  qrCode?: string;
}

/* ---- Address ---- */
export interface Address {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zipCode?: string | null;
  [key: string]: string | null | undefined;
}

/* ---- Owner Profile ---- */
export interface OwnerProfile {
  id: string;
  fullname: string | null;
  email: string | null;
  phoneNumber?: string;
  address?: Address;
  pets?: Pet[];
  type: 'owner';
  pushNotificationToken?: boolean;
}

export type Profile = OwnerProfile;

/* =========================
   STORE
========================= */
interface AuthState {
  profile: Profile | null;
  token: string | null;
  setProfile: (profile: Profile, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      profile: null,
      token: null,

      setProfile: (profile, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', profile.type);
        set({ profile, token });
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        set({ profile: null, token: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        profile: state.profile,
        token: state.token,
      }),
    }
  )
);