import React, { useEffect } from "react";
import { X, Eye, Download, ExternalLink, Video, Phone } from "lucide-react";

const formatDate = (value) => {
  if (!value) return "-";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value || "-";

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
      {value && String(value).trim() !== "" ? value : "-"}
    </div>
  </div>
);

const TextBox = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-slate-500">{label}</p>
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      {value && String(value).trim() !== "" ? (
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

const handleView = async (url) => {
  try {
    if (!url) return;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Gagal membuka file.");
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("pdf")) {
      const text = await response.text();
      console.error("File view bukan PDF:", {
        url,
        status: response.status,
        contentType,
        bodyPreview: text.slice(0, 300),
      });
      throw new Error("File bukan PDF atau URL tidak valid.");
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    window.open(blobUrl, "_blank", "noopener,noreferrer");

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 60000);
  } catch (error) {
    console.error("View file error:", error);
    alert(error.message || "Gagal membuka file.");
  }
};

const FileChip = ({ label, file }) => {
  const name = file ? getFileNameFromUrl(file) : "";
  const fallbackName = name || "dokumen.pdf";

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-slate-500">{label}</p>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
        <span className="truncate text-sm text-slate-800">{name || "-"}</span>

        {file ? (
          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleView(file)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <Eye className="h-4 w-4" />
              View
            </button>

            <button
              type="button"
              onClick={() => handleDownload(file, fallbackName)}
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

const VideoLinkField = ({ label, url }) => {
  const hasUrl = url && String(url).trim() !== "";

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-slate-500">{label}</p>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
        <div className="min-w-0 flex items-center gap-2">
          <Video className="h-4 w-4 shrink-0 text-slate-500" />
          <span className="truncate text-sm text-slate-800">
            {hasUrl ? url : "-"}
          </span>
        </div>

        {hasUrl ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-purple-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-800"
          >
            <ExternalLink className="h-4 w-4" />
            Buka
          </a>
        ) : null}
      </div>
    </div>
  );
};

const PhoneField = ({ label, value }) => {
  const hasValue = value && String(value).trim() !== "";

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-slate-500">{label}</p>

      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
        <Phone className="h-4 w-4 shrink-0 text-slate-500" />
        <span className="text-sm text-slate-800">{hasValue ? value : "-"}</span>
      </div>
    </div>
  );
};

const LihatDetail = ({ open, onClose, data }) => {
  const d = data || {};

  const kategoriName = String(d.kategori_nama ?? d.kategori ?? "")
    .trim()
    .toLowerCase();

  const isKategoriInovasiDaerah = kategoriName.includes("inovasi daerah");

  const hasIndikatorDaerah =
    d.indikator_daerah && String(d.indikator_daerah).trim() !== "";

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

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
                {d.nama_inovasi || "Data inovasi peserta"}
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

          <div className="max-h-[75vh] overflow-auto space-y-8 px-6 py-6">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900">
                  Identitas & Data Inovasi
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nama Inisiator" value={d.nama_inisiator} />
                <Field label="Nama Inovasi" value={d.nama_inovasi} />
                <PhoneField label="No HP" value={d.no_hp} />
                <Field label="Tahapan Inovasi" value={d.tahapan_inovasi} />
                <Field
                  label="Inisiator Inovasi Daerah"
                  value={d.inisiator_inovasi}
                />
                <Field label="Jenis Inovasi" value={d.jenis_inovasi} />
                <Field
                  label="Kategori Inovasi"
                  value={d.kategori_nama ?? d.kategori}
                />
                <Field
                  label="Bentuk Inovasi Daerah"
                  value={d.bentuk_inovasi}
                />

                {(hasIndikatorDaerah || isKategoriInovasiDaerah) && (
                  <Field
                    label="Indikator Daerah"
                    value={d.indikator_daerah}
                  />
                )}

                <Field label="Asta Cita" value={d.tematik} />
                <Field label="Urusan Utama" value={d.urusan_utama} />
                <Field
                  label="Urusan Lain yang Beririsan"
                  value={d.urusan_beririsan}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field
                  label="Waktu Inisiatif"
                  value={formatDate(d.waktu_pengembangan)}
                />
                <Field
                  label="Waktu Uji Coba"
                  value={formatDate(d.waktu_uji_coba)}
                />
                <Field
                  label="Waktu Penerapan"
                  value={formatDate(d.waktu_penerapan)}
                />
              </div>

              <VideoLinkField label="Link Video" url={d.link_video} />
            </section>

            <section className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Narasi
              </h3>

              <div className="space-y-4">
                <TextBox
                  label="Kebaruan / Keunikan / Keaslian"
                  value={d.kebaruan}
                />
                <TextBox
                  label="Penjelasan Singkat Bentuk Kebaruan atau Keunikan Inovasi"
                  value={d.penjelasan_singkat_kebaruan}
                />
                <TextBox label="Rancang Bangun" value={d.rancangan_bangun} />
                <TextBox
                  label="Tujuan Inovasi Daerah"
                  value={d.tujuan_inovasi}
                />
                <TextBox
                  label="Manfaat yang Diperoleh"
                  value={d.manfaat_diperoleh}
                />
                <TextBox label="Hasil Inovasi" value={d.hasil_inovasi} />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Dokumen
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FileChip
                  label="Anggaran (jika diperlukan) — PDF"
                  file={d.anggaran_pdf}
                />
                <FileChip label="PPT — PDF" file={d.profil_bisnis_pdf} />
                <FileChip
                  label="Dokumen HAKI — PDF"
                  file={d.dokumen_haki_pdf}
                />
                <FileChip
                  label="Penghargaan — PDF"
                  file={d.penghargaan_pdf}
                />
                <FileChip label="Identitas Diri — PDF" file={d.proposal_pdf} />
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