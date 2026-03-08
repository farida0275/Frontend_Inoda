import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import logoakar from "../assets/logoakar.png";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6";
import vidio from "../assets/vidio.mp4";
import { motion } from "framer-motion";
import {
  Globe,
  GraduationCap,
  HeartPulse,
  Monitor,
  Leaf,
  Users,
  Home,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  X,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ;

const fallbackIcons = [
  Globe,
  GraduationCap,
  HeartPulse,
  Monitor,
  Leaf,
  Users,
  Home,
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const stripHtml = (text = "") => {
  return text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
};

const truncateText = (text = "", maxLength = 140) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};

const getTagFromBerita = (item) => {
  if (item?.status) {
    return item.status.charAt(0).toUpperCase() + item.status.slice(1);
  }
  if (item?.author) return item.author;
  return "Berita";
};

const getDetailHref = (id) => {
  if (!id) return "#";
  return `/berita/${id}`;
};

const LandingPage = () => {
  const year = useMemo(() => new Date().getFullYear(), []);

  const [newsItems, setNewsItems] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < 640) setVisibleCount(1);
      else if (w < 1024) setVisibleCount(2);
      else setVisibleCount(4);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useEffect(() => {
    const fetchBerita = async () => {
      try {
        setLoadingNews(true);

        const response = await fetch(`${API_URL}/berita`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.message || "Gagal mengambil data berita");
        }

        const beritaList = Array.isArray(result?.data) ? result.data : [];

        const mappedNews = beritaList
          .filter((item) => item?.status?.toLowerCase?.() === "published")
          .sort(
            (a, b) =>
              new Date(b.created_at || 0).getTime() -
              new Date(a.created_at || 0).getTime()
          )
          .map((item) => ({
            id: item.id,
            title: item.judul || "Tanpa Judul",
            excerpt: truncateText(stripHtml(item.konten || ""), 140),
            date: formatDate(item.created_at),
            tag: getTagFromBerita(item),
            href: getDetailHref(item.id),
            image: item.image_url || "",
          }));

        setNewsItems(mappedNews);
      } catch (error) {
        console.error("Fetch berita error:", error);
        setNewsItems([]);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchBerita();
  }, []);

  useEffect(() => {
    const fetchInovasi = async () => {
      try {
        setLoadingCategories(true);

        const response = await fetch(`${API_URL}/inovasi`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.message || "Gagal mengambil data inovasi");
        }

        const inovasiList = Array.isArray(result?.data) ? result.data : [];

        const mappedCategories = inovasiList.map((item, index) => ({
          id: item.id,
          title: item.name || "Tanpa Nama",
          icon: fallbackIcons[index % fallbackIcons.length],
          desc: item.name || "Innovation",
          detail: item.deskripsi || "Belum ada deskripsi inovasi.",
        }));

        setCategories(mappedCategories);
      } catch (error) {
        console.error("Fetch inovasi error:", error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchInovasi();
  }, []);

  const AUTO_MS = 5000;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const len = newsItems.length;

  const maxIndex = useMemo(() => {
    if (len <= visibleCount) return 0;
    return len - visibleCount;
  }, [len, visibleCount]);

  useEffect(() => {
    setIndex((i) => clamp(i, 0, maxIndex));
  }, [maxIndex]);

  const canSlide = len > visibleCount;

  const go = (nextIndex) => setIndex(clamp(nextIndex, 0, maxIndex));
  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  useEffect(() => {
    if (paused) return;
    if (!canSlide) return;

    timerRef.current = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, AUTO_MS);

    return () => clearInterval(timerRef.current);
  }, [paused, canSlide, maxIndex]);

  const dotsCount = maxIndex + 1;

  const [activeCategoryTitle, setActiveCategoryTitle] = useState(null);
  const toggleCategory = (title) =>
    setActiveCategoryTitle((t) => (t === title ? null : title));

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-purple-600/30 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-indigo-600/25 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-fuchsia-600/20 blur-3xl" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-purple-950/60 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img
              src={logoakar}
              alt="Logo Akar Ngawi"
              className="h-13 w-13 object-contain"
            />
            <img
              src={logo}
              alt="Logo BAPPEDA Kabupaten Ngawi"
              className="h-10 w-10 object-contain"
            />

            <div className="leading-none">
              <p className="text-white font-extrabold tracking-wide text-lg sm:text-xl">
                BAPPEDA
              </p>
              <p className="text-white/80 font-bold tracking-widest text-xs sm:text-sm">
                KABUPATEN NGAWI
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <a
              href="#home"
              className="px-3 py-2 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              Home
            </a>

            <a
              href="#about"
              className="px-3 py-2 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              About
            </a>
            <a
              href="#categories"
              className="px-3 py-2 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              Kategori
            </a>
            <a
              href="#news"
              className="px-3 py-2 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              Berita
            </a>
          </div>
        </div>
      </nav>

      <header className="relative" id="home">
        <section className="relative mx-auto max-w-7xl px-6 pt-10 pb-16 sm:pt-10 sm:pb-20 lg:pt-15 lg:pb-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="relative"
            >
              <motion.h1
                variants={fadeUp}
                className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl"
              >
                Ajang Kompetisi
                <br />
                <span className="text-white text-4xl">
                  Inovasi & Riset Ngawi {year}
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-5 max-w-xl text-base sm:text-lg text-white/80"
              >
                Wadah bagi masyarakat, pelajar, komunitas, dan instansi untuk
                menghadirkan solusi kreatif dan inovatif demi masa depan
                Kabupaten Ngawi yang lebih maju dan berdaya saing.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm sm:text-base font-semibold text-white border border-white/20 bg-white/10 hover:bg-white/15 transition"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm sm:text-base font-semibold text-purple-950 bg-white hover:bg-white/90 transition shadow-lg"
                >
                  Mulai Daftar
                  <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-8 grid grid-cols-2 gap-3 max-w-xl"
              >
                <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur p-4">
                  <p className="text-xs font-semibold text-white/60">Periode</p>
                  <p className="mt-1 text-sm font-bold text-white">{year}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-widest text-white/50">
                    Format
                  </p>
                  <p className="text-base font-semibold italic text-white">
                    Online Submission
                  </p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-gradient-to-r from-purple-600/35 to-indigo-500/30 blur-3xl"
                aria-hidden="true"
              />

              <div className="relative w-full max-w-xl">
                <div
                  className="absolute -inset-2 rounded-[32px] bg-gradient-to-br from-white/10 via-white/5 to-white/10 blur-xl"
                  aria-hidden="true"
                />
                <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/10 backdrop-blur shadow-2xl shadow-black/20">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                      <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                    </div>
                  </div>

                  <div className="p-6">
                    <img
                      src="/wakil.png"
                      alt="Bupati dan Wakil Bupati Ngawi"
                      className="mx-auto w-72 sm:w-80 lg:w-[520px] object-contain drop-shadow-2xl"
                      loading="eager"
                    />

                    <div className="mt-6 grid grid-cols-2 gap-6">
                      <div className="text-center pr-4 ml-4">
                        <p className="text-sm font-extrabold text-white">
                          (Ony Anwar Harsono)
                        </p>
                        <p className="text-xs font-semibold text-white/70">
                          Bupati Ngawi
                        </p>
                      </div>
                      <div className="text-center pl-4 border-l border-white/15">
                        <p className="text-sm font-extrabold text-white">
                          (Dwi Rianto Jatmiko)
                        </p>
                        <p className="text-xs font-semibold text-white/70">
                          Wakil Bupati Ngawi
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </header>

      <section
        id="about"
        className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:py-24"
      >
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/10 backdrop-blur shadow-2xl shadow-black/20">
              <div
                className="absolute -inset-2 rounded-[32px] bg-gradient-to-br from-white/10 via-white/5 to-white/10 blur-xl"
                aria-hidden="true"
              />
              <div className="relative">
                <video
                  src={vidio}
                  className="w-full h-[280px] sm:h-[340px] lg:h-[420px] object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="relative"
          >
            <motion.p
              variants={fadeUp}
              className="text-xl sm:text-xm font-bold tracking-[0.25em] text-white/70 uppercase"
            >
              About AKAR NGAWI
            </motion.p>

            <motion.h2
              variants={fadeUp}
              className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
            >
              AKAR NGAWI {year}
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mt-4 text-white/75 leading-relaxed"
            >
              AKAR NGAWI (Ajang Kompetisi inovAsi dan Riset Ngawi) adalah wadah
              kompetisi, apresiasi, dan replikasi inovasi daerah yang
              diselenggarakan oleh Pemerintah Kabupaten Ngawi melalui Bappeda.
              Program ini mendorong terobosan berbasis data, riset, dan inovasi
              untuk memperkuat daya saing daerah serta menghadirkan solusi nyata
              bagi masyarakat.
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="mt-4 text-white/75 leading-relaxed"
            >
              Dengan tema{" "}
              <span className="font-bold text-white">
                “Bertumbuh dari Riset, Berdampak untuk Rakyat”
              </span>
              , kompetisi ini berfokus pada inovasi di bidang pelayanan publik,
              tata kelola pemerintahan, ketahanan pangan & pertanian,
              digitalisasi & smart government, pemberdayaan masyarakat & desa,
              serta ekonomi kreatif & UMKM.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-2">
              {[
                "ROOTS",
                "Rethink.",
                "Origin.",
                "Optimize.",
                "Transform.",
                "Scale.",
              ].map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-white/90"
                >
                  #{t}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section
        id="categories"
        className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:py-24"
      >
        <div className="text-center">
          <h2 className="text-xl sm:text-xl font-bold tracking-[0.25em] text-white/80 uppercase">
            Kategori
          </h2>
          <p className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Ajang Kompetisi inovAsi dan Riset Ngawi
          </p>
          <p className="mt-4 max-w-xl mx-auto text-white/70">
            Klik tulisan <span className="font-bold text-white">Learn more</span>{" "}
            untuk membuka penjelasan singkat kategori.
          </p>
        </div>

        {loadingCategories ? (
          <div className="mt-12 text-center text-white/70">
            Memuat data inovasi...
          </div>
        ) : categories.length === 0 ? (
          <div className="mt-12 text-center text-white/70">
            Belum ada data inovasi yang ditampilkan.
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {categories.map((category) => {
              const Icon = category.icon;
              const expanded = activeCategoryTitle === category.title;

              return (
                <motion.div
                  key={category.id || category.title}
                  layout
                  variants={fadeUp}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  className={[
                    "rounded-3xl border bg-white/10 backdrop-blur p-6 transition relative overflow-hidden",
                    expanded
                      ? "border-white/30 bg-white/15 shadow-2xl shadow-black/30"
                      : "border-white/10 hover:bg-white/15",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-white/15 border border-white/10">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  <h3 className="mt-5 text-base font-bold text-white">
                    {category.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/70">{category.desc}</p>

                  <p className="mt-6">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleCategory(category.title)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          toggleCategory(category.title);
                        }
                      }}
                      className="inline-flex items-center gap-2 text-sm font-bold text-white/90 underline decoration-white/25 underline-offset-4 hover:text-white hover:decoration-white/60 transition cursor-pointer"
                    >
                      {expanded ? "Tutup" : "Learn more"}
                      {expanded ? (
                        <X className="h-4 w-4 text-white/70" />
                      ) : (
                        <ExternalLink className="h-4 w-4 text-white/70" />
                      )}
                    </span>
                  </p>

                  {expanded && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4"
                    >
                      <p className="text-sm text-white/80 leading-relaxed">
                        {category.detail}
                      </p>
                    </motion.div>
                  )}

                  {expanded && (
                    <div
                      className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl"
                      aria-hidden="true"
                    />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      <section id="news" className="relative">
        <div className="mx-auto max-w-7xl px-6 pb-16 sm:pb-20 lg:pb-24">
          <div
            className="relative overflow-hidden rounded-[36px] bg-white/10 border border-white/10 backdrop-blur text-white shadow-2xl shadow-black/20"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div
              className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold tracking-[0.25em] text-white/70 uppercase">
                    Berita & Highlight
                  </p>
                  <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Inovasi & Kegiatan BAPPEDA
                  </h2>
                </div>

                <div className="mt-4 sm:mt-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={prev}
                    disabled={!canSlide}
                    className={[
                      "h-10 w-10 rounded-2xl border transition flex items-center justify-center",
                      canSlide
                        ? "border-white/20 bg-white/10 hover:bg-white/15"
                        : "border-white/10 bg-white/5 opacity-60 cursor-not-allowed",
                    ].join(" ")}
                    aria-label="Sebelumnya"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    disabled={!canSlide}
                    className={[
                      "h-10 w-10 rounded-2xl border transition flex items-center justify-center",
                      canSlide
                        ? "border-white/20 bg-white/10 hover:bg-white/15"
                        : "border-white/10 bg-white/5 opacity-60 cursor-not-allowed",
                    ].join(" ")}
                    aria-label="Berikutnya"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {loadingNews ? (
                <div className="mt-8 text-sm text-white/70">Memuat berita...</div>
              ) : newsItems.length === 0 ? (
                <div className="mt-8 text-sm text-white/70">
                  Belum ada berita yang ditampilkan.
                </div>
              ) : (
                <>
                  <div className="mt-8 overflow-hidden">
                    <motion.div
                      className="flex items-stretch gap-4"
                      animate={{
                        x: `calc(${-index * (100 / visibleCount)}% - ${index * 1}rem)`,
                      }}
                      transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    >
                      {newsItems.map((item) => (
                        <Link
                          key={item.id || item.title}
                          to={item.href}
                          className={[
                            "shrink-0 rounded-3xl border overflow-hidden transition cursor-pointer",
                            "bg-white/10 border-white/10 hover:bg-white/15 hover:scale-[1.01]",
                          ].join(" ")}
                          style={{
                            width: `calc((100% - ${
                              (visibleCount - 1) * 1
                            }rem) / ${visibleCount})`,
                          }}
                        >
                          <div className="h-28 sm:h-32 w-full overflow-hidden bg-white/5">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-white/40 text-sm">
                                Tidak ada gambar
                              </div>
                            )}
                          </div>

                          <div className="p-4">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold">
                                {item.tag}
                              </span>
                              <span className="text-[11px] text-white/60">
                                {item.date}
                              </span>
                            </div>

                            <h3 className="mt-3 text-sm sm:text-base font-extrabold leading-snug">
                              {item.title}
                            </h3>
                            <p className="mt-2 text-xs sm:text-sm text-white/75 leading-relaxed line-clamp-3">
                              {item.excerpt}
                            </p>

                            <div className="mt-4 inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white">
                              Baca
                              <ExternalLink className="h-4 w-4 text-white/70" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-2">
                    {Array.from({ length: dotsCount }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => go(i)}
                        className={[
                          "h-2.5 rounded-full transition",
                          i === index
                            ? "w-7 bg-white"
                            : "w-2.5 bg-white/35 hover:bg-white/55",
                        ].join(" ")}
                        aria-label={`Posisi ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-12 bg-purple-800 px-5 py-8 text-white md:px-10">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-md">
            <h3 className="mb-2 text-lg font-semibold">Akar Ngawi</h3>
            <p className="text-sm leading-6 text-purple-100">
              Inovasi daerah mendorong pelayanan publik menjadi lebih cepat,
              transparan, dan berdampak nyata bagi masyarakat secara
              berkelanjutan.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Sosial Media</h4>
            <div className="flex items-center gap-3">
             <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-purple-800 hover:text-blue-600 hover:scale-110 transition"
              >
                <FaFacebookF size={16} />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-purple-800 hover:text-pink-500 hover:scale-110 transition"
              >
                <FaInstagram size={16} />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-purple-800 hover:text-black hover:scale-110 transition"
              >
                <FaTiktok size={16} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;