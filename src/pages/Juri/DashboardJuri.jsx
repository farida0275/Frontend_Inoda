import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  Globe,
  GraduationCap,
  HeartPulse,
  Monitor,
  Leaf,
  Home,
  Search,
} from "lucide-react";

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

const includesText = (value, keyword) =>
  String(value || "").toLowerCase().includes(keyword.toLowerCase());

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const JuriDashboard = () => {
  const [activeTab, setActiveTab] = useState("Semua");
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

        const [pesertaResponse, inovasiResponse] = await Promise.all([
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

        const pesertaResult = await pesertaResponse.json();
        const inovasiResult = await inovasiResponse.json();

        if (!pesertaResponse.ok) {
          throw new Error(
            pesertaResult?.errors?.join(", ") ||
              pesertaResult?.message ||
              "Gagal mengambil data peserta."
          );
        }

        if (!inovasiResponse.ok) {
          throw new Error(
            inovasiResult?.errors?.join(", ") ||
              inovasiResult?.message ||
              "Gagal mengambil data inovasi."
          );
        }

        const pesertaList = Array.isArray(pesertaResult?.data)
          ? pesertaResult.data
          : [];
        const inovasiData = Array.isArray(inovasiResult?.data)
          ? inovasiResult.data
          : [];

        setRows(pesertaList);
        setInovasiList(inovasiData);
      } catch (error) {
        console.error("Fetch data peserta error:", error);
        setServerError(
          error.message || "Gagal mengambil data peserta dari server."
        );
        setRows([]);
        setInovasiList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const kategoriMap = useMemo(() => {
    const map = new Map();

    inovasiList.forEach((item) => {
      map.set(String(item.id), item.name || "-");
    });

    return map;
  }, [inovasiList]);

  const rowsWithKategori = useMemo(() => {
    return rows.map((row) => ({
      ...row,
      kategori_nama: kategoriMap.get(String(row.kategori)) || "-",
    }));
  }, [rows, kategoriMap]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return rowsWithKategori;

    return rowsWithKategori.filter((row) => {
      return (
        includesText(row.nama_inisiator, keyword) ||
        includesText(row.nama_inovasi, keyword) ||
        includesText(row.kategori_nama, keyword) ||
        includesText(row.tahapan_inovasi, keyword) ||
        includesText(row.urusan_utama, keyword) ||
        includesText(row.waktu_pengembangan, keyword) ||
        includesText(row.waktu_uji_coba, keyword) ||
        includesText(row.waktu_penerapan, keyword)
      );
    });
  }, [rowsWithKategori, search]);

  const stats = useMemo(() => {
    const countByKategoriName = (targetNames) => {
      const normalizedTargets = targetNames.map((item) => normalizeText(item));

      return rowsWithKategori.filter((item) =>
        normalizedTargets.includes(normalizeText(item.kategori_nama))
      ).length;
    };

    return [
      { title: "Total Peserta", value: rowsWithKategori.length, icon: Users },
      {
        title: "Inovasi Daerah",
        value: countByKategoriName(["Inovasi Daerah"]),
        icon: Globe,
      },
      {
        title: "Inovasi Pendidikan",
        value: countByKategoriName(["Inovasi Pendidikan"]),
        icon: GraduationCap,
      },
      {
        title: "Inovasi Kesehatan",
        value: countByKategoriName(["Inovasi Kesehatan"]),
        icon: HeartPulse,
      },
      {
        title: "Inovasi Berbasis Website",
        value: countByKategoriName(["Inovasi Berbasis Website"]),
        icon: Monitor,
      },
      {
        title: "Inovasi Agribisnis & Energi",
        value: countByKategoriName(["Inovasi Agribisnis & Energi"]),
        icon: Leaf,
      },
      {
        title: "Inovasi Sosial Budaya",
        value: countByKategoriName(["Inovasi Sosial Budaya"]),
        icon: Users,
      },
      {
        title: "Inovasi Desa",
        value: countByKategoriName(["Inovasi Desa"]),
        icon: Home,
      },
    ];
  }, [rowsWithKategori]);

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
              <th className="px-4 py-3 text-left">Nama Peserta</th>
              <th className="px-4 py-3 text-left">Nama Inovasi</th>
              <th className="px-4 py-3 text-left">Kategori</th>
              <th className="px-4 py-3 text-left">Tahapan</th>
              <th className="px-4 py-3 text-left">Urusan</th>
              <th className="px-4 py-3 text-left">Waktu Inisiatif</th>
              <th className="px-4 py-3 text-left">Waktu Uji Coba</th>
              <th className="px-4 py-3 text-left">Waktu Penerapan</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr className="border-t">
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : filteredRows.length > 0 ? (
              filteredRows.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{row.nama_inisiator || "-"}</td>
                  <td className="px-4 py-3">{row.nama_inovasi || "-"}</td>
                  <td className="px-4 py-3">{row.kategori_nama || "-"}</td>
                  <td className="px-4 py-3">{row.tahapan_inovasi || "-"}</td>
                  <td className="px-4 py-3">{row.urusan_utama || "-"}</td>
                  <td className="px-4 py-3">
                    {formatDate(row.waktu_pengembangan)}
                  </td>
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
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
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

export default JuriDashboard;