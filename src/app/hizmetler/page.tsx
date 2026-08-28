"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Header from "@/components/admin/Header";
import { formatPrice } from "@/lib/utils";
import { Service } from "@/types";
import {
  Scissors,
  Plus,
  Clock,
  Edit2,
  Trash2,
  X,
  Check,
  Tag,
  Sparkles,
} from "lucide-react";

const CATEGORIES = [
  "ALL",
  "Saç Kesimi",
  "Sakal & Bakım",
  "Renklendirme",
  "Özel Bakım & Spa",
  "Özel Paket",
];

export default function HizmetlerPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Saç Kesimi");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [price, setPrice] = useState(300);
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const url =
        selectedCategory === "ALL"
          ? "/api/services"
          : `/api/services?category=${encodeURIComponent(selectedCategory)}`;
      const res = await fetch(url);
      if (res.ok) {
        setServices(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [selectedCategory]);

  const handleOpenModal = (service?: Service) => {
    setErrorMsg(null);
    if (service) {
      setEditingService(service);
      setName(service.name);
      setCategory(service.category);
      setDurationMinutes(service.durationMinutes);
      setPrice(service.price);
      setDescription(service.description || "");
      setActive(service.active);
    } else {
      setEditingService(null);
      setName("");
      setCategory("Saç Kesimi");
      setDurationMinutes(30);
      setPrice(300);
      setDescription("");
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
        category,
        durationMinutes: Number(durationMinutes),
        price: Number(price),
        description,
        active,
      };

      if (editingService) {
        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? { ...s, ...payload } : s))
        );
        setIsModalOpen(false);

        await fetch(`/api/services/${editingService.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        const tempId = `srv-${Date.now()}`;
        const newServiceItem = {
          id: tempId,
          ...payload,
          _count: { appointments: 0 },
        };
        setServices((prev) => [...prev, newServiceItem]);
        setIsModalOpen(false);

        await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      fetchServices();
    } catch (err: any) {
      console.warn("Hizmet kaydetme uyarısı:", err);
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    setServices((prev) => prev.filter((s) => s.id !== id));
    try {
      await fetch(`/api/services/${id}`, { method: "DELETE" });
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (service: Service) => {
    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, active: !s.active } : s))
    );
    try {
      await fetch(`/api/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !service.active }),
      });
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <Header
        title="Hizmet & Fiyat Kataloğu"
        description="Salonda sunulan kuaförlük işlemleri, süreleri ve güncel fiyat listesi"
        onRefresh={fetchServices}
        isRefreshing={loading}
      />

      <main className="p-4 sm:p-8 space-y-4 sm:space-y-6 flex-1">
        {/* Category Filter & Add Button */}
        <div className="bg-[#12131a] p-4 rounded-2xl border border-zinc-800/90 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                    : "bg-[#0c0d14] text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                {cat === "ALL" ? "Tüm Kategoriler" : cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Yeni Hizmet Ekle
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <div
              key={service.id}
              className={`bg-[#12131a] rounded-2xl p-5 border shadow-md hover:border-zinc-700 transition-all flex flex-col justify-between ${
                service.active ? "border-zinc-800/90" : "border-zinc-800/40 opacity-50 bg-[#0c0d14]"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold tracking-wider text-red-400 uppercase bg-red-950/40 px-2 py-0.5 rounded-md border border-red-800/40">
                      {service.category}
                    </span>
                    <h4 className="font-bold text-sm text-white mt-2.5">{service.name}</h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(service)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {service.description && (
                  <p className="text-xs text-zinc-400 mt-2.5 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                )}
              </div>

              {/* Bottom Info & Toggle */}
              <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-zinc-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-red-500" />
                    <span>{service.durationMinutes} dk</span>
                  </div>
                  <span className="text-sm font-black text-red-400">
                    {formatPrice(service.price)}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleActive(service)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-colors ${
                    service.active
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/50"
                      : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:bg-zinc-800"
                  }`}
                >
                  {service.active ? "Aktif" : "Pasif"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#12131a] rounded-2xl max-w-md w-full shadow-2xl border border-zinc-800 overflow-hidden">
            <div className="px-6 py-4.5 bg-[#0c0d14] text-white flex items-center justify-between border-b border-zinc-800">
              <h3 className="font-bold text-base text-white">
                {editingService ? "Hizmeti Düzenle" : "Yeni Hizmet Ekle"}
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
                  Hizmet Adı *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Klasik Saç Kesimi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white text-xs font-medium focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Kategori *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white text-xs font-medium focus:outline-none focus:border-red-600"
                >
                  <option value="Saç Kesimi">Saç Kesimi</option>
                  <option value="Sakal & Bakım">Sakal & Bakım</option>
                  <option value="Renklendirme">Renklendirme</option>
                  <option value="Özel Bakım & Spa">Özel Bakım & Spa</option>
                  <option value="Özel Paket">Özel Paket</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Süre (Dakika) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white text-xs font-medium focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Fiyat (₺) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white text-xs font-medium focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Açıklama (Opsiyonel)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Hizmet detayları ve kullanılan ürünler..."
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white text-xs font-medium placeholder:text-zinc-600 focus:outline-none focus:border-red-600 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded"
                />
                <label htmlFor="activeCheck" className="text-xs font-semibold text-zinc-300">
                  Bu hizmet randevu alımına açık (Aktif)
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
                  {editingService ? "Güncelle" : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
