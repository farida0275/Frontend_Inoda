import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Mail01Icon,
  LockPasswordIcon,
  ArrowLeft01Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "hugeicons-react";
import { validateEmail } from "../utils/validator";

const API_URL = import.meta.env.VITE_API_URL;

const LoginPage = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError("");

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email.trim().toLowerCase(),
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.errors?.join(", ") ||
            result?.message ||
            "Login gagal, silakan coba lagi."
        );
      }

      const token = result?.data?.token;
      const user = result?.data?.user;

      if (!token || !user) {
        throw new Error("Response login tidak valid");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      const role = user.role?.toLowerCase();

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "juri") {
        navigate("/Juri/Penilaian");
      } else if (role === "peserta") {
        navigate("/participant");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      setServerError(error.message || "Login gagal, silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <div className="w-full">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-purple-900 transition hover:text-purple-700"
          >
            <ArrowLeft01Icon className="h-5 w-5" />
            Kembali ke Beranda
          </Link>

          <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white/95 shadow-xl backdrop-blur">
            <div className="border-b border-purple-50 bg-gradient-to-r from-purple-900 to-purple-700 px-6 py-6 text-white">
              <h2 className="text-2xl font-bold">Masuk ke Akun Anda</h2>
              <p className="mt-1 text-sm text-purple-100">
                Silakan login untuk melanjutkan ke dashboard
              </p>
            </div>

            <div className="px-6 py-7">
              <p className="mb-6 text-center text-sm text-gray-600">
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-purple-900 hover:text-purple-700"
                >
                  Daftar akun baru
                </Link>
              </p>

              {serverError && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {serverError}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Alamat Email
                  </label>

                  <div
                    className={`relative rounded-xl border bg-white transition focus-within:ring-2 focus-within:ring-purple-500 ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail01Icon className="h-5 w-5 text-gray-400" />
                    </div>

                    <input
                      type="email"
                      placeholder="nama@instansi.com"
                      className="block w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm outline-none"
                      {...register("email", {
                        validate: (value) => {
                          const emailErrors = validateEmail(value);
                          return emailErrors.length === 0 || emailErrors[0];
                        },
                      })}
                    />
                  </div>

                  {errors.email && (
                    <span className="mt-1 block text-xs text-red-500">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Kata Sandi
                  </label>

                  <div
                    className={`relative rounded-xl border bg-white transition focus-within:ring-2 focus-within:ring-purple-500 ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <LockPasswordIcon className="h-5 w-5 text-gray-400" />
                    </div>

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan kata sandi"
                      className="block w-full rounded-xl bg-transparent py-3 pl-10 pr-12 text-sm outline-none"
                      {...register("password", {
                        required: "Password harus diisi",
                      })}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition hover:text-purple-700"
                    >
                      {showPassword ? (
                        <ViewOffSlashIcon className="h-5 w-5" />
                      ) : (
                        <ViewIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <span className="mt-1 block text-xs text-red-500">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-purple-600"
                    />
                    Ingat saya
                  </label>

                  <button
                    type="button"
                    className="text-sm font-medium text-purple-900 transition hover:text-purple-700"
                  >
                    Lupa kata sandi?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-purple-900 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Sedang masuk..." : "Masuk"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;