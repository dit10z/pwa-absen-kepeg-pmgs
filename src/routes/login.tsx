import * as React from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
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

  // State for input fields
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      const response = await api.post<LoginResponse>("/mobile-v2/login", {
        username,
        password,
      });
      return response.data;
    },
    onSuccess: async (data) => {
      auth.setToken(data.token);
      auth.setUser(data.user);

      await navigate({ to: "/dashboard" });
    },
    onError: () => {
      alert("Login Failed! Please check your credentials.");
    },
  });

  // Handle login submission
  const handleLogin = () => {
    mutate();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white font-poppins">
      <div className="p-6 max-w-md text-center mb-4">
        {/* Header Section */}
        <div className="flex flex-row justify-between items-center mb-4">
          <a href="/">
            <img
              src="src/assets/ic_arrow_back.svg"
              alt="Back"
              width={30}
              height={30}
            />
          </a>
          <p>Masuk Akun</p>
          <a href="/setting-url">
            <img
              src="src/assets/ic_setting_outline.svg"
              alt="Settings"
              width={30}
              height={30}
            />
          </a>
        </div>

        {/* Login Illustration */}
        <div className="flex justify-center items-center mb-6">
          <img
            src="src/assets/ic_masuk_akun.svg"
            alt="Login"
            width={200}
            height={200}
          />
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Masuk ke Aplikasi
        </h1>
        <p className="text-gray-600 mb-2 text-sm px-2">
          Masukan informasi pengguna Anda di bawah ini untuk melanjutkan
        </p>

        {/* Form Section */}
        <div className="px-4">
          {error && (
            <p className="text-red-500 text-center mb-4">
              Login gagal. Coba lagi.
            </p>
          )}

          {/* Username Input */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="flex text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-red-500"
            />
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="flex text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              placeholder="Masukan Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-red-500"
            />
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-primary text-white py-3 rounded-3xl font-medium hover:bg-red-600 transition"
            disabled={isPending}
          >
            {isPending ? "Logging in..." : "Masuk"}
          </button>

          {/* Forgot Password */}
          <p className="text-sm text-gray-500 mt-4">
            <a href="#" className="text-primary hover:underline">
              Lupa Password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginComponent;
