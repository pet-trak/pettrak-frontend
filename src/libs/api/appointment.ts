// src/libs/api/appointment.ts
import api from "./axiosInstance"; //use the configured instance, not raw axios
import { AxiosError } from "axios";

/* ================= TYPES ================= */

export type UserAddress = {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string | null;
};

export type Appointment = {
  _id: string;
  type?: string;
  time: string;
  date: string;
  status: string;
  notes?: string;

  owner: {
    _id: string;
    fullname: string;
    email: string;
    phoneNumber?: string;
    address?: UserAddress;
  };

  pet: {
    _id: string;
    name: string;
    species: string;
    breed: string;
    age: number;
    weight?: number;
    gender?: string;
    photo?: string;
    qrCode?: string;
  };

  clinic: {
    _id: string;
    clinicName: string;
    email: string;
    phone: string;
    address?: UserAddress;
    startingTime?: string;
    closingTime?: string;
  };

  vet?: {
    _id: string;
    fullname: string;
    email: string;
    phone: string;
  } | null;

  confirmedBy?: string | null;
};


/* ================= BOOKING TYPES ================= */

export interface BookAppointmentData {
  petId: string;
  date: string; // YYYY-MM-DD
  time: string; // "10:30 AM"
  notes?: string;
}

export interface BookAppointmentQuery {
  clinicId: string;
  vetId?: string;
}

/* ================= SCHEDULE TYPES ================= */

export type ClinicScheduleDay = {
  date: string; // YYYY-MM-DD
  day: string;  // Monday
  isOpen: boolean;
  slots: {
    time: string;        // "10:30"
    available: boolean;
  }[];
};

export type ClinicAvailabilitySlot = {
  time: string;
  available: boolean;
};

/* ================= API FUNCTIONS ================= */

export async function bookAppointments(
  appointmentData: BookAppointmentData,
  query: BookAppointmentQuery
): Promise<Appointment> {
  const token = localStorage.getItem("token") || "";

  const queryString = `?${new URLSearchParams({
    clinicId: query.clinicId,
    ...(query.vetId ? { vetId: query.vetId } : {}),
  }).toString()}`;

  const response = await api.post(
    `${process.env.NEXT_PUBLIC_API_URL}/appointment/book${queryString}`,
    appointmentData,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data.appointment as Appointment;
}

/* ================= CLINIC SCHEDULE ================= */

export async function getClinicSchedule(
  clinicId: string,
  days: number = 14
): Promise<ClinicScheduleDay[]> {
  const token = localStorage.getItem("token") || "";

  const response = await api.get(
    `${process.env.NEXT_PUBLIC_API_URL}/appointment/clinics/${clinicId}/schedule`,
    {
      params: { days },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data.schedule as ClinicScheduleDay[];
}

/* ================= CLINIC AVAILABILITY ================= */

export async function getClinicAvailability(
  clinicId: string,
  date: string
): Promise<ClinicAvailabilitySlot[]> {
  const token = localStorage.getItem("token") || "";

  const response = await api.get(
    `${process.env.NEXT_PUBLIC_API_URL}/appointment/clinic/${clinicId}/availability`,
    {
      params: { date },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data.slots as ClinicAvailabilitySlot[];
}

/* ================= USER PETS ================= */

export async function getMyPets() {
  const token = localStorage.getItem("token") || "";

  const res = await api.get(
    `${process.env.NEXT_PUBLIC_API_URL}/appointment/user/me/pets`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.data.pets;
}

/* ================= USER APPOINTMENTS ================= */
export async function getAppointments(status?: string): Promise<Appointment[]> {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }
    
    console.log("Fetching appointments with token:", token.substring(0, 20) + "...");
    
    const res = await api.get<{
      status: string;
      count: number;
      appointments: Appointment[];
    }>("/appointment/users", {
      params: status ? { status } : undefined,
    });
    
    console.log("Appointments response:", res.data);
    return res.data.appointments;
  } catch (err: unknown) {
    console.error("Full error in getAppointments:", err);
    
    let msg = "Failed to fetch appointments";
    if (err instanceof AxiosError) {
      // Log the full error for debugging
      console.error("Response status:", err.response?.status);
      console.error("Response data:", err.response?.data);
      console.error("Request URL:", err.config?.url);
      
      if (err.response?.status === 401) {
        msg = "Session expired. Please login again.";
        // Optionally redirect to login
        // window.location.href = '/login';
      } else if (err.response?.status === 403) {
        msg = "You don't have permission to view appointments. Are you logged in as an owner?";
      } else {
        msg = err.response?.data?.message ?? msg;
      }
    }
    throw new Error(msg);
  }
}

/* ================= SINGLE APPOINTMENT ================= */

export const getAppointmentById = async (
  appointmentId: string,
  role: string = "owner"
): Promise<Appointment> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = localStorage.getItem("token");

  if (!token) throw new Error("Not authenticated");
  if (!appointmentId) throw new Error("Appointment ID is required");

  const res = await fetch(`${apiUrl}/appointment/users/${appointmentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch appointment");
  }

  return data.data.appointment as Appointment;
};