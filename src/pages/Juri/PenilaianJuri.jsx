import React, { useEffect, useMemo, useState } from "react";
import { Eye, RotateCcw, Star } from "lucide-react";
import DetailSubmissionModal from "../../components/LihatDetail.jsx";
import NilaiModal from "./NilaiModal.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const mapPenugasanItem = (item) => ({
  id: item.id,
  peserta_id: Number(item.peserta_id),
  inovasi_id: Number(item.inovasi_id),
  juri_id: Number(item.juri_id),
  slotPenilai:
    item.slot_penilai !== undefined && item.slot_penilai !== null
      ? Number(item.slot_penilai)
      : null,

  namaPeserta: item.nama_inisiator || "-",
  namaInovasi: item.nama_inovasi || "-",
  kategoriInovasi: item.nama_kategori_inovasi || "-",
  urusan: item.urusan_utama || "-",
  tahapan: item.tahapan_inovasi || "-",

  tahap_seleksi: item.tahap_seleksi || "",
  status_seleksi: item.status_seleksi || "",

  nama_inovasi: item.nama_inovasi || "-",
  tahapan_inovasi: item.tahapan_inovasi || "-",
  inisiator_inovasi: item.inisiator_inovasi || "-",
  nama_inisiator: item.nama_inisiator || "-",
  no_hp: item.no_hp || "",
  jenis_inovasi: item.jenis_inovasi || "-",
  bentuk_inovasi: item.bentuk_inovasi || "-",
  tematik: item.tematik || "-",
  urusan_utama: item.urusan_utama || "-",
  urusan_beririsan: item.urusan_beririsan || "-",
  waktu_pengembangan: item.waktu_pengembangan || "",
  waktu_uji_coba: item.waktu_uji_coba || "",
  waktu_penerapan: item.waktu_penerapan || "",
  link_video: item.link_video || "",

  kebaruan: item.kebaruan || "",
  penjelasan_singkat_kebaruan: item.penjelasan_singkat_kebaruan || "",

  rancangan_bangun: item.rancangan_bangun || "",
  tujuan_inovasi: item.tujuan_inovasi || "",
  manfaat_diperoleh: item.manfaat_diperoleh || "",
  hasil_inovasi: item.hasil_inovasi || "",

  anggaran_pdf: item.anggaran_pdf || "",
  profil_bisnis_pdf: item.profil_bisnis_pdf || "",
  dokumen_haki_pdf: item.dokumen_haki_pdf || "",
  penghargaan_pdf: item.penghargaan_pdf || "",
  proposal_pdf: item.proposal_pdf || "",

  kategori: item.kategori || "",
  kategori_nama: item.nama_kategori_inovasi || "-",
});

const mapPenilaianItem = (item) => ({
  id: item.id,
  peserta_id: Number(item.peserta_id),
  inovasi_id: Number(item.inovasi_id),
  juri_id: Number(item.juri_id),
  catatan: item.catatan || "",
  slot_penilai:
    item.slot_penilai !== undefined && item.slot_penilai !== null
      ? Number(item.slot_penilai)
      : null,

  proposal_tampilan: Number(item.proposal_tampilan ?? 0),
  proposal_kelengkapan: Number(item.proposal_kelengkapan ?? 0),
  proposal_keterkaitan: Number(item.proposal_keterkaitan ?? 0),
  proposal_tujuan: Number(item.proposal_tujuan ?? 0),
  proposal_deskripsi: Number(item.proposal_deskripsi ?? 0),

  video_latar_belakang: Number(item.video_latar_belakang ?? 0),
  video_penjaringan_ide: Number(item.video_penjaringan_ide ?? 0),
  video_pemilihan_ide: Number(item.video_pemilihan_ide ?? 0),
  video_manfaat: Number(item.video_manfaat ?? 0),
  video_dampak: Number(item.video_dampak ?? 0),

  substansi_kesiapterapan: Number(item.substansi_kesiapterapan ?? 0),
  substansi_kebaharuan: Number(item.substansi_kebaharuan ?? 0),
  substansi_komersialisasi: Number(item.substansi_komersialisasi ?? 0),
  substansi_usp: Number(item.substansi_usp ?? 0),
  substansi_kemanfaatan: Number(item.substansi_kemanfaatan ?? 0),
  substansi_kedalaman: Number(item.substansi_kedalaman ?? 0),

  skor_proposal: Number(item.skor_proposal ?? 0),
  skor_video: Number(item.skor_video ?? 0),
  skor_substansi: Number(item.skor_substansi ?? 0),
  skor_akhir: Number(item.skor_akhir ?? 0),
});

const actionBtnClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed";

const PenilaianJuri = () => {
  const [penugasanList, setPenugasanList] = useState([]);
  const [penilaianSaya, setPenilaianSaya] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [openNilai, setOpenNilai] = useState(false);
  const [rowNilai, setRowNilai] = useState(null);

  const token = localStorage.getItem("token");
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setServerError("");

      if (!token) {
        throw new Error("Token login tidak ditemukan. Silakan login ulang.");
      }

      const [penugasanRes, penilaianRes] = await Promise.all([
        fetch(`${API_URL}/penugasan-juri/saya`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_URL}/penilaian/saya`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const penugasanJson = await penugasanRes.json();
      const penilaianJson = await penilaianRes.json();

      if (!penugasanRes.ok) {
        throw new Error(
          penugasanJson?.errors?.join(", ") ||
            penugasanJson?.message ||
            "Gagal mengambil penugasan juri."
        );
      }

      if (!penilaianRes.ok) {
        throw new Error(
          penilaianJson?.errors?.join(", ") ||
            penilaianJson?.message ||
            "Gagal mengambil penilaian milik juri."
        );
      }

      const penugasanData = Array.isArray(penugasanJson?.data)
        ? penugasanJson.data
        : [];
      const penilaianData = Array.isArray(penilaianJson?.data)
        ? penilaianJson.data
        : [];

      setPenugasanList(penugasanData.map(mapPenugasanItem));
      setPenilaianSaya(penilaianData.map(mapPenilaianItem));
    } catch (error) {
      console.error("Fetch penilaian juri error:", error);
      setServerError(error.message || "Terjadi kesalahan saat mengambil data.");
      setPenugasanList([]);
      setPenilaianSaya([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const rows = useMemo(() => {
    return penugasanList.map((item) => {
      const nilai = penilaianSaya.find(
        (n) =>
          Number(n.peserta_id) === Number(item.peserta_id) &&
          Number(n.inovasi_id) === Number(item.inovasi_id) &&
          Number(n.juri_id) === Number(item.juri_id)
      );

      return {
        ...item,
        penilaian_id: nilai?.id || null,
        catatan: nilai?.catatan || "",
        skorProposal: nilai?.skor_proposal ?? null,
        skorVideo: nilai?.skor_video ?? null,
        skorSubstansi: nilai?.skor_substansi ?? null,
        skorAkhir: nilai?.skor_akhir ?? null,
        nilaiDetail: nilai || null,
      };
    });
  }, [penugasanList, penilaianSaya]);

  const jumlahSudahDinilai = useMemo(() => {
    return rows.filter((row) => row.penilaian_id !== null).length;
  }, [rows]);

  const handleDetail = (row) => {
    setSelectedRow({
      ...row,
      id: row.peserta_id,
    });
    setOpenDetail(true);
  };

  const handleNilai = (row) => {
    setRowNilai(row);
    setOpenNilai(true);
  };

  const saveNilai = async (payloadForm) => {
    if (!rowNilai) return;

    if (!token) {
      throw new Error("Token login tidak ditemukan. Silakan login ulang.");
    }

    const body = {
      peserta_id: Number(rowNilai.peserta_id),
      inovasi_id: Number(rowNilai.inovasi_id),

      proposal_tampilan: Number(payloadForm.proposal_tampilan),
      proposal_kelengkapan: Number(payloadForm.proposal_kelengkapan),
      proposal_keterkaitan: Number(payloadForm.proposal_keterkaitan),
      proposal_tujuan: Number(payloadForm.proposal_tujuan),
      proposal_deskripsi: Number(payloadForm.proposal_deskripsi),

      video_latar_belakang: Number(payloadForm.video_latar_belakang),
      video_penjaringan_ide: Number(payloadForm.video_penjaringan_ide),
      video_pemilihan_ide: Number(payloadForm.video_pemilihan_ide),
      video_manfaat: Number(payloadForm.video_manfaat),
      video_dampak: Number(payloadForm.video_dampak),

      substansi_kesiapterapan: Number(payloadForm.substansi_kesiapterapan),
      substansi_kebaharuan: Number(payloadForm.substansi_kebaharuan),
      substansi_komersialisasi: Number(payloadForm.substansi_komersialisasi),
      substansi_usp: Number(payloadForm.substansi_usp),
      substansi_kemanfaatan: Number(payloadForm.substansi_kemanfaatan),
      substansi_kedalaman: Number(payloadForm.substansi_kedalaman),

      catatan: payloadForm.catatan || "",
    };

    const response = await fetch(`${API_URL}/penilaian`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.errors?.join(", ") ||
          result?.message ||
          "Gagal menyimpan penilaian."
      );
    }

    await fetchData();
  };

  const handleResetSatu = async (row) => {
    if (!row?.penilaian_id) {
      alert("Belum ada penilaian yang bisa direset untuk peserta ini.");
      return;
    }

    const ok = window.confirm(
      `Reset penilaian untuk peserta "${row.namaPeserta}"?`
    );
    if (!ok) return;

    try {
      setActionLoading(true);

      const response = await fetch(
        `${API_URL}/penilaian/reset/saya/${row.penilaian_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.errors?.join(", ") ||
            result?.message ||
            "Gagal mereset penilaian peserta."
        );
      }

      await fetchData();
    } catch (error) {
      console.error("Reset satu penilaian error:", error);
      alert(error.message || "Gagal mereset penilaian peserta.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetSemua = async () => {
    if (jumlahSudahDinilai === 0) {
      alert("Belum ada penilaian yang bisa direset.");
      return;
    }

    const ok = window.confirm(
      "Reset semua penilaian milikmu? Tindakan ini akan menghapus seluruh nilai yang sudah kamu isi."
    );
    if (!ok) return;

    try {
      setActionLoading(true);

      const response = await fetch(`${API_URL}/penilaian/reset/saya`, {
        method: "DELETE",
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
            "Gagal mereset semua penilaian."
        );
      }

      await fetchData();
    } catch (error) {
      console.error("Reset semua penilaian error:", error);
      alert(error.message || "Gagal mereset semua penilaian.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-5">
          <h1 className="text-xl font-extrabold text-slate-900">
            Penilaian Juri
          </h1>
          <p className="text-sm text-slate-500">
            Halo {currentUser?.nama || "Juri"}, berikut daftar peserta yang
            dapat kamu nilai.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 flex flex-col gap-3 border-b border-slate-200 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-bold text-slate-800">
                Daftar Peserta Penilaian Juri
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Total peserta: <span className="font-semibold">{rows.length}</span>
                {" • "}
                Sudah dinilai:{" "}
                <span className="font-semibold">{jumlahSudahDinilai}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetSemua}
              disabled={actionLoading || jumlahSudahDinilai === 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RotateCcw className="h-4 w-4" />
              {actionLoading ? "Memproses..." : "Reset Semua Nilai"}
            </button>
          </div>

          {serverError && (
            <div className="px-5 pt-4">
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr className="border-b border-slate-200">
                  <th className="text-left font-bold px-4 py-3 w-12">#</th>
                  <th className="text-left font-bold px-4 py-3">Peserta</th>
                  <th className="text-left font-bold px-4 py-3">Inovasi</th>
                  <th className="text-left font-bold px-4 py-3">Kategori</th>
                  <th className="text-left font-bold px-4 py-3">Urusan</th>
                  <th className="text-left font-bold px-4 py-3">Tahapan</th>
                  <th className="text-left font-bold px-4 py-3 w-16">Juri</th>
                  <th className="text-left font-bold px-4 py-3 w-20">Total</th>
                  <th className="text-center font-bold px-4 py-3 w-36">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      Belum ada peserta yang dapat dinilai untuk akun ini.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr
                      key={`${row.id}-${row.peserta_id}-${row.inovasi_id}`}
                      className="border-b border-slate-100 hover:bg-slate-50 transition"
                    >
                      <td className="px-4 py-3 text-slate-600">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {row.namaPeserta}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {row.namaInovasi}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {row.kategoriInovasi}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{row.urusan}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {row.tahapan}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {row.slotPenilai ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex min-w-[52px] items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold ${
                            row.skorAkhir !== null && row.skorAkhir !== undefined
                              ? "bg-purple-100 text-purple-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {row.skorAkhir ?? "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDetail(row)}
                            className={`${actionBtnClass} border-slate-200 bg-white hover:bg-slate-50`}
                            title="Lihat Detail"
                            aria-label="Lihat Detail"
                          >
                            <Eye className="h-4 w-4 text-slate-600" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleNilai(row)}
                            className={`${actionBtnClass} border-purple-200 bg-purple-50 hover:bg-purple-100`}
                            title={
                              row.skorAkhir !== null && row.skorAkhir !== undefined
                                ? "Edit Nilai"
                                : "Nilai"
                            }
                            aria-label={
                              row.skorAkhir !== null && row.skorAkhir !== undefined
                                ? "Edit Nilai"
                                : "Nilai"
                            }
                          >
                            <Star className="h-4 w-4 text-purple-700" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleResetSatu(row)}
                            disabled={actionLoading || !row.penilaian_id}
                            className={`${actionBtnClass} border-red-200 bg-red-50 hover:bg-red-100`}
                            title="Reset Nilai"
                            aria-label="Reset Nilai"
                          >
                            <RotateCcw className="h-4 w-4 text-red-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-slate-200 text-xs text-slate-500">
            Juri hanya dapat memberi nilai dan mereset penilaian pada penugasan
            miliknya sendiri.
          </div>
        </div>
      </div>

      <DetailSubmissionModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        data={selectedRow}
      />

      <NilaiModal
        open={openNilai}
        onClose={() => setOpenNilai(false)}
        row={rowNilai}
        initialData={rowNilai?.nilaiDetail || {}}
        onSave={saveNilai}
      />
    </div>
  );
};

export default PenilaianJuri;