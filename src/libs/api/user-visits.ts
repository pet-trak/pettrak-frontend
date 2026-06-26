import axios, { AxiosError } from 'axios';

const api_url = process.env.NEXT_PUBLIC_API_URL;

export type UserVisitPet = {
    _id: string;
    petId: string;
    userId: string;
    name: string;
    species: string;
    breed: string;
    age: number | string;
    gender: string;
    photo?: string;
};

export interface DischargeSummary {
    greeting: string;
    visitSummary: string;
    diagnosis: string;
    homeCareinstructions: string[];
    returnConditions: string[];
    closing: string;
}

export type UserVisit = {
    _id: string;
    status: 'in-progress' | 'completed' | 'cancelled';
    vitals: {
        weight: number;
        temp: number;
        pulse: number;
        respiration: number;
    };
    billing: {
        total: number;
    };
    paymentStatus: 'unpaid' | 'paid';
    createdAt: string;
    completedAt: string | null;
    appointmentType?: string;
    pet: UserVisitPet;
    dischargeSummary?: DischargeSummary;
    dischargeSummaryGeneratedAt?: string;
    soapGeneratedByAI?: boolean;
};

type GetUserVisitsResponse = {
    status: string;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    results: number;
    data: UserVisit[];
};

export async function getUserVisits(): Promise<UserVisit[]> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    try {
        const res = await axios.get<GetUserVisitsResponse>(`${api_url}/visit/user`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message ?? 'Failed to fetch visits');
        }
        throw error;
    }
}