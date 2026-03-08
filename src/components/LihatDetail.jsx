import React, { useEffect } from "react";
import { X, Eye, Download } from "lucide-react";

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const Field = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-slate-500">{label}</p>
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
      {value || "-"}
    </div>
  </div>
);

const TextBox = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-slate-500">{label}</p>
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      {value ? (
        <p className="whitespace-pre-line text-sm leading-6 text-slate-800">
          {value}
        </p>
      ) : (
        <p className="text-sm text-slate-500">-</p>
      )}
    </div>
  </div>
);

const getFileNameFromUrl = (url) => {
  if (!url) return "";
  try {
    const cleanUrl = url.split("?")[0];
    const parts = cleanUrl.split("/");
    return decodeURIComponent(parts[parts.length - 1] || "file.pdf");
  } catch {
    return "file.pdf";
  }
};

const handleDownload = async (url, fallbackName = "dokumen.pdf") => {
  try {
    if (!url) return;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Gagal mengunduh file");

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fallbackName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download file error:", error);
    alert("Gagal mengunduh file.");
  }
};

const FileChip = ({ label, file }) => {
  const isString = typeof file === "string";
  const name = isString ? getFileNameFromUrl(file) : file?.name;
  const url = isString ? file : file?.url;
  const fallbackName = name || "dokumen.pdf";

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-slate-500">{label}</p>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
        <span className="truncate text-sm text-slate-800">{name || "-"}</span>

        {url ? (
          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <Eye className="h-4 w-4" />
              View
            </button>

            <button
              type="button"
              onClick={() => handleDownload(url, fallbackName)}
              className="inline-flex items-center gap-1 rounded-lg bg-purple-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-800"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const LihatDetail = ({ open, onClose, data }) => {
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const d = data || {};

  return (
    <div className="fixed inset-0 z-[999]">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <p className="text-sm font-extrabold text-slate-900">
                Detail Submission
              </p>
              <p className="text-xs text-slate-500">
                {d.nama_inovasi || d.namaInovasi || "Data inovasi peserta"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
              aria-label="Tutup"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          <div className="max-h-[75vh] overflow-auto px-6 py-6 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900">
                  Identitas
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  Peserta: {d.nama_pemda || d.namaPemda || d.namaPeserta || "-"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Nama Pemda"
                  value={d.nama_pemda || d.namaPemda || d.namaPeserta}
                />
                <Field
                  label="Nama Inovasi"
                  value={d.nama_inovasi || d.namaInovasi}
                />
                <Field
                  label="Tahapan Inovasi"
                  value={d.tahapan_inovasi || d.tahap || d.tahapan}
                />
                <Field
                  label="Inisiator (Kelompok)"
                  value={d.inisiator_inovasi || d.inisiatorKelompok}
                />
                <Field
                  label="Nama Inisiator"
                  value={d.nama_inisiator || d.namaInisiator}
                />
                <Field
                  label="Jenis Inovasi"
                  value={d.jenis_inovasi || d.jenisInovasi}
                />
                <Field
                  label="Bentuk Inovasi"
                  value={d.bentuk_inovasi || d.bentukInovasi}
                />
                <Field label="Tematik" value={d.tematik} />
                <Field
                  label="Urusan Utama"
                  value={d.urusan_utama || d.urusanUtama || d.urusan}
                />
                <Field
                  label="Urusan Irisan"
                  value={d.urusan_beririsan || d.urusanIrisan}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field
                  label="Waktu Uji Coba"
                  value={formatDate(d.waktu_uji_coba || d.waktuUjiCoba)}
                />
                <Field
                  label="Waktu Penerapan"
                  value={formatDate(d.waktu_penerapan || d.waktuPenerapan)}
                />
                <Field
                  label="Waktu Pengembangan"
                  value={formatDate(d.waktu_pengembangan || d.waktuPengembangan || d.waktuInisiatif)}
                />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Narasi
              </h3>

              <div className="space-y-4">
                <TextBox
                  label="Rancang Bangun"
                  value={d.rancangan_bangun || d.rancangBangun}
                />
                <TextBox
                  label="Tujuan"
                  value={d.tujuan_inovasi || d.tujuan}
                />
                <TextBox
                  label="Manfaat"
                  value={d.manfaat_diperoleh || d.manfaat}
                />
                <TextBox
                  label="Hasil"
                  value={d.hasil_inovasi || d.hasil}
                />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Dokumen
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FileChip
                  label="Anggaran (PDF)"
                  file={d.anggaran_pdf || d.anggaranFile}
                />
                <FileChip
                  label="PPT (PDF)"
                  file={d.profil_bisnis_pdf || d.pptFile || d.profilBisnisFile}
                />
                <FileChip
                  label="Dokumen HAKI (PDF)"
                  file={d.dokumen_haki_pdf || d.hakiFile}
                />
                <FileChip
                  label="Penghargaan (PDF)"
                  file={d.penghargaan_pdf || d.penghargaanFile}
                />
                <FileChip
                  label="Proposal (PDF)"
                  file={d.proposal_pdf || d.proposalFile}
                />
              </div>
            </section>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LihatDetail;