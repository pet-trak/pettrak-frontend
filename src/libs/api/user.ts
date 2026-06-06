import { AxiosError } from "axios";
import api from "./axiosInstance";
import type { OwnerProfile, Pet, Address } from "@/store/auth"; // import from store

export type { OwnerProfile, Pet, Address }; // re-export so existing imports don't break

/**
 * Backend can return:
 * 1. nested address: user.address
 * 2. flattened fields: user.country, user.state, etc
 */
type RawUser = {
  id: string;
  fullname: string | null;
  email: string | null;
  phoneNumber?: string | null;
  role?: string;
  pets?: RawPet[] | null;

  address?: Address | null;

  country?: string | null;
  state?: string | null;
  city?: string | null;
  street?: string | null;
  zipCode?: string | null;
};

// Raw pet from Mongo uses _id — we normalize it to id for the store
type RawPet = Omit<Pet, "id"> & { _id: string };

function mapPet(raw: RawPet): Pet {
  const { _id, ...rest } = raw;
  return { id: _id, ...rest };
}

function mapUser(user: RawUser): OwnerProfile {
  return {
    id: user.id,
    fullname: user.fullname ?? "",
    email: user.email ?? "",
    phoneNumber: user.phoneNumber ?? "",
    address: {
      country: user.address?.country ?? user.country ?? "",
      state: user.address?.state ?? user.state ?? "",
      city: user.address?.city ?? user.city ?? "",
      street: user.address?.street ?? user.street ?? "",
      zipCode: user.address?.zipCode ?? user.zipCode ?? "",
    },
    pets: (user.pets ?? []).map(mapPet), // _id → id
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
  address?: Address;
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
    const response = await api.delete<{ status: string; message: string }>(
      "/user/delete"
    );
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

    const res = await api.post<{ data: { pet: RawPet } }>("/user/new-pet", formData);
    return mapPet(res.data.data.pet); // ✅ normalize here too
  } catch (err: unknown) {
    let msg = "Failed to create pet";
    if (err instanceof AxiosError) {
      msg = err.response?.data?.message ?? msg;
    }
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
      pet: mapPet(response.data.data.pet), // ✅ normalize
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
    return mapPet(response.data.data.pet); // ✅ normalize
  } catch (err: unknown) {
    let msg = "Failed to update pet";
    if (err instanceof AxiosError) msg = err.response?.data?.message ?? msg;
    throw new Error(msg);
  }
}