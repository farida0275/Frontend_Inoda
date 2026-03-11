import React, { useRef, useState } from "react";
import { X, UploadCloud } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const initialForm = {
  judul: "",
  konten: "",
  author: "",
  source_name: "",
  source_url: "",
  status: "draft",
  thumbnail: null,
};

const TambahBerita = ({ isOpen, onClose, onSuccess }) => {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const resetForm = () => {
    setForm(initialForm);
    setPreview("");
    setErrorMsg("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      thumbnail: file,
    }));

    setPreview(URL.createObjectURL(file));
  };

  const handleActionSubmit = async (status) => {
    try {
      setSaving(true);
      setErrorMsg("");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token login tidak ditemukan. Silakan login ulang.");
      }

      const formData = new FormData();
      formData.append("judul", form.judul.trim());
      formData.append("konten", form.konten.trim());
      formData.append("author", form.author.trim());
      formData.append("status", status);
      formData.append("source_name", form.source_name.trim());
      formData.append("source_url", form.source_url.trim());

      if (form.thumbnail instanceof File) {
        formData.append("image", form.thumbnail);
      }

      const response = await fetch(`${API_URL}/berita`, {
        method: "POST",
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
            "Gagal menambahkan berita."
        );
      }

      onSuccess?.(result?.data);
      resetForm();
      onClose?.();
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || "Gagal menyimpan berita.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30">
      <div className="flex h-full items-center justify-center p-4">
        <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-md bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-7 py-5">
            <h2 className="text-2xl font-semibold text-gray-900">
              Tambah Berita
            </h2>

            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 transition hover:text-gray-600"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-7 py-6">
            <div className="space-y-5">
              {errorMsg && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Judul Berita
                </label>
                <input
                  type="text"
                  name="judul"
                  value={form.judul}
                  onChange={handleChange}
                  placeholder="Masukkan judul berita"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Konten Berita
                </label>
                <textarea
                  name="konten"
                  value={form.konten}
                  onChange={handleChange}
                  rows={7}
                  placeholder="Tuliskan konten berita di sini..."
                  className="w-full resize-none rounded border border-gray-300 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Author Berita
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={form.author}
                    onChange={handleChange}
                    placeholder="Contoh: Humas Bappeda"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nama Sumber / Penerbit
                  </label>
                  <input
                    type="text"
                    name="source_name"
                    value={form.source_name}
                    onChange={handleChange}
                    placeholder="Contoh: Republika"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Link Berita Asli
                </label>
                <input
                  type="url"
                  name="source_url"
                  value={form.source_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Thumbnail Berita
                </label>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-8 transition hover:border-purple-400"
                >
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview thumbnail"
                        className="h-40 w-auto rounded object-cover"
                      />
                    ) : (
                      <>
                        <UploadCloud className="mb-3 h-10 w-10 text-purple-700" />
                        <p className="text-sm">
                          Klik untuk memilih gambar thumbnail
                        </p>
                      </>
                    )}
                  </div>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="border-t bg-white px-7 py-4">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleActionSubmit("draft")}
                className="rounded bg-red-400 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Draft"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleActionSubmit("published")}
                className="rounded bg-purple-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-purple-800 disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Publish"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TambahBerita;