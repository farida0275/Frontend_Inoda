import React from "react";
import { useNavigate } from "react-router-dom";

const ConfirmLogoutModal = ({ open, onClose }) => {
  const navigate = useNavigate();

  if (!open) return null;

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onClose?.();
    navigate("/", { replace: true });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <button
        type="button"
        aria-label="Tutup popup logout"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div className="relative w-[92%] max-w-[460px] rounded-2xl bg-white shadow-2xl">
        <div className="px-6 pt-8 pb-6">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Konfirmasi Logout
          </h2>

          <p className="mt-4 text-base text-slate-700">
            Apakah Anda yakin ingin keluar dari akun ini?
          </p>
        </div>

        <div className="flex justify-end px-6 pb-6">
          <button
            type="button"
            onClick={handleConfirmLogout}
            className="rounded-2xl border border-red-400 px-6 py-2.5 text-lg font-semibold text-red-400 transition hover:bg-red-50"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogoutModal;