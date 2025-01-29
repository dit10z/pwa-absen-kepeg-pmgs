import { AxiosError } from "axios";
import api from "../lib/api";
import { useAuthStore } from "../store/auth-store";
import { CheckAbsenRequest } from "../types/requests/check-absen";
import { CheckAbsenResponse } from "../types/responses/check-absen-response";
import { ErrorResponse } from "../types/responses/error";

export const postCheckAbsen = async (data: CheckAbsenRequest) => {
  const token = useAuthStore.getState().token;

  return await api
    .post<CheckAbsenResponse>("/mobile-v2/absen-check", data, {
      headers: {
        token: `${token}`,
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch((err: AxiosError<ErrorResponse>) => {
      throw new Error(err.response?.data.message);
    });
};
