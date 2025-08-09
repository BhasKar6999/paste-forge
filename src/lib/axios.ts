import axios from "axios";
import { getSupabase } from "@/lib/supabaseLoader";
import { toast } from "react-hot-toast";

// Default API base URL (can be adjusted on your deployment)
export const API_BASE_URL = "https://pastebin-api-bx76.onrender.com";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

api.interceptors.request.use(async (config) => {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      const headers = (config.headers ?? {}) as any;
      headers["Authorization"] = `Bearer ${token}`;
      config.headers = headers;
    }
  } catch {
    // Supabase not connected or no session
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err?.response?.data?.detail || err?.message || "Request failed";
    toast.error(String(message));
    return Promise.reject(err);
  }
);
