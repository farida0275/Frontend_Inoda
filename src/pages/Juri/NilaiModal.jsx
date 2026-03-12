import React, { useEffect, useState } from "react";
import { Star, X } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-purple-200";

const helperClass =
  "mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-600";

const SectionTitle = ({ children }) => (
  <div className="mt-6 mb-3">
    <h4 className="text-sm font-extrabold text-slate-900">{children}</h4>
  </div>
);

const ScoreInput = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  description = "",
}) => (
  <div>
    <label className="block text-xs font-bold text-slate-700 mb-2">
      {label}
    </label>
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    />
    <p className="mt-1 text-[11px] text-slate-500">
      Nilai {min} - {max}
    </p>

    {description ? <div className={helperClass}>{description}</div> : null}
  </div>
);

const substansiDescriptions = {
  kesiapterapan:
    "Komponen ini terkait dengan tingkat kondisi kematangan atau kesiapterapan suatu hasil penelitian (research) dan pengembangan inovasi dan teknologi yang diukur secara sistematis agar dapat diadopsi oleh pengguna, baik oleh pemerintah, industri, atau masyarakat.",
  kebaharuan:
    "Komponen ini terkait dengan kebaruan ide dari penemuan tersebut, yang berbeda dari yang sudah ada atau yang sudah dikenal sebelumnya.",
  komersialisasi:
    "Komponen ini terkait dengan potensi dapat dikembangkan lebih lanjut dan menjadi ikon inovasi.",
  usp: "Unique selling point (USP) adalah suatu alasan kenapa masyarakat rela membelanjakan uangnya untuk membeli produk pilihannya pada hasil inovasi teknologi Anda, daripada orang lain.",
  kemanfaatan:
    "Komponen ini terkait dengan daya ungkit potensi kemanfaatan secara luas dan bernilai tinggi.",
  kedalaman:
    "Komponen ini berkaitan bobot kualitas atau kerumitan atau kecanggihan inovasi.",
};

const NilaiModal = ({ open, onClose, row, initialData = {}, onSave }) => {
  const [form, setForm] = useState({
    proposal_tampilan: "",
    proposal_kelengkapan: "",
    proposal_keterkaitan: "",
    proposal_tujuan: "",
    proposal_deskripsi: "",
    video_latar_belakang: "",
    video_penjaringan_ide: "",
    video_pemilihan_ide: "",
    video_manfaat: "",
    video_dampak: "",
    substansi_kesiapterapan: "",
    substansi_kebaharuan: "",
    substansi_komersialisasi: "",
    substansi_usp: "",
    substansi_kemanfaatan: "",
    substansi_kedalaman: "",
    catatan: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setForm({
      proposal_tampilan: initialData?.proposal_tampilan ?? "",
      proposal_kelengkapan: initialData?.proposal_kelengkapan ?? "",
      proposal_keterkaitan: initialData?.proposal_keterkaitan ?? "",
      proposal_tujuan: initialData?.proposal_tujuan ?? "",
      proposal_deskripsi: initialData?.proposal_deskripsi ?? "",

      video_latar_belakang: initialData?.video_latar_belakang ?? "",
      video_penjaringan_ide: initialData?.video_penjaringan_ide ?? "",
      video_pemilihan_ide: initialData?.video_pemilihan_ide ?? "",
      video_manfaat: initialData?.video_manfaat ?? "",
      video_dampak: initialData?.video_dampak ?? "",

      substansi_kesiapterapan: initialData?.substansi_kesiapterapan ?? "",
      substansi_kebaharuan: initialData?.substansi_kebaharuan ?? "",
      substansi_komersialisasi: initialData?.substansi_komersialisasi ?? "",
      substansi_usp: initialData?.substansi_usp ?? "",
      substansi_kemanfaatan: initialData?.substansi_kemanfaatan ?? "",
      substansi_kedalaman: initialData?.substansi_kedalaman ?? "",

      catatan: initialData?.catatan ?? "",
    });
  }, [open, initialData, row?.id]);

  if (!open) return null;

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      await onSave?.(form);
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

      <div className="relative mx-auto flex min-h-full max-w-5xl items-center justify-center px-4 py-6">
        <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-200 bg-white shrink-0">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Form Penilaian Juri
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Isi nilai proposal, video, dan substansi inovasi.
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

          <form onSubmit={submit} className="flex-1 overflow-y-auto">
            <div className="px-5 py-5">
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

                <p className="mt-3 text-xs font-bold text-slate-500">
                  Kategori
                </p>
                <p className="text-sm text-slate-800">
                  {row?.kategoriInovasi || "-"}
                </p>

                <p className="mt-3 text-xs font-bold text-slate-500">Slot</p>
                <p className="text-sm text-slate-800">
                  Slot {row?.slotPenilai || "-"}
                </p>
              </div>

              <SectionTitle>Penilaian Proposal (0 - 100)</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ScoreInput
                  label="Tampilan Proposal"
                  value={form.proposal_tampilan}
                  onChange={(v) => updateField("proposal_tampilan", v)}
                />
                <ScoreInput
                  label="Kelengkapan Substansi"
                  value={form.proposal_kelengkapan}
                  onChange={(v) => updateField("proposal_kelengkapan", v)}
                />
                <ScoreInput
                  label="Keterkaitan Antar Bab"
                  value={form.proposal_keterkaitan}
                  onChange={(v) => updateField("proposal_keterkaitan", v)}
                />
                <ScoreInput
                  label="Kejelasan Tujuan dan Sasaran"
                  value={form.proposal_tujuan}
                  onChange={(v) => updateField("proposal_tujuan", v)}
                />
                <ScoreInput
                  label="Kejelasan Deskripsi Produk"
                  value={form.proposal_deskripsi}
                  onChange={(v) => updateField("proposal_deskripsi", v)}
                />
              </div>

              <SectionTitle>Penilaian Video (0 - 100)</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ScoreInput
                  label="Latar Belakang Inovasi"
                  value={form.video_latar_belakang}
                  onChange={(v) => updateField("video_latar_belakang", v)}
                />
                <ScoreInput
                  label="Penjaringan Ide"
                  value={form.video_penjaringan_ide}
                  onChange={(v) => updateField("video_penjaringan_ide", v)}
                />
                <ScoreInput
                  label="Pemilihan Ide"
                  value={form.video_pemilihan_ide}
                  onChange={(v) => updateField("video_pemilihan_ide", v)}
                />
                <ScoreInput
                  label="Manfaat Inovasi"
                  value={form.video_manfaat}
                  onChange={(v) => updateField("video_manfaat", v)}
                />
                <ScoreInput
                  label="Dampak Inovasi"
                  value={form.video_dampak}
                  onChange={(v) => updateField("video_dampak", v)}
                />
              </div>

              <SectionTitle>Substansi Inovasi</SectionTitle>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ScoreInput
                  label="Tingkat Kesiapterapan"
                  min={0}
                  max={20}
                  value={form.substansi_kesiapterapan}
                  onChange={(v) => updateField("substansi_kesiapterapan", v)}
                  description={substansiDescriptions.kesiapterapan}
                />
                <ScoreInput
                  label="Kebaharuan (Novelty)"
                  min={0}
                  max={10}
                  value={form.substansi_kebaharuan}
                  onChange={(v) => updateField("substansi_kebaharuan", v)}
                  description={substansiDescriptions.kebaharuan}
                />
                <ScoreInput
                  label="Potensi Komersialisasi / Keberlanjutan"
                  min={0}
                  max={20}
                  value={form.substansi_komersialisasi}
                  onChange={(v) => updateField("substansi_komersialisasi", v)}
                  description={substansiDescriptions.komersialisasi}
                />
                <ScoreInput
                  label="Unique Selling Point"
                  min={0}
                  max={20}
                  value={form.substansi_usp}
                  onChange={(v) => updateField("substansi_usp", v)}
                  description={substansiDescriptions.usp}
                />
                <ScoreInput
                  label="Kemanfaatan Produk Inovasi"
                  min={0}
                  max={35}
                  value={form.substansi_kemanfaatan}
                  onChange={(v) => updateField("substansi_kemanfaatan", v)}
                  description={substansiDescriptions.kemanfaatan}
                />
                <ScoreInput
                  label="Tingkat Kedalaman"
                  min={0}
                  max={15}
                  value={form.substansi_kedalaman}
                  onChange={(v) => updateField("substansi_kedalaman", v)}
                  description={substansiDescriptions.kedalaman}
                />
              </div>

              <div className="mt-5">
                <label className="block text-sm font-bold text-slate-800">
                  Catatan
                </label>
                <textarea
                  value={form.catatan}
                  onChange={(e) => updateField("catatan", e.target.value)}
                  rows={4}
                  placeholder="Tulis catatan penilaian..."
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-purple-200 resize-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-5 py-4 flex items-center justify-end gap-2">
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

export default NilaiModal;