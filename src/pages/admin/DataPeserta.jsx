import React, { useEffect, useMemo, useState } from "react";
import { Eye, Search, Trash2 } from "lucide-react";
import DetailSubmissionModal from "../../components/LihatDetail.jsx";

const API_URL = import.meta.env.VITE_API_URL;

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
  const [inovasiList, setInovasiList] = useState([]);
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

        const [pesertaResponse, inovasiResponse] = await Promise.all([
          fetch(`${API_URL}/data-peserta`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/inovasi`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }),
        ]);

        const pesertaResult = await pesertaResponse.json();
        const inovasiResult = await inovasiResponse.json();

        if (!pesertaResponse.ok) {
          throw new Error(
            pesertaResult?.errors?.join(", ") ||
              pesertaResult?.message ||
              "Gagal mengambil data peserta."
          );
        }

        if (!inovasiResponse.ok) {
          throw new Error(
            inovasiResult?.errors?.join(", ") ||
              inovasiResult?.message ||
              "Gagal mengambil data inovasi."
          );
        }

        const pesertaData = Array.isArray(pesertaResult?.data)
          ? pesertaResult.data
          : [];
        const inovasiData = Array.isArray(inovasiResult?.data)
          ? inovasiResult.data
          : [];

        const kategoriMap = new Map();
        inovasiData.forEach((item) => {
          kategoriMap.set(String(item.id), item.name || "-");
        });

        const mapped = pesertaData.map((item) => ({
          id: item.id,

          // untuk tabel
          namaInisiator: item.nama_inisiator || "-",
          namaInovasi: item.nama_inovasi || "-",
          kategoriNama: kategoriMap.get(String(item.kategori)) || "-",
          tahapan: item.tahapan_inovasi || "-",
          urusan: item.urusan_utama || "-",
          waktuInisiatif: formatDate(item.waktu_pengembangan),
          waktuUjiCoba: formatDate(item.waktu_uji_coba),
          waktuPenerapan: formatDate(item.waktu_penerapan),
          skor:
            item.skor_final !== undefined && item.skor_final !== null
              ? Number(item.skor_final)
              : 0,

          // untuk LihatDetail.jsx
          kategori: item.kategori || "",
          kategori_nama: kategoriMap.get(String(item.kategori)) || "-",
          nama_inisiator: item.nama_inisiator || "",
          nama_inovasi: item.nama_inovasi || "",
          tahapan_inovasi: item.tahapan_inovasi || "",
          urusan_utama: item.urusan_utama || "",
          urusan_beririsan: item.urusan_beririsan || "",
          waktu_uji_coba: item.waktu_uji_coba || "",
          waktu_penerapan: item.waktu_penerapan || "",
          waktu_pengembangan: item.waktu_pengembangan || "",

          inisiator_inovasi: item.inisiator_inovasi || "",
          jenis_inovasi: item.jenis_inovasi || "",
          bentuk_inovasi: item.bentuk_inovasi || "",
          tematik: item.tematik || "",

          rancangan_bangun: item.rancangan_bangun || "",
          tujuan_inovasi: item.tujuan_inovasi || "",
          manfaat_diperoleh: item.manfaat_diperoleh || "",
          hasil_inovasi: item.hasil_inovasi || "",

          anggaran_pdf: item.anggaran_pdf || "",
          profil_bisnis_pdf: item.profil_bisnis_pdf || "",
          dokumen_haki_pdf: item.dokumen_haki_pdf || "",
          penghargaan_pdf: item.penghargaan_pdf || "",
          proposal_pdf: item.proposal_pdf || "",

          // opsional, biar tetap kompatibel kalau dipakai di tempat lain
          rancangBangun: item.rancangan_bangun || "",
          tujuan: item.tujuan_inovasi || "",
          manfaat: item.manfaat_diperoleh || "",
          hasil: item.hasil_inovasi || "",
        }));

        setRows(mapped);
        setInovasiList(inovasiData);
      } catch (error) {
        console.error("Fetch data peserta error:", error);
        setServerError(
          error.message || "Terjadi kesalahan saat mengambil data peserta."
        );
        setRows([]);
        setInovasiList([]);
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
        r.namaInisiator?.toLowerCase().includes(s) ||
        r.namaInovasi?.toLowerCase().includes(s) ||
        r.kategoriNama?.toLowerCase().includes(s) ||
        r.tahapan?.toLowerCase().includes(s) ||
        r.urusan?.toLowerCase().includes(s) ||
        r.waktuInisiatif?.toLowerCase().includes(s)
      );
    });
  }, [q, rows]);

  const handleDetail = (row) => {
    setSelectedRow(row);
    setOpenDetail(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Apakah yakin ingin menghapus data ini?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Token login tidak ditemukan. Silakan login ulang.");
      }

      const response = await fetch(`${API_URL}/data-peserta/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.errors?.join(", ") ||
            result?.message ||
            "Gagal menghapus data."
        );
      }

      setRows((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Delete peserta error:", error);
      alert(error.message || "Gagal menghapus data.");
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-7xl">
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
            <table className="min-w-full table-fixed text-sm">
              <thead className="bg-white">
                <tr className="border-b border-slate-300">
                  <th className="w-[140px] text-left font-bold px-4 py-4">
                    Nama Peserta
                  </th>
                  <th className="w-[160px] text-left font-bold px-4 py-4">
                    Nama Inovasi
                  </th>
                  <th className="w-[160px] text-left font-bold px-4 py-4">
                    Kategori
                  </th>
                  <th className="w-[110px] text-left font-bold px-4 py-4">
                    Tahapan
                  </th>
                  <th className="w-[140px] text-left font-bold px-4 py-4">
                    Urusan
                  </th>
                  <th className="w-[120px] text-left font-bold px-4 py-4">
                    Waktu Inisiatif
                  </th>
                  <th className="w-[120px] text-left font-bold px-4 py-4">
                    Waktu Uji Coba
                  </th>
                  <th className="w-[130px] text-left font-bold px-4 py-4">
                    Waktu Penerapan
                  </th>
                  <th className="w-[80px] text-center font-bold px-4 py-4">
                    Skor
                  </th>
                  <th className="w-[110px] text-left font-bold px-4 py-4">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-10 text-center text-slate-500"
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
                      <td className="px-4 py-4 text-slate-900 break-words">
                        {row.namaInisiator}
                      </td>
                      <td className="px-4 py-4 text-slate-900 break-words">
                        {row.namaInovasi}
                      </td>
                      <td className="px-4 py-4 text-slate-900 break-words">
                        {row.kategoriNama}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-slate-900">
                        {row.tahapan}
                      </td>
                      <td className="px-4 py-4 text-slate-900 break-words">
                        {row.urusan}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-slate-900">
                        {row.waktuInisiatif}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-slate-900">
                        {row.waktuUjiCoba}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-slate-900">
                        {row.waktuPenerapan}
                      </td>
                      <td className="px-4 py-4 text-center font-semibold text-slate-900">
                        {row.skor ?? 0}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDetail(row)}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4 text-slate-500" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(row.id)}
                            className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
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