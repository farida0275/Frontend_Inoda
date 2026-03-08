import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Globe,
  GraduationCap,
  HeartPulse,
  Monitor,
  Leaf,
  Home,
  Plus,
  Search,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://backend-inoda.vercel.app/api";

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

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("Semua");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const fetchDataPeserta = async () => {
      try {
        setLoading(true);
        setServerError("");

        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/data-peserta`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.errors?.join(", ") ||
              result?.message ||
              "Gagal mengambil data peserta."
          );
        }

        const list = Array.isArray(result?.data) ? result.data : [];
        setRows(list);
      } catch (error) {
        console.error("Fetch data peserta error:", error);
        setServerError(
          error.message || "Gagal mengambil data peserta dari server."
        );
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDataPeserta();
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
    const uniqueParticipants = new Set(
      rows
        .map((item) => item.nama_pemda)
        .filter((item) => item && String(item).trim() !== "")
    ).size;

    const countByKeyword = (keywords) =>
      rows.filter((item) => {
        const source = [
          item.nama_inovasi,
          item.urusan_utama,
          item.tematik,
          item.bentuk_inovasi,
          item.jenis_inovasi,
        ]
          .join(" ")
          .toLowerCase();

        return keywords.some((keyword) => source.includes(keyword));
      }).length;

    return [
      { title: "Jumlah Partisipan", value: uniqueParticipants, icon: Users },
      {
        title: "Inovasi Daerah",
        value: countByKeyword(["daerah", "pemerintahan", "pelayanan publik"]),
        icon: Globe,
      },
      {
        title: "Inovasi Pendidikan",
        value: countByKeyword(["pendidikan", "sekolah", "pembelajaran"]),
        icon: GraduationCap,
      },
      {
        title: "Inovasi Kesehatan",
        value: countByKeyword(["kesehatan", "rumah sakit", "puskesmas"]),
        icon: HeartPulse,
      },
      {
        title: "Inovasi Berbasis Website",
        value: countByKeyword(["website", "web", "digital", "aplikasi"]),
        icon: Monitor,
      },
      {
        title: "Inovasi Agribisnis & Energi",
        value: countByKeyword([
          "agribisnis",
          "energi",
          "pertanian",
          "peternakan",
          "pangan",
        ]),
        icon: Leaf,
      },
      {
        title: "Inovasi Sosial Budaya",
        value: countByKeyword(["sosial", "budaya", "komunitas", "umkm"]),
        icon: Users,
      },
      {
        title: "Inovasi Desa",
        value: countByKeyword(["desa", "bumdes"]),
        icon: Home,
      },
    ];
  }, [rows]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Dashboard Indeks Inovasi Daerah
        </h1>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, i) => (
          <div
            key={i}
            className="bg-white shadow rounded-xl border border-gray-100 p-5 flex items-center gap-4"
          >
            <item.icon className="w-8 h-8 text-purple-700" />
            <div>
              <p className="text-sm text-gray-500">{item.title}</p>
              <p className="text-xl font-semibold text-gray-900">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Pencarian"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <Link
          to="/FormDaftar"
          className="flex items-center gap-2 bg-purple-900 hover:bg-purple-800 text-white px-4 py-2 rounded-lg shadow"
        >
          <Plus className="w-4 h-4" />
          Tambah Inovasi Daerah
        </Link>
      </div>

      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {serverError}
        </div>
      )}

      <div className="bg-white border rounded-xl shadow overflow-hidden">
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

export default UserDashboard;