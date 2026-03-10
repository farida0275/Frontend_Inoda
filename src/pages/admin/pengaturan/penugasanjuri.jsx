import React from "react";
import { Plus, Trash2 } from "lucide-react";

const IconBtn = ({ variant = "neutral", children, ...props }) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold border transition";
  const styles =
    variant === "danger"
      ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
      : variant === "primary"
      ? "border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

  return (
    <button type="button" className={`${base} ${styles}`} {...props}>
      {children}
    </button>
  );
};

const PenugasanJuriTable = ({
  penugasanForm,
  setPenugasanForm,
  juriOptions,
  inovasiRows,
  selectedInovasiMeta,
  selectedSlotOccupied,
  handleAssignByInovasi,
  filteredInovasiForAssign,
  filtered,
  loadingInovasi,
  loadingPenugasan,
  loadingPeserta,
  loadingUser,
  inovasiError,
  pesertaError,
  penugasanError,
  handleHapus,
}) => {
  return (
    <>
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={penugasanForm.juri_id}
            onChange={(e) =>
              setPenugasanForm((prev) => ({
                ...prev,
                juri_id: e.target.value,
              }))
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Pilih Juri</option>
            {juriOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama} - {item.email}
              </option>
            ))}
          </select>

          <select
            value={penugasanForm.inovasi_id}
            onChange={(e) =>
              setPenugasanForm((prev) => ({
                ...prev,
                inovasi_id: e.target.value,
              }))
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Pilih Inovasi</option>
            {inovasiRows.map((item) => (
              <option key={item.id} value={item.id}>
                {item.kategori}
              </option>
            ))}
          </select>

          <select
            value={penugasanForm.slot_penilai}
            onChange={(e) =>
              setPenugasanForm((prev) => ({
                ...prev,
                slot_penilai: e.target.value,
              }))
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="1">Slot 1</option>
            <option value="2">Slot 2</option>
            <option value="3">Slot 3</option>
          </select>

          <button
            type="button"
            onClick={handleAssignByInovasi}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition bg-purple-700 text-white hover:bg-purple-800"
          >
            <Plus className="h-4 w-4" />
            Tugaskan
          </button>
        </div>

        {(penugasanForm.inovasi_id || penugasanForm.slot_penilai) && (
          <div className="mt-3">
            {selectedInovasiMeta ? (
              selectedSlotOccupied ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Slot {penugasanForm.slot_penilai} untuk inovasi{" "}
                  <span className="font-semibold">
                    {selectedInovasiMeta.kategori}
                  </span>{" "}
                  sudah terisi.
                </div>
              ) : (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Slot {penugasanForm.slot_penilai} untuk inovasi{" "}
                  <span className="font-semibold">
                    {selectedInovasiMeta.kategori}
                  </span>{" "}
                  masih tersedia.
                </div>
              )
            ) : null}
          </div>
        )}
      </div>

      <div className="overflow-x-auto border-b border-slate-200">
        {loadingInovasi || loadingPenugasan ? (
          <div className="px-5 py-10 text-center text-slate-500">
            Memuat data inovasi...
          </div>
        ) : inovasiError ? (
          <div className="px-5 py-6">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {inovasiError}
            </div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3 text-left w-14">#</th>
                <th className="px-5 py-3 text-left">Kategori Inovasi</th>
                <th className="px-5 py-3 text-left">Deskripsi</th>
                <th className="px-5 py-3 text-left">Status Slot 1</th>
                <th className="px-5 py-3 text-left">Status Slot 2</th>
                <th className="px-5 py-3 text-left">Status Slot 3</th>
              </tr>
            </thead>

            <tbody>
              {filteredInovasiForAssign.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Data tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredInovasiForAssign.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition ${
                      Number(r.id) === Number(penugasanForm.inovasi_id)
                        ? "bg-purple-50/50"
                        : ""
                    }`}
                  >
                    <td className="px-5 py-4 text-slate-600">{idx + 1}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {r.kategori}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{r.deskripsi}</td>
                    <td className="px-5 py-4">
                      {r.assignedSlot1 ? (
                        <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 border border-red-200">
                          Terisi
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                          Tersedia
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {r.assignedSlot2 ? (
                        <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 border border-red-200">
                          Terisi
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                          Tersedia
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {r.assignedSlot3 ? (
                        <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 border border-red-200">
                          Terisi
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                          Tersedia
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="overflow-x-auto">
        {loadingPenugasan || loadingPeserta || loadingUser || loadingInovasi ? (
          <div className="px-5 py-10 text-center text-slate-500">
            Memuat data penugasan...
          </div>
        ) : penugasanError ? (
          <div className="px-5 py-6">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {penugasanError}
            </div>
          </div>
        ) : pesertaError ? (
          <div className="px-5 py-6">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {pesertaError}
            </div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3 text-left w-14">#</th>
                <th className="px-5 py-3 text-left">Nama Juri</th>
                <th className="px-5 py-3 text-left">Kategori Inovasi</th>
                <th className="px-5 py-3 text-left">Slot</th>
                <th className="px-5 py-3 text-left w-40">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Data tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="px-5 py-4 text-slate-600">{idx + 1}</td>
                    <td className="px-5 py-4 text-slate-700">
                      <div className="font-semibold">{r.namaJuri}</div>
                      <div className="text-xs text-slate-500">{r.emailJuri}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {r.kategoriInovasi}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      Slot {r.slot_penilai}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <IconBtn
                          variant="danger"
                          onClick={() => handleHapus("penugasan", r.id)}
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                          Hapus
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default PenugasanJuriTable;