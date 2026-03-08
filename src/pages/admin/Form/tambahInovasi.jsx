import React, { useState } from "react";
import { X, Check } from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://backend-inoda.vercel.app/api";

const initialForm = {
  name: "",
  deskripsi: "",
};

const TambahInovasi = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState(initialForm);
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

      const response = await fetch(`${API_URL}/inovasi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          deskripsi: form.deskripsi.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.errors?.join(", ") ||
            result?.message ||
            "Gagal menambahkan inovasi."
        );
      }

      setShowSuccess(true);

      if (onSuccess) {
        onSuccess(result?.data);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || "Gagal menambahkan inovasi.");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setForm(initialForm);
    setErrorMsg("");
    onClose?.();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
        <div className="w-full max-w-2xl rounded-md bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-6 py-5">
            <h2 className="text-2xl font-semibold text-gray-900">
              Tambah Inovasi
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 transition hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
            {errorMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nama Inovasi
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Masukkan nama inovasi"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Deskripsi
              </label>
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                rows={6}
                placeholder="Masukkan deskripsi inovasi"
                className="w-full resize-none rounded border border-gray-300 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
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

            <h3 className="text-xl font-bold text-gray-900">Sukses</h3>
            <p className="mt-2 text-sm text-gray-700">
              Berhasil menambahkan inovasi.
            </p>

            <button
              type="button"
              onClick={handleCloseSuccess}
              className="mt-5 rounded-lg bg-purple-900 px-6 py-2 text-sm font-medium text-white transition hover:bg-purple-800"
            >
              Oke
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TambahInovasi;