import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FiUser, FiMail, FiLock, FiArrowLeft } from "react-icons/fi";
import {
  validateNama,
  validateEmail,
  validatePassword,
} from "../utils/validator";

const API_BASE_URL = "https://backend-inoda.vercel.app/api/auth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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

      const response = await fetch(`${API_BASE_URL}/register`, {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="flex items-center gap-2 text-purple-900 hover:text-purple-700 mb-6 text-sm font-medium"
        >
          <FiArrowLeft /> Kembali ke Beranda
        </Link>

        <div className="bg-white/80 backdrop-blur-lg border border-purple-100 shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Daftar Akun
          </h2>
          <p className="text-center text-gray-500 text-sm mt-2">
            Buat akun untuk mengikuti lomba
          </p>

          {serverError && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          {serverSuccess && (
            <div className="mt-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-600">
              {serverSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-6">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Nama Lengkap
              </label>
              <div className="mt-1 flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-purple-500">
                <FiUser className="text-gray-400 mr-2" />
                <input
                  type="text"
                  className="w-full outline-none bg-transparent"
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
                <p className="text-xs text-red-500 mt-1">
                  {errors.nama.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-purple-500">
                <FiMail className="text-gray-400 mr-2" />
                <input
                  type="email"
                  className="w-full outline-none bg-transparent"
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
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-purple-500">
                <FiLock className="text-gray-400 mr-2" />
                <input
                  type="password"
                  className="w-full outline-none bg-transparent"
                  placeholder="Masukkan password"
                  {...register("password", {
                    validate: (value) => {
                      const passwordErrors = validatePassword(value);
                      return passwordErrors.length === 0 || passwordErrors[0];
                    },
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Konfirmasi Password
              </label>
              <div className="mt-1 flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-purple-500">
                <FiLock className="text-gray-400 mr-2" />
                <input
                  type="password"
                  className="w-full outline-none bg-transparent"
                  placeholder="Ulangi password"
                  {...register("confirmPassword", {
                    required: "Konfirmasi password wajib diisi",
                    validate: (value) =>
                      value === password || "Password tidak cocok",
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold bg-purple-900 hover:opacity-90 transition shadow-lg disabled:opacity-60"
            >
              {loading ? "Sedang daftar..." : "Daftar"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="text-purple-900 font-medium hover:underline"
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;