"use client";

import { useEffect, useState } from "react";
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
  X,
  Palette,
  Calendar,
} from "lucide-react";

const COLOR_PRESETS = [
  { name: "Yakut Kırmızısı", hex: "#dc2626" },
  { name: "Koyu Bordo", hex: "#991b1b" },
  { name: "Altın Sarısı", hex: "#d97706" },
  { name: "Safir Mavisi", hex: "#2563eb" },
  { name: "Zümrüt Yeşili", hex: "#059669" },
  { name: "Ametist Moru", hex: "#7c3aed" },
];

export default function PersonelPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("20:00");
  const [color, setColor] = useState("#dc2626");
  const [active, setActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/staff");
      if (res.ok) {
        setStaffList(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenModal = (staff?: Staff) => {
    setErrorMsg(null);
    if (staff) {
      setEditingStaff(staff);
      setName(staff.name);
      setTitle(staff.title);
      setPhone(staff.phone || "");
      setEmail(staff.email || "");
      setStartTime(staff.startTime);
      setEndTime(staff.endTime);
      setColor(staff.color || "#dc2626");
      setActive(staff.active);
    } else {
      setEditingStaff(null);
      setName("");
      setTitle("");
      setPhone("");
      setEmail("");
      setStartTime("09:00");
      setEndTime("20:00");
      setColor("#dc2626");
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
        startTime,
        endTime,
        color,
        active,
      };

      if (editingStaff) {
        setStaffList((prev) =>
          prev.map((s) => (s.id === editingStaff.id ? { ...s, ...payload } : s))
        );
        setIsModalOpen(false);

        await fetch(`/api/staff/${editingStaff.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        const tempId = `st-${Date.now()}`;
        const newStaffItem = {
          id: tempId,
          ...payload,
          _count: { appointments: 0 },
        };
        setStaffList((prev) => [...prev, newStaffItem]);
        setIsModalOpen(false);

        await fetch("/api/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      fetchStaff();
    } catch (err: any) {
      console.warn("Personel kaydetme uyarısı:", err);
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu personeli silmek istediğinize emin misiniz?")) return;
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    try {
      await fetch(`/api/staff/${id}`, { method: "DELETE" });
      fetchStaff();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (staff: Staff) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staff.id ? { ...s, active: !s.active } : s))
    );
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

      <main className="p-4 sm:p-8 space-y-4 sm:space-y-6 flex-1">
        {/* Top bar */}
        <div className="bg-[#12131a] p-4 rounded-2xl border border-zinc-800/90 shadow-lg flex items-center justify-between">
          <p className="text-xs text-zinc-400 font-medium">
            Toplam <span className="font-black text-white">{staffList.length}</span> uzman kuaför tanımlı
          </p>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02]"
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
              className={`bg-[#12131a] rounded-2xl p-6 border shadow-md hover:border-zinc-700 transition-all flex flex-col justify-between relative overflow-hidden ${
                staff.active ? "border-zinc-800/90" : "border-zinc-800/40 opacity-50 bg-[#0c0d14]"
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
                      className="w-12 h-12 rounded-2xl text-white font-black text-lg flex items-center justify-center shadow-md"
                      style={{ backgroundColor: staff.color }}
                    >
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{staff.name}</h4>
                      <p className="text-xs text-zinc-400 font-medium">{staff.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(staff)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(staff.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contact & Hours */}
                <div className="mt-4 space-y-2 text-xs text-zinc-300">
                  {staff.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-red-500" />
                      <a href={`tel:${staff.phone}`} className="hover:text-red-400">
                        {staff.phone}
                      </a>
                    </div>
                  )}

                  {staff.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{staff.email}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <Clock className="w-3.5 h-3.5 text-red-500" />
                    <span>
                      Mesai: <strong className="text-white">{staff.startTime} - {staff.endTime}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions & Total Count */}
              <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-red-500" />
                  {staff._count?.appointments || 0} Randevu
                </span>

                <button
                  onClick={() => handleToggleActive(staff)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-colors ${
                    staff.active
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/50"
                      : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:bg-zinc-800"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#12131a] rounded-2xl max-w-md w-full shadow-2xl border border-zinc-800 overflow-hidden">
            <div className="px-6 py-4.5 bg-[#0c0d14] text-white flex items-center justify-between border-b border-zinc-800">
              <h3 className="font-bold text-base text-white">
                {editingStaff ? "Personeli Düzenle" : "Yeni Personel Ekle"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white text-xs font-medium focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Unvan / Uzmanlık *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Master Berber & Stilist"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white text-xs font-medium focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0532 000 00 00"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white text-xs font-medium placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@salon.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white text-xs font-medium placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Mesai Başlangıç
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white text-xs font-medium focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Mesai Bitiş
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white text-xs font-medium focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Color Presets */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-red-500" />
                  Takvim Ayırt Edici Renk
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setColor(preset.hex)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === preset.hex ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#12131a]" : "hover:scale-110 opacity-70"
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
                  className="w-4 h-4 accent-red-600 rounded"
                />
                <label htmlFor="staffActiveCheck" className="text-xs font-semibold text-zinc-300">
                  Personel aktif ve randevu kabul ediyor
                </label>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition-all"
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
