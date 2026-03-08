import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import JuriSidebar from "./JuriSidebar";

const API_URL =
  import.meta.env.VITE_API_URL ;

const SIDEBAR_W = "w-64";
const SIDEBAR_ML = "ml-64";

const JuriLayout = ({ children, onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileError("");

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token login tidak ditemukan.");
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

        setProfile(result?.data || null);
      } catch (error) {
        console.error("Fetch profile juri error:", error);
        setProfileError(error.message || "Gagal mengambil profile.");
        setProfile(null);
      }
    };

    fetchProfile();
  }, []);

  const avatarLetter = useMemo(() => {
    const nama = profile?.nama || "J";
    return String(nama).trim().charAt(0).toUpperCase() || "J";
  }, [profile]);

  const roleLabel = useMemo(() => {
    if (!profile?.role) return "Juri Penilai";
    if (profile.role === "juri") return "Juri Penilai";
    if (profile.role === "admin") return "Administrator";
    if (profile.role === "user") return "Peserta Inovasi";
    return profile.role;
  }, [profile]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className={`fixed left-0 top-0 h-screen ${SIDEBAR_W} z-40`}>
        <JuriSidebar onLogout={onLogout} />
      </div>

      <div className={`${SIDEBAR_ML} min-h-screen flex flex-col`}>
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-end">
          <Link
            to="/juri/profile"
            className="flex items-center gap-4 rounded-xl px-3 py-2 transition hover:bg-slate-50"
          >
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700">
                {profile?.nama || "Juri"}
              </p>
              <p className="text-xs text-slate-500">
                {profileError ? "Profile belum dimuat" : roleLabel}
              </p>
            </div>

            <div className="h-10 w-10 overflow-hidden rounded-full bg-purple-100 text-purple-900 flex items-center justify-center font-extrabold">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile?.nama || "Profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                avatarLetter
              )}
            </div>
          </Link>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default JuriLayout;