import React, { useEffect, useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import DetailSubmissionModal from "../../components/LihatDetail.jsx";

const API_URL =
  import.meta.env.VITE_API_URL ;

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

const DataPeserta = () => {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    const fetchDataPeserta = async () => {
      try {
        setLoading(true);
        setServerError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Token login tidak ditemukan. Silakan login ulang.");
        }

        const response = await fetch(`${API_URL}/data-peserta`, {
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
              "Gagal mengambil data peserta."
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
        console.error("Fetch data peserta error:", error);
        setServerError(
          error.message || "Terjadi kesalahan saat mengambil data peserta."
        );
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDataPeserta();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;

    return rows.filter((r) => {
      return (
        r.namaPeserta?.toLowerCase().includes(s) ||
        r.namaInovasi?.toLowerCase().includes(s) ||
        r.tahapan?.toLowerCase().includes(s) ||
        r.urusan?.toLowerCase().includes(s)
      );
    });
  }, [q, rows]);

  const handleDetail = (row) => {
    setSelectedRow(row);
    setOpenDetail(true);
  };

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-5">
          <h1 className="text-xl font-extrabold text-slate-900">Data Peserta</h1>
          <p className="text-sm text-slate-500">
            Daftar peserta yang sudah mengirim inovasi.
          </p>
        </div>

        <div className="mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pencarian"
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>
        </div>

        {serverError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white">
                <tr className="border-b border-slate-300">
                  <th className="text-left font-bold px-5 py-4 whitespace-nowrap">
                    Nama Peserta
                  </th>
                  <th className="text-left font-bold px-5 py-4 whitespace-nowrap">
                    Nama Inovasi
                  </th>
                  <th className="text-left font-bold px-5 py-4 whitespace-nowrap">
                    Tahapan
                  </th>
                  <th className="text-left font-bold px-5 py-4 whitespace-nowrap">
                    Urusan
                  </th>
                  <th className="text-left font-bold px-5 py-4 whitespace-nowrap">
                    Waktu Uji Coba
                  </th>
                  <th className="text-left font-bold px-5 py-4 whitespace-nowrap">
                    Waktu Penerapan
                  </th>
                  <th className="text-left font-bold px-5 py-4 whitespace-nowrap">
                    Skor
                  </th>
                  <th className="text-left font-bold px-5 py-4 whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      Data tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        {row.namaPeserta}
                      </td>
                      <td className="px-5 py-4">{row.namaInovasi}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {row.tahapan}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {row.urusan}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {row.waktuUjiCoba}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {row.waktuPenerapan}
                      </td>
                      <td className="px-5 py-4 text-center font-semibold">
                        {row.skor ?? 0}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleDetail(row)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Eye className="h-4 w-4 text-slate-500" />
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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

export default DataPeserta;