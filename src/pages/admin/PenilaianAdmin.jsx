import React, { useEffect, useMemo, useState } from "react";
import { Eye, Star, X } from "lucide-react";
import DetailSubmissionModal from "../../components/LihatDetail.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const SLOT_TABS = [
  { key: 1, label: "Slot 1" },
  { key: 2, label: "Slot 2" },
  { key: 3, label: "Slot 3" },
];

const TabButton = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "px-4 py-2 text-sm font-semibold rounded-t-lg border border-slate-200 transition",
      active
        ? "bg-white text-slate-900 border-b-white"
        : "bg-slate-50 text-slate-600 hover:bg-white",
    ].join(" ")}
  >
    {children}
  </button>
);

const SmallPill = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "px-4 py-2 text-sm font-semibold rounded-lg border transition",
      active
        ? "bg-purple-700 text-white border-purple-700"
        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
    ].join(" ")}
  >
    {children}
  </button>
);

const debugFetch = async (url, options, label) => {
  console.group(`[${label}] FETCH START`);
  console.log("URL:", url);
  console.log("Method:", options?.method || "GET");
  console.log("Headers:", options?.headers || {});
  if (options?.body) {
    console.log("Body:", options.body);
  }

  const response = await fetch(url, options);

  console.log("Final URL:", response.url);
  console.log("Status:", response.status);
  console.log("OK:", response.ok);
  console.log("Content-Type:", response.headers.get("content-type"));
  console.groupEnd();

  return response;
};

const parseJsonSafe = async (response, label) => {
  const text = await response.text();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    console.error(`[${label}] Response bukan JSON`, {
      url: response.url,
      status: response.status,
      contentType,
      bodyPreview: text.slice(0, 500),
      fullBody: text,
    });

    throw new Error(
      `${label} tidak mengembalikan JSON. Status ${response.status}. Cek console untuk detail response.`
    );
  }

  try {
    const parsed = JSON.parse(text);
    console.log(`[${label}] JSON OK`, parsed);
    return parsed;
  } catch (err) {
    console.error(`[${label}] JSON parse error`, {
      url: response.url,
      status: response.status,
      contentType,
      bodyPreview: text.slice(0, 500),
      fullBody: text,
    });

    throw new Error(
      `${label} mengembalikan format JSON yang tidak valid. Cek console untuk detail response.`
    );
  }
};

const safeFetchJson = async ({
  url,
  options,
  label,
  fallbackData = [],
  silent404 = false,
}) => {
  const response = await debugFetch(url, options, label);

  if (silent404 && response.status === 404) {
    console.warn(`[${label}] endpoint tidak ditemukan, pakai fallback kosong.`);
    return {
      ok: true,
      status: 404,
      json: {
        message: `${label} endpoint tidak ditemukan, fallback digunakan`,
        data: fallbackData,
      },
    };
  }

  const json = await parseJsonSafe(response, label);

  return {
    ok: response.ok,
    status: response.status,
    json,
  };
};

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
                Input Nilai Admin
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Admin dapat mengisi nilai untuk slot yang dipilih.
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
                {row?.namaPeserta || "-"}
              </p>

              <p className="mt-3 text-xs font-bold text-slate-500">
                Nama Inovasi
              </p>
              <p className="text-sm text-slate-800">
                {row?.namaInovasi || "-"}
              </p>

              <p className="mt-3 text-xs font-bold text-slate-500">Slot</p>
              <p className="text-sm text-slate-800">
                Slot {row?.slotPenilai || "-"}
              </p>

              <p className="mt-3 text-xs font-bold text-slate-500">
                Juri Penugasan
              </p>
              <p className="text-sm text-slate-800">{row?.namaJuri || "-"}</p>
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
            </div>

            <div className="mt-5">
              <label className="block text-sm font-bold text-slate-800">
                Catatan
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                rows={4}
                placeholder="Catatan penilaian..."
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

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const PenilaianAdmin = () => {
  const [activeSlot, setActiveSlot] = useState(1);
  const [activeInv, setActiveInv] = useState("");
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [openNilai, setOpenNilai] = useState(false);
  const [rowNilai, setRowNilai] = useState(null);

  const [inovasiList, setInovasiList] = useState([]);
  const [pesertaList, setPesertaList] = useState([]);
  const [penilaianList, setPenilaianList] = useState([]);
  const [penugasanList, setPenugasanList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [warningMessage, setWarningMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchAll = async () => {
    try {
      setLoading(true);
      setServerError("");
      setWarningMessage("");

      if (!token) {
        throw new Error("Token login tidak ditemukan. Silakan login ulang.");
      }

      const [inovasiResult, pesertaResult, penilaianResult, penugasanResult] =
        await Promise.all([
          safeFetchJson({
            url: `${API_URL}/inovasi`,
            options: {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            },
            label: "INOVASI",
          }),

          safeFetchJson({
            url: `${API_URL}/data-peserta`,
            options: {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
            label: "DATA PESERTA",
          }),

          safeFetchJson({
            url: `${API_URL}/penilaian`,
            options: {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
            label: "PENILAIAN",
          }),

          safeFetchJson({
            url: `${API_URL}/penugasan-juri`,
            options: {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
            label: "PENUGASAN JURI",
            fallbackData: [],
            silent404: true,
          }),
        ]);

      const inovasiJson = inovasiResult.json;
      const pesertaJson = pesertaResult.json;
      const penilaianJson = penilaianResult.json;
      const penugasanJson = penugasanResult.json;

      if (!inovasiResult.ok) {
        throw new Error(
          inovasiJson?.errors?.join(", ") ||
            inovasiJson?.message ||
            "Gagal mengambil data inovasi."
        );
      }

      if (!pesertaResult.ok) {
        throw new Error(
          pesertaJson?.errors?.join(", ") ||
            pesertaJson?.message ||
            "Gagal mengambil data peserta."
        );
      }

      if (!penilaianResult.ok) {
        throw new Error(
          penilaianJson?.errors?.join(", ") ||
            penilaianJson?.message ||
            "Gagal mengambil data penilaian."
        );
      }

      if (!penugasanResult.ok) {
        throw new Error(
          penugasanJson?.errors?.join(", ") ||
            penugasanJson?.message ||
            "Gagal mengambil data penugasan."
        );
      }

      if (penugasanResult.status === 404) {
        setWarningMessage(
          "Endpoint penugasan juri belum tersedia di backend. Data penugasan sementara dianggap kosong."
        );
      }

      const inovasiData = Array.isArray(inovasiJson?.data)
        ? inovasiJson.data
        : [];
      const pesertaData = Array.isArray(pesertaJson?.data)
        ? pesertaJson.data
        : [];
      const penilaianData = Array.isArray(penilaianJson?.data)
        ? penilaianJson.data
        : [];
      const penugasanData = Array.isArray(penugasanJson?.data)
        ? penugasanJson.data
        : [];

      setInovasiList(inovasiData);
      setPesertaList(pesertaData);
      setPenilaianList(penilaianData);
      setPenugasanList(penugasanData);

      if (inovasiData.length > 0) {
        setActiveInv((prev) => prev || String(inovasiData[0].id));
      }
    } catch (error) {
      console.error("Fetch penilaian admin error:", error);
      setServerError(error.message || "Terjadi kesalahan saat mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [token]);

  const currentInv = useMemo(() => {
    return inovasiList.find((item) => String(item.id) === String(activeInv));
  }, [inovasiList, activeInv]);

  const currentInvLabel = useMemo(() => {
    return currentInv?.name || "Inovasi";
  }, [currentInv]);

  const rows = useMemo(() => {
    if (!currentInv) return [];

    const pesertaFiltered = pesertaList.filter(
      (item) => String(item.kategori) === String(currentInv.id)
    );

    return pesertaFiltered.map((item) => {
      const penugasan = penugasanList.find(
        (p) =>
          Number(p.peserta_id) === Number(item.id) &&
          Number(p.inovasi_id) === Number(currentInv.id) &&
          Number(p.slot_penilai) === Number(activeSlot)
      );

      const nilai = penugasan
        ? penilaianList.find(
            (n) =>
              Number(n.peserta_id) === Number(item.id) &&
              Number(n.inovasi_id) === Number(currentInv.id) &&
              Number(n.juri_id) === Number(penugasan.juri_id)
          )
        : null;

      return {
        id: item.id,
        peserta_id: item.id,
        inovasi_id: currentInv.id,

        // untuk tabel
        namaPeserta: item.nama_inisiator || "-",
        namaInovasi: item.nama_inovasi || "-",
        kategoriNama: currentInv.name || "-",
        urusan: item.urusan_utama || "-",
        tahapan: item.tahapan_inovasi || "-",
        slotPenilai: activeSlot,
        namaJuri: penugasan?.nama_juri || "-",
        juri_id: penugasan?.juri_id || null,
        assigned: !!penugasan,
        skor:
          nilai && nilai.skor !== undefined && nilai.skor !== null
            ? Number(nilai.skor)
            : null,
        catatan: nilai?.catatan || "",
        penilaian_id: nilai?.id || null,

        // untuk DetailSubmissionModal / LihatDetail.jsx
        kategori: item.kategori || "",
        kategori_nama: currentInv.name || "-",
        nama_inovasi: item.nama_inovasi || "-",
        tahapan_inovasi: item.tahapan_inovasi || "-",
        inisiator_inovasi: item.inisiator_inovasi || "-",
        nama_inisiator: item.nama_inisiator || "-",
        jenis_inovasi: item.jenis_inovasi || "-",
        bentuk_inovasi: item.bentuk_inovasi || "-",
        tematik: item.tematik || "-",
        urusan_utama: item.urusan_utama || "-",
        urusan_beririsan: item.urusan_beririsan || "-",
        waktu_pengembangan: item.waktu_pengembangan || "",
        waktu_uji_coba: item.waktu_uji_coba || "",
        waktu_penerapan: item.waktu_penerapan || "",
        rancangan_bangun: item.rancangan_bangun || "",
        tujuan_inovasi: item.tujuan_inovasi || "",
        manfaat_diperoleh: item.manfaat_diperoleh || "",
        hasil_inovasi: item.hasil_inovasi || "",
        anggaran_pdf: item.anggaran_pdf || "",
        profil_bisnis_pdf: item.profil_bisnis_pdf || "",
        dokumen_haki_pdf: item.dokumen_haki_pdf || "",
        penghargaan_pdf: item.penghargaan_pdf || "",
        proposal_pdf: item.proposal_pdf || "",

        // opsional untuk tabel lama / kompatibilitas
        tahap: item.tahapan_inovasi || "-",
        inisiatorKelompok: item.inisiator_inovasi || "-",
        namaInisiator: item.nama_inisiator || "-",
        jenisInovasi: item.jenis_inovasi || "-",
        bentukInovasi: item.bentuk_inovasi || "-",
        urusanUtama: item.urusan_utama || "-",
        urusanIrisan: item.urusan_beririsan || "-",
        waktuInisiatif: formatDate(item.waktu_pengembangan),
        waktuUjiCoba: formatDate(item.waktu_uji_coba),
        waktuPenerapan: formatDate(item.waktu_penerapan),
        waktuPengembangan: formatDate(item.waktu_pengembangan),
        rancangBangun: item.rancangan_bangun || "",
        tujuan: item.tujuan_inovasi || "",
        manfaat: item.manfaat_diperoleh || "",
        hasil: item.hasil_inovasi || "",
      };
    });
  }, [pesertaList, penilaianList, penugasanList, currentInv, activeSlot]);

  const handleDetail = (row) => {
    setSelectedRow(row);
    setOpenDetail(true);
  };

  const handleNilai = (row) => {
    if (!row.assigned) {
      alert("Slot ini belum memiliki juri yang ditugaskan.");
      return;
    }
    setRowNilai(row);
    setOpenNilai(true);
  };

  const saveNilai = async ({ skor, catatan }) => {
    try {
      if (!rowNilai) return;

      if (!token) {
        throw new Error("Token login tidak ditemukan. Silakan login ulang.");
      }

      const response = await debugFetch(
        `${API_URL}/penilaian/admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            peserta_id: Number(rowNilai.peserta_id),
            inovasi_id: Number(rowNilai.inovasi_id),
            slot_penilai: Number(rowNilai.slotPenilai),
            skor: Number(skor),
            catatan: catatan || "",
          }),
        },
        "SAVE PENILAIAN ADMIN"
      );

      const result = await parseJsonSafe(response, "SAVE PENILAIAN ADMIN");

      if (!response.ok) {
        throw new Error(
          result?.errors?.join(", ") ||
            result?.message ||
            "Gagal menyimpan penilaian admin."
        );
      }

      await fetchAll();
      setOpenNilai(false);
      setRowNilai(null);
    } catch (error) {
      console.error("Save nilai admin error:", error);
      alert(error.message || "Gagal menyimpan nilai.");
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-5">
          <h1 className="text-xl font-extrabold text-slate-900">
            Penilaian Admin
          </h1>
          <p className="text-sm text-slate-500">
            Admin dapat mengakses semua slot penilaian, tetapi tetap bukan
            penilai tambahan.
          </p>
        </div>

        <div className="flex gap-2 items-end">
          {SLOT_TABS.map((t) => (
            <TabButton
              key={t.key}
              active={activeSlot === t.key}
              onClick={() => setActiveSlot(t.key)}
            >
              {t.label}
            </TabButton>
          ))}
          <div className="flex-1 border-b border-slate-200" />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 pt-5">
            <div className="flex flex-wrap gap-2">
              {inovasiList.map((inv) => (
                <SmallPill
                  key={inv.id}
                  active={String(activeInv) === String(inv.id)}
                  onClick={() => setActiveInv(String(inv.id))}
                >
                  {inv.name}
                </SmallPill>
              ))}
            </div>
          </div>

          <div className="px-5 py-4 flex items-center justify-between border-b border-slate-200">
            <div className="text-sm font-bold text-slate-800">
              Daftar Peserta • {currentInvLabel}
            </div>
            <div className="text-xs text-slate-500">
              Aktif: <span className="font-semibold">SLOT {activeSlot}</span>
            </div>
          </div>

          {warningMessage && (
            <div className="px-5 pt-4">
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                {warningMessage}
              </div>
            </div>
          )}

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
                  <th className="text-left font-bold px-5 py-3">Waktu Inisiatif</th>
                  <th className="text-left font-bold px-5 py-3">Juri Slot</th>
                  <th className="text-left font-bold px-5 py-3 w-24">Skor</th>
                  <th className="text-left font-bold px-5 py-3 w-56">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      Belum ada data untuk {currentInvLabel}.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr
                      key={`${row.id}-${row.slotPenilai}`}
                      className="border-b border-slate-100 hover:bg-slate-50 transition"
                    >
                      <td className="px-5 py-4 text-slate-600">{idx + 1}</td>

                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {row.namaPeserta}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {row.namaInovasi}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {row.kategoriNama}
                      </td>

                      <td className="px-5 py-4 text-slate-700">{row.urusan}</td>

                      <td className="px-5 py-4 text-slate-700">
                        {row.tahapan}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {row.waktuInisiatif || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {row.assigned ? (
                          row.namaJuri
                        ) : (
                          <span className="text-red-500 text-xs font-semibold">
                            Belum ditugaskan
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {row.skor ?? "-"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleDetail(row)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 transition"
                          >
                            <Eye className="h-4 w-4 text-slate-500" />
                            Lihat Detail
                          </button>

                          <button
                            type="button"
                            onClick={() => handleNilai(row)}
                            disabled={!row.assigned}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-purple-700 text-white hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
            Admin dapat mengisi semua slot penilaian, tetapi nilai tetap masuk
            ke slot juri yang ditugaskan.
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

export default PenilaianAdmin;