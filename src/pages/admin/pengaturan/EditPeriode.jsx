import React, { useEffect, useState } from "react";
import { Save, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const inputDateTimeValue = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (num) => String(num).padStart(2, "0");

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const EditPeriode = ({ isOpen, onClose, periodeData, onSuccess }) => {
  const token = localStorage.getItem("token");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    registration_start: "",
    registration_end: "",
    edit_start: "",
    edit_end: "",
  });

  useEffect(() => {
    if (isOpen) {
      setError("");
      setForm({
        registration_start: inputDateTimeValue(periodeData?.registration_start),
        registration_end: inputDateTimeValue(periodeData?.registration_end),
        edit_start: inputDateTimeValue(periodeData?.edit_start),
        edit_end: inputDateTimeValue(periodeData?.edit_end),
      });
    }
  }, [periodeData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (
      !form.registration_start ||
      !form.registration_end ||
      !form.edit_start ||
      !form.edit_end
    ) {
      return "Semua field periode wajib diisi.";
    }

    if (new Date(form.registration_start) > new Date(form.registration_end)) {
      return "Tanggal mulai pendaftaran tidak boleh lebih besar dari tanggal akhir pendaftaran.";
    }

    if (new Date(form.edit_start) > new Date(form.edit_end)) {
      return "Tanggal mulai edit tidak boleh lebih besar dari tanggal akhir edit.";
    }

    return "";
  };

  const readResponseSafely = async (response) => {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return await response.json();
    }
    return await response.text();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (!token) {
        throw new Error("Token login tidak ditemukan. Silakan login ulang.");
      }

      const validationMessage = validateForm();
      if (validationMessage) {
        setError(validationMessage);
        return;
      }

      setSubmitting(true);

      const method = periodeData?.id ? "PUT" : "POST";
      const endpoint = periodeData?.id
        ? `${API_URL}/submission-settings/${periodeData.id}`
        : `${API_URL}/submission-settings`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          registration_start: form.registration_start,
          registration_end: form.registration_end,
          edit_start: form.edit_start,
          edit_end: form.edit_end,
        }),
      });

      const result = await readResponseSafely(response);

      if (!response.ok) {
        throw new Error(
          typeof result === "object"
            ? result?.errors?.join(", ") ||
                result?.message ||
                "Gagal menyimpan pengaturan periode."
            : "Response server bukan JSON. Cek VITE_API_URL dan route backend."
        );
      }

      await onSuccess();
      onClose();
    } catch (err) {
      console.error("Submit submission setting error:", err);
      setError(
        err.message || "Terjadi kesalahan saat menyimpan pengaturan periode."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            {periodeData?.id ? "Edit Periode Peserta" : "Tambah Periode Peserta"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Mulai Pendaftaran
              </label>
              <input
                type="datetime-local"
                name="registration_start"
                value={form.registration_start}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Akhir Pendaftaran
              </label>
              <input
                type="datetime-local"
                name="registration_end"
                value={form.registration_end}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Mulai Edit Peserta
              </label>
              <input
                type="datetime-local"
                name="edit_start"
                value={form.edit_start}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Akhir Edit Peserta
              </label>
              <input
                type="datetime-local"
                name="edit_end"
                value={form.edit_end}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPeriode;