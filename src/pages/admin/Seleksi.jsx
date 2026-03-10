import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const TABS = [
  { key: "all", label: "Semua" },
  { key: "administratif", label: "Seleksi Administratif" },
  { key: "semifinal", label: "Semi Final" },
  { key: "final", label: "Final" },
];

const stageLabel = (key) => {
  if (key === "administratif") return "Seleksi Administratif";
  if (key === "semifinal") return "Semi Final";
  if (key === "final") return "Final";
  return "Semua";
};

const statusStyle = (status) => {
  if (status === "Lolos") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (status === "Tidak Lolos") {
    return "bg-red-50 text-red-700 border-red-200";
  }
  return "bg-amber-50 text-amber-700 border-amber-200";
};

const formatScore = (value) => {
  const num = Number(value || 0);
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(2);
};

const getNextStage = (currentStage) => {
  if (currentStage === "all") return "administratif";
  if (currentStage === "administratif") return "semifinal";
  if (currentStage === "semifinal") return "final";
  return "final";
};

const SeleksiPeserta = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [q, setQ] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const fetchSeleksiData = async () => {
      try {
        setLoading(true);
        setServerError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Token login tidak ditemukan. Silakan login ulang.");
        }

        const [pesertaRes, penilaianRes] = await Promise.all([
          fetch(`${API_URL}/data-peserta`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/penilaian`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const pesertaText = await pesertaRes.text();
        const penilaianText = await penilaianRes.text();

        let pesertaResult = {};
        let penilaianResult = {};

        try {
          pesertaResult = JSON.parse(pesertaText);
        } catch {
          throw new Error("Response data peserta bukan JSON.");
        }

        try {
          penilaianResult = JSON.parse(penilaianText);
        } catch {
          throw new Error("Response penilaian bukan JSON.");
        }

        if (!pesertaRes.ok) {
          throw new Error(
            pesertaResult?.errors?.join(", ") ||
              pesertaResult?.message ||
              "Gagal mengambil data peserta."
          );
        }

        if (!penilaianRes.ok) {
          throw new Error(
            penilaianResult?.errors?.join(", ") ||
              penilaianResult?.message ||
              "Gagal mengambil data penilaian."
          );
        }

        const pesertaList = Array.isArray(pesertaResult?.data)
          ? pesertaResult.data
          : [];
        const penilaianList = Array.isArray(penilaianResult?.data)
          ? penilaianResult.data
          : [];

        const mapped = pesertaList.map((item) => {
          const penilaianPeserta = penilaianList.filter(
            (nilai) => Number(nilai.peserta_id) === Number(item.id)
          );

          const totalNilai = penilaianPeserta.reduce(
            (sum, nilai) => sum + Number(nilai.skor || 0),
            0
          );

          const rataRata3Juri = totalNilai / 3;

          return {
            id: item.id,
            namaInisiator: item.nama_inisiator || "-",
            namaInovasi: item.nama_inovasi || "-",
            tahapSeleksi: item.tahap_seleksi || "all",
            urusan: item.urusan_utama || "-",
            tglDaftar: item.created_at || "",
            status: item.status_seleksi || "Diproses",
            skor: rataRata3Juri,
          };
        });

        setData(mapped);
      } catch (error) {
        console.error("Fetch data seleksi error:", error);
        setServerError(
          error.message || "Terjadi kesalahan saat mengambil data seleksi."
        );
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSeleksiData();
  }, []);

  const handleStatusChange = async (id, value) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Token login tidak ditemukan. Silakan login ulang.");
        return;
      }

      const currentRow = data.find((item) => item.id === id);
      if (!currentRow) return;

      let nextTahap = currentRow.tahapSeleksi;
      let nextStatus = value;

      // hanya naik tahap kalau pilih LOL0S
      if (value === "Lolos") {
        if (currentRow.tahapSeleksi === "final") {
          nextTahap = "final";
          nextStatus = "Lolos";
        } else {
          nextTahap = getNextStage(currentRow.tahapSeleksi);
          nextStatus = "Diproses";
        }
      }

      // kalau Diproses / Tidak Lolos => tetap di tahap sekarang
      if (value === "Diproses") {
        nextTahap = currentRow.tahapSeleksi;
        nextStatus = "Diproses";
      }

      if (value === "Tidak Lolos") {
        nextTahap = currentRow.tahapSeleksi;
        nextStatus = "Tidak Lolos";
      }

      const response = await fetch(`${API_URL}/data-peserta/${id}/seleksi`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tahap_seleksi: nextTahap,
          status_seleksi: nextStatus,
        }),
      });

      const text = await response.text();
      console.log("RAW RESPONSE SELEKSI:", text);

      let result = {};
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          `Response backend bukan JSON. Cek route /data-peserta/${id}/seleksi`
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.errors?.join(", ") ||
            result?.message ||
            "Gagal mengubah status seleksi."
        );
      }

      setData((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                tahapSeleksi: nextTahap,
                status: nextStatus,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Update seleksi error:", error);
      alert(error.message || "Gagal mengubah status seleksi.");
    }
  };

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();

    return data.filter((row) => {
      // TAB Semua hanya untuk stage "all"
      const tabOk = row.tahapSeleksi === activeTab;

      const searchOk =
        !keyword ||
        row.namaInisiator.toLowerCase().includes(keyword) ||
        row.namaInovasi.toLowerCase().includes(keyword);

      return tabOk && searchOk;
    });
  }, [activeTab, q, data]);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-extrabold text-slate-900">
        Seleksi Peserta
      </h1>

      <div className="relative mb-4">
        <div className="absolute left-0 right-0 bottom-0 h-px bg-slate-200" />

        <div className="flex items-end gap-2">
          {TABS.map((t) => {
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={[
                  "relative px-4 py-2 text-sm font-semibold rounded-t-md transition",
                  active
                    ? "bg-white text-slate-900 border border-slate-200 border-b-0"
                    : "bg-slate-50 text-slate-600 border border-transparent hover:text-slate-900 hover:bg-slate-100",
                ].join(" ")}
              >
                {t.label}
                {active && (
                  <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Tahapan:{" "}
            <span className="font-semibold text-slate-700">
              {stageLabel(activeTab)}
            </span>{" "}
            • Total: <span className="font-semibold">{filtered.length}</span>
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pencarian..."
              className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {serverError && (
          <div className="px-5 pb-4">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {serverError}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr className="border-t border-slate-200">
                <th className="px-5 py-3 text-left w-14">#</th>
                <th className="px-5 py-3 text-left">Nama Pemda</th>
                <th className="px-5 py-3 text-left">Nama Inovasi</th>
                <th className="px-5 py-3 text-left">Tahapan</th>
                <th className="px-5 py-3 text-left w-24">Skor</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Data tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-slate-600">{idx + 1}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {row.namaInisiator}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {row.namaInovasi}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {stageLabel(row.tahapSeleksi)}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {formatScore(row.skor)}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={row.status}
                        onChange={(e) =>
                          handleStatusChange(row.id, e.target.value)
                        }
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${statusStyle(
                          row.status
                        )}`}
                      >
                        <option value="Diproses">Diproses</option>
                        <option value="Lolos">Lolos</option>
                        <option value="Tidak Lolos">Tidak Lolos</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SeleksiPeserta;