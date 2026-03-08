import React, { useState } from "react";
import { X, Check } from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://backend-inoda.vercel.app/api";

const TambahUser = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    role: "user",
    password: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setErrorMsg("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Token login tidak ditemukan. Silakan login ulang.");
      }

      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nama: form.nama.trim(),
          email: form.email.trim(),
          role: form.role,
          password: form.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.errors?.join(", ") ||
            result?.message ||
            "Gagal menambahkan user."
        );
      }

      setShowSuccess(true);

      if (onSuccess) {
        onSuccess(result?.data);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || "Gagal menambahkan user.");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setErrorMsg("");
    setForm({
      nama: "",
      email: "",
      role: "user",
      password: "",
    });
    onClose?.();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
        <div className="w-full max-w-md rounded-md bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Tambah User</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 transition hover:text-gray-600"
            >
              <X size={22} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            {errorMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nama User
              </label>
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                placeholder="Masukkan nama user"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Masukkan email"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="juri">Juri</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Qwerty123!"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-purple-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-purple-800 disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-xs rounded-xl bg-white px-6 py-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
              <Check size={40} className="text-purple-700" strokeWidth={3} />
            </div>

            <h3 className="text-2xl font-bold text-gray-900">Sukses</h3>
            <p className="mt-2 text-gray-700">Berhasil menambahkan user.</p>

            <button
              type="button"
              onClick={handleCloseSuccess}
              className="mt-6 rounded-lg bg-purple-900 px-6 py-2 text-sm font-medium text-white transition hover:bg-purple-800"
            >
              Oke
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TambahUser;