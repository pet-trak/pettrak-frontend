// src/libs/api/user.ts

import { AxiosError } from "axios";
import api from "./axiosInstance";
import type { OwnerProfile, Pet, Address } from "@/store/auth";

export type { OwnerProfile, Pet, Address };

type RawUser = {
  id: string;
  fullname: string | null;
  email: string | null;
  phoneNumber?: string | null;
  role?: string;
  address?: Address | null;
  pets?: RawPet[] | null;
};

type RawPet = Omit<Pet, "id"> & { _id: string };

function mapPet(raw: RawPet): Pet {
  const { _id, ...rest } = raw;
  return { id: _id, ...rest };
}

// Collapses `string | null | undefined` → `string` (or `string | undefined`).
// `?? ""` alone doesn't satisfy TS because null stays in the inferred union;
// the explicit `|| undefined` / `|| ""` forces the type to narrow fully.
function str(v: string | null | undefined, fallback: string): string {
  return v ?? fallback;
}

function mapUser(user: RawUser): OwnerProfile {
  return {
    id: user.id,
    fullname: str(user.fullname, ""),
    email: str(user.email, ""),
    phoneNumber: str(user.phoneNumber, "") || undefined, // keep optional; empty → undefined
    address: user.address ?? undefined,
    pets: (user.pets ?? []).map(mapPet),
    type: "owner",
  };
}

export async function getUserProfile(): Promise<OwnerProfile> {
  try {
    const res = await api.get<{ success: boolean; user: RawUser }>("/auth/owner/me");
    return mapUser(res.data.user);
  } catch (err: unknown) {
    let msg = "Failed to fetch profile";
    if (err instanceof AxiosError) {
      msg = (err.response?.data as { message?: string })?.message ?? msg;
    }
    throw new Error(msg);
  }
}

export async function updateProfile(profileData: {
  fullname?: string;
  phoneNumber?: string;
}): Promise<OwnerProfile> {
  try {
    const res = await api.patch<{ data: { user: RawUser } }>(
      "/owner/update-profile",
      profileData
    );
    return mapUser(res.data.data.user);
  } catch (err: unknown) {
    let msg = "Failed to update profile";
    if (err instanceof AxiosError) {
      msg = (err.response?.data as { message?: string })?.message ?? msg;
    }
    throw new Error(msg);
  }
}

export async function deleteAccount(): Promise<{ message: string }> {
  try {
    const response = await api.delete<{ status: string; message: string }>("/user/delete");
    return response.data;
  } catch (err: unknown) {
    let msg = "Failed to delete account";
    if (err instanceof AxiosError) msg = err.response?.data?.message ?? msg;
    throw new Error(msg);
  }
}

export async function createPet(
  data: {
    name: string;
    species?: string;
    breed?: string;
    age?: number;
    weight?: number;
    gender?: "Male" | "Female" | "Unknown";
  },
  file?: File
): Promise<Pet> {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, String(v));
    });
    if (file) formData.append("photo", file);

    const res = await api.post<{ data: { pet: RawPet } }>("/owner/new-pet", formData);
    return mapPet(res.data.data.pet);
  } catch (err: unknown) {
    let msg = "Failed to create pet";
    if (err instanceof AxiosError) msg = err.response?.data?.message ?? msg;
    throw new Error(msg);
  }
}

export async function getPet(
  petId: string
): Promise<{ user: OwnerProfile; pet: Pet }> {
  try {
    const response = await api.get<{
      status: string;
      data: { user: RawUser; pet: RawPet };
    }>(`/pet/${petId}`);

    return {
      user: mapUser(response.data.data.user),
      pet: mapPet(response.data.data.pet),
    };
  } catch (err: unknown) {
    let msg = "Failed to fetch pet";
    if (err instanceof AxiosError) msg = err.response?.data?.message ?? msg;
    throw new Error(msg);
  }
}

export async function updatePet(
  petId: string,
  petData: {
    name?: string;
    species?: string;
    breed?: string;
    age?: number;
    weight?: number;
    gender?: "Male" | "Female" | "Unknown";
  },
  file?: File
): Promise<Pet> {
  try {
    const formData = new FormData();
    Object.entries(petData).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value));
    });
    if (file) formData.append("photo", file);

    const response = await api.patch<{ status: string; data: { pet: RawPet } }>(
      `/user/pet/${petId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return mapPet(response.data.data.pet);
  } catch (err: unknown) {
    let msg = "Failed to update pet";
    if (err instanceof AxiosError) msg = err.response?.data?.message ?? msg;
    throw new Error(msg);
  }
}