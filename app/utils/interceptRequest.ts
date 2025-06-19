import { type AxiosInstance } from "axios";

const interceptRequest = (httpClient: AxiosInstance): void => {
  httpClient.interceptors.request.use(
    async (config) => {
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

export default interceptRequest;
