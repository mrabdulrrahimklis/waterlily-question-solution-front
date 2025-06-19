import axios, { type AxiosInstance } from "axios";

const interceptResponse = async (httpClient: AxiosInstance) => {
  httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (!error.response) {
        if (error.message === "Network Error") {
          console.error("Network error - server is probably down");
          throw error;
        } else {
          console.error("Unknown error", error);
          throw error;
        }
      }
      return error.response;
    }
  );
};
export default interceptResponse;
