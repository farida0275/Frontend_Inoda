import React, { useEffect, useMemo, useState } from "react";
import {
  UserCircleIcon,
  Mail01Icon,
  Shield01Icon,
  Edit02Icon,
  Call02Icon,
  Image02Icon,
  Tick02Icon,
  Cancel01Icon,
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

const ProfileUser = () => {
  const [user, setUser] = useState({
    nama: "",
    email: "",
    role: "",
    phone: "",
    avatar_url: "",
    created_at: "",
  });

  const [form, setForm] = useState({
    nama: "",
    email: "",
    phone: "",
    avatar: null,
  });

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEdit, setIsEdit] = useState(false);

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

        const normalizedUser = {
          nama: profile.nama || "",
          email: profile.email || "",
          role: profile.role || "",
          phone: profile.phone || "",
          avatar_url: profile.avatar_url || "",
          created_at: profile.created_at || "",
        };

        setUser(normalizedUser);
        setForm({
          nama: normalizedUser.nama,
          email: normalizedUser.email,
          phone: normalizedUser.phone,
          avatar: null,
        });
        setPreview(normalizedUser.avatar_url || "");
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

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const initials = useMemo(
    () => getInitials(isEdit ? form.nama : user.nama),
    [form.nama, user.nama, isEdit]
  );

  const handleEditMode = () => {
    setIsEdit(true);
    setServerError("");
    setSuccessMessage("");
    setForm({
      nama: user.nama || "",
      email: user.email || "",
      phone: user.phone || "",
      avatar: null,
    });
    setPreview(user.avatar_url || "");
  };

  const handleCancelEdit = () => {
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setIsEdit(false);
    setServerError("");
    setSuccessMessage("");
    setForm({
      nama: user.nama || "",
      email: user.email || "",
      phone: user.phone || "",
      avatar: null,
    });
    setPreview(user.avatar_url || "");
  };

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
      setPreview(user.avatar_url || "");
    }
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
        role: updatedProfile.role || user.role || "",
        phone: updatedProfile.phone || "",
        avatar_url: updatedProfile.avatar_url || "",
        created_at: updatedProfile.created_at || user.created_at || "",
      };

      setUser(normalizedUser);
      setForm({
        nama: normalizedUser.nama,
        email: normalizedUser.email,
        phone: normalizedUser.phone,
        avatar: null,
      });
      setPreview(normalizedUser.avatar_url || "");
      setSuccessMessage("Profile berhasil diperbarui.");
      setIsEdit(false);
    } catch (error) {
      console.error("Update profile error:", error);
      setServerError(
        error.message || "Terjadi kesalahan saat memperbarui profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-purple-700 via-violet-600 to-fuchsia-600" />
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute top-8 -left-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

        <div className="relative px-5 pb-5 pt-12 sm:px-6 sm:pb-6 sm:pt-14">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                {preview ? (
                  <img
                    src={preview}
                    alt={isEdit ? form.nama || "User Avatar" : user.nama || "User Avatar"}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                    <span className="text-xl font-bold text-purple-700">
                      {initials}
                    </span>
                  </div>
                )}

                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md">
                  {isEdit ? (
                    <Edit02Icon className="w-4 h-4" />
                  ) : (
                    <UserCircleIcon className="w-4 h-4" />
                  )}
                </div>
              </div>

              {loading ? (
                <div className="mt-4 text-sm text-gray-500">Memuat profile...</div>
              ) : serverError ? (
                <div className="mt-4 w-full max-w-xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {serverError}
                </div>
              ) : (
                <>
                  <h2 className="mt-4 text-xl font-bold text-gray-900">
                    {isEdit ? form.nama || "-" : user.nama || "-"}
                  </h2>

                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                    <Shield01Icon className="w-4 h-4" />
                    {getRoleLabel(user.role)}
                  </div>

                  {successMessage && (
                    <div className="mt-4 w-full max-w-xl rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                      {successMessage}
                    </div>
                  )}

                  <div className="mt-5 grid w-full gap-3 sm:grid-cols-2">
                    {isEdit && (
                      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left sm:col-span-2">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700 mt-1">
                            <Image02Icon className="w-4 h-4" />
                          </div>
                          <div className="w-full">
                            <p className="text-xs font-medium text-gray-500">
                              Foto Profile
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              className="mt-2 block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-purple-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-purple-700 hover:file:bg-purple-200"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700 mt-1">
                          <Mail01Icon className="w-4 h-4" />
                        </div>
                        <div className="w-full">
                          <p className="text-xs font-medium text-gray-500">
                            Email
                          </p>
                          {isEdit ? (
                            <input
                              type="email"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                              placeholder="Masukkan email"
                            />
                          ) : (
                            <p className="text-sm font-semibold text-gray-900 break-all">
                              {user.email || "-"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700 mt-1">
                          <Call02Icon className="w-4 h-4" />
                        </div>
                        <div className="w-full">
                          <p className="text-xs font-medium text-gray-500">
                            Nomor Telepon
                          </p>
                          {isEdit ? (
                            <input
                              type="text"
                              name="phone"
                              value={form.phone}
                              onChange={handleChange}
                              className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                              placeholder="Masukkan nomor telepon"
                            />
                          ) : (
                            <p className="text-sm font-semibold text-gray-900">
                              {user.phone || "-"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700 mt-1">
                          <UserCircleIcon className="w-4 h-4" />
                        </div>
                        <div className="w-full">
                          <p className="text-xs font-medium text-gray-500">
                            Nama
                          </p>
                          {isEdit ? (
                            <input
                              type="text"
                              name="nama"
                              value={form.nama}
                              onChange={handleChange}
                              className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                              placeholder="Masukkan nama"
                            />
                          ) : (
                            <p className="text-sm font-semibold text-gray-900">
                              {user.nama || "-"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700 mt-1">
                          <Shield01Icon className="w-4 h-4" />
                        </div>
                        <div className="w-full">
                          <p className="text-xs font-medium text-gray-500">
                            Role Sistem
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {user.role || "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left sm:col-span-2">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700 mt-1">
                          <UserCircleIcon className="w-4 h-4" />
                        </div>
                        <div className="w-full">
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

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    {!isEdit ? (
                      <button
                        type="button"
                        onClick={handleEditMode}
                        className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
                      >
                        <Edit02Icon className="w-4 h-4" />
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className="inline-flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <Cancel01Icon className="w-4 h-4" />
                          Batal
                        </button>

                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <Tick02Icon className="w-4 h-4" />
                          {saving ? "Menyimpan..." : "Simpan"}
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileUser;