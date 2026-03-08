import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  ClipboardCheck,
} from "lucide-react";
import logo from "../assets/logo.png";
import logoakar from "../assets/logoakar.png";
import ConfirmLogoutModal from "../components/ConfirmLogoutModal.jsx";

const menuAdmin = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/admin/seleksi", label: "Seleksi Peserta", icon: ClipboardList },
  { to: "/admin/peserta", label: "Data Peserta", icon: Users },
  { to: "/admin/penilaian", label: "Penilaian", icon: ClipboardCheck },
  { to: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

const AdminSidebar = ({ onLogout, onNavigate }) => {
  const [openLogoutModal, setOpenLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    setOpenLogoutModal(false);
    onLogout?.();
  };

  return (
    <>
      <aside className="flex h-screen w-64 flex-col border-r border-purple-100 bg-white shadow-md">
        <div className="flex items-center gap-2 bg-purple-900 px-4 py-3">
          <img
            src={logoakar}
            alt="Logo Akar Ngawi"
            className="h-10 w-10 object-contain"
          />
          <img
            src={logo}
            alt="Logo Bappeda"
            className="h-8 w-8 object-contain"
          />
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-wide text-white">BAPPEDA</p>
            <p className="text-xs font-medium text-purple-200">
              KABUPATEN NGAWI
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {menuAdmin.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "border-r-4 border-purple-700 bg-purple-50 text-purple-700"
                      : "text-slate-700 hover:bg-purple-50",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={isActive ? "text-purple-700" : "text-slate-400"}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-purple-100 p-4">
          <button
            type="button"
            onClick={() => setOpenLogoutModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-900 px-4 py-3 font-semibold text-white shadow-md transition hover:bg-purple-800"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      <ConfirmLogoutModal
        open={openLogoutModal}
        onClose={() => setOpenLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

export default AdminSidebar;