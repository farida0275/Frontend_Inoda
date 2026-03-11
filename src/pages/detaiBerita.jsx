import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa6";

import AOS from "aos";
import "aos/dist/aos.css";

const API_URL = import.meta.env.VITE_API_URL;

const formatTanggalIndonesia = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const splitKontenToParagraphs = (konten) => {
  if (!konten || typeof konten !== "string") return [];

  return konten
    .split(/\n{2,}|\r\n\r\n/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const DetailBerita = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [berita, setBerita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  useEffect(() => {
    const fetchDetailBerita = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const response = await fetch(`${API_URL}/berita/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.errors?.join(", ") ||
              result?.message ||
              "Gagal mengambil detail berita."
          );
        }

        setBerita(result?.data || null);
      } catch (error) {
        console.error(error);
        setErrorMsg(error.message || "Terjadi kesalahan saat mengambil berita.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetailBerita();
    }
  }, [id]);

  const paragraphs = useMemo(() => {
    return splitKontenToParagraphs(berita?.konten);
  }, [berita?.konten]);

  const sourceName = berita?.source_name?.trim?.() || "";
  const sourceUrl = berita?.source_url?.trim?.() || "";

  const firstParagraphWithSource = useMemo(() => {
    if (!paragraphs.length) return "";

    return paragraphs[0];
  }, [paragraphs]);

  const remainingParagraphs = useMemo(() => {
    if (!paragraphs.length) return [];
    return paragraphs.slice(1);
  }, [paragraphs]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8">
        <div
          data-aos="fade-down"
          className="mb-8 flex items-start justify-between gap-4"
        >
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 transition hover:text-purple-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>

          <div className="flex-1 text-center">
            <h1 className="mx-auto max-w-3xl text-xl font-bold leading-tight text-gray-900 md:text-3xl">
              {loading
                ? "Memuat detail berita..."
                : berita?.judul || "Detail Berita"}
            </h1>
          </div>

          <div className="w-[72px]" />
        </div>

        {loading ? (
          <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-gray-50 px-6 py-16 text-center text-gray-500">
            Memuat data berita...
          </div>
        ) : errorMsg ? (
          <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-600">
            {errorMsg}
          </div>
        ) : !berita ? (
          <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-gray-50 px-6 py-10 text-center text-gray-500">
            Data berita tidak ditemukan.
          </div>
        ) : (
          <>
            <div
              data-aos="zoom-in"
              className="mx-auto mb-8 max-w-4xl overflow-hidden rounded-2xl"
            >
              <img
                src={
                  berita.image_url ||
                  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80"
                }
                alt={berita.judul}
                className="h-[220px] w-full object-cover md:h-[380px]"
              />

              <div className="space-y-4 bg-white pt-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] uppercase tracking-wide text-gray-500 md:text-xs">
                  <span>{berita.author || "-"}</span>
                  <span className="hidden md:inline">•</span>
                  <span>{formatTanggalIndonesia(berita.created_at)}</span>
                  <span className="hidden md:inline">•</span>
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-purple-700">
                    {berita.status || "-"}
                  </span>
                </div>
              </div>
            </div>

            <div
              data-aos="fade-up"
              data-aos-delay="200"
              className="mx-auto max-w-4xl space-y-4 text-sm leading-8 text-gray-700 md:text-[17px]"
            >
              {firstParagraphWithSource ? (
                <>
                  <p>
                    {(sourceName || sourceUrl) && (
                      <>
                        {sourceName ? (
                          sourceUrl ? (
                            <a
                              href={sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mr-2 inline-flex items-center gap-1 font-bold uppercase tracking-wide text-slate-900 hover:text-purple-700 hover:underline"
                            >
                              {sourceName}
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="mr-2 font-bold uppercase tracking-wide text-slate-900">
                              {sourceName}
                            </span>
                          )
                        ) : sourceUrl ? (
                          <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mr-2 inline-flex items-center gap-1 font-bold uppercase tracking-wide text-slate-900 hover:text-purple-700 hover:underline"
                          >
                            Sumber
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : null}
                      </>
                    )}

                    {firstParagraphWithSource}
                  </p>

                  {remainingParagraphs.map((paragraf, index) => (
                    <p key={index}>{paragraf}</p>
                  ))}
                </>
              ) : (
                <p>
                  {(sourceName || sourceUrl) && (
                    <>
                      {sourceName ? (
                        sourceUrl ? (
                          <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mr-2 inline-flex items-center gap-1 font-bold uppercase tracking-wide text-slate-900 hover:text-purple-700 hover:underline"
                          >
                            {sourceName}
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="mr-2 font-bold uppercase tracking-wide text-slate-900">
                            {sourceName}
                          </span>
                        )
                      ) : sourceUrl ? (
                        <a
                          href={sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mr-2 inline-flex items-center gap-1 font-bold uppercase tracking-wide text-slate-900 hover:text-purple-700 hover:underline"
                        >
                          Sumber
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : null}
                    </>
                  )}

                  {berita.konten || "-"}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <footer
        data-aos="fade-up"
        data-aos-delay="300"
        className="mt-12 bg-purple-800 px-5 py-8 text-white md:px-10"
      >
        <div className="mx-auto flex max-w-5xl flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-md">
            <h3 className="mb-2 text-lg font-semibold">Akar Ngawi</h3>
            <p className="text-sm leading-6 text-purple-100">
              Inovasi daerah mendorong pelayanan publik menjadi lebih cepat,
              transparan, dan berdampak nyata bagi masyarakat.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Sosial Media</h4>

            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/Bappeda.Kabupaten.Ngawi/"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-purple-800 transition hover:scale-110 hover:text-blue-600"
              >
                <FaFacebookF size={16} />
              </a>

              <a
                href="https://www.instagram.com/bappedangawi/"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-purple-800 transition hover:scale-110 hover:text-pink-500"
              >
                <FaInstagram size={16} />
              </a>

              <a
                href="https://www.youtube.com/channel/UC16D3Jc6lDIhzB5Hh3pXm_A"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-purple-800 transition hover:scale-110 hover:text-black"
              >
                <FaYoutube size={16} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DetailBerita;