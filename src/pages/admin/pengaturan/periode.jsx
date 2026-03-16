import React from "react";
import { Pencil, Plus } from "lucide-react";

const IconBtn = ({ variant = "neutral", children, ...props }) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold border transition";
  const styles =
    variant === "primary"
      ? "border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

  return (
    <button type="button" className={`${base} ${styles}`} {...props}>
      {children}
    </button>
  );
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getPeriodStatus = (start, end) => {
  if (!start || !end) {
    return {
      label: "Belum diatur",
      className: "bg-slate-100 text-slate-700",
    };
  }

  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return {
      label: "Tanggal tidak valid",
      className: "bg-red-100 text-red-700",
    };
  }

  if (now < startDate) {
    return {
      label: "Belum dimulai",
      className: "bg-amber-100 text-amber-700",
    };
  }

  if (now > endDate) {
    return {
      label: "Sudah berakhir",
      className: "bg-slate-200 text-slate-700",
    };
  }

  return {
    label: "Sedang aktif",
    className: "bg-emerald-100 text-emerald-700",
  };
};

const PeriodeTable = ({
  loadingPeriode,
  periodeError,
  filtered,
  handleEdit,
  handleTambahPeriode,
}) => {
  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Periode Peserta</h2>
          <p className="text-sm text-slate-500">
            Atur batas waktu pendaftaran dan edit peserta.
          </p>
        </div>

        {filtered.length === 0 && (
          <IconBtn variant="primary" onClick={handleTambahPeriode}>
            <Plus className="h-4 w-4" />
            Tambah Periode
          </IconBtn>
        )}
      </div>

      {loadingPeriode ? (
        <div className="px-5 py-10 text-center text-slate-500">
          Memuat data periode...
        </div>
      ) : periodeError ? (
        <div className="px-5 py-6">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {periodeError}
          </div>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr className="border-b border-slate-200">
              <th className="w-14 px-5 py-3 text-left">#</th>
              <th className="px-5 py-3 text-left">Periode Pendaftaran</th>
              <th className="px-5 py-3 text-left">Periode Edit</th>
              <th className="px-5 py-3 text-left">Status Pendaftaran</th>
              <th className="px-5 py-3 text-left">Status Edit</th>
              <th className="w-56 px-5 py-3 text-left">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                  Belum ada data periode.
                </td>
              </tr>
            ) : (
              filtered.map((r, idx) => {
                const regStatus = getPeriodStatus(
                  r.registration_start,
                  r.registration_end
                );
                const editStatus = getPeriodStatus(r.edit_start, r.edit_end);

                return (
                  <tr
                    key={r.id || idx}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-slate-600">{idx + 1}</td>

                    <td className="px-5 py-4 text-slate-700">
                      {formatDateTime(r.registration_start)} -{" "}
                      {formatDateTime(r.registration_end)}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {formatDateTime(r.edit_start)} -{" "}
                      {formatDateTime(r.edit_end)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${regStatus.className}`}
                      >
                        {regStatus.label}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${editStatus.className}`}
                      >
                        {editStatus.label}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <IconBtn
                          variant="primary"
                          onClick={() => handleEdit("periode", r)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PeriodeTable;