import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  User,
  Newspaper,
  Lightbulb,
  Plus,
  ClipboardList,
} from "lucide-react";

import TambahUser from "./Form/tambahUser";
import EditUser from "./Form/editUser";
import TambahBerita from "./Form/tambahBerita";
import EditBerita from "./Form/editBerita";
import TambahInovasi from "./Form/tambahInovasi";
import EditInovasi from "./Form/editInovasi";

import UserTable from "./pengaturan/user";
import BeritaTable from "./pengaturan/berita";
import InovasiTable from "./pengaturan/inovasi";
import PenugasanJuriTable from "./pengaturan/penugasanjuri";

const API_URL = import.meta.env.VITE_API_URL;

const TABS = [
  { key: "user", label: "User", icon: User },
  { key: "berita", label: "Berita", icon: Newspaper },
  { key: "inovasi", label: "Inovasi", icon: Lightbulb },
  { key: "penugasan", label: "Penugasan Juri", icon: ClipboardList },
];

const SEED = {
  user: [],
  berita: [],
  inovasi: [],
  peserta: [],
  penugasan: [],
};

const TableShell = ({ children }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    {children}
  </div>
);

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const mapUserFromApi = (item) => ({
  id: item.id,
  nama: item.nama || "-",
  email: item.email || "-",
  role: item.role || "user",
});

const mapBeritaFromApi = (item) => ({
  id: item.id,
  judul: item.judul || "-",
  kategori: item.status || "-",
  tanggal: formatDate(item.created_at),
  konten: item.konten || "",
  author: item.author || "",
  status: item.status || "draft",
  image_url: item.image_url || "",
});

const mapInovasiFromApi = (item) => ({
  id: item.id,
  kategori: item.name || "-",
  deskripsi: item.deskripsi || "-",
});

const mapPesertaFromApi = (item) => ({
  id: item.id,
  namaInisiator: item.nama_inisiator || "-",
  namaInovasi: item.nama_inovasi || "-",
  tahapan: item.tahapan_inovasi || "-",
  urusan: item.urusan_utama || "-",
});

const mapPenugasanFromApi = (item) => ({
  id: item.id,
  peserta_id: Number(item.peserta_id),
  inovasi_id: Number(item.inovasi_id),
  juri_id: Number(item.juri_id),
  slot_penilai: Number(item.slot_penilai),
  created_at: item.created_at || "",
});

const Pengaturan = () => {
  const [activeTab, setActiveTab] = useState("user");
  const [q, setQ] = useState("");
  const [data, setData] = useState(SEED);

  const [loadingUser, setLoadingUser] = useState(false);
  const [userError, setUserError] = useState("");

  const [loadingBerita, setLoadingBerita] = useState(false);
  const [beritaError, setBeritaError] = useState("");

  const [loadingInovasi, setLoadingInovasi] = useState(false);
  const [inovasiError, setInovasiError] = useState("");

  const [loadingPeserta, setLoadingPeserta] = useState(false);
  const [pesertaError, setPesertaError] = useState("");

  const [loadingPenugasan, setLoadingPenugasan] = useState(false);
  const [penugasanError, setPenugasanError] = useState("");

  const [penugasanForm, setPenugasanForm] = useState({
    juri_id: "",
    inovasi_id: "",
    slot_penilai: "1",
  });

  const [openTambahUser, setOpenTambahUser] = useState(false);
  const [openEditUser, setOpenEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [openTambahBerita, setOpenTambahBerita] = useState(false);
  const [openEditBerita, setOpenEditBerita] = useState(false);
  const [selectedBerita, setSelectedBerita] = useState(null);

  const [openTambahInovasi, setOpenTambahInovasi] = useState(false);
  const [openEditInovasi, setOpenEditInovasi] = useState(false);
  const [selectedInovasi, setSelectedInovasi] = useState(null);

  const tabLabel = useMemo(
    () => TABS.find((t) => t.key === activeTab)?.label || "Pengaturan",
    [activeTab]
  );

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      setLoadingUser(true);
      setUserError("");

      if (!token) {
        throw new Error("Token login tidak ditemukan. Silakan login ulang.");
      }

      const response = await fetch(`${API_URL}/users`, {
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
            "Gagal mengambil data user."
        );
      }

      const list = Array.isArray(result?.data) ? result.data : [];

      setData((prev) => ({
        ...prev,
        user: list.map(mapUserFromApi),
      }));
    } catch (error) {
      console.error("Fetch user error:", error);
      setUserError(
        error.message || "Terjadi kesalahan saat mengambil data user."
      );
      setData((prev) => ({
        ...prev,
        user: [],
      }));
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchBerita = async () => {
    try {
      setLoadingBerita(true);
      setBeritaError("");

      const response = await fetch(`${API_URL}/berita`, {
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
            "Gagal mengambil data berita."
        );
      }

      const list = Array.isArray(result?.data) ? result.data : [];

      setData((prev) => ({
        ...prev,
        berita: list.map(mapBeritaFromApi),
      }));
    } catch (error) {
      console.error("Fetch berita error:", error);
      setBeritaError(
        error.message || "Terjadi kesalahan saat mengambil data berita."
      );
      setData((prev) => ({
        ...prev,
        berita: [],
      }));
    } finally {
      setLoadingBerita(false);
    }
  };

  const fetchInovasi = async () => {
    try {
      setLoadingInovasi(true);
      setInovasiError("");

      const response = await fetch(`${API_URL}/inovasi`, {
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
            "Gagal mengambil data inovasi."
        );
      }

      const list = Array.isArray(result?.data) ? result.data : [];

      setData((prev) => ({
        ...prev,
        inovasi: list.map(mapInovasiFromApi),
      }));
    } catch (error) {
      console.error("Fetch inovasi error:", error);
      setInovasiError(
        error.message || "Terjadi kesalahan saat mengambil data inovasi."
      );
      setData((prev) => ({
        ...prev,
        inovasi: [],
      }));
    } finally {
      setLoadingInovasi(false);
    }
  };

  const fetchPeserta = async () => {
    try {
      setLoadingPeserta(true);
      setPesertaError("");

      if (!token) {
        throw new Error("Token login tidak ditemukan. Silakan login ulang.");
      }

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

      setData((prev) => ({
        ...prev,
        peserta: list.map(mapPesertaFromApi),
      }));
    } catch (error) {
      console.error("Fetch peserta error:", error);
      setPesertaError(
        error.message || "Terjadi kesalahan saat mengambil data peserta."
      );
      setData((prev) => ({
        ...prev,
        peserta: [],
      }));
    } finally {
      setLoadingPeserta(false);
    }
  };

  const fetchPenugasan = async () => {
    try {
      setLoadingPenugasan(true);
      setPenugasanError("");

      if (!token) {
        throw new Error("Token login tidak ditemukan. Silakan login ulang.");
      }

      const response = await fetch(`${API_URL}/penugasan-juri`, {
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
            "Gagal mengambil data penugasan juri."
        );
      }

      const list = Array.isArray(result?.data) ? result.data : [];

      setData((prev) => ({
        ...prev,
        penugasan: list.map(mapPenugasanFromApi),
      }));
    } catch (error) {
      console.error("Fetch penugasan error:", error);
      setPenugasanError(
        error.message || "Terjadi kesalahan saat mengambil data penugasan."
      );
      setData((prev) => ({
        ...prev,
        penugasan: [],
      }));
    } finally {
      setLoadingPenugasan(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBerita();
    fetchInovasi();
    fetchPeserta();
    fetchPenugasan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userRows = useMemo(() => data.user || [], [data.user]);
  const beritaRows = useMemo(() => data.berita || [], [data.berita]);
  const inovasiRows = useMemo(() => data.inovasi || [], [data.inovasi]);
  const pesertaRows = useMemo(() => data.peserta || [], [data.peserta]);

  const juriOptions = useMemo(
    () => userRows.filter((u) => u.role === "juri"),
    [userRows]
  );

  const penugasanRows = useMemo(() => {
    return (data.penugasan || []).map((item) => {
      const peserta = pesertaRows.find(
        (p) => Number(p.id) === Number(item.peserta_id)
      );
      const inovasi = inovasiRows.find(
        (i) => Number(i.id) === Number(item.inovasi_id)
      );
      const juri = userRows.find((u) => Number(u.id) === Number(item.juri_id));

      return {
        ...item,
        namaInisiator: peserta?.namaInisiator || "-",
        namaInovasiPeserta: peserta?.namaInovasi || "-",
        kategoriInovasi: inovasi?.kategori || "-",
        namaJuri: juri?.nama || "-",
        emailJuri: juri?.email || "-",
        tanggal: formatDate(item.created_at),
      };
    });
  }, [data.penugasan, pesertaRows, inovasiRows, userRows]);

  const inovasiPenugasanRows = useMemo(() => {
    return inovasiRows.map((inovasi) => {
      const slot1 = data.penugasan.some(
        (p) =>
          Number(p.inovasi_id) === Number(inovasi.id) &&
          Number(p.slot_penilai) === 1
      );
      const slot2 = data.penugasan.some(
        (p) =>
          Number(p.inovasi_id) === Number(inovasi.id) &&
          Number(p.slot_penilai) === 2
      );
      const slot3 = data.penugasan.some(
        (p) =>
          Number(p.inovasi_id) === Number(inovasi.id) &&
          Number(p.slot_penilai) === 3
      );

      return {
        ...inovasi,
        assignedSlot1: slot1,
        assignedSlot2: slot2,
        assignedSlot3: slot3,
      };
    });
  }, [inovasiRows, data.penugasan]);

  const rows = useMemo(() => {
    if (activeTab === "user") return userRows;
    if (activeTab === "berita") return beritaRows;
    if (activeTab === "inovasi") return inovasiRows;
    if (activeTab === "penugasan") return penugasanRows;
    return [];
  }, [activeTab, userRows, beritaRows, inovasiRows, penugasanRows]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;

    return rows.filter((r) =>
      Object.values(r).some((val) =>
        String(val ?? "")
          .toLowerCase()
          .includes(s)
      )
    );
  }, [q, rows]);

  const filteredInovasiForAssign = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return inovasiPenugasanRows;

    return inovasiPenugasanRows.filter((r) =>
      Object.values(r).some((val) =>
        String(val ?? "")
          .toLowerCase()
          .includes(s)
      )
    );
  }, [q, inovasiPenugasanRows]);

  const selectedInovasiMeta = useMemo(() => {
    return inovasiRows.find(
      (item) => Number(item.id) === Number(penugasanForm.inovasi_id)
    );
  }, [inovasiRows, penugasanForm.inovasi_id]);

  const selectedSlotOccupied = useMemo(() => {
    const slot = Number(penugasanForm.slot_penilai);
    if (!penugasanForm.inovasi_id) return false;

    const row = inovasiPenugasanRows.find(
      (item) => Number(item.id) === Number(penugasanForm.inovasi_id)
    );

    if (!row) return false;
    if (slot === 1) return row.assignedSlot1;
    if (slot === 2) return row.assignedSlot2;
    return row.assignedSlot3;
  }, [inovasiPenugasanRows, penugasanForm.inovasi_id, penugasanForm.slot_penilai]);

  const handleTambah = () => {
    if (activeTab === "user") {
      setOpenTambahUser(true);
      return;
    }

    if (activeTab === "berita") {
      setOpenTambahBerita(true);
      return;
    }

    if (activeTab === "inovasi") {
      setOpenTambahInovasi(true);
    }
  };

  const handleAssignByInovasi = async () => {
    try {
      if (!token) {
        alert("Token login tidak ditemukan. Silakan login ulang.");
        return;
      }

      if (
        !penugasanForm.juri_id ||
        !penugasanForm.inovasi_id ||
        !penugasanForm.slot_penilai
      ) {
        alert("Pilih juri, inovasi, dan slot penilai terlebih dahulu.");
        return;
      }

      if (selectedSlotOccupied) {
        alert("Slot untuk inovasi ini sudah terisi.");
        return;
      }

      const response = await fetch(`${API_URL}/penugasan-juri/by-inovasi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          juri_id: Number(penugasanForm.juri_id),
          inovasi_id: Number(penugasanForm.inovasi_id),
          slot_penilai: Number(penugasanForm.slot_penilai),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.errors?.join(", ") ||
            result?.message ||
            "Gagal menambah penugasan juri."
        );
      }

      await fetchPenugasan();
      await fetchPeserta();

      setPenugasanForm({
        juri_id: "",
        inovasi_id: "",
        slot_penilai: "1",
      });

      alert("Penugasan juri berhasil ditambahkan.");
    } catch (error) {
      console.error("Assign by inovasi error:", error);
      alert(error.message || "Gagal menambah penugasan juri.");
    }
  };

  const handleRoleChange = async (id, value) => {
    try {
      if (!token) {
        alert("Token login tidak ditemukan. Silakan login ulang.");
        return;
      }

      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: (() => {
          const formData = new FormData();
          formData.append("role", value);
          return formData;
        })(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.errors?.join(", ") ||
            result?.message ||
            "Gagal mengubah role user."
        );
      }

      const updatedUser = mapUserFromApi(result?.data || {});

      setData((prev) => ({
        ...prev,
        user: prev.user.map((u) => (u.id === id ? updatedUser : u)),
      }));
    } catch (error) {
      console.error("Update role user error:", error);
      alert(error.message || "Gagal mengubah role user.");
    }
  };

  const handleHapus = async (tabKey, id) => {
    if (tabKey === "user") {
      try {
        if (!token) {
          alert("Token login tidak ditemukan. Silakan login ulang.");
          return;
        }

        const confirmed = window.confirm("Yakin ingin menghapus user ini?");
        if (!confirmed) return;

        const response = await fetch(`${API_URL}/users/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.errors?.join(", ") ||
              result?.message ||
              "Gagal menghapus user."
          );
        }

        setData((prev) => ({
          ...prev,
          user: prev.user.filter((x) => x.id !== id),
        }));
      } catch (error) {
        console.error("Hapus user error:", error);
        alert(error.message || "Gagal menghapus user.");
      }
      return;
    }

    if (tabKey === "berita") {
      try {
        if (!token) {
          alert("Token login tidak ditemukan. Silakan login ulang.");
          return;
        }

        const confirmed = window.confirm("Yakin ingin menghapus berita ini?");
        if (!confirmed) return;

        const response = await fetch(`${API_URL}/berita/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.errors?.join(", ") ||
              result?.message ||
              "Gagal menghapus berita."
          );
        }

        setData((prev) => ({
          ...prev,
          berita: prev.berita.filter((x) => x.id !== id),
        }));
      } catch (error) {
        console.error("Hapus berita error:", error);
        alert(error.message || "Gagal menghapus berita.");
      }
      return;
    }

    if (tabKey === "inovasi") {
      try {
        if (!token) {
          alert("Token login tidak ditemukan. Silakan login ulang.");
          return;
        }

        const confirmed = window.confirm("Yakin ingin menghapus inovasi ini?");
        if (!confirmed) return;

        const response = await fetch(`${API_URL}/inovasi/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.errors?.join(", ") ||
              result?.message ||
              "Gagal menghapus inovasi."
          );
        }

        setData((prev) => ({
          ...prev,
          inovasi: prev.inovasi.filter((x) => x.id !== id),
        }));
      } catch (error) {
        console.error("Hapus inovasi error:", error);
        alert(error.message || "Gagal menghapus inovasi.");
      }
      return;
    }

    if (tabKey === "penugasan") {
      try {
        if (!token) {
          alert("Token login tidak ditemukan. Silakan login ulang.");
          return;
        }

        const confirmed = window.confirm(
          "Yakin ingin menghapus penugasan juri ini?"
        );
        if (!confirmed) return;

        const response = await fetch(`${API_URL}/penugasan-juri/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.errors?.join(", ") ||
              result?.message ||
              "Gagal menghapus penugasan juri."
          );
        }

        setData((prev) => ({
          ...prev,
          penugasan: prev.penugasan.filter((x) => x.id !== id),
        }));
      } catch (error) {
        console.error("Hapus penugasan error:", error);
        alert(error.message || "Gagal menghapus penugasan juri.");
      }
    }
  };

  const handleEdit = (tabKey, row) => {
    if (tabKey === "user") {
      setSelectedUser(row);
      setOpenEditUser(true);
      return;
    }

    if (tabKey === "berita") {
      setSelectedBerita(row);
      setOpenEditBerita(true);
      return;
    }

    if (tabKey === "inovasi") {
      setSelectedInovasi(row);
      setOpenEditInovasi(true);
    }
  };

  const tambahLabel = useMemo(() => {
    if (activeTab === "user") return "Tambah User";
    if (activeTab === "berita") return "Tambah Berita";
    if (activeTab === "inovasi") return "Tambah Inovasi";
    return "Tambah Penugasan";
  }, [activeTab]);

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-4">
          <h1 className="text-xl font-extrabold text-slate-900">Pengaturan</h1>
          <p className="text-sm text-slate-500">
            Kelola data {tabLabel.toLowerCase()} pada sistem.
          </p>
        </div>

        <div className="relative mb-4">
          <div className="absolute left-0 right-0 bottom-0 h-px bg-slate-200" />
          <div className="flex items-end gap-2 flex-wrap">
            {TABS.map((t) => {
              const active = activeTab === t.key;
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={[
                    "relative px-4 py-2 text-sm font-semibold rounded-t-md transition flex items-center gap-2",
                    active
                      ? "bg-white text-slate-900 border border-slate-200 border-b-0"
                      : "bg-slate-50 text-slate-600 border border-transparent hover:text-slate-900 hover:bg-slate-100",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                  {active && (
                    <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-white" />
                  )}
                </button>
              );
            })}
            <div className="flex-1" />
          </div>
        </div>

        <TableShell>
          <div className="px-5 py-4 flex items-center justify-between gap-3 border-b border-slate-200">
            <div className="flex items-center gap-3 w-full">
              <div className="relative w-full max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Pencarian..."
                  className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="text-xs text-slate-500 hidden sm:block">
                Menu:{" "}
                <span className="font-semibold text-slate-700">{tabLabel}</span>{" "}
                • Total: <span className="font-semibold">{filtered.length}</span>
              </div>
            </div>

            {activeTab !== "penugasan" && (
              <button
                type="button"
                onClick={handleTambah}
                className="shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition bg-purple-700 text-white hover:bg-purple-800"
              >
                <Plus className="h-4 w-4" />
                {tambahLabel}
              </button>
            )}
          </div>

          {activeTab === "user" && (
            <UserTable
              loadingUser={loadingUser}
              userError={userError}
              filtered={filtered}
              handleRoleChange={handleRoleChange}
              handleEdit={handleEdit}
              handleHapus={handleHapus}
            />
          )}

          {activeTab === "berita" && (
            <BeritaTable
              loadingBerita={loadingBerita}
              beritaError={beritaError}
              filtered={filtered}
              handleEdit={handleEdit}
              handleHapus={handleHapus}
            />
          )}

          {activeTab === "inovasi" && (
            <InovasiTable
              loadingInovasi={loadingInovasi}
              inovasiError={inovasiError}
              filtered={filtered}
              handleEdit={handleEdit}
              handleHapus={handleHapus}
            />
          )}

          {activeTab === "penugasan" && (
            <PenugasanJuriTable
              penugasanForm={penugasanForm}
              setPenugasanForm={setPenugasanForm}
              juriOptions={juriOptions}
              inovasiRows={inovasiRows}
              selectedInovasiMeta={selectedInovasiMeta}
              selectedSlotOccupied={selectedSlotOccupied}
              handleAssignByInovasi={handleAssignByInovasi}
              filteredInovasiForAssign={filteredInovasiForAssign}
              filtered={filtered}
              loadingInovasi={loadingInovasi}
              loadingPenugasan={loadingPenugasan}
              loadingPeserta={loadingPeserta}
              loadingUser={loadingUser}
              inovasiError={inovasiError}
              pesertaError={pesertaError}
              penugasanError={penugasanError}
              handleHapus={handleHapus}
            />
          )}
        </TableShell>
      </div>

      <TambahUser
        isOpen={openTambahUser}
        onClose={() => setOpenTambahUser(false)}
        onSuccess={() => fetchUsers()}
      />

      <EditUser
        isOpen={openEditUser}
        onClose={() => {
          setOpenEditUser(false);
          setSelectedUser(null);
        }}
        userData={selectedUser}
        onSuccess={() => fetchUsers()}
      />

      <TambahBerita
        isOpen={openTambahBerita}
        onClose={() => setOpenTambahBerita(false)}
        onSuccess={() => fetchBerita()}
      />

      <EditBerita
        isOpen={openEditBerita}
        onClose={() => {
          setOpenEditBerita(false);
          setSelectedBerita(null);
        }}
        beritaData={
          selectedBerita
            ? {
                id: selectedBerita.id,
                judul: selectedBerita.judul,
                tanggal: "",
                konten: selectedBerita.konten || "",
                author: selectedBerita.author || "Admin",
                status: selectedBerita.status || "draft",
                thumbnail: selectedBerita.image_url || "",
              }
            : null
        }
        onSuccess={() => fetchBerita()}
      />

      <TambahInovasi
        isOpen={openTambahInovasi}
        onClose={() => setOpenTambahInovasi(false)}
        onSuccess={() => fetchInovasi()}
      />

      <EditInovasi
        isOpen={openEditInovasi}
        onClose={() => {
          setOpenEditInovasi(false);
          setSelectedInovasi(null);
        }}
        inovasiData={
          selectedInovasi
            ? {
                id: selectedInovasi.id,
                name: selectedInovasi.kategori,
                deskripsi: selectedInovasi.deskripsi,
              }
            : null
        }
        onSuccess={() => fetchInovasi()}
      />
    </div>
  );
};

export default Pengaturan;