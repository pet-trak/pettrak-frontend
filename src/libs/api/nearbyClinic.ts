// src/libs/api/nearbyClinic.ts

import axios from 'axios';

/* ================= TYPES ================= */

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
}

export interface Service {
  _id: string;
  name: string;
  price: number;
}

export interface Clinic {
  _id: string;
  clinicName: string;
  address: Address;
  phoneNumber?: string;
  daysOpen: string[];
  startingTime: string;
  closingTime: string;
  servicesProvided: Service[]; // Now objects instead of strings
  animalsHandled?: string[];
  status?: string;
  pricing?: {
    type: string;
    fee: number;
  }[];
}

/* ================= RAW API SHAPES ================= */

interface RawClinicProfile {
  description?: string;
  clinicName?: string;
  servicesProvided?: string[];
}

interface RawClinic {
  _id: string;
  clinicName?: string;
  fullname?: string;
  phoneNumber?: string;
  phone?: string;
  address: Address;
  daysOpen?: string[];
  startingTime: string;
  closingTime: string;
  servicesProvided?: Service[] | string[]; // Can be objects or strings
  animalsHandled?: string[];
  pricing?: {
    type: string;
    fee: number;
  }[];
  clinicProfile?: RawClinicProfile;
  status?: string;
}

interface FetchClinicsResponse {
  status: string;
  results: number;
  data: {
    clinics: RawClinic[];
  };
}

interface FetchClinicByIdResponse {
  status: string;
  data: {
    clinic: RawClinic;
  };
}

/* ================= HELPERS ================= */

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function mergeServices(c: RawClinic): Service[] {
  // Get services from root
  let rootServices: Service[] = [];
  if (c.servicesProvided) {
    if (Array.isArray(c.servicesProvided) && c.servicesProvided.length > 0) {
      // Check if it's an array of strings or objects
      if (typeof c.servicesProvided[0] === 'string') {
        // Convert strings to Service objects
        rootServices = (c.servicesProvided as string[]).map(name => ({
          _id: name,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          price: 0 // Default price if not found
        }));
      } else {
        // Already Service objects
        rootServices = c.servicesProvided as Service[];
      }
    }
  }

  // Get services from profile (might be strings)
  let profileServices: Service[] = [];
  const profileServiceStrings = c.clinicProfile?.servicesProvided ?? [];
  if (profileServiceStrings.length > 0) {
    profileServices = profileServiceStrings.map(name => ({
      _id: name,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      price: 0 // Default price if not found
    }));
  }

  // Merge and deduplicate by _id
  const mergedMap = new Map<string, Service>();
  [...rootServices, ...profileServices].forEach(service => {
    if (!mergedMap.has(service._id)) {
      mergedMap.set(service._id, service);
    }
  });

  return Array.from(mergedMap.values());
}

function mapRawClinic(c: RawClinic): Clinic {
  return {
    _id: c._id,
    clinicName: c.clinicName ?? c.clinicProfile?.clinicName ?? c.fullname ?? 'Unnamed Clinic',
    address: c.address,
    phoneNumber: c.phoneNumber ?? c.phone,
    daysOpen: c.daysOpen ?? [],
    startingTime: c.startingTime,
    closingTime: c.closingTime,
    servicesProvided: mergeServices(c),
    animalsHandled: c.animalsHandled ?? [],
    status: c.status ?? 'active',
    pricing: c.pricing ?? [],
  };
}

/* ================= API ================= */

export async function fetchClinics(): Promise<Clinic[]> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');

  const response = await axios.get<FetchClinicsResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}/owner/clinics`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const clinics = response.data?.data?.clinics ?? [];
  return clinics.map(mapRawClinic);
}

/* ================= SINGLE CLINIC ================= */

export async function fetchClinicById(clinicId: string): Promise<Clinic | null> {
  const token = getToken();
  if (!token) return null;

  const response = await axios.get<FetchClinicByIdResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}/user/clinic/${clinicId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const c = response.data?.data?.clinic;
  if (!c) return null;

  return mapRawClinic(c);
}