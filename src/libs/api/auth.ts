import axios, { AxiosError } from "axios";

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

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
}

interface BasicResponse {
  message: string;
}

/* ========== LOGIN ========== */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const response = await axios.post<LoginResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/owner/login`,
      payload
    );
    return response.data;
  } catch (error: unknown) {
    let msg = "Login failed.";
    if (error instanceof AxiosError) msg = error.response?.data?.message ?? msg;
    throw new Error(msg);
  }
}

/* ========== LOGOUT ========== */
export async function logout(): Promise<BasicResponse | null> {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/owner/logout`,
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