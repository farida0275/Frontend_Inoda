import React, { useEffect, useMemo, useState } from "react";
import { Eye, Star, X } from "lucide-react";
import DetailSubmissionModal from "../../components/LihatDetail.jsx";

const API_URL =
  import.meta.env.VITE_API_URL ;

const NilaiModal = ({
  open,
  onClose,
  row,
  initialScore = "",
  initialCatatan = "",
  onSave,
}) => {
  const [score, setScore] = useState(initialScore);
  const [catatan, setCatatan] = useState(initialCatatan);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setScore(initialScore ?? "");
    setCatatan(initialCatatan ?? "");
  }, [open, initialScore, initialCatatan, row?.id]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();

    const n = Number(score);
    if (Number.isNaN(n)) {
      alert("Skor harus berupa angka.");
      return;
    }

    const fixed = Math.max(0, Math.min(100, n));

    try {
      setSaving(true);
      await onSave?.({
        skor: fixed,
        catatan,
      });
      onClose?.();
    } catch (error) {
      console.error(error);
      alert(error.message || "Gagal menyimpan nilai.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div className="relative mx-auto flex min-h-full max-w-xl items-center justify-center px-4 py-10">
        <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Beri Nilai
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Isi skor 0 – 100 untuk penugasan milikmu.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
              aria-label="Tutup"
            >
              <X className="h-4 w-4 text-slate-600" />
            </button>
          </div>

          <form onSubmit={submit} className="px-5 py-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500">Nama Peserta</p>
              <p className="text-sm font-semibold text-slate-900">
                {row?.namaPemda || "-"}
              </p>

              <p className="mt-3 text-xs font-bold text-slate-500">
                Nama Inovasi
              </p>
              <p className="text-sm text-slate-800">
                {row?.namaInovasi || "-"}
              </p>

              <p className="mt-3 text-xs font-bold text-slate-500">Kategori</p>
              <p className="text-sm text-slate-800">
                {row?.kategoriInovasi || "-"}
              </p>

              <p className="mt-3 text-xs font-bold text-slate-500">Slot</p>
              <p className="text-sm text-slate-800">
                Slot {row?.slotPenilai || "-"}
              </p>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-bold text-slate-800">
                Skor (0 - 100)
              </label>

              <div className="mt-2 flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-purple-200"
                  placeholder="Masukkan skor..."
                  autoFocus
                />
                <div className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-extrabold text-slate-900">
                  /100
                </div>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Gunakan angka bulat 0 sampai 100.
              </p>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-bold text-slate-800">
                Catatan
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                rows={4}
                placeholder="Tulis catatan penilaian..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-purple-200 resize-none"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white bg-purple-700 hover:bg-purple-800 transition disabled:opacity-60"
              >
                <Star className="h-4 w-4" />
                {saving ? "Menyimpan..." : "Simpan Nilai"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const mapPenugasanItem = (item) => ({
  id: item.id,
  peserta_id: Number(item.peserta_id),
  inovasi_id: Number(item.inovasi_id),
  juri_id: Number(item.juri_id),
  slotPenilai: Number(item.slot_penilai),
  namaPemda: item.nama_pemda || "-",
  namaInovasi: item.nama_inovasi || "-",
  kategoriInovasi: item.nama_kategori_inovasi || "-",
  urusan: item.urusan_utama || "-",
  tahapan: item.tahapan_inovasi || "-",

  namaInisiator: item.nama_inisiator || "-",
  tahap: item.tahapan_inovasi || "-",
  inisiatorKelompok: item.inisiator_inovasi || "-",
  jenisInovasi: item.jenis_inovasi || "-",
  bentukInovasi: item.bentuk_inovasi || "-",
  tematik: item.tematik || "-",
  urusanUtama: item.urusan_utama || "-",
  urusanIrisan: item.urusan_beririsan || "-",
  waktuInisiatif: item.waktu_pengembangan || "",
  waktuUjiCoba: item.waktu_uji_coba || "",
  waktuPenerapan: item.waktu_penerapan || "",
  waktuPengembangan: item.waktu_pengembangan || "",
  rancangBangun: item.rancangan_bangun || "",
  tujuan: item.tujuan_inovasi || "",
  manfaat: item.manfaat_diperoleh || "",
  hasil: item.hasil_inovasi || "",
  anggaran_pdf: item.anggaran_pdf || "",
  profil_bisnis_pdf: item.profil_bisnis_pdf || "",
  dokumen_haki_pdf: item.dokumen_haki_pdf || "",
  penghargaan_pdf: item.penghargaan_pdf || "",
  proposal_pdf: item.proposal_pdf || "",
});

const mapPenilaianItem = (item) => ({
  id: item.id,
  peserta_id: Number(item.peserta_id),
  inovasi_id: Number(item.inovasi_id),
  juri_id: Number(item.juri_id),
  skor:
    item.skor !== undefined && item.skor !== null ? Number(item.skor) : null,
  catatan: item.catatan || "",
  slot_penilai:
    item.slot_penilai !== undefined && item.slot_penilai !== null
      ? Number(item.slot_penilai)
      : null,
});

const PenilaianJuri = () => {
  const [penugasanList, setPenugasanList] = useState([]);
  const [penilaianSaya, setPenilaianSaya] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        skor: nilai?.skor ?? null,
        catatan: nilai?.catatan || "",
        penilaian_id: nilai?.id || null,
      };
    });
  }, [penugasanList, penilaianSaya]);

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

  const saveNilai = async ({ skor, catatan }) => {
    if (!rowNilai) return;

    if (!token) {
      throw new Error("Token login tidak ditemukan. Silakan login ulang.");
    }

    const response = await fetch(`${API_URL}/penilaian`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        peserta_id: Number(rowNilai.peserta_id),
        inovasi_id: Number(rowNilai.inovasi_id),
        skor: Number(skor),
        catatan: catatan || "",
      }),
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

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-5">
          <h1 className="text-xl font-extrabold text-slate-900">
            Penilaian Juri
          </h1>
          <p className="text-sm text-slate-500">
            Halo {currentUser?.nama || "Juri"}, berikut daftar penugasan yang
            bisa kamu nilai.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 flex items-center justify-between border-b border-slate-200">
            <div className="text-sm font-bold text-slate-800">
              Daftar Penugasan Saya
            </div>
            <div className="text-xs text-slate-500">
              Total: <span className="font-semibold">{rows.length}</span>
            </div>
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
                  <th className="text-left font-bold px-5 py-3 w-14">#</th>
                  <th className="text-left font-bold px-5 py-3">Nama Peserta</th>
                  <th className="text-left font-bold px-5 py-3">Nama Inovasi</th>
                  <th className="text-left font-bold px-5 py-3">Kategori</th>
                  <th className="text-left font-bold px-5 py-3">Urusan</th>
                  <th className="text-left font-bold px-5 py-3">Tahapan</th>
                  <th className="text-left font-bold px-5 py-3">Slot</th>
                  <th className="text-left font-bold px-5 py-3 w-24">Skor</th>
                  <th className="text-left font-bold px-5 py-3 w-56">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      Belum ada penugasan untuk akun ini.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr
                      key={`${row.id}-${row.peserta_id}-${row.inovasi_id}`}
                      className="border-b border-slate-100 hover:bg-slate-50 transition"
                    >
                      <td className="px-5 py-4 text-slate-600">{idx + 1}</td>

                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {row.namaPemda}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {row.namaInovasi}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {row.kategoriInovasi}
                      </td>

                      <td className="px-5 py-4 text-slate-700">{row.urusan}</td>

                      <td className="px-5 py-4 text-slate-700">
                        {row.tahapan}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        Slot {row.slotPenilai}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {row.skor ?? "-"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleDetail(row)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold
                                       border border-slate-200 bg-white hover:bg-slate-50 transition"
                          >
                            <Eye className="h-4 w-4 text-slate-500" />
                            Lihat Detail
                          </button>

                          <button
                            type="button"
                            onClick={() => handleNilai(row)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold
                                       bg-purple-700 text-white hover:bg-purple-800 transition"
                          >
                            <Star className="h-4 w-4" />
                            {row.skor !== null && row.skor !== undefined
                              ? "Edit Nilai"
                              : "Nilai"}
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
            Juri hanya dapat memberi nilai pada penugasan miliknya sendiri.
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
        initialScore={rowNilai?.skor ?? ""}
        initialCatatan={rowNilai?.catatan ?? ""}
        onSave={saveNilai}
      />
    </div>
  );
};

export default PenilaianJuri;