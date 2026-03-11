import React from "react";
import { Pencil, Trash2, ExternalLink } from "lucide-react";

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

const formatTanggal = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const renderSumber = (row) => {
  const sourceName = row?.source_name?.trim?.() || "";
  const sourceUrl = row?.source_url?.trim?.() || "";

  if (sourceName && sourceUrl) {
    return (
      <a
        href={sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 font-medium text-purple-700 hover:underline"
      >
        {sourceName}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    );
  }

  if (sourceName) {
    return <span className="font-medium text-slate-700">{sourceName}</span>;
  }

  if (sourceUrl) {
    return (
      <a
        href={sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 font-medium text-purple-700 hover:underline"
      >
        Lihat sumber
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    );
  }

  return "-";
};

const renderStatus = (status) => {
  const normalized = (status || "").toLowerCase();

  if (normalized === "published") {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        Published
      </span>
    );
  }

  return (
    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
      Draft
    </span>
  );
};

const BeritaTable = ({
  loadingBerita,
  beritaError,
  filtered = [],
  handleEdit,
  handleHapus,
}) => {
  return (
    <div className="overflow-x-auto">
      {loadingBerita ? (
        <div className="px-5 py-10 text-center text-slate-500">
          Memuat data berita...
        </div>
      ) : beritaError ? (
        <div className="px-5 py-6">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {beritaError}
          </div>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr className="border-b border-slate-200">
              <th className="w-14 px-5 py-3 text-left">#</th>
              <th className="px-5 py-3 text-left">Judul</th>
              <th className="px-5 py-3 text-left">Sumber</th>
              <th className="px-5 py-3 text-left">Author</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Tanggal</th>
              <th className="w-56 px-5 py-3 text-left">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                  Data tidak ditemukan.
                </td>
              </tr>
            ) : (
              filtered.map((r, idx) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4 text-slate-600">{idx + 1}</td>

                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {r.judul || "-"}
                  </td>

                  <td className="px-5 py-4 text-slate-700">{renderSumber(r)}</td>

                  <td className="px-5 py-4 text-slate-700">{r.author || "-"}</td>

                  <td className="px-5 py-4">{renderStatus(r.status)}</td>

                  <td className="px-5 py-4 text-slate-700">
                    {formatTanggal(r.created_at || r.tanggal)}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <IconBtn
                        variant="primary"
                        onClick={() => handleEdit("berita", r)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </IconBtn>

                      <IconBtn
                        variant="danger"
                        onClick={() => handleHapus("berita", r.id)}
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

export default BeritaTable;