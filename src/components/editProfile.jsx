import React, { useEffect, useMemo, useState } from "react";
import {
  UserCircleIcon,
  Mail01Icon,
  Shield01Icon,
  Edit02Icon,
  Call02Icon,
  Image02Icon,
  Cancel01Icon,
  Tick02Icon,
} from "hugeicons-react";

const API_URL = import.meta.env.VITE_API_URL;

const getRoleLabel = (role) => {
  if (!role) return "Peserta AKAR NGAWI";
  if (role.toLowerCase() === "admin") return "Admin AKAR NGAWI 2026";
  if (role.toLowerCase() === "juri") return "Juri AKAR NGAWI 2026";
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

const EditProfileModal = ({ open, onClose, data, onSuccess }) => {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    phone: "",
    avatar: null,
  });
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!open) return;

    setForm({
      nama: data?.nama || "",
      email: data?.email || "",
      phone: data?.phone || "",
      avatar: null,
    });
    setPreview(data?.avatar_url || "");
    setServerError("");
    setSuccessMessage("");
  }, [open, data]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const initials = useMemo(
    () => getInitials(form.nama || data?.nama || ""),
    [form.nama, data]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setForm((prev) => ({
      ...prev,
      avatar: file,
    }));

    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(data?.avatar_url || "");
    }
  };

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setServerError("");
      setSuccessMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Token login tidak ditemukan. Silakan login ulang.");
      }

      const formData = new FormData();
      formData.append("nama", form.nama);
      formData.append("email", form.email);
      formData.append("phone", form.phone);

      if (form.avatar) {
        formData.append("avatar", form.avatar);
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.errors?.join(", ") ||
            result?.message ||
            "Gagal memperbarui profile."
        );
      }

      const updatedProfile = result?.data || {};

      const normalizedUser = {
        nama: updatedProfile.nama || "",
        email: updatedProfile.email || "",
        role: updatedProfile.role || data?.role || "",
        phone: updatedProfile.phone || "",
        avatar_url: updatedProfile.avatar_url || "",
        created_at: updatedProfile.created_at || data?.created_at || "",
      };

      setSuccessMessage("Profile berhasil diperbarui.");

      if (onSuccess) {
        onSuccess(normalizedUser);
      }

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (error) {
      console.error("Update profile error:", error);
      setServerError(
        error.message || "Terjadi kesalahan saat memperbarui profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="relative max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-gray-200 bg-white shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-r from-purple-700 via-violet-600 to-fuchsia-600" />
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute top-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative px-8 pb-8 pt-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Edit Profile</h2>

            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/30"
            >
              <Cancel01Icon className="w-4 h-4" />
              Tutup
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {preview ? (
                <img
                  src={preview}
                  alt={form.nama || "User Avatar"}
                  className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-white shadow-lg">
                  <span className="text-2xl font-bold text-purple-700">
                    {initials}
                  </span>
                </div>
              )}

              <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-white shadow-md">
                <Edit02Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-1.5 text-sm font-medium text-purple-700">
              <Shield01Icon className="w-4 h-4" />
              {getRoleLabel(data?.role)}
            </div>

            {serverError && (
              <div className="mt-6 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

            {successMessage && (
              <div className="mt-6 w-full rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                {successMessage}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-8 grid w-full gap-4 sm:grid-cols-2"
            >
              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-left sm:col-span-2">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                    <Image02Icon className="w-5 h-5" />
                  </div>

                  <div className="w-full">
                    <p className="text-xs font-medium text-gray-500">
                      Foto Profile
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="mt-2 block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-purple-700 hover:file:bg-purple-200"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-left">
                <label className="flex items-start gap-3">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                    <UserCircleIcon className="w-5 h-5" />
                  </div>
                  <div className="w-full">
                    <p className="text-xs font-medium text-gray-500">Nama</p>
                    <input
                      type="text"
                      name="nama"
                      value={form.nama}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      placeholder="Masukkan nama"
                    />
                  </div>
                </label>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-left">
                <label className="flex items-start gap-3">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                    <Mail01Icon className="w-5 h-5" />
                  </div>
                  <div className="w-full">
                    <p className="text-xs font-medium text-gray-500">Email</p>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      placeholder="Masukkan email"
                    />
                  </div>
                </label>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-left">
                <label className="flex items-start gap-3">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                    <Call02Icon className="w-5 h-5" />
                  </div>
                  <div className="w-full">
                    <p className="text-xs font-medium text-gray-500">
                      Nomor Telepon
                    </p>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      placeholder="Masukkan nomor telepon"
                    />
                  </div>
                </label>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                    <Shield01Icon className="w-5 h-5" />
                  </div>
                  <div className="w-full">
                    <p className="text-xs font-medium text-gray-500">
                      Role Sistem
                    </p>
                    <input
                      type="text"
                      value={data?.role || "-"}
                      disabled
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-left sm:col-span-2">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                    <UserCircleIcon className="w-5 h-5" />
                  </div>
                  <div className="w-full">
                    <p className="text-xs font-medium text-gray-500">
                      Terdaftar Sejak
                    </p>
                    <input
                      type="text"
                      value={formatDate(data?.created_at)}
                      disabled
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-2 flex justify-center gap-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Cancel01Icon className="w-4 h-4" />
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Tick02Icon className="w-4 h-4" />
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;