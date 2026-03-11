import React, { useEffect, useMemo, useState } from "react";
import { Eye, RotateCcw, Star } from "lucide-react";
import DetailSubmissionModal from "../../components/LihatDetail.jsx";
import NilaiModal from "../Juri/NilaiModal.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const SLOT_TABS = [
  { key: 1, label: "Juri 1" },
  { key: 2, label: "Juri 2" },
  { key: 3, label: "Juri 3" },
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

const actionBtnClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed";

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
  const [actionLoading, setActionLoading] = useState(false);
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
      setPenilaianList(penilaianData.map(mapPenilaianItem));
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

        namaPeserta: item.nama_inisiator || "-",
        namaInovasi: item.nama_inovasi || "-",
        kategoriNama: currentInv.name || "-",
        urusan: item.urusan_utama || "-",
        tahapan: item.tahapan_inovasi || "-",
        slotPenilai: activeSlot,
        namaJuri: penugasan?.nama_juri || "-",
        juri_id: penugasan?.juri_id || null,
        assigned: !!penugasan,

        penilaian_id: nilai?.id || null,
        catatan: nilai?.catatan || "",

        proposal_tampilan: nilai?.proposal_tampilan ?? 0,
        proposal_kelengkapan: nilai?.proposal_kelengkapan ?? 0,
        proposal_keterkaitan: nilai?.proposal_keterkaitan ?? 0,
        proposal_tujuan: nilai?.proposal_tujuan ?? 0,
        proposal_deskripsi: nilai?.proposal_deskripsi ?? 0,

        video_latar_belakang: nilai?.video_latar_belakang ?? 0,
        video_penjaringan_ide: nilai?.video_penjaringan_ide ?? 0,
        video_pemilihan_ide: nilai?.video_pemilihan_ide ?? 0,
        video_manfaat: nilai?.video_manfaat ?? 0,
        video_dampak: nilai?.video_dampak ?? 0,

        substansi_kesiapterapan: nilai?.substansi_kesiapterapan ?? 0,
        substansi_kebaharuan: nilai?.substansi_kebaharuan ?? 0,
        substansi_komersialisasi: nilai?.substansi_komersialisasi ?? 0,
        substansi_usp: nilai?.substansi_usp ?? 0,
        substansi_kemanfaatan: nilai?.substansi_kemanfaatan ?? 0,
        substansi_kedalaman: nilai?.substansi_kedalaman ?? 0,

        skorProposal: nilai?.skor_proposal ?? null,
        skorVideo: nilai?.skor_video ?? null,
        skorSubstansi: nilai?.skor_substansi ?? null,
        skorAkhir: nilai?.skor_akhir ?? null,

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

        waktuInisiatif: formatDate(item.waktu_pengembangan),
      };
    });
  }, [pesertaList, penilaianList, penugasanList, currentInv, activeSlot]);

  const jumlahSudahDinilai = useMemo(() => {
    return rows.filter((row) => row.penilaian_id !== null).length;
  }, [rows]);

  const uniqueAssignedJuriCount = useMemo(() => {
    const ids = new Set(
      rows.filter((row) => row.juri_id).map((row) => Number(row.juri_id))
    );
    return ids.size;
  }, [rows]);

  const handleDetail = (row) => {
    setSelectedRow(row);
    setOpenDetail(true);
  };

  const handleNilai = (row) => {
    if (!row.assigned) {
      alert("Tempat ini belum memiliki juri yang ditugaskan.");
      return;
    }
    setRowNilai(row);
    setOpenNilai(true);
  };

  const saveNilai = async (payloadForm) => {
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
            substansi_komersialisasi: Number(
              payloadForm.substansi_komersialisasi
            ),
            substansi_usp: Number(payloadForm.substansi_usp),
            substansi_kemanfaatan: Number(payloadForm.substansi_kemanfaatan),
            substansi_kedalaman: Number(payloadForm.substansi_kedalaman),

            catatan: payloadForm.catatan || "",
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

  const handleResetSemua = async () => {
    if (jumlahSudahDinilai === 0) {
      alert("Belum ada nilai yang bisa direset.");
      return;
    }

    const ok = window.confirm(
      "Reset semua penilaian? Tindakan ini akan menghapus seluruh nilai."
    );
    if (!ok) return;

    try {
      setActionLoading(true);

      const response = await debugFetch(
        `${API_URL}/penilaian/reset/all`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        "RESET SEMUA PENILAIAN"
      );

      const result = await parseJsonSafe(response, "RESET SEMUA PENILAIAN");

      if (!response.ok) {
        throw new Error(
          result?.errors?.join(", ") ||
            result?.message ||
            "Gagal mereset semua penilaian."
        );
      }

      await fetchAll();
    } catch (error) {
      console.error("Reset semua penilaian error:", error);
      alert(error.message || "Gagal mereset semua penilaian.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetByJuri = async (row) => {
    if (!row?.juri_id) {
      alert("Baris ini belum memiliki juri yang ditugaskan.");
      return;
    }

    const ok = window.confirm(
      `Reset semua penilaian milik juri "${row.namaJuri}" (ID: ${row.juri_id})?`
    );
    if (!ok) return;

    try {
      setActionLoading(true);

      const response = await debugFetch(
        `${API_URL}/penilaian/reset/juri/${row.juri_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        "RESET PENILAIAN BY JURI"
      );

      const result = await parseJsonSafe(response, "RESET PENILAIAN BY JURI");

      if (!response.ok) {
        throw new Error(
          result?.errors?.join(", ") ||
            result?.message ||
            "Gagal mereset penilaian berdasarkan juri."
        );
      }

      await fetchAll();
    } catch (error) {
      console.error("Reset penilaian by juri error:", error);
      alert(error.message || "Gagal mereset penilaian berdasarkan juri.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-5">
          <h1 className="text-xl font-extrabold text-slate-900">
            Penilaian Admin
          </h1>
          <p className="text-sm text-slate-500">
            Admin dapat mengakses semua Tempat penilaian, tetapi tetap bukan
            penilai tambahan.
          </p>
        </div>

        <div className="flex items-end gap-2">
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

          <button
            type="button"
            onClick={handleResetSemua}
            disabled={actionLoading || jumlahSudahDinilai === 0}
            className="mb-[1px] inline-flex items-center justify-center gap-2 rounded-t-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-4 w-4" />
            {actionLoading ? "Memproses..." : "Reset Semua Nilai"}
          </button>
        </div>

        <div className="bg-white rounded-b-xl rounded-tr-xl border border-slate-200 shadow-sm">
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
            <div>
              <div className="text-sm font-bold text-slate-800">
                Daftar Peserta • {currentInvLabel}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Aktif: <span className="font-semibold">JURI {activeSlot}</span>
                {" • "}
                Sudah dinilai:{" "}
                <span className="font-semibold">{jumlahSudahDinilai}</span>
                {" • "}
                Total juri terlibat:{" "}
                <span className="font-semibold">{uniqueAssignedJuriCount}</span>
              </div>
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
                  <th className="text-left font-bold px-4 py-3 w-12">#</th>
                  <th className="text-left font-bold px-4 py-3">Peserta</th>
                  <th className="text-left font-bold px-4 py-3">Inovasi</th>
                  <th className="text-left font-bold px-4 py-3">Kategori</th>
                  <th className="text-left font-bold px-4 py-3">Urusan</th>
                  <th className="text-left font-bold px-4 py-3">Tahapan</th>
                  <th className="text-left font-bold px-4 py-3">Inisiatif</th>
                  <th className="text-left font-bold px-4 py-3">Juri</th>
                  <th className="text-left font-bold px-4 py-3 w-20">Skor</th>
                  <th className="text-center font-bold px-4 py-3 w-40">Aksi</th>
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
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-10 text-center text-slate-500"
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
                      <td className="px-4 py-3 text-slate-600">{idx + 1}</td>

                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {row.namaPeserta}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {row.namaInovasi}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {row.kategoriNama}
                      </td>

                      <td className="px-4 py-3 text-slate-700">{row.urusan}</td>

                      <td className="px-4 py-3 text-slate-700">
                        {row.tahapan}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {row.waktuInisiatif || "-"}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {row.assigned ? (
                          <div className="flex flex-col">
                            <span>{row.namaJuri}</span>
                            <span className="text-[11px] text-slate-400">
                              ID: {row.juri_id}
                            </span>
                          </div>
                        ) : (
                          <span className="text-red-500 text-xs font-semibold">
                            Belum ditugaskan
                          </span>
                        )}
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
                            disabled={!row.assigned}
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
                            onClick={() => handleResetByJuri(row)}
                            disabled={actionLoading || !row.juri_id}
                            className={`${actionBtnClass} border-red-200 bg-red-50 hover:bg-red-100`}
                            title="Reset Nilai Berdasarkan Juri"
                            aria-label="Reset Nilai Berdasarkan Juri"
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
            Admin dapat mengisi semua Juri penilaian, tetapi nilai tetap masuk
            ke juri yang ditugaskan. Admin juga dapat mereset semua nilai
            atau mereset nilai berdasarkan juri.
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
        initialData={rowNilai?.penilaian_id ? rowNilai : {}}
        onSave={saveNilai}
      />
    </div>
  );
};

export default PenilaianAdmin;