export const API_BASE_URL: string = (import.meta.env["VITE_API_BASE_URL"] ?? "").replace(/\/$/, "");
export const APP_VERSION = "0.1.0-preview";

export const ENDPOINTS = {
  investigations: "/api/investigations",
  investigation: (id: string) => `/api/investigations/${encodeURIComponent(id)}`,
  compare: "/api/compare",
  health: "/health",
} as const;
