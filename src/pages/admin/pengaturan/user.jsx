import React from "react";
import { Pencil, Trash2 } from "lucide-react";

const IconBtn = ({ variant = "neutral", children, ...props }) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold border transition";
  const styles =
    variant === "danger"
      ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
      : variant === "primary"
      ? "border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

  return (
    <button type="button" className={`${base} ${styles}`} {...props}>
      {children}
    </button>
  );
};

const ROLE_OPTIONS = [
  { label: "Admin", value: "admin" },
  { label: "Juri", value: "juri" },
  { label: "Peserta", value: "user" },
];

const UserTable = ({
  loadingUser,
  userError,
  filtered,
  handleRoleChange,
  handleEdit,
  handleHapus,
}) => {
  return (
    <div className="overflow-x-auto">
      {loadingUser ? (
        <div className="px-5 py-10 text-center text-slate-500">
          Memuat data user...
        </div>
      ) : userError ? (
        <div className="px-5 py-6">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {userError}
          </div>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr className="border-b border-slate-200">
              <th className="px-5 py-3 text-left w-14">#</th>
              <th className="px-5 py-3 text-left">Nama</th>
              <th className="px-5 py-3 text-left">Email</th>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3 text-left w-56">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                  Data tidak ditemukan.
                </td>
              </tr>
            ) : (
              filtered.map((r, idx) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  <td className="px-5 py-4 text-slate-600">{idx + 1}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {r.nama}
                  </td>
                  <td className="px-5 py-4 text-slate-700">{r.email}</td>

                  <td className="px-5 py-4">
                    <select
                      value={r.role}
                      onChange={(e) => handleRoleChange(r.id, e.target.value)}
                      className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-800
                                 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <IconBtn
                        variant="primary"
                        onClick={() => handleEdit("user", r)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </IconBtn>

                      <IconBtn
                        variant="danger"
                        onClick={() => handleHapus("user", r.id)}
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                        Hapus
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserTable;