import {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { interceptRequest, interceptResponse, statusChecker } from "../utils";
import { HttpClient } from "./httpClient";

const initializeApiInterceptors = (httpClient: AxiosInstance): void => {
  interceptRequest(httpClient);
  interceptResponse(httpClient);
};

class ApiService {
  private _httpClient = HttpClient.getInstance();

  constructor() {
    initializeApiInterceptors(this._httpClient);
  }

  responseHandler<T = unknown>({ data }: AxiosResponse<T>) {
    return data;
  }

  async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return statusChecker(await this._httpClient.get<T>(url, config));
  }

  async post<T = unknown, B = unknown>(
    url: string,
    body: B,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return statusChecker(await this._httpClient.post<T>(url, body, config));
  }

  async patch<T = unknown, B = unknown>(
    url: string,
    body: B,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return statusChecker(await this._httpClient.patch<T>(url, body, config));
  }

  async put<T = unknown, B = unknown>(
    url: string,
    body: B,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return statusChecker(await this._httpClient.put<T>(url, body, config));
  }

  async delete<T = unknown>(
    url: string,
    data?: any, // Optional body for DELETE request
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const deleteConfig: AxiosRequestConfig = config || {};
    if (data) {
      deleteConfig.data = data;
    }
    return statusChecker(await this._httpClient.delete<T>(url, deleteConfig));
  }
}

export const apiService = new ApiService();
