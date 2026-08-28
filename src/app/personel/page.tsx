"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Header from "@/components/admin/Header";
import { Staff } from "@/types";
import {
  UserCheck,
  Plus,
  Clock,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Calendar,
  X,
  Palette,
} from "lucide-react";

const COLOR_PRESETS = [
  { name: "Indigo", hex: "#4f46e5" },
  { name: "Pembe / Fuşya", hex: "#db2777" },
  { name: "Zümrüt Yeşili", hex: "#059669" },
  { name: "Amber / Altın", hex: "#d97706" },
  { name: "Mor / Violet", hex: "#7c3aed" },
  { name: "Gök Mavisi", hex: "#0284c7" },
  { name: "Gül Kurusu", hex: "#e11d48" },
  { name: "Teal", hex: "#0d9488" },
];

export default function PersonelPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [color, setColor] = useState("#4f46e5");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("19:00");
  const [active, setActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/staff");
      if (res.ok) {
        setStaffList(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleOpenModal = (staff?: Staff) => {
    setErrorMsg(null);
    if (staff) {
      setEditingStaff(staff);
      setName(staff.name);
      setTitle(staff.title);
      setPhone(staff.phone || "");
      setEmail(staff.email || "");
      setColor(staff.color || "#4f46e5");
      setStartTime(staff.startTime || "09:00");
      setEndTime(staff.endTime || "19:00");
      setActive(staff.active);
    } else {
      setEditingStaff(null);
      setName("");
      setTitle("Kuaför & Stilist");
      setPhone("");
      setEmail("");
      setColor(COLOR_PRESETS[staffList.length % COLOR_PRESETS.length].hex);
      setStartTime("09:00");
      setEndTime("19:00");
      setActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      const payload = {
        name,
        title,
        phone,
        email,
        color,
        startTime,
        endTime,
        active,
      };

      if (editingStaff) {
        const res = await fetch(`/api/staff/${editingStaff.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Personel güncellenemedi.");
      } else {
        const res = await fetch("/api/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Personel eklenemedi.");
      }

      setIsModalOpen(false);
      fetchStaff();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu personeli silmek istediğinizden emin misiniz?")) return;
    try {
      const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
      if (res.ok) fetchStaff();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (staff: Staff) => {
    try {
      await fetch(`/api/staff/${staff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !staff.active }),
      });
      fetchStaff();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <Header
        title="Personel & Uzman Kadrosu"
        description="Kuaför ekibi, mesai saatleri ve takvim renk kodları yönetimi"
        onRefresh={fetchStaff}
        isRefreshing={loading}
      />

      <main className="p-8 space-y-6 flex-1">
        {/* Top bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            Toplam <span className="font-bold text-slate-900">{staffList.length}</span> uzman kuaför tanımlı
          </p>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Yeni Personel Ekle
          </button>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {staffList.map((staff: any) => (
            <div
              key={staff.id}
              className={`bg-white rounded-2xl p-6 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
                staff.active ? "border-slate-200/80" : "border-slate-200 opacity-60 bg-slate-50/50"
              }`}
            >
              {/* Top Color Accent Ribbon */}
              <div
                className="h-1.5 absolute top-0 left-0 right-0"
                style={{ backgroundColor: staff.color }}
              ></div>

              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl text-white font-bold text-lg flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: staff.color }}
                    >
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{staff.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{staff.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(staff)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(staff.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contact & Hours */}
                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  {staff.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`tel:${staff.phone}`} className="hover:text-amber-600">
                        {staff.phone}
                      </a>
                    </div>
                  )}

                  {staff.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{staff.email}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Mesai: <strong className="text-slate-800">{staff.startTime} - {staff.endTime}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions & Total Count */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {staff._count?.appointments || 0} Randevu
                </span>

                <button
                  onClick={() => handleToggleActive(staff)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                    staff.active
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  {staff.active ? "Görevde (Aktif)" : "İzinde (Pasif)"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingStaff ? "Personeli Düzenle" : "Yeni Personel Ekle"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Unvan / Uzmanlık *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Master Berber & Stilist"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0532 000 00 00"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@salon.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Mesai Başlangıç
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Mesai Bitiş
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {/* Color Presets */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-600" />
                  Takvim Ayırt Edici Renk
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setColor(preset.hex)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === preset.hex ? "scale-125 ring-2 ring-slate-900 ring-offset-2" : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: preset.hex }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="staffActiveCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <label htmlFor="staffActiveCheck" className="text-xs font-semibold text-slate-700">
                  Personel aktif ve randevu kabul ediyor
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow-xs"
                >
                  {editingStaff ? "Güncelle" : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
