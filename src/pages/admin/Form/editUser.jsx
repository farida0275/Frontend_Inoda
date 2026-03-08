import React, { useEffect, useState } from "react";
import { X, Check } from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://backend-inoda.vercel.app/api";

const EditUser = ({ isOpen, onClose, userData, onSuccess }) => {
  const [role, setRole] = useState("user");
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (userData?.role) {
      setRole(userData.role);
    }
  }, [userData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setErrorMsg("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Token login tidak ditemukan. Silakan login ulang.");
      }

      if (!userData?.id) {
        throw new Error("ID user tidak ditemukan.");
      }

      const response = await fetch(`${API_URL}/users/${userData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.errors?.join(", ") ||
            result?.message ||
            "Gagal mengupdate user."
        );
      }

      setShowSuccess(true);

      if (onSuccess) {
        onSuccess(result?.data);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || "Gagal mengupdate user.");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setErrorMsg("");
    onClose?.();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
        <div className="w-full max-w-2xl rounded-md bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-6 py-5">
            <h2 className="text-2xl font-semibold text-gray-900">Edit User</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 transition hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6">
            {errorMsg && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="juri">Juri</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end">
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
              Berhasil mengupdate user.
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

export default EditUser;