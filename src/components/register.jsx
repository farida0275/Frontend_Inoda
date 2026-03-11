import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  UserIcon,
  Mail01Icon,
  LockPasswordIcon,
  ArrowLeft01Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "hugeicons-react";
import {
  validateNama,
  validateEmail,
  validatePassword,
} from "../utils/validator";

const API_URL = import.meta.env.VITE_API_URL;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError("");
      setServerSuccess("");

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: data.nama.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.errors?.join(", ") ||
            result?.message ||
            "Registrasi gagal, silakan coba lagi."
        );
      }

      setServerSuccess(
        result?.message || "Registrasi berhasil. Mengarahkan ke halaman login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error("Register error:", error);
      setServerError(error.message || "Registrasi gagal, silakan coba lagi.");
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
              <h2 className="text-2xl font-bold">Daftar Akun</h2>
              <p className="mt-1 text-sm text-purple-100">
                Buat akun untuk mengikuti lomba
              </p>
            </div>

            <div className="px-6 py-7">
              {serverError && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {serverError}
                </div>
              )}

              {serverSuccess && (
                <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                  {serverSuccess}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nama Lengkap
                  </label>

                  <div
                    className={`relative rounded-xl border bg-white transition focus-within:ring-2 focus-within:ring-purple-500 ${
                      errors.nama ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>

                    <input
                      type="text"
                      className="block w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm outline-none"
                      placeholder="Nama peserta"
                      {...register("nama", {
                        validate: (value) => {
                          const namaErrors = validateNama(value);
                          return namaErrors.length === 0 || namaErrors[0];
                        },
                      })}
                    />
                  </div>

                  {errors.nama && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.nama.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email
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
                      className="block w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm outline-none"
                      placeholder="email@gmail.com"
                      {...register("email", {
                        validate: (value) => {
                          const emailErrors = validateEmail(value);
                          return emailErrors.length === 0 || emailErrors[0];
                        },
                      })}
                    />
                  </div>

                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Password
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
                      className="block w-full rounded-xl bg-transparent py-3 pl-10 pr-12 text-sm outline-none"
                      placeholder="Masukkan password"
                      {...register("password", {
                        validate: (value) => {
                          const passwordErrors = validatePassword(value);
                          return passwordErrors.length === 0 || passwordErrors[0];
                        },
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
                    <p className="mt-1 text-xs text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Konfirmasi Password
                  </label>

                  <div
                    className={`relative rounded-xl border bg-white transition focus-within:ring-2 focus-within:ring-purple-500 ${
                      errors.confirmPassword ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <LockPasswordIcon className="h-5 w-5 text-gray-400" />
                    </div>

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="block w-full rounded-xl bg-transparent py-3 pl-10 pr-12 text-sm outline-none"
                      placeholder="Ulangi password"
                      {...register("confirmPassword", {
                        required: "Konfirmasi password wajib diisi",
                        validate: (value) =>
                          value === password || "Password tidak cocok",
                      })}
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition hover:text-purple-700"
                    >
                      {showConfirmPassword ? (
                        <ViewOffSlashIcon className="h-5 w-5" />
                      ) : (
                        <ViewIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-purple-900 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Sedang daftar..." : "Daftar"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Sudah punya akun?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-purple-900 hover:underline"
                >
                  Masuk
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;