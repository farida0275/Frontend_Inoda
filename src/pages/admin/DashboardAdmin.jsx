import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Users,
  Globe,
  GraduationCap,
  HeartPulse,
  Monitor,
  Leaf,
  Home,
  Lightbulb,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ;

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

const includesText = (value, keyword) =>
  String(value || "").toLowerCase().includes(keyword.toLowerCase());

const normalizeText = (value) =>
  String(value || "").trim().toLowerCase();

const getInovasiIcon = (name) => {
  const text = normalizeText(name);

  if (
    text.includes("daerah") ||
    text.includes("pemerintahan") ||
    text.includes("pelayanan publik")
  ) {
    return Globe;
  }

  if (
    text.includes("pendidikan") ||
    text.includes("sekolah") ||
    text.includes("pembelajaran")
  ) {
    return GraduationCap;
  }

  if (
    text.includes("kesehatan") ||
    text.includes("rumah sakit") ||
    text.includes("puskesmas")
  ) {
    return HeartPulse;
  }

  if (
    text.includes("website") ||
    text.includes("web") ||
    text.includes("digital") ||
    text.includes("aplikasi") ||
    text.includes("teknologi")
  ) {
    return Monitor;
  }

  if (
    text.includes("agribisnis") ||
    text.includes("energi") ||
    text.includes("pertanian") ||
    text.includes("peternakan") ||
    text.includes("pangan")
  ) {
    return Leaf;
  }

  if (
    text.includes("desa") ||
    text.includes("bumdes")
  ) {
    return Home;
  }

  if (
    text.includes("sosial") ||
    text.includes("budaya") ||
    text.includes("komunitas") ||
    text.includes("umkm")
  ) {
    return Users;
  }

  return Lightbulb;
};

const AdminDashboard = () => {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [inovasiList, setInovasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setServerError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Token login tidak ditemukan. Silakan login ulang.");
        }

        const [pesertaRes, inovasiRes] = await Promise.all([
          fetch(`${API_URL}/data-peserta`, {
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

        const pesertaResult = await pesertaRes.json();
        const inovasiResult = await inovasiRes.json();

        if (!pesertaRes.ok) {
          throw new Error(
            pesertaResult?.errors?.join(", ") ||
              pesertaResult?.message ||
              "Gagal mengambil data peserta."
          );
        }

        if (!inovasiRes.ok) {
          throw new Error(
            inovasiResult?.errors?.join(", ") ||
              inovasiResult?.message ||
              "Gagal mengambil data inovasi."
          );
        }

        const pesertaList = Array.isArray(pesertaResult?.data)
          ? pesertaResult.data
          : [];
        const masterInovasi = Array.isArray(inovasiResult?.data)
          ? inovasiResult.data
          : [];

        setRows(pesertaList);
        setInovasiList(masterInovasi);
      } catch (error) {
        console.error("Fetch dashboard error:", error);
        setServerError(
          error.message || "Gagal mengambil data dashboard dari server."
        );
        setRows([]);
        setInovasiList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return rows;

    return rows.filter((row) => {
      return (
        includesText(row.nama_pemda, keyword) ||
        includesText(row.nama_inovasi, keyword) ||
        includesText(row.tahapan_inovasi, keyword) ||
        includesText(row.urusan_utama, keyword) ||
        includesText(row.waktu_uji_coba, keyword) ||
        includesText(row.waktu_penerapan, keyword)
      );
    });
  }, [rows, search]);

  const stats = useMemo(() => {
    const cards = [
      {
        id: "total-peserta",
        title: "Total Peserta",
        value: rows.length,
        icon: Users,
      },
    ];

    const inovasiCards = inovasiList.map((inovasi) => {
      const jumlahPeserta = rows.filter(
        (item) =>
          normalizeText(item.nama_inovasi) === normalizeText(inovasi.name)
      ).length;

      return {
        id: inovasi.id,
        title: inovasi.name || "Inovasi",
        value: jumlahPeserta,
        icon: getInovasiIcon(inovasi.name),
      };
    });

    return [...cards, ...inovasiCards];
  }, [inovasiList, rows]);

  return (
    <div className="space-y-6 p-6 ">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">
          Dashboard Indeks Inovasi Daerah
        </h1>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <div className="col-span-full rounded-xl border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500 shadow">
            Memuat data dashboard...
          </div>
        ) : stats.length > 0 ? (
          stats.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow"
            >
              <item.icon className="h-8 w-8 text-purple-700" />
              <div>
                <p className="text-sm text-gray-500">{item.title}</p>
                <p className="text-xl font-semibold text-gray-900">
                  {item.value}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-xl border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500 shadow">
            Belum ada data dashboard.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pencarian"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-white shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Nama Pemda</th>
              <th className="px-4 py-3 text-left">Nama Inovasi</th>
              <th className="px-4 py-3 text-left">Tahapan</th>
              <th className="px-4 py-3 text-left">Urusan</th>
              <th className="px-4 py-3 text-left">Waktu Uji Coba</th>
              <th className="px-4 py-3 text-left">Waktu Penerapan</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr className="border-t">
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : filteredRows.length > 0 ? (
              filteredRows.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{row.nama_pemda || "-"}</td>
                  <td className="px-4 py-3">{row.nama_inovasi || "-"}</td>
                  <td className="px-4 py-3">{row.tahapan_inovasi || "-"}</td>
                  <td className="px-4 py-3">{row.urusan_utama || "-"}</td>
                  <td className="px-4 py-3">
                    {formatDate(row.waktu_uji_coba)}
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(row.waktu_penerapan)}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t">
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  Tidak ada data peserta.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;