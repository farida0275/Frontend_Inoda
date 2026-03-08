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

const AdminSidebar = ({ onLogout }) => {
  const [openLogoutModal, setOpenLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    setOpenLogoutModal(false);
    onLogout?.();
  };

  return (
    <>
      <aside className="w-64 min-h-screen bg-white border-r border-purple-100 shadow-md flex flex-col">
        <div className="bg-purple-900 px-4 py-3 flex items-center gap-2">
          <img
            src={logoakar}
            alt="Logo Akar Ngawi"
            className="w-10 h-10 object-contain"
          />
          <img
            src={logo}
            alt="Logo Bappeda"
            className="w-8 h-8 object-contain"
          />

          <div className="leading-tight">
            <p className="text-white font-bold text-sm tracking-wide">BAPPEDA</p>
            <p className="text-purple-200 text-xs font-medium">
              KABUPATEN NGAWI
            </p>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {menuAdmin.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-purple-50 text-purple-700 border-r-4 border-purple-700"
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

        <div className="p-4 border-t border-purple-100">
          <button
            type="button"
            onClick={() => setOpenLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-900 text-white font-semibold hover:bg-purple-800 transition shadow-md"
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