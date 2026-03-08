import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const API_URL = import.meta.env.VITE_API_URL;

const AdminLayout = ({ children, onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileError("");

        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token login tidak ditemukan.");

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
        console.error("Fetch profile admin error:", error);
        setProfileError(error.message || "Gagal mengambil profile.");
        setProfile(null);
      }
    };

    fetchProfile();
  }, []);

  const avatarLetter = useMemo(() => {
    const nama = profile?.nama || "A";
    return String(nama).trim().charAt(0).toUpperCase() || "A";
  }, [profile]);

  const roleLabel = useMemo(() => {
    if (!profile?.role) return "Administrator";
    if (profile.role === "admin") return "Administrator";
    if (profile.role === "juri") return "Juri Penilai";
    if (profile.role === "user") return "Peserta Inovasi";
    return profile.role;
  }, [profile]);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <div
        className={`fixed left-0 top-0 z-50 h-screen w-64 transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          <AdminSidebar onLogout={onLogout} onNavigate={closeSidebar} />
          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Tutup sidebar"
            className="absolute right-3 top-3 rounded-lg bg-white/90 p-2 text-slate-700 shadow"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="fixed left-0 top-0 z-40 hidden h-screen w-64 lg:block">
        <AdminSidebar onLogout={onLogout} />
      </div>

      <div className="min-h-screen flex flex-col lg:ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka sidebar"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="hidden lg:block" />

          <Link
            to="/admin/profile"
            className="ml-auto flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50"
          >
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700">
                {profile?.nama || "Administrator"}
              </p>
              <p className="text-xs text-slate-500">
                {profileError ? "Profile belum dimuat" : roleLabel}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-purple-100 font-extrabold text-purple-900">
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

        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;