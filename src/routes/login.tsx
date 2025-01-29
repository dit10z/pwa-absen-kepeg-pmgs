import * as React from "react";
import {
  createFileRoute,
  redirect,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import api from "../lib/api";
import { LoginResponse } from "../types/responses/login";
import { useAuthStore } from "../store/auth-store";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
  beforeLoad: ({ context }) => {
    const token = context.auth.token;
    if (token) {
      throw redirect({ to: "/dashboard" });
    }
  },
});

function LoginComponent() {
  const auth = useAuthStore();
  const navigate = useNavigate();
  const router = useRouter();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => {
      const response = await api.post<LoginResponse>("/mobile-v2/login", {
        username,
        password,
      });
      return response.data; // Return the response data
    },
    onSuccess: async (data) => {
      auth.setToken(data.token);
      auth.setUser(data.user);

      router.invalidate();
      await navigate({ to: "/dashboard" });
    },
    onError: (err) => {
      alert("Login Failed! Please check your credentials.");
    },
  });
  return (
    <div>
      <h1>Login Page</h1>
      <button
        onClick={() => mutate({ username: "pegawai_test", password: "1234" })}
        disabled={isPending}
      >
        {isPending ? "Logging in..." : "Login"}
      </button>
      {error && <p style={{ color: "red" }}>Login failed. Try again.</p>}
    </div>
  );
}
