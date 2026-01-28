import type { AxiosInstance } from "axios";

let api: AxiosInstance | null = null;

export function initApiClient(instance: AxiosInstance) {
  api = instance;
}

export function getApiClient(): AxiosInstance {
  if (!api) {
    throw new Error("API client not initialized");
  }
  return api;
}
