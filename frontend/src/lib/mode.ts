import { useSyncExternalStore } from "react";
import { API_BASE_URL } from "./config";

export type AppMode = "demo" | "live";
const KEY = "vendorlens.mode";
const listeners = new Set<() => void>();

function read(): AppMode {
  if (typeof window === "undefined") return "demo";
  const v = window.localStorage.getItem(KEY);
  if (v === "demo" || v === "live") return v;
  return API_BASE_URL ? "live" : "demo";
}

export function setMode(mode: AppMode) {
  window.localStorage.setItem(KEY, mode);
  listeners.forEach((l) => l());
}

export function getMode(): AppMode {
  return read();
}

export function useMode(): AppMode {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => "demo",
  );
}
