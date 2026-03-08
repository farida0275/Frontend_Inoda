import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Mail01Icon,
  LockPasswordIcon,
  ArrowLeft01Icon,
} from "hugeicons-react";
import { validateEmail } from "../utils/validator";

const API_URL = import.meta.env.VITE_API_URL;

const LoginPage = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

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

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "juri") {
        navigate("/Juri");
      } else {
        navigate("/participant");
      }
    } catch (error) {
      console.error("Login error:", error);
      setServerError(error.message || "Login gagal, silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="flex items-center gap-2 text-purple-900 hover:text-purple-700 mb-4 text-sm font-medium"
        >
          <ArrowLeft01Icon className="h-5 w-5" />
          Kembali ke Beranda
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg rounded-xl border border-gray-100">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Masuk ke Akun Anda
          </h2>

          <p className="mt-2 text-center text-sm text-gray-600">
            Atau{" "}
            <Link
              to="/register"
              className="font-medium text-purple-900 hover:text-purple-700"
            >
              daftar akun baru
            </Link>
          </p>

          {serverError && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <form className="space-y-6 mt-8" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Alamat Email
              </label>

              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail01Icon className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  type="email"
                  placeholder="nama@instansi.com"
                  className={`block w-full pl-10 sm:text-sm border rounded-md py-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                  {...register("email", {
                    validate: (value) => {
                      const emailErrors = validateEmail(value);
                      return emailErrors.length === 0 || emailErrors[0];
                    },
                  })}
                />
              </div>

              {errors.email && (
                <span className="text-xs text-red-500 mt-1 block">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Kata Sandi
              </label>

              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockPasswordIcon className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  type="password"
                  className={`block w-full pl-10 sm:text-sm border rounded-md py-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  }`}
                  {...register("password", {
                    required: "Password harus diisi",
                  })}
                />
              </div>

              {errors.password && (
                <span className="text-xs text-red-500 mt-1 block">
                  {errors.password.message}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-900">
                  Ingat saya
                </label>
              </div>

              <a
                href="#"
                className="text-sm font-medium text-purple-900 hover:text-purple-700"
              >
                Lupa kata sandi?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold bg-purple-900 hover:opacity-90 transition shadow-lg disabled:opacity-60"
            >
              {loading ? "Sedang masuk..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;