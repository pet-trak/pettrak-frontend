import axios, { AxiosError } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Pet {
    _id: string;
    userId: string;
    name: string;
    species: string;
    breed?: string | null;
    age?: number | null;
    weight?: number | null;
    gender?: string;
    photo?: string;
    qrCode?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PetOwner {
    _id: string;
    fullname: string;
    email: string;
    address?: Record<string, string>;
}

export interface GetPetResponse {
    status: string;
    data: {
        pet: Pet;
        owner: PetOwner;
    };
}

export interface CreatePetResponse {
    status: string;
    message: string;
    data: {
        pet: Pet;
    };
}

export interface ApiErrorResponse {
    message?: string;
}

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
}

/**
 * Fetch a single pet by its ID.
 * GET /api/v1/user/pet?petId=<id>
 */
export async function getPet(petId: string): Promise<GetPetResponse> {
    try {
        const { data } = await axios.get<GetPetResponse>(
            `${BASE_URL}/api/v1/user/pet`,
            {
                params: { petId },
                headers: getAuthHeaders(),
            }
        );
        return data;
    } catch (err) {
        throw err as AxiosError<ApiErrorResponse>;
    }
}

/**
 * Create a new pet for the authenticated user.
 * POST /api/v1/user/new-pet/
 * Accepts multipart/form-data so a photo file can be included.
 */
export async function createPet(payload: {
    name: string;
    species?: string;
    breed?: string;
    age?: number | string;
    weight?: number | string;
    gender?: string;
    photo?: File | null;
}): Promise<CreatePetResponse> {
    const form = new FormData();

    form.append("name", payload.name);
    if (payload.species) form.append("species", payload.species);
    if (payload.breed) form.append("breed", payload.breed);
    if (payload.age !== undefined && payload.age !== "")
        form.append("age", String(payload.age));
    if (payload.weight !== undefined && payload.weight !== "")
        form.append("weight", String(payload.weight));
    if (payload.gender) form.append("gender", payload.gender);
    if (payload.photo) form.append("photo", payload.photo);

    try {
        const { data } = await axios.post<CreatePetResponse>(
            `${BASE_URL}/api/v1/user/new-pet/`,
            form,
            {
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return data;
    } catch (err) {
        throw err as AxiosError<ApiErrorResponse>;
    }
}

/** 
 * get my pet details
 */

export interface GetMyPetsResponse {
  status: string;
  results: number;
  data: { pets: Pet[] };
}

export async function getMyPets(): Promise<GetMyPetsResponse> {
  try {
    const { data } = await axios.get<GetMyPetsResponse>(
      `${BASE_URL}/owner/me/pets`,
      { headers: getAuthHeaders() }
    );
    return data;
  } catch (err) {
    throw err as AxiosError<ApiErrorResponse>;
  }
}