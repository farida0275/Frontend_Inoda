import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  Upload01Icon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Upload01Icon as UploadIcon,
} from "hugeicons-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://backend-inoda.vercel.app/api";

const steps = [
  { id: 1, name: "Identitas & Data Inovasi", icon: UserIcon },
  { id: 2, name: "Narasi & Dokumen", icon: Upload01Icon },
];

const bentukOptions = [
  "Aplikasi",
  "Layanan",
  "Kebijakan",
  "Prosedur",
  "Lainnya",
];

const tematikOptions = [
  "Digitalisasi",
  "Kesehatan",
  "Pendidikan",
  "Pertanian",
];

const urusanUtamaOptions = ["Urusan A", "Urusan B", "Urusan C"];
const urusanIrisanOptions = ["Irisan 1", "Irisan 2", "Irisan 3"];

const MAX_2MB = 2 * 1024 * 1024;

const FormDaftar = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
  } = useForm({
    defaultValues: {
      tahap: "Inisiatif",
      inisiatorKelompok: "Kepala Daerah",
      jenisInovasi: "Digital",
      rancangBangun: "",
      tujuan: "",
      manfaat: "",
      hasil: "",
      waktuInisiatif: "",
      waktuUjiCoba: "",
      waktuPenerapan: "",
      waktuPengembangan: "",
    },
    mode: "onTouched",
  });

  const countWords = (text = "") => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const selectedTahap = watch("tahap");
  const tahapLevel = {
    Inisiatif: 1,
    "Uji Coba": 2,
    Penerapan: 3,
  };

  const stepFields = {
    1: [
      "namaPemda",
      "namaInovasi",
      "tahap",
      "inisiatorKelompok",
      "namaInisiator",
      "jenisInovasi",
      "bentukInovasi",
      "tematik",
      "urusanUtama",
      "waktuInisiatif",
      "waktuUjiCoba",
      "waktuPenerapan",
      "waktuPengembangan",
    ],
    2: [
      "rancangBangun",
      "tujuan",
      "manfaat",
      "hasil",
      "anggaranFile",
      "pptFile",
      "hakiFile",
      "penghargaanFile",
      "proposalFile",
    ],
  };

  const nextStep = async () => {
    const fields = stepFields[currentStep];
    const isValid = await trigger(fields);
    if (isValid) setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const validatePdf2mb = (fileList) => {
    if (!fileList || fileList.length === 0) return true;
    const f = fileList[0];
    if (f.size > MAX_2MB) return "Maksimal 2MB";
    if (f.type !== "application/pdf") return "Harus PDF";
    return true;
  };

  const onSubmit = async (data) => {
    try {
      setLoadingSubmit(true);

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Token login tidak ditemukan. Silakan login terlebih dahulu.");
        navigate("/login");
        return;
      }

      const formData = new FormData();

      formData.append("nama_pemda", data.namaPemda);
      formData.append("nama_inovasi", data.namaInovasi);
      formData.append("tahapan_inovasi", data.tahap);
      formData.append("inisiator_inovasi", data.inisiatorKelompok);
      formData.append("nama_inisiator", data.namaInisiator);
      formData.append("jenis_inovasi", data.jenisInovasi);
      formData.append("bentuk_inovasi", data.bentukInovasi);
      formData.append("tematik", data.tematik);
      formData.append("urusan_utama", data.urusanUtama);

      if (data.urusanIrisan) {
        formData.append("urusan_beririsan", data.urusanIrisan);
      }

      if (data.waktuInisiatif) {
        formData.append("waktu_pengembangan", data.waktuInisiatif);
      }

      if (data.waktuUjiCoba) {
        formData.append("waktu_uji_coba", data.waktuUjiCoba);
      }

      if (data.waktuPenerapan) {
        formData.append("waktu_penerapan", data.waktuPenerapan);
      }

      formData.append("rancangan_bangun", data.rancangBangun);
      formData.append("tujuan_inovasi", data.tujuan);
      formData.append("manfaat_diperoleh", data.manfaat);
      formData.append("hasil_inovasi", data.hasil);

      if (data.anggaranFile?.[0]) {
        formData.append("anggaran_pdf", data.anggaranFile[0]);
      }

      if (data.pptFile?.[0]) {
        formData.append("profil_bisnis_pdf", data.pptFile[0]);
      }

      if (data.hakiFile?.[0]) {
        formData.append("dokumen_haki_pdf", data.hakiFile[0]);
      }

      if (data.penghargaanFile?.[0]) {
        formData.append("penghargaan_pdf", data.penghargaanFile[0]);
      }

      if (data.proposalFile?.[0]) {
        formData.append("proposal_pdf", data.proposalFile[0]);
      }

      const response = await fetch(`${API_URL}/data-peserta`, {
        method: "POST",
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
            "Gagal menyimpan data peserta."
        );
      }

      alert("Data berhasil disimpan!");
      navigate("/Submisi");
    } catch (error) {
      console.error("Submit data peserta error:", error);
      alert(error.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const anggaranName = watch("anggaranFile")?.[0]?.name || "Belum ada file";
  const pptName = watch("pptFile")?.[0]?.name || "Belum ada file";
  const hakiName = watch("hakiFile")?.[0]?.name || "Belum ada file";
  const penghargaanName =
    watch("penghargaanFile")?.[0]?.name || "Belum ada file";
  const proposalName = watch("proposalFile")?.[0]?.name || "Belum ada file";

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Tambah Inovasi Daerah
        </h1>
        <p className="text-sm text-gray-500">
          Lengkapi form berikut untuk menambahkan data inovasi.
        </p>
      </div>

      <div className="mb-10 relative">
        <div className="absolute top-5 left-1/2 -translate-x-1/2 h-1 w-[min(520px,100%)] bg-gray-200 -z-10" />

        <div className="flex items-center justify-center gap-16">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= step.id
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                <step.icon className="w-5 h-5" />
              </div>

              <span
                className={`mt-2 text-xs font-medium ${
                  currentStep >= step.id ? "text-purple-700" : "text-gray-500"
                }`}
              >
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow rounded-xl p-6 space-y-8"
      >
        {currentStep === 1 && (
          <>
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3">
                Identitas
              </h3>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Pemda
                  </label>

                  <input
                    type="text"
                    placeholder="Masukkan nama pemerintah daerah..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    {...register("namaPemda", { required: "Wajib diisi" })}
                  />

                  {errors.namaPemda && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.namaPemda.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Inovasi
                  </label>

                  <input
                    type="text"
                    placeholder="Masukkan nama atau judul inovasi daerah..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    {...register("namaInovasi", { required: "Wajib diisi" })}
                  />

                  {errors.namaInovasi && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.namaInovasi.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold border-b pb-2">
                Data Inovasi
              </h3>

              <div className="space-y-6 mt-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Tahapan Inovasi
                  </label>
                  <div className="mt-2 grid sm:grid-cols-3 gap-3">
                    {["Inisiatif", "Uji Coba", "Penerapan"].map((v) => (
                      <label
                        key={v}
                        className={`border rounded-lg px-3 py-2 flex items-center gap-2 cursor-pointer ${
                          watch("tahap") === v
                            ? "border-purple-600"
                            : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          value={v}
                          {...register("tahap", { required: true })}
                        />
                        <span className="text-sm">{v}</span>
                      </label>
                    ))}
                  </div>
                  {errors.tahap && (
                    <p className="text-xs text-red-500 mt-1">Wajib dipilih</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Inisiator Inovasi Daerah
                  </label>
                  <div className="mt-2 grid sm:grid-cols-5 gap-3">
                    {[
                      "Kepala Daerah",
                      "Anggota DPRD",
                      "OPD",
                      "ASN",
                      "Masyarakat",
                    ].map((v) => (
                      <label
                        key={v}
                        className={`border rounded-lg px-3 py-2 flex items-center gap-2 cursor-pointer ${
                          watch("inisiatorKelompok") === v
                            ? "border-purple-600"
                            : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          value={v}
                          {...register("inisiatorKelompok", { required: true })}
                        />
                        <span className="text-xs">{v}</span>
                      </label>
                    ))}
                  </div>
                  {errors.inisiatorKelompok && (
                    <p className="text-xs text-red-500 mt-1">Wajib dipilih</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Nama Inisiator
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan nama inisiator..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    {...register("namaInisiator", { required: "Wajib diisi" })}
                  />
                  {errors.namaInisiator && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.namaInisiator.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Jenis Inovasi
                  </label>
                  <div className="mt-2 grid sm:grid-cols-2 gap-3">
                    {["Digital", "Non Digital"].map((v) => (
                      <label
                        key={v}
                        className={`border rounded-lg px-3 py-2 flex items-center gap-2 cursor-pointer ${
                          watch("jenisInovasi") === v
                            ? "border-purple-600"
                            : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          value={v}
                          {...register("jenisInovasi", { required: true })}
                        />
                        <span className="text-sm">{v}</span>
                      </label>
                    ))}
                  </div>
                  {errors.jenisInovasi && (
                    <p className="text-xs text-red-500 mt-1">Wajib dipilih</p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bentuk Inovasi Daerah
                    </label>

                    <select
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      {...register("bentukInovasi", { required: "Wajib dipilih" })}
                    >
                      <option value="">Silahkan Pilih</option>
                      {bentukOptions.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>

                    {errors.bentukInovasi && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.bentukInovasi.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tematik
                    </label>

                    <select
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      {...register("tematik", { required: "Wajib dipilih" })}
                    >
                      <option value="">Silahkan Pilih</option>
                      {tematikOptions.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>

                    {errors.tematik && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.tematik.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Urusan Utama
                    </label>

                    <select
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      {...register("urusanUtama", { required: "Wajib dipilih" })}
                    >
                      <option value="">Pilih...</option>
                      {urusanUtamaOptions.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>

                    {errors.urusanUtama && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.urusanUtama.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Urusan lain yang beririsan
                    </label>

                    <select
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      {...register("urusanIrisan")}
                    >
                      <option value="">Select...</option>
                      {urusanIrisanOptions.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waktu Inisiatif
                    </label>

                    <input
                      type="date"
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      {...register("waktuInisiatif", {
                        validate: (val) => {
                          if (!selectedTahap) return true;
                          if (tahapLevel[selectedTahap] >= 1) {
                            return val ? true : "Waktu Inisiatif wajib diisi";
                          }
                          return true;
                        },
                      })}
                    />

                    {errors.waktuInisiatif && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.waktuInisiatif.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waktu Uji Coba
                    </label>

                    <input
                      type="date"
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      {...register("waktuUjiCoba", {
                        validate: (val) => {
                          if (!selectedTahap) return true;
                          if (tahapLevel[selectedTahap] >= 2) {
                            return val ? true : "Waktu Uji Coba wajib diisi";
                          }
                          return true;
                        },
                      })}
                    />

                    {errors.waktuUjiCoba && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.waktuUjiCoba.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waktu Penerapan
                    </label>

                    <input
                      type="date"
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      {...register("waktuPenerapan", {
                        validate: (val) => {
                          if (!selectedTahap) return true;
                          if (tahapLevel[selectedTahap] >= 3) {
                            return val ? true : "Waktu Penerapan wajib diisi";
                          }
                          return true;
                        },
                      })}
                    />

                    {errors.waktuPenerapan && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.waktuPenerapan.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <h3 className="text-lg font-semibold border-b pb-2">
              Narasi & Dokumen
            </h3>

            <div className="space-y-6 mt-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Rancang bangun (Minimal 300 kata)
                </label>

                <textarea
                  placeholder="Tuliskan rancang bangun inovasi..."
                  className="mt-3 w-full h-44 rounded-lg border border-gray-300 px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-y"
                  {...register("rancangBangun", {
                    required: "Wajib diisi",
                    validate: (val) => {
                      const words = countWords(val);
                      return (
                        words >= 300 || `Minimal 300 kata (sekarang ${words})`
                      );
                    },
                  })}
                />

                <div className="mt-2 flex items-center justify-between">
                  {errors.rancangBangun ? (
                    <p className="text-xs text-red-500">
                      {errors.rancangBangun.message}
                    </p>
                  ) : (
                    <span className="text-xs text-gray-500">
                      Minimal 300 kata
                    </span>
                  )}

                  <span className="text-xs text-gray-500">
                    {countWords(watch("rancangBangun"))} kata
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tujuan inovasi daerah
                </label>

                <textarea
                  placeholder="Tuliskan tujuan inovasi..."
                  className="mt-3 w-full h-32 rounded-lg border border-gray-300 px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-y"
                  {...register("tujuan", { required: "Wajib diisi" })}
                />

                {errors.tujuan && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.tujuan.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Manfaat yang diperoleh
                </label>

                <textarea
                  placeholder="Tuliskan manfaat inovasi..."
                  className="mt-3 w-full h-32 rounded-lg border border-gray-300 px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-y"
                  {...register("manfaat", { required: "Wajib diisi" })}
                />

                {errors.manfaat && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.manfaat.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Hasil inovasi
                </label>

                <textarea
                  placeholder="Tuliskan hasil inovasi..."
                  className="mt-3 w-full h-32 rounded-lg border border-gray-300 px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-y"
                  {...register("hasil", { required: "Wajib diisi" })}
                />

                {errors.hasil && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.hasil.message}
                  </p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Anggaran (jika diperlukan) — PDF maks 2MB
                  </label>

                  <div className="mt-2 flex items-center gap-3">
                    <input
                      id="anggaranFile"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      {...register("anggaranFile", { validate: validatePdf2mb })}
                    />
                    <label
                      htmlFor="anggaranFile"
                      className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition cursor-pointer"
                    >
                      <UploadIcon className="w-4 h-4" />
                      Pilih File
                    </label>
                    <span className="text-xs text-gray-600 truncate">
                      {anggaranName}
                    </span>
                  </div>

                  {errors.anggaranFile && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.anggaranFile.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    PPT — PDF maks 2MB
                  </label>

                  <div className="mt-2 flex items-center gap-3">
                    <input
                      id="pptFile"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      {...register("pptFile", { validate: validatePdf2mb })}
                    />
                    <label
                      htmlFor="pptFile"
                      className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition cursor-pointer"
                    >
                      <UploadIcon className="w-4 h-4" />
                      Pilih File
                    </label>
                    <span className="text-xs text-gray-600 truncate">
                      {pptName}
                    </span>
                  </div>

                  {errors.pptFile && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.pptFile.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Dokumen HAKI — PDF maks 2MB
                  </label>

                  <div className="mt-2 flex items-center gap-3">
                    <input
                      id="hakiFile"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      {...register("hakiFile", { validate: validatePdf2mb })}
                    />
                    <label
                      htmlFor="hakiFile"
                      className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition cursor-pointer"
                    >
                      <UploadIcon className="w-4 h-4" />
                      Pilih File
                    </label>
                    <span className="text-xs text-gray-600 truncate">
                      {hakiName}
                    </span>
                  </div>

                  {errors.hakiFile && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.hakiFile.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Penghargaan — PDF maks 2MB
                  </label>

                  <div className="mt-2 flex items-center gap-3">
                    <input
                      id="penghargaanFile"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      {...register("penghargaanFile", {
                        validate: validatePdf2mb,
                      })}
                    />
                    <label
                      htmlFor="penghargaanFile"
                      className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition cursor-pointer"
                    >
                      <UploadIcon className="w-4 h-4" />
                      Pilih File
                    </label>
                    <span className="text-xs text-gray-600 truncate">
                      {penghargaanName}
                    </span>
                  </div>

                  {errors.penghargaanFile && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.penghargaanFile.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Proposal — PDF maks 2MB
                  </label>

                  <div className="mt-2 flex items-center gap-3">
                    <input
                      id="proposalFile"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      {...register("proposalFile", {
                        validate: validatePdf2mb,
                      })}
                    />
                    <label
                      htmlFor="proposalFile"
                      className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition cursor-pointer"
                    >
                      <UploadIcon className="w-4 h-4" />
                      Pilih File
                    </label>
                    <span className="text-xs text-gray-600 truncate">
                      {proposalName}
                    </span>
                  </div>

                  {errors.proposalFile && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.proposalFile.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-between pt-4">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft01Icon className="w-4 h-4" /> Kembali
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Batal
            </button>
          )}

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn-primary flex items-center gap-2"
            >
              Selanjutnya <ArrowRight01Icon className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loadingSubmit}
              className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <CheckmarkCircle02Icon className="w-4 h-4" />
              {loadingSubmit ? "Menyimpan..." : "Simpan"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FormDaftar;