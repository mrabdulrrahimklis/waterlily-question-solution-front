import { type AxiosResponse } from "axios";

function statusChecker<T>(response: AxiosResponse<T>): AxiosResponse<T> {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  throw response.data;
}

export default statusChecker;
