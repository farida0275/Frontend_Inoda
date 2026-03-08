import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search01Icon,
  Add01Icon,
  Edit02Icon,
  EyeIcon,
} from "hugeicons-react";
import DetailSubmissionModal from "../../components/LihatDetail.jsx";

const API_URL =
  import.meta.env.VITE_API_URL;

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const SubmissionsPage = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    const fetchMySubmissions = async () => {
      try {
        setLoading(true);
        setServerError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Token login tidak ditemukan. Silakan login ulang.");
        }

        const response = await fetch(`${API_URL}/data-peserta/my-submissions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.errors?.join(", ") ||
              result?.message ||
              "Gagal mengambil data submission."
          );
        }

        const list = Array.isArray(result?.data) ? result.data : [];

        const mapped = list.map((item) => ({
          id: item.id,
          namaPeserta: item.nama_inisiator || "-",
          namaInovasi: item.nama_inovasi || "-",
          tahapan: item.tahapan_inovasi || "-",
          urusan: item.urusan_utama || "-",
          waktuUjiCoba: formatDate(item.waktu_uji_coba),
          waktuPenerapan: formatDate(item.waktu_penerapan),
          skor: Number(item.skor_final ?? 0),

          // field detail
          rancangBangun: item.rancangan_bangun || "",
          tujuan: item.tujuan_inovasi || "",
          manfaat: item.manfaat_diperoleh || "",
          hasil: item.hasil_inovasi || "",

          anggaran_pdf: item.anggaran_pdf || "",
          profil_bisnis_pdf: item.profil_bisnis_pdf || "",
          dokumen_haki_pdf: item.dokumen_haki_pdf || "",
          penghargaan_pdf: item.penghargaan_pdf || "",
          proposal_pdf: item.proposal_pdf || "",
        }));

        setRows(mapped);
      } catch (error) {
        console.error("Fetch submissions error:", error);
        setServerError(
          error.message || "Terjadi kesalahan saat mengambil data."
        );
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMySubmissions();
  }, []);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return rows;

    return rows.filter((r) => {
      return `${r.namaPeserta} ${r.namaInovasi} ${r.tahapan} ${r.urusan}`
        .toLowerCase()
        .includes(kw);
    });
  }, [q, rows]);

  const goAdd = () => navigate("/participant/add");
  const goEdit = (id) => navigate(`/participant/submissions/${id}/edit`);

  const handleDetail = (row) => {
    setSelectedRow(row);
    setOpenDetail(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="w-full max-w-sm relative">
          <Search01Icon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pencarian"
            className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <button
          type="button"
          onClick={goAdd}
          className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-800 transition"
        >
          <Add01Icon className="w-4 h-4" />
          Tambah Submisis
        </button>
      </div>

      {serverError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white">
              <tr className="border-b border-gray-100">
                <th className="text-left font-semibold text-gray-700 px-4 py-3">
                  Nama Peserta
                </th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">
                  Nama Inovasi
                </th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">
                  Tahapan
                </th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">
                  Urusan
                </th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">
                  Waktu Uji Coba
                </th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">
                  Waktu Penerapan
                </th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Data tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/60 transition"
                  >
                    <td className="px-4 py-3 text-gray-900">
                      {row.namaPeserta}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {row.namaInovasi}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{row.tahapan}</td>
                    <td className="px-4 py-3 text-gray-900">{row.urusan}</td>
                    <td className="px-4 py-3 text-gray-900">
                      {row.waktuUjiCoba}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {row.waktuPenerapan}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => goEdit(row.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                          <Edit02Icon className="w-4 h-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDetail(row)}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                          <EyeIcon className="w-4 h-4" />
                          Lihat Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DetailSubmissionModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        data={selectedRow}
      />
    </div>
  );
};

export default SubmissionsPage;