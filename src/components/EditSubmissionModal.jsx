import React, { useEffect, useState } from "react";
import { X, Save, Pencil, Upload, FileText, ChevronDown } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const astaCitaOptions = [
  "Memperkokoh ideologi Pancasila, demokrasi, dan hak asasi manusia (HAM).",
  "Memantapkan sistem pertahanan keamanan negara dan mendorong kemandirian bangsa melalui swasembada pangan, energi, air, ekonomi kreatif, ekonomi hijau, dan ekonomi biru.",
  "Meningkatkan lapangan kerja yang berkualitas, mendorong kewirausahaan, mengembangkan industri kreatif, dan melanjutkan pengembangan infrastruktur.",
  "Memperkuat pembangunan sumber daya manusia (SDM), sains, teknologi, pendidikan, kesehatan, prestasi olahraga, kesetaraan gender, serta penguatan peran perempuan, pemuda, dan penyandang disabilitas.",
  "Melanjutkan hilirisasi dan industrialisasi untuk meningkatkan nilai tambah di dalam negeri.",
  "Membangun dari desa dan dari bawah untuk pemerataan ekonomi dan pemberantasan kemiskinan.",
  "Memperkuat reformasi politik, hukum, dan birokrasi, serta memperkuat pencegahan dan pemberantasan korupsi dan narkoba.",
  "Memperkuat penyelarasan kehidupan yang harmonis dengan lingkungan, alam, dan budaya, serta peningkatan toleransi antarumat beragama untuk mencapai masyarakat yang adil dan makmur.",
];

const urusanOptions = [
  "Pendidikan",
  "Kesehatan",
  "Pekerjaan Umum dan Penataan Ruang",
  "Perumahan Rakyat dan Kawasan Permukiman",
  "Ketenteraman, Ketertiban Umum, dan Perlindungan Masyarakat",
  "Sosial",
  "Tenaga Kerja",
  "Pemberdayaan Perempuan dan Perlindungan Anak",
  "Pangan",
  "Pertanahan",
  "Lingkungan Hidup",
  "Administrasi Kependudukan dan Pencatatan Sipil",
  "Pemberdayaan Masyarakat dan Desa",
  "Pengendalian Penduduk dan Keluarga Berencana",
  "Perhubungan",
  "Komunikasi dan Informatika",
  "Koperasi, Usaha Kecil, dan Menengah",
  "Penanaman Modal",
  "Kepemudaan dan Olahraga",
  "Statistik",
  "Persandian",
  "Kebudayaan",
  "Perpustakaan",
  "Kearsipan",
  "Kelautan dan Perikanan",
  "Pariwisata",
  "Pertanian",
  "Kehutanan",
  "Energi dan Sumber Daya Mineral",
  "Perdagangan",
  "Perindustrian",
  "Transmigrasi",
];

const bentukInovasiDaerahOptions = [
  "Inovasi Tata Kelola Pemerintahan Daerah",
  "Inovasi Pelayanan Publik",
  "Inovasi bentuk lainnya sesuai bidang urusan pemerintahan yang menjadi kewenangan Daerah",
];

const formatDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
}) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-500">{label}</label>
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100">
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
      />
      <Pencil className="h-4 w-4 text-slate-400" />
    </div>
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  disabled = false,
  numbered = false,
}) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-500">{label}</label>

    <div className="relative rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100">
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className="w-full appearance-none bg-transparent pr-8 text-sm text-slate-800 outline-none disabled:cursor-not-allowed disabled:text-slate-400"
      >
        <option value="">Pilih...</option>
        {options.map((item, index) => {
          const optionValue = typeof item === "object" ? String(item.id) : item;
          const optionLabel = typeof item === "object" ? item.name : item;

          return (
            <option key={optionValue} value={optionValue}>
              {numbered ? `${index + 1}. ${optionLabel}` : optionLabel}
            </option>
          );
        })}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  </div>
);

const TextareaField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
}) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-500">{label}</label>
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100">
      <div className="mb-2 flex justify-end">
        <Pencil className="h-4 w-4 text-slate-400" />
      </div>
      <textarea
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y bg-transparent text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400"
      />
    </div>
  </div>
);

const FileUploadField = ({ label, name, fileUrl, fileValue, onFileChange }) => {
  const currentName =
    fileValue?.name ||
    (fileUrl ? decodeURIComponent(fileUrl.split("?")[0].split("/").pop()) : "");

  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-500">{label}</label>

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
        <div className="mb-3 flex items-center gap-2 text-sm text-slate-700">
          <FileText className="h-4 w-4" />
          <span className="truncate">{currentName || "Belum ada file"}</span>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-purple-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-800">
          <Upload className="h-4 w-4" />
          Upload File Baru
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => onFileChange(name, e.target.files?.[0] || null)}
          />
        </label>
      </div>
    </div>
  );
};

const EditSubmissionModal = ({
  open,
  onClose,
  data,
  onSave,
  loading = false,
}) => {
  const [form, setForm] = useState({
    nama_inovasi: "",
    tahapan_inovasi: "",
    inisiator_inovasi: "",
    nama_inisiator: "",
    jenis_inovasi: "",
    kategori: "",
    bentuk_inovasi: "",
    tematik: "",
    urusan_utama: "",
    urusan_beririsan: "",
    waktu_uji_coba: "",
    waktu_penerapan: "",
    waktu_pengembangan: "",
    rancangan_bangun: "",
    tujuan_inovasi: "",
    manfaat_diperoleh: "",
    hasil_inovasi: "",
    anggaran_pdf: null,
    profil_bisnis_pdf: null,
    dokumen_haki_pdf: null,
    penghargaan_pdf: null,
    proposal_pdf: null,
  });

  const [existingFiles, setExistingFiles] = useState({
    anggaran_pdf: "",
    profil_bisnis_pdf: "",
    dokumen_haki_pdf: "",
    penghargaan_pdf: "",
    proposal_pdf: "",
  });

  const [kategoriOptions, setKategoriOptions] = useState([]);
  const [loadingKategori, setLoadingKategori] = useState(false);

  useEffect(() => {
    const fetchKategoriOptions = async () => {
      try {
        setLoadingKategori(true);

        const response = await fetch(`${API_URL}/inovasi`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();
        const list = Array.isArray(result?.data) ? result.data : [];
        setKategoriOptions(list);
      } catch (error) {
        console.error("Fetch kategori inovasi error:", error);
        setKategoriOptions([]);
      } finally {
        setLoadingKategori(false);
      }
    };

    fetchKategoriOptions();
  }, []);

  useEffect(() => {
    if (!open) return;

    setForm({
      nama_inovasi: data?.nama_inovasi || "",
      tahapan_inovasi: data?.tahapan_inovasi || "",
      inisiator_inovasi: data?.inisiator_inovasi || "",
      nama_inisiator: data?.nama_inisiator || "",
      jenis_inovasi: data?.jenis_inovasi || "",
      kategori: data?.kategori ? String(data.kategori) : "",
      bentuk_inovasi: data?.bentuk_inovasi || "",
      tematik: data?.tematik || "",
      urusan_utama: data?.urusan_utama || "",
      urusan_beririsan: data?.urusan_beririsan || "",
      waktu_uji_coba: formatDateInput(data?.waktu_uji_coba),
      waktu_penerapan: formatDateInput(data?.waktu_penerapan),
      waktu_pengembangan: formatDateInput(data?.waktu_pengembangan),
      rancangan_bangun: data?.rancangan_bangun || "",
      tujuan_inovasi: data?.tujuan_inovasi || "",
      manfaat_diperoleh: data?.manfaat_diperoleh || "",
      hasil_inovasi: data?.hasil_inovasi || "",
      anggaran_pdf: null,
      profil_bisnis_pdf: null,
      dokumen_haki_pdf: null,
      penghargaan_pdf: null,
      proposal_pdf: null,
    });

    setExistingFiles({
      anggaran_pdf: data?.anggaran_pdf || "",
      profil_bisnis_pdf: data?.profil_bisnis_pdf || "",
      dokumen_haki_pdf: data?.dokumen_haki_pdf || "",
      penghargaan_pdf: data?.penghargaan_pdf || "",
      proposal_pdf: data?.proposal_pdf || "",
    });
  }, [open, data]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (name, file) => {
    setForm((prev) => ({
      ...prev,
      [name]: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave?.(form, data);
  };

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
                Edit Submission
              </p>
              <p className="text-xs text-slate-500">
                {data?.nama_inovasi || "Ubah data inovasi peserta"}
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

          <form onSubmit={handleSubmit}>
            <div className="max-h-[75vh] overflow-auto px-6 py-6 space-y-8">
              <section className="space-y-4">
                <h3 className="text-base font-extrabold text-slate-900">
                  Identitas
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField
                    label="Nama Inovasi"
                    name="nama_inovasi"
                    value={form.nama_inovasi}
                    onChange={handleChange}
                    placeholder="Masukkan nama inovasi"
                  />

                  <SelectField
                    label="Tahapan Inovasi"
                    name="tahapan_inovasi"
                    value={form.tahapan_inovasi}
                    onChange={handleChange}
                    options={["Inisiatif", "Uji Coba", "Penerapan"]}
                  />

                  <SelectField
                    label="Inisiator (Kelompok)"
                    name="inisiator_inovasi"
                    value={form.inisiator_inovasi}
                    onChange={handleChange}
                    options={[
                      "Kepala Daerah",
                      "Anggota DPRD",
                      "OPD",
                      "ASN",
                      "Masyarakat",
                    ]}
                  />

                  <InputField
                    label="Nama Inisiator"
                    name="nama_inisiator"
                    value={form.nama_inisiator}
                    onChange={handleChange}
                    placeholder="Masukkan nama inisiator"
                  />

                  <SelectField
                    label="Jenis Inovasi"
                    name="jenis_inovasi"
                    value={form.jenis_inovasi}
                    onChange={handleChange}
                    options={["Digital", "Non Digital"]}
                  />

                  <SelectField
                    label="Kategori Inovasi"
                    name="kategori"
                    value={form.kategori}
                    onChange={handleChange}
                    options={kategoriOptions}
                    disabled={loadingKategori}
                  />

                  <SelectField
                    label="Bentuk Inovasi"
                    name="bentuk_inovasi"
                    value={form.bentuk_inovasi}
                    onChange={handleChange}
                    options={bentukInovasiDaerahOptions}
                  />

                  <div className="sm:col-span-2">
                    <SelectField
                      label="Tematik / Asta Cita"
                      name="tematik"
                      value={form.tematik}
                      onChange={handleChange}
                      options={astaCitaOptions}
                      numbered
                    />

                    {form.tematik && (
                      <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700 whitespace-pre-line break-words">
                        {form.tematik}
                      </div>
                    )}
                  </div>

                  <SelectField
                    label="Urusan Utama"
                    name="urusan_utama"
                    value={form.urusan_utama}
                    onChange={handleChange}
                    options={urusanOptions}
                  />

                  <SelectField
                    label="Urusan Irisan"
                    name="urusan_beririsan"
                    value={form.urusan_beririsan}
                    onChange={handleChange}
                    options={urusanOptions}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <InputField
                    label="Waktu Uji Coba"
                    name="waktu_uji_coba"
                    type="date"
                    value={form.waktu_uji_coba}
                    onChange={handleChange}
                  />

                  <InputField
                    label="Waktu Penerapan"
                    name="waktu_penerapan"
                    type="date"
                    value={form.waktu_penerapan}
                    onChange={handleChange}
                  />

                  <InputField
                    label="Waktu Inisiatif"
                    name="waktu_pengembangan"
                    type="date"
                    value={form.waktu_pengembangan}
                    onChange={handleChange}
                  />
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-base font-extrabold text-slate-900">
                  Narasi
                </h3>

                <div className="space-y-4">
                  <TextareaField
                    label="Rancang Bangun"
                    name="rancangan_bangun"
                    value={form.rancangan_bangun}
                    onChange={handleChange}
                    placeholder="Tuliskan rancang bangun"
                    rows={6}
                  />

                  <TextareaField
                    label="Tujuan"
                    name="tujuan_inovasi"
                    value={form.tujuan_inovasi}
                    onChange={handleChange}
                    placeholder="Tuliskan tujuan inovasi"
                  />

                  <TextareaField
                    label="Manfaat"
                    name="manfaat_diperoleh"
                    value={form.manfaat_diperoleh}
                    onChange={handleChange}
                    placeholder="Tuliskan manfaat inovasi"
                  />

                  <TextareaField
                    label="Hasil"
                    name="hasil_inovasi"
                    value={form.hasil_inovasi}
                    onChange={handleChange}
                    placeholder="Tuliskan hasil inovasi"
                  />
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-base font-extrabold text-slate-900">
                  Dokumen
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FileUploadField
                    label="Anggaran (PDF)"
                    name="anggaran_pdf"
                    fileUrl={existingFiles.anggaran_pdf}
                    fileValue={form.anggaran_pdf}
                    onFileChange={handleFileChange}
                  />

                  <FileUploadField
                    label="PPT (PDF)"
                    name="profil_bisnis_pdf"
                    fileUrl={existingFiles.profil_bisnis_pdf}
                    fileValue={form.profil_bisnis_pdf}
                    onFileChange={handleFileChange}
                  />

                  <FileUploadField
                    label="Dokumen HAKI (PDF)"
                    name="dokumen_haki_pdf"
                    fileUrl={existingFiles.dokumen_haki_pdf}
                    fileValue={form.dokumen_haki_pdf}
                    onFileChange={handleFileChange}
                  />

                  <FileUploadField
                    label="Penghargaan (PDF)"
                    name="penghargaan_pdf"
                    fileUrl={existingFiles.penghargaan_pdf}
                    fileValue={form.penghargaan_pdf}
                    onFileChange={handleFileChange}
                  />

                  <FileUploadField
                    label="Proposal (PDF)"
                    name="proposal_pdf"
                    fileUrl={existingFiles.proposal_pdf}
                    fileValue={form.proposal_pdf}
                    onFileChange={handleFileChange}
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
                Batal
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSubmissionModal;