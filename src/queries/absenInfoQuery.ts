import { queryOptions } from "@tanstack/react-query";
import api from "../lib/api";
import { AbsenInfoRespon } from "../types/responses/absent-information";
import { useAuthStore } from "../store/auth-store";

export const getAbsenInfo = async () => {
  const token = useAuthStore.getState().token;

  const response = await api.get<AbsenInfoRespon>(
    "/mobile-v2/absent-information",
    {
      headers: {
        token: `${token}`,
      },
    }
  );
  return response.data;
};

export const absenInfoQueryOptions = () =>
  queryOptions({
    queryKey: ["absenInfo"],
    queryFn: getAbsenInfo,
    retry: false,
    staleTime: 60 * 60 * 1000,
  });
