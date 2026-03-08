import React, { useEffect, useMemo, useState } from "react";
import {
  UserCircleIcon,
  Mail01Icon,
  Shield01Icon,
  Edit02Icon,
  Call02Icon,
} from "hugeicons-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://backend-inoda.vercel.app/api";

const getRoleLabel = (role) => {
  if (!role) return "Peserta AKAR NGAWI";
  if (role.toLowerCase() === "admin") return "Admin AKAR NGAWI 2026";
  return "Peserta AKAR NGAWI 2026";
};

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const ProfileUser = () => {
  const [user, setUser] = useState({
    nama: "",
    email: "",
    role: "",
    phone: "",
    avatar_url: "",
    created_at: "",
  });
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setServerError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Token login tidak ditemukan. Silakan login ulang.");
        }

        const response = await fetch(`${API_URL}/auth/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.errors?.join(", ") ||
              result?.message ||
              "Gagal mengambil data profile."
          );
        }

        const profile = result?.data || {};

        setUser({
          nama: profile.nama || "",
          email: profile.email || "",
          role: profile.role || "",
          phone: profile.phone || "",
          avatar_url: profile.avatar_url || "",
          created_at: profile.created_at || "",
        });
      } catch (error) {
        console.error("Fetch profile error:", error);
        setServerError(
          error.message || "Terjadi kesalahan saat mengambil profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const initials = useMemo(() => getInitials(user.nama), [user.nama]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-r from-purple-700 via-violet-600 to-fuchsia-600" />
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute top-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative px-8 pb-8 pt-16">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.nama || "User Avatar"}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-700">
                    {initials}
                  </span>
                </div>
              )}

              <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md">
                <UserCircleIcon className="w-5 h-5" />
              </div>
            </div>

            {loading ? (
              <div className="mt-6 text-sm text-gray-500">Memuat profile...</div>
            ) : serverError ? (
              <div className="mt-6 w-full max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </div>
            ) : (
              <>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                  {user.nama || "-"}
                </h2>

                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-1.5 text-sm font-medium text-purple-700">
                  <Shield01Icon className="w-4 h-4" />
                  {getRoleLabel(user.role)}
                </div>

                <div className="mt-8 grid w-full gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                        <Mail01Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          Email
                        </p>
                        <p className="text-sm font-semibold text-gray-900 break-all">
                          {user.email || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                        <Call02Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          Nomor Telepon
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {user.phone || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                        <Shield01Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          Role Sistem
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {user.role || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                        <UserCircleIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          Terdaftar Sejak
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(user.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm">
                    <Edit02Icon className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileUser;