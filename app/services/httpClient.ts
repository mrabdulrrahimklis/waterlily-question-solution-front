import axios, { type AxiosInstance } from "axios";

export abstract class HttpClient {
  private static instance: AxiosInstance;

  public static getInstance(): AxiosInstance {
    if (!HttpClient.instance) {
      HttpClient.instance = axios.create({
        baseURL: import.meta.env.VITE_BACKEND_API_URL,
        timeout: 120000,
      });
    }

    return HttpClient.instance;
  }
}
