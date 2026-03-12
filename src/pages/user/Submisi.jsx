import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search01Icon,
  Add01Icon,
  Edit02Icon,
  EyeIcon,
} from "hugeicons-react";
import EditSubmissionModal from "../../components/EditSubmissionModal.jsx";
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

const getStatusBadgeClass = (status) => {
  if (status === "Lolos") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }

  if (status === "Tidak Lolos") {
    return "bg-red-50 text-red-700 border border-red-200";
  }

  return "bg-amber-50 text-amber-700 border border-amber-200";
};

const getTahapLabel = (tahap) => {
  if (tahap === "administratif") return "Administratif";
  if (tahap === "semifinal") return "Semi Final";
  if (tahap === "final") return "Final";
  return "Awal";
};

const getTahapBadgeClass = (tahap) => {
  if (tahap === "administratif") {
    return "bg-blue-50 text-blue-700 border border-blue-200";
  }

  if (tahap === "semifinal") {
    return "bg-purple-50 text-purple-700 border border-purple-200";
  }

  if (tahap === "final") {
    return "bg-indigo-50 text-indigo-700 border border-indigo-200";
  }

  return "bg-slate-50 text-slate-700 border border-slate-200";
};

const SubmissionsPage = () => {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [inovasiList, setInovasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  const [openDetail, setOpenDetail] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loadingSave, setLoadingSave] = useState(false);

  useEffect(() => {
    const fetchMySubmissions = async () => {
      try {
        setLoading(true);
        setServerError("");

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token login tidak ditemukan. Silakan login ulang.");
        }

        const [submissionResponse, inovasiResponse] = await Promise.all([
          fetch(`${API_URL}/data-peserta/my-submissions`, {
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

        const submissionResult = await submissionResponse.json();
        const inovasiResult = await inovasiResponse.json();

        if (!submissionResponse.ok) {
          throw new Error(
            submissionResult?.errors?.join(", ") ||
              submissionResult?.message ||
              "Gagal mengambil data submission."
          );
        }

        if (!inovasiResponse.ok) {
          throw new Error(
            inovasiResult?.errors?.join(", ") ||
              inovasiResult?.message ||
              "Gagal mengambil data inovasi."
          );
        }

        const list = Array.isArray(submissionResult?.data)
          ? submissionResult.data
          : [];
        const inovasiData = Array.isArray(inovasiResult?.data)
          ? inovasiResult.data
          : [];

        const kategoriMap = new Map();
        inovasiData.forEach((item) => {
          kategoriMap.set(String(item.id), item.name || "-");
        });

        const mapped = list.map((item) => ({
          id: item.id,
          namaPeserta: item.nama_inisiator || "-",
          namaInovasi: item.nama_inovasi || "-",
          kategoriNama: kategoriMap.get(String(item.kategori)) || "-",
          tahapan: item.tahapan_inovasi || "-",
          urusan: item.urusan_utama || "-",
          waktuInisiatif: formatDate(item.waktu_pengembangan),
          waktuUjiCoba: formatDate(item.waktu_uji_coba),
          waktuPenerapan: formatDate(item.waktu_penerapan),
          skor: Number(item.skor_final ?? 0),

          statusSeleksi: item.status_seleksi || "Diproses",
          tahapSeleksi: item.tahap_seleksi || "all",

          kategori: item.kategori || "",
          kategori_nama: kategoriMap.get(String(item.kategori)) || "-",
          nama_pemda: item.nama_pemda || "",
          nama_inovasi: item.nama_inovasi || "",
          tahapan_inovasi: item.tahapan_inovasi || "",
          inisiator_inovasi: item.inisiator_inovasi || "",
          nama_inisiator: item.nama_inisiator || "",
          jenis_inovasi: item.jenis_inovasi || "",
          bentuk_inovasi: item.bentuk_inovasi || "",
          tematik: item.tematik || "",
          urusan_utama: item.urusan_utama || "",
          urusan_beririsan: item.urusan_beririsan || "",
          waktu_uji_coba: item.waktu_uji_coba || "",
          waktu_penerapan: item.waktu_penerapan || "",
          waktu_pengembangan: item.waktu_pengembangan || "",
          link_video: item.link_video || "",

          rancangan_bangun: item.rancangan_bangun || "",
          tujuan_inovasi: item.tujuan_inovasi || "",
          manfaat_diperoleh: item.manfaat_diperoleh || "",
          hasil_inovasi: item.hasil_inovasi || "",

          anggaran_pdf: item.anggaran_pdf || "",
          profil_bisnis_pdf: item.profil_bisnis_pdf || "",
          dokumen_haki_pdf: item.dokumen_haki_pdf || "",
          penghargaan_pdf: item.penghargaan_pdf || "",
          proposal_pdf: item.proposal_pdf || "",
        }));

        setRows(mapped);
        setInovasiList(inovasiData);
      } catch (error) {
        console.error("Fetch submissions error:", error);
        setServerError(
          error.message || "Terjadi kesalahan saat mengambil data."
        );
        setRows([]);
        setInovasiList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMySubmissions();
  }, []);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return rows;

    return rows.filter((r) =>
      `${r.namaPeserta} ${r.namaInovasi} ${r.kategoriNama} ${r.tahapan} ${r.urusan} ${r.waktuInisiatif} ${r.statusSeleksi} ${r.tahapSeleksi} ${r.link_video}`
        .toLowerCase()
        .includes(kw)
    );
  }, [q, rows]);

  const goAdd = () => navigate("/participant/add");

  const handleDetail = (row) => {
    setSelectedRow(row);
    setOpenDetail(true);
  };

  const handleEdit = (row) => {
    setSelectedRow(row);
    setOpenEdit(true);
  };

  const handleSaveSubmission = async (form) => {
    try {
      setLoadingSave(true);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token login tidak ditemukan. Silakan login ulang.");
      }

      if (!selectedRow?.id) {
        throw new Error("ID submission tidak ditemukan.");
      }

      const formData = new FormData();

      formData.append("nama_inovasi", form.nama_inovasi || "");
      formData.append("kategori", form.kategori || "");
      formData.append("tahapan_inovasi", form.tahapan_inovasi || "");
      formData.append("inisiator_inovasi", form.inisiator_inovasi || "");
      formData.append("nama_inisiator", form.nama_inisiator || "");
      formData.append("jenis_inovasi", form.jenis_inovasi || "");
      formData.append("bentuk_inovasi", form.bentuk_inovasi || "");
      formData.append("tematik", form.tematik || "");
      formData.append("urusan_utama", form.urusan_utama || "");
      formData.append("urusan_beririsan", form.urusan_beririsan || "");
      formData.append("link_video", form.link_video || "");

      if (form.waktu_uji_coba !== undefined) {
        formData.append("waktu_uji_coba", form.waktu_uji_coba || "");
      }
      if (form.waktu_penerapan !== undefined) {
        formData.append("waktu_penerapan", form.waktu_penerapan || "");
      }
      if (form.waktu_pengembangan !== undefined) {
        formData.append("waktu_pengembangan", form.waktu_pengembangan || "");
      }

      formData.append("rancangan_bangun", form.rancangan_bangun || "");
      formData.append("tujuan_inovasi", form.tujuan_inovasi || "");
      formData.append("manfaat_diperoleh", form.manfaat_diperoleh || "");
      formData.append("hasil_inovasi", form.hasil_inovasi || "");

      if (form.anggaran_pdf instanceof File) {
        formData.append("anggaran_pdf", form.anggaran_pdf);
      }
      if (form.profil_bisnis_pdf instanceof File) {
        formData.append("profil_bisnis_pdf", form.profil_bisnis_pdf);
      }
      if (form.dokumen_haki_pdf instanceof File) {
        formData.append("dokumen_haki_pdf", form.dokumen_haki_pdf);
      }
      if (form.penghargaan_pdf instanceof File) {
        formData.append("penghargaan_pdf", form.penghargaan_pdf);
      }
      if (form.proposal_pdf instanceof File) {
        formData.append("proposal_pdf", form.proposal_pdf);
      }

      const response = await fetch(`${API_URL}/data-peserta/${selectedRow.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.errors?.join(", ") ||
            result?.message ||
            "Gagal memperbarui submission."
        );
      }

      const updated = result?.data;
      const kategoriMap = new Map();

      inovasiList.forEach((item) => {
        kategoriMap.set(String(item.id), item.name || "-");
      });

      const normalizedUpdated = {
        id: updated.id,
        namaPeserta: updated.nama_inisiator || "-",
        namaInovasi: updated.nama_inovasi || "-",
        kategoriNama: kategoriMap.get(String(updated.kategori)) || "-",
        tahapan: updated.tahapan_inovasi || "-",
        urusan: updated.urusan_utama || "-",
        waktuInisiatif: formatDate(updated.waktu_pengembangan),
        waktuUjiCoba: formatDate(updated.waktu_uji_coba),
        waktuPenerapan: formatDate(updated.waktu_penerapan),
        skor: Number(updated.skor_final ?? 0),

        statusSeleksi:
          updated.status_seleksi || selectedRow.statusSeleksi || "Diproses",
        tahapSeleksi: updated.tahap_seleksi || selectedRow.tahapSeleksi || "all",

        kategori: updated.kategori || "",
        kategori_nama: kategoriMap.get(String(updated.kategori)) || "-",
        nama_pemda: updated.nama_pemda || "",
        nama_inovasi: updated.nama_inovasi || "",
        tahapan_inovasi: updated.tahapan_inovasi || "",
        inisiator_inovasi: updated.inisiator_inovasi || "",
        nama_inisiator: updated.nama_inisiator || "",
        jenis_inovasi: updated.jenis_inovasi || "",
        bentuk_inovasi: updated.bentuk_inovasi || "",
        tematik: updated.tematik || "",
        urusan_utama: updated.urusan_utama || "",
        urusan_beririsan: updated.urusan_beririsan || "",
        waktu_uji_coba: updated.waktu_uji_coba || "",
        waktu_penerapan: updated.waktu_penerapan || "",
        waktu_pengembangan: updated.waktu_pengembangan || "",
        link_video: updated.link_video || "",

        rancangan_bangun: updated.rancangan_bangun || "",
        tujuan_inovasi: updated.tujuan_inovasi || "",
        manfaat_diperoleh: updated.manfaat_diperoleh || "",
        hasil_inovasi: updated.hasil_inovasi || "",

        anggaran_pdf: updated.anggaran_pdf || "",
        profil_bisnis_pdf: updated.profil_bisnis_pdf || "",
        dokumen_haki_pdf: updated.dokumen_haki_pdf || "",
        penghargaan_pdf: updated.penghargaan_pdf || "",
        proposal_pdf: updated.proposal_pdf || "",
      };

      setRows((prev) =>
        prev.map((item) => (item.id === selectedRow.id ? normalizedUpdated : item))
      );

      setSelectedRow(normalizedUpdated);
      setOpenEdit(false);
      alert("Submission berhasil diperbarui!");
    } catch (error) {
      console.error("Update submission error:", error);
      alert(error.message || "Terjadi kesalahan saat memperbarui submission.");
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
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
          Tambah Submisi
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
                <th className="text-left font-semibold text-gray-700 px-3 py-3">
                  Nama Peserta
                </th>
                <th className="text-left font-semibold text-gray-700 px-3 py-3">
                  Nama Inovasi
                </th>
                <th className="text-left font-semibold text-gray-700 px-3 py-3">
                  Kategori
                </th>
                <th className="text-left font-semibold text-gray-700 px-3 py-3">
                  Tahapan
                </th>
                <th className="text-left font-semibold text-gray-700 px-3 py-3">
                  Urusan
                </th>
                <th className="text-left font-semibold text-gray-700 px-3 py-3 whitespace-nowrap">
                  Waktu Inisiatif
                </th>
                <th className="text-left font-semibold text-gray-700 px-3 py-3 whitespace-nowrap">
                  Waktu Uji Coba
                </th>
                <th className="text-left font-semibold text-gray-700 px-3 py-3 whitespace-nowrap">
                  Waktu Penerapan
                </th>
                <th className="text-left font-semibold text-gray-700 px-3 py-3 whitespace-nowrap">
                  Tahap
                </th>
                <th className="text-left font-semibold text-gray-700 px-3 py-3 whitespace-nowrap">
                  Status
                </th>
                <th className="text-center font-semibold text-gray-700 px-3 py-3 whitespace-nowrap">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-3 py-8 text-center text-gray-500"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-3 py-8 text-center text-gray-500"
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
                    <td className="px-3 py-3 text-gray-900">{row.namaPeserta}</td>
                    <td className="px-3 py-3 text-gray-900">{row.namaInovasi}</td>
                    <td className="px-3 py-3 text-gray-900">{row.kategoriNama}</td>
                    <td className="px-3 py-3 text-gray-900">{row.tahapan}</td>
                    <td className="px-3 py-3 text-gray-900">{row.urusan}</td>
                    <td className="px-3 py-3 text-gray-900 whitespace-nowrap">
                      {row.waktuInisiatif}
                    </td>
                    <td className="px-3 py-3 text-gray-900 whitespace-nowrap">
                      {row.waktuUjiCoba}
                    </td>
                    <td className="px-3 py-3 text-gray-900 whitespace-nowrap">
                      {row.waktuPenerapan}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${getTahapBadgeClass(
                          row.tahapSeleksi
                        )}`}
                      >
                        {getTahapLabel(row.tahapSeleksi)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${getStatusBadgeClass(
                          row.statusSeleksi
                        )}`}
                      >
                        {row.statusSeleksi}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(row)}
                          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-50 transition"
                          title="Edit"
                        >
                          <Edit02Icon className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDetail(row)}
                          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-50 transition"
                          title="Lihat Detail"
                        >
                          <EyeIcon className="w-4 h-4" />
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

      <EditSubmissionModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        data={selectedRow}
        onSave={handleSaveSubmission}
        loading={loadingSave}
      />

      <DetailSubmissionModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        data={selectedRow}
      />
    </div>
  );
};

export default SubmissionsPage;