import axios, { AxiosError } from "axios";

export type UserRole = "owner" | "clinic" | "vet" | "receptionist";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterOwnerPayload {
  fullname: string;
  email: string;
  password: string;
  phoneNumber: string;
}

interface RegisterClinicPayload {
  clinicName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  password: string;

  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };

  licenseDocument: File;
  registrationCertificate: File;
  additionalDocuments?: File[];
}

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  role: UserRole;
}

interface BasicResponse {
  message: string;
}

/* =========================
   VERIFY EMAIL
========================= */

/* ========== LOGIN (ALL ROLES) ========== */
export async function login(role: UserRole, payload: LoginPayload): Promise<LoginResponse> {
  try {
    const response = await axios.post<LoginResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/${role}/login`,
      payload
    );
    return response.data;
  } catch (error: unknown) {
    let msg = "Login failed.";
    if (error instanceof AxiosError) msg = error.response?.data?.message ?? msg;
    throw new Error(msg);
  }
}

/* ========== LOGOUT (ALL ROLES) ========== */
export async function logout(role: UserRole): Promise<BasicResponse | null> {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/${role}/logout`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch {
    return null;
  }
}

/* ========== REGISTER OWNER ========== */
export async function registerOwner(payload: RegisterOwnerPayload): Promise<BasicResponse> {
  try {
    const response = await axios.post<BasicResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/owner/register`,
      payload
    );
    return response.data;
  } catch (error: unknown) {
    let msg = "Owner registration failed.";
    if (error instanceof AxiosError) msg = error.response?.data?.message ?? msg;
    throw new Error(msg);
  }
}

/* ========== REGISTER CLINIC ========== */
export async function registerClinic(payload: RegisterClinicPayload): Promise<BasicResponse> {
  try {
    const formData = new FormData();
    formData.append("clinicName", payload.clinicName);
    formData.append("email", payload.email);
    formData.append("phone", payload.phone);
    formData.append("licenseNumber", payload.licenseNumber);
    formData.append("password", payload.password);

    if (payload.address) formData.append("address", JSON.stringify(payload.address));

    formData.append("licenseDocument", payload.licenseDocument);
    formData.append("registrationCertificate", payload.registrationCertificate);

    if (payload.additionalDocuments?.length) {
      payload.additionalDocuments.forEach(file => formData.append("additionalDocuments", file));
    }

    const response = await axios.post<BasicResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/clinic/register`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (error: unknown) {
    let msg = "Clinic registration failed.";
    if (error instanceof AxiosError) msg = error.response?.data?.message ?? msg;
    throw new Error(msg);
  }
}