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
  servicesProvided: Service[];
  animalsHandled?: string[];
  status?: string;
  pricing?: {
    type: string;
    fee: number;
  }[];
  rating?: {
    average: number;
    count: number;
  };
}

export interface SearchClinicsParams {
  search?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  services?: string;   // comma-separated service keys
  animals?: string;    // comma-separated animal types
}

export interface SearchClinicsResult {
  clinics: Clinic[];
  notFoundLocally: boolean;
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
  servicesProvided?: Service[] | string[];
  animalsHandled?: string[];
  pricing?: { type: string; fee: number }[];
  clinicProfile?: RawClinicProfile;
  status?: string;
  rating?: { average: number; count: number };
}

interface FetchClinicsResponse {
  status: string;
  results: number;
  data: { clinics: RawClinic[] };
}

interface FetchClinicByIdResponse {
  status: string;
  data: { clinic: RawClinic };
}

interface SearchClinicsResponse {
  status: string;
  results: number;
  notFoundLocally: boolean;
  data: { clinics: RawClinic[] };
}

/* ================= HELPERS ================= */

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function mergeServices(c: RawClinic): Service[] {
  let rootServices: Service[] = [];

  if (Array.isArray(c.servicesProvided) && c.servicesProvided.length > 0) {
    if (typeof c.servicesProvided[0] === 'string') {
      rootServices = (c.servicesProvided as string[]).map(name => ({
        _id: name,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        price: 0,
      }));
    } else {
      rootServices = c.servicesProvided as Service[];
    }
  }

  const profileServices: Service[] = (c.clinicProfile?.servicesProvided ?? []).map(name => ({
    _id: name,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    price: 0,
  }));

  const mergedMap = new Map<string, Service>();
  [...rootServices, ...profileServices].forEach(s => {
    if (!mergedMap.has(s._id)) mergedMap.set(s._id, s);
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
    rating: c.rating,
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

  return (response.data?.data?.clinics ?? []).map(mapRawClinic);
}

export async function searchClinics(params: SearchClinicsParams): Promise<SearchClinicsResult> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');

  const query = new URLSearchParams();
  if (params.search)   query.set('search',   params.search);
  if (params.street)   query.set('street',   params.street);
  if (params.city)     query.set('city',     params.city);
  if (params.state)    query.set('state',    params.state);
  if (params.country)  query.set('country',  params.country);
  if (params.services) query.set('services', params.services);
  if (params.animals)  query.set('animals',  params.animals);

  const response = await axios.get<SearchClinicsResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}/owner/clinics/search?${query.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return {
    clinics: (response.data?.data?.clinics ?? []).map(mapRawClinic),
    notFoundLocally: response.data?.notFoundLocally ?? false,
  };
}

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